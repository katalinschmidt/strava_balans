"""CRUD operations for Balans web app database"""

# # # This code is for connecting nested directories/files/making variables accessable # # #
import os
import sys

BASE_PATH = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_PATH)
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# from database.model import connect_to_db
from database.model import db, Athlete, Goal, Custom_Trng_Plan, Default_Trng_Plan
# Use the 'datetime' module to count the days until a given training goal
from datetime import datetime, timedelta


def create_athlete(athlete_id, fname, lname, profile_photo):
    """Create and return athlete."""

    athlete = Athlete(
                    athlete_id=athlete_id,
                    fname=fname,
                    lname=lname,
                    profile_photo=profile_photo,
                    )

    db.session.add(athlete)
    db.session.commit()

    return athlete  


def get_athlete(athlete_id):
    """Return athlete."""

    return Athlete.query.filter(Athlete.athlete_id == athlete_id).first()


def create_goal(athlete_id, goal_name, goal_date):
    """Create and return athlete's training goal."""

    goal = Goal(
                athlete_id=athlete_id,
                goal_name=goal_name,
                goal_date=goal_date
                )
    
    db.session.add(goal)
    db.session.commit()

    return goal


def get_goals(athlete_id):
    """Return athlete's training goal(s)."""

    return Goal.query.filter(Goal.athlete_id == athlete_id).all()


def create_custom_trng_plan(athlete_id, goal_id, goal_name, goal_date):
    """Create and return athlete's custom training plan."""

    # Get default plan for given goal ->
    # This will be the starting point for the custom plan
    default_trng_plan = get_default_trng_plan(goal_name)
    
    # Create list to store all generated items for the custom plan:
    custom_trng_plan = []

    # Create all activities for custom plan, using default plan as base: 
    for workouts in default_trng_plan: 
        custom_workouts = Custom_Trng_Plan(
                                            athlete_id=athlete_id,
                                            goal_id=goal_id,
                                            default_plan_id=workouts.default_plan_id,
                                            day=workouts.day,
                                            trng_item=workouts.trng_item,
                                            date=None
                                            )
        custom_trng_plan.append(custom_workouts)
        db.session.add_all(custom_trng_plan)
    
    # Prep for date assignment:
    # Count days until goal_date (incl. today in count):
    today = datetime.today()
    days_until = (goal_date - today).days + 1 # +1 to incl. today
    # Calc total num of workouts in custom_plan:
    tot_num_workouts = len(custom_trng_plan)
    # Subtract daysUntil from totalWorkouts to see how many workouts are left to render:
    render_num = tot_num_workouts - days_until

    # Assign each workout a date, beginning with today:
    activity_date = today.date()
    for workout in custom_trng_plan:
        # Limit date assignment to fit number of days between today & goal date: 
        if workout.day >= render_num:
            workout.date = activity_date
            # Increment date for next day's activity:
            activity_date = activity_date + timedelta(days=1)

    db.session.commit()

    return custom_trng_plan


def get_custom_trng_plan(goal_id):
    """Get athlete's custom training plan."""

    return Custom_Trng_Plan.query.filter(Custom_Trng_Plan.goal_id == goal_id).all()


def save_custom_trng_plan_item(custom_plan_id, trng_item=None, date=None):
    """Save changes to a specific training item in the athlete's custom training plan."""

    row = Custom_Trng_Plan.query.filter(Custom_Trng_Plan.custom_plan_id == custom_plan_id).one()
    
    if date:
        row.date = date
    if trng_item:
        row.trng_item = trng_item

    db.session.commit()

    return row


def create_default_trng_plan(plan_name, day, trng_item):
    """Create and return a default training plan."""

    default_trng_plan = Default_Trng_Plan(
                                        plan_name=plan_name,
                                        day=day,
                                        trng_item=trng_item
                                        )

    db.session.add(default_trng_plan)
    db.session.commit()

    return default_trng_plan


def get_default_trng_plan(plan_name):
    """Return a default training plan."""

    return Default_Trng_Plan.query.filter(Default_Trng_Plan.plan_name == plan_name).all()


# Execute the following only when 'crud.py' is called directly / run directly from the terminal:
if __name__ == "__main__":
    # This code is for connecting nested directories/files/making variables accessable:
    from database.model import connect_to_db
    from server import app
    connect_to_db(app)