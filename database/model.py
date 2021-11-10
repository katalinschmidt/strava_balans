"""Database model for Balans web app"""

# 'flask_SQLAlchemy' is an extension that eases the use of SQLAlchemy
# SQLAlchemy is a library / ORM that facilitates the communication between Python programs and databases
from flask_sqlalchemy import SQLAlchemy

# Create an instance of the class 'SQLAlchemy':
db = SQLAlchemy()


# Each class represents a table in the database:
class Athlete(db.Model):
    """An athlete."""

    __tablename__ = "athletes"

    athlete_id = db.Column(db.Integer, unique=True, primary_key=True)
    fname = db.Column(db.String, nullable=False)
    lname = db.Column(db.String, nullable=False)
    profile_photo = db.Column(db.String)

    goals = db.relationship("Goal", back_populates="athlete")
    custom_trng_plans = db.relationship("Custom_Trng_Plan", back_populates="athlete")

    def __repr__(self):
        return f"< Athlete: {self.fname} - {self.athlete_id} >"


class Goal(db.Model):
    """An athlete's training goal."""

    __tablename__ = "goals"

    goal_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    athlete_id = db.Column(db.Integer, db.ForeignKey("athletes.athlete_id")) 
    goal_name = db.Column(db.String)
    goal_date = db.Column(db.DateTime)

    athlete = db.relationship("Athlete", back_populates="goals")
    custom_trng_plan = db.relationship("Custom_Trng_Plan", back_populates="goals")

    def __repr__(self):
        return f"< Goal: {self.goal_name} - {self.goal_date} - {self.athlete_id} >"
    
    def toDict(self):
        return {"goal_id": self.goal_id, "goal_name": self.goal_name, "goal_date": self.goal_date}


class Custom_Trng_Plan(db.Model):
    """An athlete's custom training plan (to achieve their training goal)"""

    __tablename__ = "custom_trng_plans"

    custom_plan_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    athlete_id = db.Column(db.Integer, db.ForeignKey("athletes.athlete_id"))
    goal_id = db.Column(db.Integer, db.ForeignKey("goals.goal_id"))
    default_plan_id = db.Column(db.Integer, db.ForeignKey("default_trng_plans.default_plan_id"))
    day = db.Column(db.Integer)
    trng_item = db.Column(db.String)
    date = db.Column(db.DateTime, nullable=True)

    athlete = db.relationship("Athlete", back_populates="custom_trng_plans")
    goals = db.relationship("Goal", back_populates="custom_trng_plan")
    default_trng_plan = db.relationship("Default_Trng_Plan", back_populates="custom_trng_plans")

    def __repr__(self):
        return f"< Custom_Trng_Plan: {self.athlete_id} - {self.day} - {self.trng_item} >"
    
    def toDict(self):
        return {"custom_plan_id": self.custom_plan_id, "goal_id": self.goal_id, "goal_name": self.goals.goal_name, "goal_date": self.goals.goal_date, "date": self.date, "day": self.day, "trng_item": self.trng_item}

class Default_Trng_Plan(db.Model):
    """The default plans for all possible training goals."""

    __tablename__ = "default_trng_plans"

    default_plan_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    plan_name = db.Column(db.String)
    day = db.Column(db.Integer)
    trng_item = db.Column(db.String)

    custom_trng_plans = db.relationship("Custom_Trng_Plan", back_populates="default_trng_plan")


def connect_to_db(flask_app, db_uri="postgresql:///strava_balans", echo=True):
    # The URI is an identifier of a specific resource. It tells you where to find the database.
    # PostgreSQL (see URI) is an open source object-relational database system. (Use 'psql' to access it in the cmd line)
    flask_app.config["SQLALCHEMY_DATABASE_URI"] = db_uri
    # With echo=True: SQLAlchemy will log all the statements issued to stderr which is useful for debugging.
    flask_app.config["SQLALCHEMY_ECHO"] = echo
    # With track=True: SQLAlchemy will track modifications of objects and emit signals.
    flask_app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # Set class attribute with flask_app (when called, this is 'app' from server.py):
    db.app = flask_app
    # The 'init_app' method connects the app to the database:
    db.init_app(flask_app)

    print("Connected to the db!")


# Execute the following only when 'model.py' is called directly / run directly from the terminal:
if __name__ == "__main__":
    # This code is for connecting nested directories/files/making variables accessable:
    import os
    import sys

    BASE_PATH = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    sys.path.append(BASE_PATH)

    from server import app
    connect_to_db(app)