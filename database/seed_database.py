"""Script to seed database."""

from server import app
from model import db, connect_to_db
from crud import create_default_trng_plan
import json
import os
import sys

BASE_PATH = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_PATH)

os.system("dropdb strava_balans")
os.system("createdb strava_balans")

connect_to_db(app)
db.create_all()


# Loop through all default plans:
files = ['default_5k_run', 'default_10k_run']

for file in files:
    # Load default plan from JSON file:
    with open(f"default_trng_plans/{file}.json") as file:
        default_trng_plans = json.loads(file.read()) # Why can't this be file.read().json() ? 

    # Create default plan with data from JSON file:
    for plan in default_trng_plans:
        plan_name, day, trng_item = (
                                    plan['plan_name'],
                                    plan['day'],
                                    plan['trng_item']
                                    )

        default_trng_plan = create_default_trng_plan(plan_name, day, trng_item)


# if __name__ == "__main__":
    # THIS WAY PRODUCES THE FOLLOWING ERRORS:
    # Error line 40: NameError: name 'create_default_trng_plan' is not defined
    # FIX => Add 'from crud import <func>' to top of file
    # New Error line 102 db.session.add in crud: RuntimeError: No application found.
    # FIX => Add 'import os...from server import app' to top of crud file
    # Same error
    # FIX => Add 'from model import...call connect_to_db()' to tope of crud file
    # New Error line 102 db.session.commit in crud: (psycopg2.errors.UndefinedTable) relation "default_trng_plans" does not exist
    # Same error
    # FIX => Add print statements to bottom of this file, to see if execution reaches here even (since db created, but w/o tables, i.e. db.create_all())
    # Same error => Prints 'Connected to the db!' Then begins SQL statement to insert first data from JSON.
    # FIX => Add drop/create db & createall to top of this file
    # New Error line 21 db.create_all(): RuntimeError: No application found.
    # FIX => Comment out if name=main from this file, since it will always only ever be called directly & remove connect_to_db from crud
    # THIS WORKED!!!

    # import os
    # import sys

    # BASE_PATH = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    # sys.path.append(BASE_PATH)

    # from server import app
    # from database.model import db, connect_to_db
    # from database.crud import create_default_trng_plan

    # os.system("dropdb strava_balans")
    # print("*"*20)
    # print("Dropped, now creating...")
    # print("*"*20)   
    # os.system("createdb strava_balans")

    # connect_to_db(app)
    # db.create_all()