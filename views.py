"""Create Flask web app routes to render HTML pages of web app"""

# 'flask' is the micro web app framework, from which you can import useful classes and functions
from flask import Blueprint, session, render_template, redirect
# 'auth' is a file containing self-made methods to handle API connection
import auth
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

    activities = auth.get_activites()

    return render_template("activities.html")