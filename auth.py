"""This file contains the methods for handling low-level access to the Strava API"""

# 'flask' is the micro web app framework, from which you can import useful classes and functions
from flask import Blueprint, redirect, Response, request, session 
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

    if not OAUTH_CODE:
        return Response('Error: Missing authorization', status=400)
    
    return OAUTH_CODE


def exchange_tokens(OAUTH_CODE):
    """Exchange oauth code for access tokens"""

    data = {
            'client_id': CLIENT_ID,
            'client_secret': CLIENT_SECRET,
            'code': OAUTH_CODE,
            'grant_type': 'authorization_code'
            }

    # TOKENS = requests.post(STRAVA_TOKEN_URL, data=data).json()
    TOKENS = requests.post(url=STRAVA_TOKEN_URL, data=data).json()

    return TOKENS


def save_tokens(TOKENS):
    """Save tokens to session & database"""

    session['athlete_id'] = TOKENS['athlete']['id']
    session['access_token'] = TOKENS['access_token']
    session['refresh_token'] = TOKENS['refresh_token']
    session['expires_at'] = TOKENS['expires_at']

    # if not crud.get_athlete(TOKENS['athlete']['id']):
    #     crud.create_athlete(
    #                         TOKENS['athlete']['id'],
    #                         TOKENS['athlete']['firstname'],
    #                         TOKENS['athlete']['lastname'],
    #                         TOKENS['athlete']['profile'],
    #                        ) 