import os
from collections import deque
import stringcase

from flask import Flask, render_template, request, redirect, url_for
from flask_socketio import SocketIO, emit, send, join_room, leave_room
from engineio.payload import Payload

from utils.users import USERS, register, login, diconnect_user, join_channel_data, get_channel_users, user_exists
from utils.message import format_message
from utils.channels import CHANNELS, get_messages, add_message, MAX_MESSAGES

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
Payload.max_decode_packets = 150
socketio = SocketIO(app)


@app.errorhandler(404)
def page_not_found(e):
    """404 gets sent to home page. SPA client JS handles urls."""
    return redirect(url_for("index"))


@app.route("/")
def index():
    return render_template("index.html")


@socketio.on('connect')
def connect():
    print("CONNECT")


@socketio.on("registration_request")
def registration_request(data):
    if user_exists(data['username']):
        emit('flash', "User already registered.")
    else:
        register(data['username'])
        emit('registration_success', {
             'username': data['username']})
        emit('flash', "user registered.")


@socketio.on("login_request")
def login_request(data):
    user = login(data['username'], request.sid)
    if user:
        emit('login_success', {
             'username': user['username'], 'channel': user['channel']}, room=request.sid)
    else:
        emit('flash', 'User not found. Please register.', room=request.sid)
        emit('login_fail', room=request.sid)


@socketio.on("channel_request")
def channel_request(data):
    requested_channel = stringcase.snakecase(data['channel'])

    if requested_channel not in CHANNELS:
        CHANNELS[requested_channel] = deque([], maxlen=MAX_MESSAGES)
        emit('refresh_channels', {'channels': [*CHANNELS]}, broadcast=True)
        emit('flash', f"{requested_channel} channel created.", broadcast=True)
    else:
        emit('flash', "Could not create channel")


@socketio.on("join_channel")
def join_channel(data):
    user = join_channel_data(request.sid, data['channel'])
    join_room(data['channel'])
    emit('flash', f"{user['username']} has entered the room.",
         room=data['channel'])
    users = get_channel_users(data['channel'])
    channel_messages = get_messages(data['channel'])
    emit("refresh_messages", {
         'messages': channel_messages}, room=data['channel'])
    emit("refresh_channels", {'channels': [*CHANNELS]})
    emit("refresh_users", {'users': users}, room=data['channel'])


@socketio.on("leave_channel")
def leave_channel(data):
    leave_room(data['channel'])
    join_channel_data(request.sid, None)
    users = get_channel_users(data['channel'])
    emit("refresh_users", {'users': users}, room=data['channel'])


@socketio.on("push_message")
def push_message(data):
    username = data['username']
    msg = data['msg']
    channel = data['channel']

    add_message(channel, username, msg)
    channel_messages = get_messages(channel)
    emit('refresh_messages', {'messages': channel_messages}, room=channel)


@socketio.on("send_convogram")
def send_convogram(data):
    session_id = data['session_id']
    sender = data['username']
    msg = data['msg']

    emit("receive_convogram", {
        'sender': sender,
        'msg': msg
    }, room=session_id)


@socketio.on('disconnect')
def disconnect():
    sid = request.sid
    user = diconnect_user(sid)
    if user:
        emit(
            'flash', f"{user['username']} has left the room.", room=user['channel'])
        emit('refresh_users')
        users = get_channel_users(user['channel'])
        emit("refresh_users", {'users': users}, room=user['channel'])
