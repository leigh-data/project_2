USERS = []


def register(username):
    user = {
        'username': username,
        'room': 'atrium',
        'session_id': None
    }

    USERS.append(user)


def login(username, session_id):
    # get user
    index = next((index for (index, d) in enumerate(
        USERS) if d["username"] == username), -1)

    if index != -1:
        USERS[index]['session_id'] = session_id
        print(USERS[index])
        return True
    else:
        return False


def join_channel_data(session_id, channel):
    index = next((index for (index, d) in enumerate(
        USERS) if d["session_id"] == session_id), -1)

    if index != -1:
        user = USERS[index]
        user['channel'] = channel
        return user


def diconnect_user(session_id):
    # get user
    index = next((index for (index, d) in enumerate(
        USERS) if d["session_id"] == session_id), -1)

    if index != -1:
        user = USERS[index]
        user['session_id'] = None
        return user
