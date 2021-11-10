"""Script to seed database"""

# # # This code is for connecting nested directories/files/making variables accessable # # #
import os
import sys

BASE_PATH = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_PATH)
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

from server import app
from model import db, connect_to_db
from crud import create_default_trng_plan
import json

os.system("dropdb strava_balans")
os.system("createdb strava_balans")

connect_to_db(app)
db.create_all()


# Loop through all default plans:
files = ['default_5k_run', 'default_10k_run', 'default_50mi_ride']

for file in files:
    # Load default plan from JSON file:
    with open(f"default_trng_plans/{file}.json") as file:
        default_trng_plans = json.loads(file.read())

    # Create default plan with data from JSON file:
    for plan in default_trng_plans:
        plan_name, day, trng_item = (
                                    plan['plan_name'],
                                    plan['day'],
                                    plan['trng_item']
                                    )

        default_trng_plan = create_default_trng_plan(plan_name, day, trng_item)