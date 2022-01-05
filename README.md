# BALANS

[![Watch the demo on Youtube](https://user-images.githubusercontent.com/89751654/143115159-93c5eaec-053d-4da8-83a9-f52683a742c4.png)](https://youtu.be/vDR7UKrjt9I)

## Table Of Contents
1. [Project Description](#project-description)
2. [Tech Stack](#tech-stack)
3. [Set-Up](#set-up)
4. [Project Development / Iterations](#project-development-/-iterations)
5. [Future Features](#future-features)
6. [Demo Media](#demo-media) 
7. [Progress Media](#progress-media) 

## Project Description
BALANS is a full-stack Python Flask web application that allows Strava users to to visualize and filter their activities (by type and/or date) on an interactive Javascript Leaflet map as well as to create, read, update, delete training goals and the respective training plans with Javascript FullCalendar. The goal of this web application was to remove the competitive nature of the original Strava platform and, instead, allow a user to focus exclusively on their own athletic accomplishments and all-around well-being.

With the map component, a user can enjoy immediately seeing the geographic diversity of their past activities as well as enjoy exploring the frequency of their activity types across locations and years. A user could answer questions like, “In which countries / states, do I run the most?”, “Which neighborhoods in my area have I explored the most or least during my training?”, “In what years, was I really into biking?”, “What sport did I do the most during COVID?”, etc.

With the calendar component, a user can experience a sense of accomplishment by viewing all of their past training goals and plans, and a boost in motivation by viewing all of their current and future training goals and plans. A user can analyze which type of sport they train for the most, and, within that, which particular events. They can also identify the typical seasons in which they race / compete. A user can customize the individual items of their plan to fit their personal needs, so they also can evaluate how certain life events have affected their daily training in the past and, with that, plan their daily training items in the future in a way more realistically aligned to their personal routine.

With the future diet and journal components, a user will be able to record and track other aspects of their health and assess how those areas of their life are influencing their mood and physical fitness.

<i>Current Key Features Summarized:</i>
* Visualize physical activities on an interactive and customizable map
* Filter activities on map by type and / or by year
* Option to personalize map center to user's location
* Link directly to an activity on Strava
* Link directly to user's Strava dashboard
* Create & delete training goals
* Read & update each training goal's respective training plan on an interactive calendar
* Form input validation
* Strava user authentication
* Login protections

## Tech Stack
* Python, Flask, PostGreSQL, SQLAlchemy, JavaScript (AJAX, JSON), jQuery, Bootstrap, HTML, CSS
* Strava REST API

## Set-Up
1. Create an API account with Strava:
    * Follow the Strava documentation found [here] (https://developers.strava.com/docs/getting-started/#:~:text=If%20you%20have%20not%20already,My%20API%20Application%E2%80%9D%20page%20now)
    * Update the file `auth.py` with your personal API information:
        * `CLIENT_ID = <your_client_ID>`
        * `CLIENT_SECRET = <your_client_secret`
2. Clone this repo:
    * `cd <your_desired_directory>`
    * `git clone https://github.com/katalinschmidt/strava_balans.git`
3. Set-up the virtual environment:
    * `virtualenv env`
    * `source env/bin/activate`
    * `pip3 install -r requirements.txt`
4. Seed the database with default training plans:
    * `cd database`
    * `python3 seed_database.py`
5. To view the contents of the database (PostgreSQL):
    * `psql strava_balans`
6. To add new default training plans to the database:
    * Create a new json file in the `default_trng_plans` directory
    * Add the json file's name to line 24 in `seed_database.py`
    * Add the new plan as an option on the training goals form in `training.html`
    * Seed / Re-seed the database (see step 2.)

## Project Development / Iterations
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
5. Given goal's training plan rendered on a FullCalendar calendar:
    * Training item & date
6. Extend CRUD functions:
    * Allow user to edit individual activity item, and record those changes in database
7. "Nav" Table to allow user to view all of their existing training goals:
    * Click to show a goal / associated plan on the calendar, or
    * Click to delete goal / associated plan from database
8. Extend interactive Leaflet functionality:
    * Filter routes by type and year
9. Extend interactive Leaflet functionality:
    * Allow user to customize map appearance

## Future Features
* Diet page
* Journal page

## Demo Media
<img width="1407" alt="index.html" src="https://user-images.githubusercontent.com/89751654/141047643-930783c0-2787-4f14-9559-39a5fa35fa8d.png">
<img width="1271" alt="index.html-top-layer" src="https://user-images.githubusercontent.com/89751654/141051366-674c5fa3-832b-47f8-b092-181724e1bac8.png">
<img width="1271" alt="index.html-bottom-layer" src="https://user-images.githubusercontent.com/89751654/141051379-3af6cc88-88c2-4a84-b117-9d4748256f5e.png">
<img width="1122" alt="loader-animation" src="https://user-images.githubusercontent.com/89751654/141047665-eee549be-1b1c-45e9-a7b5-a24b9d234cf6.png">
<img width="1359" alt="example-routes-and-navbar" src="https://user-images.githubusercontent.com/89751654/141047652-67e29791-3d2c-4511-af21-91bd9cb0eb13.png">
<img width="1432" alt="example-routes-and-navbar-filters-applied" src="https://user-images.githubusercontent.com/89751654/141048126-bece856a-b7a5-451a-9e6a-d0e8865fdcab.png">
<img width="1428" alt="training.html" src="https://user-images.githubusercontent.com/89751654/141048707-c6990e3c-3abc-42cb-90bb-0779ba498bf9.png">
<img width="1428" alt="training-goals-form" src="https://user-images.githubusercontent.com/89751654/141048637-fe290938-f4fa-47fc-98c1-b6f23ed826ba.png">
<img width="1430" alt="edit-trng-item" src="https://user-images.githubusercontent.com/89751654/141048753-01552ea2-1d46-4c8b-b1e8-89d235a82235.png">
<p align="center">
   <img width="400" alt="form-validation-date" src="https://user-images.githubusercontent.com/89751654/143117801-4899f1af-0354-4c99-8681-5447b52d3bae.png">
   <img width="400" alt="form-validation-goal" src="https://user-images.githubusercontent.com/89751654/143117824-2b240ba1-f058-4f25-87d8-ea21c7b0318c.png">
</p>
<img width="1268" alt="logout-alert" src="https://user-images.githubusercontent.com/89751654/141048947-779ccd02-038d-4365-b8e1-5e12ab8e57c2.png">
<img width="1269" alt="invalid-access-alert" src="https://user-images.githubusercontent.com/89751654/141048958-f28e2c1f-b500-48c6-8038-36d23bb3a933.png">

## Progress Media
<p>Polylines before and after:</p>
<img width="600" alt="polyline-trial-error" src="https://user-images.githubusercontent.com/89751654/143098000-27538a98-837f-4b0c-800e-dee98e2165b0.jpeg">

<p>Splitscreen slider in-progress:</p>

https://user-images.githubusercontent.com/89751654/143097961-8cd1dd0f-71f2-4e14-b1e2-c4bdda120aee.mov

<p>Splitscreen slider in-progress:</p>

https://user-images.githubusercontent.com/89751654/143109430-230092a2-0162-4b61-ab95-da40b5aa7f5c.mov
