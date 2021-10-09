"""Create Flask web app routes to render HTML pages of web app"""

# 'flask' is the micro web app framework, 'Blueprint' is a class, and 'render_template' is a function
from flask import Blueprint, render_template

# Blueprints allow you to break up your application into modules and thereby help organize views / code.
# Create an instance of the class Blueprint:
views = Blueprint('views', __name__) 


# Use the route decorator to connect your view / function to your desired URL:
@views.route('/') # Implicit -> ('/', methods=('GET'))
def show_homepage():
    """Show homepage"""

    return render_template("homepage.html")