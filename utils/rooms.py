from collections import deque
from utils.message import format_message

CHANNELS = {'atrium': deque([], maxlen=10)}


def get_messages(channel):
    if CHANNELS[channel]:
        return list(CHANNELS[channel])
    else:
        return []


def add_message(channel, username, message):
    print(CHANNELS[channel])
    if CHANNELS[channel] is not None:
        msg = format_message(username, message)
        print(msg)
        CHANNELS[channel].append(msg)
