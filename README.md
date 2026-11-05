# WeCare Healthcare Website — Starter Full-Stack Project

This project keeps your existing HTML/CSS frontend and adds a Node.js/Express API with MongoDB.

## Requirements
- Node.js LTS installed
- MongoDB Community Server running locally, OR a MongoDB Atlas connection string
- Internet connection for the existing Font Awesome CDN

## Setup on Windows
1. Install Node.js LTS from https://nodejs.org/ and restart your terminal.
2. Install MongoDB Community Server from https://www.mongodb.com/try/download/community and start the MongoDB service, OR create a MongoDB Atlas cluster.
3. Extract this project folder.
4. Open the folder in VS Code.
5. Open Terminal > New Terminal.
6. Run `npm install`
7. Copy `.env.example` to a new file named `.env`.
8. For a local MongoDB server, leave `MONGODB_URI=mongodb://127.0.0.1:27017/wecare`.
   For Atlas, replace it with your Atlas connection string. Keep the password private.
9. Run `npm run dev` (or `npm start`).
10. Open http://localhost:3000 in your browser. Do not open index.html directly from File Explorer.

## API endpoints
- GET `/api/health` — check that the API is running
- GET `/api/doctors` — list doctors
- GET `/api/doctors?search=cardio` — search name/specialty
- GET `/api/doctors?location=WeCare` — filter location
- POST `/api/appointments` — create an appointment request
- POST `/api/newsletter` — subscribe an email
- POST `/api/enquiries` — save a contact enquiry (API is ready; the current HTML does not yet contain a contact form)

## Testing
Open http://localhost:3000/api/health. Expected JSON:
`{"status":"ok","message":"WeCare API is running"}`

The first run inserts five sample doctors if the doctors collection is empty.
Appointments are created with `pending` status; this demo does not confirm bookings automatically.

## Important before public deployment
This is a learning/demo starter, not a production medical system. It does not include login, an admin dashboard, email/SMS notifications, payment, doctor availability scheduling, or protection against double-booking. Do not collect real patient medical information until you have added proper authentication, authorization, HTTPS, privacy/security controls, backups, and any legally required safeguards. Do not expose database credentials or publish `.env`.
