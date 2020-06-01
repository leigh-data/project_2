import os

from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, send, join_room

from utils.users import USERS, register, login, diconnect_user, join_channel_data, get_channel_users, user_exists
from utils.message import format_message
from utils.rooms import get_messages, add_message

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)


@app.route("/")
def index():
    return render_template("index.html")


@socketio.on('connect')
def connect():
    print("CONNECT")


@socketio.on("registration_request")
def registration_request(data):
    print(data)
    if user_exists(data['username']):
        emit('flash', "User already registered.")
    else:
        register(data['username'])
        emit('registration_success', {
             'username': data['username']})
        emit('flash', "user registered.")
        


@socketio.on("login_request")
def login_request(data):
    if login(data['username'], request.sid):
        emit('login_success', {'username': data['username']}, room=request.sid)
    else:
        emit('flash', 'User not found. Please register.', room=request.sid)
        emit('login_fail', room=request.sid)


@socketio.on("join_channel")
def join_channel(data):
    user = join_channel_data(data['session_id'], data['channel'])
    join_room(data['channel'])
    emit('flash', user['username'] + ' has entered the room.', room=data['channel'])
    users = get_channel_users(data['channel'])
    channel_messages = get_messages(data['channel'])
    emit("refresh_users", {'users': users}, room=data['channel'])
    emit("refresh_messages", {
         'messages': channel_messages}, room=data['channel'])


@socketio.on("push_message")
def push_message(data):
    username = data['username']
    msg = data['msg']
    channel = data['channel']

    add_message(channel, username, msg)
    channel_messages = get_messages(channel)
    print(channel_messages)
    emit('refresh_messages', {'messages': channel_messages}, room=channel)


@socketio.on('disconnect')
def disconnect():
    sid = request.sid
    user = diconnect_user(sid)

    if user:
        emit('flash', f"{user['username']} has left the room.", room=user['channel'])
