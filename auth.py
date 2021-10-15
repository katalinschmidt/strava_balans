"""This file contains the methods for handling low-level access to the Strava API"""

# 'flask' is the micro web app framework, from which you can import useful classes and functions
from flask import Blueprint, redirect, Response, request, session
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

    OAUTH_CODE = request.args.get('code', None)
    
    return OAUTH_CODE


def exchange_tokens(OAUTH_CODE):
    """Exchange oauth code for access tokens"""

    data = {
            'client_id': CLIENT_ID,
            'client_secret': CLIENT_SECRET,
            'code': OAUTH_CODE,
            'grant_type': 'authorization_code'
            }

    TOKENS = requests.post(STRAVA_TOKEN_URL, data=data).json()
    # FIXME: Call save_tokens() here instead of in views.py?

    return TOKENS


def refresh_tokens():
    """Refresh tokens"""

    data = {
            'client_id': CLIENT_ID,
            'client_secret': CLIENT_SECRET,
            'refresh_token': session['refresh_token'],
            'grant_type': 'refresh_token'
            }

    TOKENS = requests.post(STRAVA_TOKEN_URL, data=data).json()
    # FIXME: Call save_tokens() here instead of in views.py?

    return TOKENS


def save_tokens(TOKENS, refresh=False):
    """Save tokens to session & db"""

    if not refresh:
        session['athlete_id'] = TOKENS['athlete']['id']
        crud.create_athlete(
                            TOKENS['athlete']['id'],
                            TOKENS['athlete']['firstname'],
                            TOKENS['athlete']['lastname'],
                            TOKENS['athlete']['profile'],
                            )
        # FIXME: Method for updating profile photo if profile photo has changed on Strava
    
    session.clear()
    session['access_token'] = TOKENS['access_token']
    session['refresh_token'] = TOKENS['refresh_token']
    session['expires_at'] = TOKENS['expires_at']


# FIXME: Move this function to leaflet.js!
def get_activites():
    """Get user's activities using tokens stored in database"""

    all_activities = []
    page_num = 1
    
    while True:
        ACCESS_TOKEN = session.get("access_token", None)        

        headers = {'Authorization': 'Bearer ' + ACCESS_TOKEN}

        params = {
                'access_token': ACCESS_TOKEN,
                'per_page': '200',
                'page': page_num
                }

        activities = requests.get(API_BASE_URL, headers=headers, params=params).json()
        
        if len(activities) == 0:
            break
        
        page_num += 1
        all_activities.append(activities)
    # from pprint import pprint
    # pprint(all_activities[0][0])

    return all_activities