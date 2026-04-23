# CougPlace

CougPlace is a campus-focused marketplace web application built for CPTS 489. It allows students to create verified accounts, browse and search listings, view item details, create and manage listings, update profile information, change passwords, and use a simple real-time chat feature.

## Team Members
- Andres Sanchez
- Arni Thorvaldsson
- Emmett Kjolseth

## Tech Stack
- Node.js
- Express.js
- EJS
- SQLite (`better-sqlite3`)
- Express Session
- Nodemailer

## Project Structure
- `app.js` - application entry point
- `routes/index.js` - main routes and controller logic
- `routes/users.js` - Express-generated placeholder users route
- `views/` - EJS templates
- `public/stylesheets/style.css` - shared application styling
- `db.js` - SQLite database setup
- `cougplace.db` - SQLite database file

## Install Dependencies

npm install

## Environment Variables / Configuration
This current classroom prototype does **not** require a `.env` file to start the app locally.

## Restore the Database
This project uses SQLite.

To restore the database for local testing:
1. Make sure the included `cougplace.db` file is placed in the project root directory.
2. Do **not** rename the file unless you also update the path inside `db.js`.
3. No additional restore command is required because SQLite reads the database file directly.

## Start the Application

npm install
npm start

The application will run at:

http://localhost:3000


## Default Test Flow
1. Open `http://localhost:3000`
2. Log in with an existing test account or create a new account through sign-up
3. Browse the marketplace
4. Search for listings
5. View item details
6. Open the seller dashboard
7. Create a listing
8. Mark a listing as sold or delete it
9. Update the profile and test change password

## Notes About the Current Prototype
- Passwords are stored in plain text in the current classroom prototype.
- Chat system idea was scrapped due to time constraints
- Listing report submissions are currently UI-only and are not stored.
- The app currently uses a shared authenticated user flow rather than a fully implemented admin role workflow.
