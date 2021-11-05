# BALANS

## Table Of Contents
1. [Overview](#overview)
2. [Set-Up Instructions](#set-up-instructions)
3. [MVP](#mvp)
4. [Future Features](#future-features)


## Overview
This is a full-stack web application that allows Strava users to to visualize and filter their activities on an interactive Javascript Leaflet as well as to create, show, update, delete training goals and the respective training plans with Javascript FullCalendar. The goal of this web application was to remove the competitive elements of the original Strava and, instead, allow a user to focus exclusively on their own atheletic accomplishments and all-around well-being.

Tech Stack: Strava REST API,  Python, Flask, SQLAlchemy, JavaScript (AJAX, JSON), jQuery, Bootstrap, HTML, CSS


## Set-Up Instructions
1. Set-up the virtual environment:
    * `virualenv env`
    * `source env/bin/activate`
    * `pip3 install -r requirements.txt`
2. Seed the database (with default training plans):
    * `cd database`
    * `python3 seed_db.py`
3. To view contents of database (using PostgreSQL):
    * `psql strava_balans`
    * `\dt` to view the database schema


## MVP:
1. Strava API authentication & API data rendered on a sortable table
2. Strava API data rendered on a Javascript Leaflet
3. Interactive Leaflet functionality: click route for details pop-up, filter routes by type or year
4. Form to create training goals and table to render given goal's training items per day (with days still being numbered 1-x as stored in the database, as opposed to calendar dates)
5. Form to create training goals and calendar to render given goal's training items
6. Navigation table to allow user to view all of their existing training goals with functionality to click and show on calendar or delete from database
7. Finalized interactive Leaflet functionality: filter routes by type & year

## Future Features:
1. Customize map appearance
2. Diet page -> user entries, recorded per day & time
3. Journal page -> user entries, recorder per day & with journal prompts











Project description:
- A full-stack web application that allows Strava users to to visualize and filter their own activities on an interactive Javascript Leaflet as well as to create, show, update, delete training goals and the respective training plans.
- The goal of this web application was to remove the competitive elements of the original Strava and, instead, allow a user to focus exclusively on their own atheletic accomplishments and all-around well-being.


Tech stack:
- Strava REST API,  Python, Flask, SQLAlchemy, JavaScript (AJAX, JSON), jQuery, Bootstrap, HTML, CSS


Features:
- Authenticate Strava users / API authentication & protect pages from unauthenticated users
- Filter activities by type and / or date
- See details of your activities with an interactive map -> zoom in/out and click routes for details pop-up
- Create, show, update, and delete training goals with a form & FullCalendar