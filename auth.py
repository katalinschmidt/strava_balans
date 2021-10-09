# 'flask' is the micro web app framework, from which you can import useful classes and functions
from flask import Blueprint, redirect, Response, request, session 
# 'urllib.parse' is a module that provides functions for manipulating URLs
import urllib.parse
# 'os' allows you to interact with your underlying operating system, e.g. access environmental variables
import os

# Blueprints allow you to break up your application into modules and thereby help organize views / code.
# Create an instance of the class Blueprint:
auth = Blueprint('auth', __name__)

# Creating environmental variables allows us to hide sensitive data:
CLIENT_ID = os.environ['CLIENT_ID']
CLIENT_SECRET = os.environ['CLIENT_SECRET']
REDIRECT_URI = os.environ['REDIRECT_URI']

STRAVA_AUTH_URL = "https://www.strava.com/oauth/authorize"
STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token"
API_BASE_URL = "https://www.strava.com/api/v3/athlete/activities"


# Use the route decorator to connect your view / function to your desired URL:
@auth.route('/strava_login')
def strava_login():
    """Prompt user to 'login' with Strava profile"""

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


@auth.route('/strava_oauth')
def strava_oauth():
    """Get access to & make call to STRAVA API"""

    return "<h1>TEST OAUTH</h1>"