"""Create and run Flask web app"""

# 'flask' is the micro web app framework, and 'Flask' is a Python class 
from flask import Flask


def create_app():
    # Create an instance of the class 'Flask':
    app = Flask(__name__)
    
    # Apps require configuration. Here 'config' is a subclass of a dict, i.e. multiple key/value pairs:
    # Enable testing mode:
    app.config['TESTING'] = True
    # Create key for securely signing the session cookie:
    app.config['SECRET_KEY'] = 'test' # CHANGE 'test' UPON DEPLOYMENT / PRODUCTION

    # Alternative syntax:
    # app.config.update(
    #     TESTING = True,
    #     SECRET_KEY = 'test'
    # )

    # ASK ABOUT THE FOLLOWING:
    # app.config.from_object('yourapplication.default_settings')
    # app.config.from_envvar('YOURAPPLICATION_SETTINGS')

    # Import & register your Blueprint (to extend your web app):
    from views import views
    from auth import auth

    app.register_blueprint(views, url_prefix="/")
    app.register_blueprint(auth, url_prefix="/")

    return app


# Call function to create the web app:
app = create_app()


# Run the app only if this file is called directly (and not imported):
# Keep debug set to true while developing
if __name__ == "__main__":
    app.run(debug=True)