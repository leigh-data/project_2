import os

from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)


USERS = []


@app.route("/")
def index():
    return render_template("index.html")


@socketio.on("registration_request")
def registration_request(data):
    print(data)
    if data['username'] not in USERS:
        USERS.append(data['username'])
        emit('registration_success', {
             'username': data['username']}, room=request.sid)
        emit('flash', "user registered."room=request.sid)
    else:
        emit('flash', "User already registered."room=request.sid)
