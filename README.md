# Project 2

Web Programming with Python and JavaScript

## SeDaKA- Social Distancing Kick-it Area

[GitHub](https://github.com/leigh-data/project_2)

[YouTube](https://youtu.be/OkozRtxjLx0)

---

This web application uses Socket.io to send messages to all users in a particular chat room. Any user may add their own chat room with the form on the side. Each room caches the 100 most recent messages. If a user closes the window, the application will get the user back into the last visited room with his or her username (assuming the application did not restart).

### Added Feature: Convogram

Active users may send another active user a Convogram, a private message of less than 126 characters. The Convogram is displayed on the recipient's screen where flash messages are seen. The screen is positioned for the user to view the message.

## Application Directory

### /scss

This folder contains **.scss** files for styling the application.

#### font_awesome/

Contains scss files for Font Awesome icons.

#### \_main.scss

Contains custom styles.

#### styles.scss

The main style sheet.

### static/

This folder contains static assets.

#### css/

Contains the **styles.csss** file, which is compiled from the scss folder files.

#### fonts/

Contains fonts needed for Font Awesome icons.

#### js/

Holds the JavaScript files required to run the application. Contains a **lib/** directory, which has one file (**vanilla-router.min.js**) and **index.js**, which runs the SPA.

### templates/

Directory of application html templates. Contains one template: **index.html**.

### utils/

Directory of Python files used for the back-end.

#### **init**.py

Makes the directory a module.

#### channels.py

Handles channel related logic.

#### message.py

Formats individual messages.

#### users.py

Handles user functionality.

### .gitignore

Files and directories ignored in git commits.

### package.json

npm file. Used to download npm repositories (`npm install`) run the scss compilation (`npm run scss`)

### Procfile

Used by Heroku to run the application.

### requirements.txt

Python modules required for the application.

## Notes

This application uses [vanilla-router](https://www.npmjs.com/package/vanilla-router), an npm module that allows url routing. In the browser, you just enter the root website url (e.g. **https://sedaka.herokuapp.com**), and the JavaScript will take care of the rest.
