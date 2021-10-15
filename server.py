"""Create and run Flask web app"""

# 'flask' is the micro web app framework, and 'Flask' is a Python class 
from flask import Flask
# 'connect_to_db' is a self-made func in database/model.py
from database.model import connect_to_db


def create_app():
    # Create an instance of the class 'Flask':
    app = Flask(__name__)
    
    # Apps require configuration. Here 'config' is a subclass of a dict, i.e. multiple key/value pairs:
    # Enable testing mode:
    app.config['TESTING'] = True
    # Create key for securely signing the session cookie:
    app.config['SECRET_KEY'] = 'test' # CHANGE 'test' UPON DEPLOYMENT / PRODUCTION

    # ASK ABOUT THE FOLLOWING:
    # app.config.from_object('yourapplication.default_settings')
    # app.config.from_envvar('YOURAPPLICATION_SETTINGS')

    # Import & register your Blueprint (to extend your web app):
    from views import views
    app.register_blueprint(views, url_prefix="/")

    return app


# Call function to create the web app:
app = create_app()
connect_to_db(app)

# Run the app only if this file is called directly:
# Keep debug set to true while developing
if __name__ == "__main__":
    # from database.model import connect_to_db
    # connect_to_db(app)
    app.run(debug=True)