import datetime


def format_message(username, text):
    now = datetime.datetime.now().strftime('%m/%d %H:%M %p')
    return {
        'username': username,
        'text': text,
        'time': now
    }
