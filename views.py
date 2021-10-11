"""Create Flask web app routes to render HTML pages of web app"""

# 'flask' is the micro web app framework, from which you can import useful classes and functions
from flask import Blueprint, session, render_template
# 'auth' is a file containing self-made methods to handle API connection
import auth

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
    
    if session.get('access_token', None):
        return render_template("activities.html")       
    
    else:
        print("No access_token in session") # FIXME: Delete this line if testing complete
        return auth.prompt_strava_login()


@views.route('/strava_oauth')
def connect_to_api():
    """Connect to Strava API"""

    OAUTH_CODE = auth.get_oauth_code()
    TOKENS = auth.exchange_tokens(OAUTH_CODE)
    auth.save_tokens(TOKENS) # FIXME -> Refactor this into a separate function? 

    return render_template("activities.html")