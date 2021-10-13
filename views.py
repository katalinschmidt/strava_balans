"""Create Flask web app routes to render HTML pages of web app"""

# 'flask' is the micro web app framework, from which you can import useful classes and functions
from flask import Blueprint, session, render_template, redirect
# 'auth' is a file containing self-made methods to handle API connection
import auth
# Use the 'datetime' modul to format dates received in your API JSON data
from datetime import datetime
# Use the 'time' module to check the validity of your API token
import time

# Blueprints allow you to break up your application into modules and thereby help organize views / code.
# Create an instance of the class Blueprint:
views = Blueprint('views', __name__) 


# Use the route decorator to connect your view / function to your desired URL:
@views.route('/') # Implicit -> ('/', methods=('GET'))
def show_homepage():
    """Show homepage"""

    return render_template("homepage.html")


@views.route('/login')
def user_login():
    """Check if user is in session & handle login accordingly"""

    # session.clear()

    if session.get('access_token', None):
        if session['expires_at'] < time.time():
            TOKENS = auth.refresh_tokens()
            auth.save_tokens(TOKENS, refresh=True) # FIXME -> Call this within auth.py?

        return redirect('/athlete_home')   
    
    else:
        return auth.prompt_strava_login()


@views.route('/strava_oauth')
def connect_to_api():
    """Connect to Strava API"""

    OAUTH_CODE = auth.get_oauth_code()
    TOKENS = auth.exchange_tokens(OAUTH_CODE) # FIXME -> Call this within auth.py?
    auth.save_tokens(TOKENS) # FIXME -> Call this within auth.py?

    return redirect('/athlete_home')


# Strava handles authentication here,
# i.e. if user knows route but is not logged in, Strava renders error page
@views.route('/athlete_home')
def show_athlete_home():
    """Show athlete's homepage with athlete's activities"""

    all_activities = auth.get_activites()

    # Clean up data for rendering:
    for arrays in all_activities:
        for data in arrays:
            data['start_date_local'] = datetime.strptime(data['start_date_local'], '%Y-%m-%dT%H:%M:%SZ')
            data['start_date_local'] = data['start_date_local'].strftime("%Y %m %d")

            data['distance'] = data['distance'] * 0.000621
            data['distance'] = round(data['distance'], 2)

            data['elapsed_time'] = time.strftime("%H:%M:%S", time.gmtime(data['elapsed_time']))

    return render_template("activities.html", all_activities=all_activities)