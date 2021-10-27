"""Create Flask web app routes to render HTML pages of web app"""

# 'flask' is the micro web app framework, from which you can import useful classes and functions
from flask import Blueprint, session, render_template, redirect, request, Response
# 'jsonify' is used to pass the API result from Python to JS (as JSON)
from flask import jsonify
# 'auth' is a file containing self-made methods to handle API connection
import auth
# 'crud' contains the self-made functions that add data to the database
import database.crud
# The 'json' module allows us to deserialize JSON strings into native Python objects
import json
# Use the 'datetime' module to transform strings into datetime objects
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

    return render_template("index.html")


@views.route('/login')
def user_login():
    """Check if user is in session & handle login accordingly"""

    # Remove this line after debugging:
    session.clear()

    if session.get('access_token'):
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


@views.route('/athlete_profile')
@auth.login_required
def show_athlete_profile():
    """Show athlete's homepage / profile"""

    return render_template("profile.html")


@views.route('/athlete_data.json', methods=['POST'])
@auth.login_required
def get_athlete_data():
    """Pass API data to JS file"""

    if request.method == 'POST':
        res = auth.get_activities()
        return jsonify(res)
    
    return Response(405)


# Defining two methods here allows us to handle form input within the same function:
@views.route('/training', methods=['GET', 'POST'])
@auth.login_required
def show_trng_plan():
    """Show athlete's training plan"""

    if request.method == 'POST':
        print("Post method has occurred...")

        athlete_id = session.get("athlete_id")
        goal_id = request.form.get('id')
        
        # If user is requesting existing plan, lookup plan:
        if goal_id:
            custom_plan = database.crud.get_custom_trng_plan(goal_id)
        # If user is requesting a new plan (via form), create plan:
        else:
            goal_name = request.form.get('name')
            goal_date = request.form.get('date')
            today = request.form.get('today')
            # Convert UTC strings to datetime objects for db:
            goal_date = datetime.strptime(goal_date, '%a, %d %b %Y %H:%M:%S %Z')
            today = datetime.strptime(today, '%a, %d %b %Y %H:%M:%S %Z')

            # Store trng goal in db:
            database.crud.create_goal(athlete_id, goal_name, goal_date)
            # Get goal_id:
            goal_id = database.crud.get_goals(athlete_id)[-1].goal_id
            
            # Pass required data to db to create custom plan:
            custom_plan = database.crud.create_custom_trng_plan(athlete_id, goal_id, goal_name, goal_date, today)

        # Return custom_plan to JS file:
        workout = [workout.toDict() for workout in custom_plan] # Jsonify method requires a dict
        return jsonify(workout)

    return render_template("training.html")


@views.route('/get_goals.json')
@auth.login_required
def get_all_trng_goals():
    """Get & return all training goals associated with an athlete"""

    athlete_id = session.get("athlete_id")
    # Pass required data to db to get all goals:
    goals = database.crud.get_goals(athlete_id)

    # Return goals to JS file:
    goals = [goal.toDict() for goal in goals]
    return jsonify(goals)


@views.route('/save_changes', methods=['POST'])
@auth.login_required
def save_custom_trng_plan():
    """Save user-made changes to database"""
    
    if request.method == 'POST':
        print("Saving plan...")

        # Convert JSON string into Python dict:
        modified_activity = request.form.get('modifiedActivity')
        modified_activity = json.loads(modified_activity) 
       
        # Parse JSON for req data:
        custom_plan_id = modified_activity['extendedProps']['custom_plan_id']
        trng_item = modified_activity['title']
        date = modified_activity['start']
       
        # Pass req data to CRUD function so that changes are saved:
        database.crud.save_custom_trng_plan_item(custom_plan_id, trng_item, date)
    
    return Response(405)