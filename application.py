import os

from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)


@app.route("/")
def index():
    return render_template("index.html")


@socketio.on("registration_request")
def registration_request(data):
    print(data)
    if data['name'] == 'stinky':
        emit('registration_success')
    else:
        emit('flash', "Unable to register")
