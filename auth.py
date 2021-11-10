"""This file contains the methods for handling low-level access to the Strava API"""

# 'flask' is the micro web app framework, from which you can import useful classes and functions
from flask import flash, redirect, request, session
# 'functools' is Flask's preferred library for decorators / wrappers (see login_required)
from functools import wraps
# 'crud' contains the self-made functions that add data to the database
from database import crud
# 'urllib.parse' is a module that provides functions for manipulating URLs
import urllib.parse
# 'requests' is a library that simplifies how you send HTTP requests
import requests
# 'os' allows you to interact with your underlying operating system, e.g. access environmental variables
import os


# Creating environmental variables allows us to hide sensitive data:
CLIENT_ID = os.environ['CLIENT_ID']
CLIENT_SECRET = os.environ['CLIENT_SECRET']
REDIRECT_URI = os.environ['REDIRECT_URI']

# Global variables are created outside of functions, so that they can be accessed everywhere:
# Constant variables are used to hold information that will not be changed later:
STRAVA_AUTH_URL = "https://www.strava.com/oauth/authorize"
STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token"
API_BASE_URL = "https://www.strava.com/api/v3/athlete/activities"


def login_required(orig_func):
    """Protects routes from unauthorized users"""
    print(f"login_required for {orig_func.__name__}")

    @wraps(orig_func)
    def wrapper():
        auth_given = session.get("access_token", None)

        if auth_given:
            return orig_func()
        else:
            flash("Please connect with Strava to access the desired page.")
            return redirect('/')
    
    return wrapper


def prompt_strava_login():
    """Prompt user to authorize connection to Strava"""

    params = {
        'client_id': CLIENT_ID,
        'response_type': 'code',
        'redirect_uri': REDIRECT_URI,
        'approval_prompt': 'force',
        'scope': 'activity:read_all'
        }

    return redirect("{}?{}".format(
        STRAVA_AUTH_URL,
        urllib.parse.urlencode(params)
    )) 


def get_oauth_code():
    """Parse oauth code from URL for access to STRAVA API"""

    oauth_code = request.args.get('code', None)

    return oauth_code


def exchange_tokens(oauth_code):
    """Exchange oauth code for access tokens"""

    data = {
            'client_id': CLIENT_ID,
            'client_secret': CLIENT_SECRET,
            'code': oauth_code,
            'grant_type': 'authorization_code'
            }

    tokens = requests.post(STRAVA_TOKEN_URL, data=data).json()
    return tokens


def refresh_tokens():
    """Refresh tokens"""

    data = {
            'client_id': CLIENT_ID,
            'client_secret': CLIENT_SECRET,
            'refresh_token': session['refresh_token'],
            'grant_type': 'refresh_token'
            }

    tokens = requests.post(STRAVA_TOKEN_URL, data=data).json()
    return tokens


def save_tokens(tokens, refresh=False):
    """Save tokens to session & db"""

    if not refresh:
        session['athlete_id'] = tokens['athlete']['id']

        if not crud.get_athlete(tokens['athlete']['id']):
            print("Athlete not in db. Adding now...")
            crud.create_athlete(
                                tokens['athlete']['id'],
                                tokens['athlete']['firstname'],
                                tokens['athlete']['lastname'],
                                tokens['athlete']['profile'],
                                )
    
    session['access_token'] = tokens['access_token']
    session['refresh_token'] = tokens['refresh_token']
    session['expires_at'] = tokens['expires_at']


def get_activities():
    """Get user's activities using tokens stored in database"""

    all_activities = []
    page_num = 1
    
    # Iterate until an empty page is returned, to go through the full set of results:
    while True:
        ACCESS_TOKEN = session.get("access_token", None)        

        headers = {'Authorization': 'Bearer ' + ACCESS_TOKEN}

        params = {
                'access_token': ACCESS_TOKEN,
                'per_page': '200',
                'page': page_num
                }

        res = requests.get(API_BASE_URL, headers=headers, params=params)
        if res.status_code != 200: # Add code 201, if editing/creating activities
            print("*"*20)
            print("API Error:", res.status_code)
            print("*"*20)
            return ("error code")
        
        activities = res.json()
        # if len(activities) == 0:
        #     break
        
        page_num += 1
        all_activities.append(activities)
        all_activities.extend(activities)
        break # FIXME: REMOVE THIS LINE & UNCOMMENT ABOVE AFTER DEBUGGING COMPLETE

    return all_activities