# BALANS

## Table Of Contents
1. [Overview](#overview)
2. [Set-Up Instructions](#set-up-instructions)
3. [Project Development / Iterations](#project-development-/-iterations)
4. [Future Features](#future-features)


## Overview
This is a full-stack Python Flask web application that allows Strava users to to visualize and filter their activities (by type and/or date) on an interactive Javascript Leaflet map as well as to create, read, update, delete training goals and the respective training plans with Javascript FullCalendar. 

The goal of this web application was to remove the competitive nature of the original Strava platform and, instead, allow a user to focus exclusively on their own athletic accomplishments and all-around well-being.

## Tech Stack
* Python, Flask, SQLAlchemy, JavaScript (AJAX, JSON), jQuery, Bootstrap, HTML, CSS
* Strava REST API

## Set-Up Instructions
1. Set-up the virtual environment:
    * `virualenv env`
    * `source env/bin/activate`
    * `pip3 install -r requirements.txt`
2. Seed the database with default training plans:
    * `cd database`
    * `python3 seed_database.py`
3. To view contents of database (PostgreSQL):
    * `psql strava_balans`

## Project Development / Iterations:
1. Strava API authentication & API data rendered on a sortable table
2. Strava API data rendered on a Javascript Leaflet map
3. Interactive Leaflet functionality:
    * Click route for details pop-up (e.g. activity type, name, mileage, etc.)
    * Filter routes by type or year
4. Database set-up & CRUD functions:
    * Form to create training goals
    * Store user-input in database
    * Create custom training plan by matching user-input with default plans' data
    * Render user's given goal's training items on table:
        * Training item & day (e.g. days 1-56, as stored in default plan's DB table)
5. Given goal's training plan rendered on a FullCalendar calendar
6. Extend CRUD functions:
    -> Allow user to drag & drop activities, and record those changes in database
7. "Nav" Table to allow user to view all of their existing training goals:
    * Click to show a goal / associated plan on the calendar, or
    * Click to delete goal / associated plan from database
8. Extend interactive Leaflet functionality:
    * Filter routes by type & year

## Future Features:
1. Allow user to customize map appearance
2. Create diet page
    * Allow user entries, recorded per day & time
3. Create journal page
    * Allow user entries, recorder per day
    * Provide journal prompts
4. Extended data visualization features on Leaflet, e.g. num of countries you've run/biked/swam in