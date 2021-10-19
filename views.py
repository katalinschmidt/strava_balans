"""Create Flask web app routes to render HTML pages of web app"""

# 'flask' is the micro web app framework, from which you can import useful classes and functions
from flask import Blueprint, session, render_template, redirect
# 'jsonify' is used to pass the API result from Python to JS (as JSON)
from flask import jsonify
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

    return render_template("index.html")


@views.route('/login')
def user_login():
    """Check if user is in session & handle login accordingly"""

    # Remove this line after debugging:
    # session.clear()

    if session.get('access_token', None):
        # If user in session, check for expiration:
        if session['expires_at'] < time.time():
            tokens = auth.refresh_tokens()
            auth.save_tokens(tokens, refresh=True)
        # If user in session, redirect directly to profile page:
        return redirect('/athlete_profile')   
    else:
        # If user not in session, prompt 'login' via Strava:
        return auth.prompt_strava_login()


@views.route('/strava_oauth')
def connect_to_api():
    """Connect to Strava API"""

    oauth_code = auth.get_oauth_code()

    # If user does not authenticate via Strava, redirect to homepage:
    if not oauth_code:
        return redirect('/')

    tokens = auth.exchange_tokens(oauth_code)
    auth.save_tokens(tokens)

    return redirect('/athlete_profile')


# @auth.login_required is a self-made decorator that protects route by checking for user in session
@views.route('/athlete_profile')
@auth.login_required
def show_athlete_profile():
    """Show athlete's homepage / profile"""

    return render_template("profile.html")


# FIXME: Refactor this to be exclusively in leaflet.js! Ask about passing session['access_token'].
@views.route('/athlete_data.json')
def get_athlete_data():
    """Pass API data to JS file"""

    res = auth.get_activities()
    return jsonify(res)


@views.route('/training')
# @auth.login_required
def show_trng_plan():
    """Show athlete's training plan"""

    return "<h1>TEST</h1>"