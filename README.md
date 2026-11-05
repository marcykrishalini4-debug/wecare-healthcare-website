# WeCare – Healthcare Website

WeCare is a full-stack healthcare website designed to help users explore healthcare services, search for doctors, and submit appointment requests.

## Key Features

- User-friendly healthcare website interface
- Doctor search by name and medical specialty
- Doctor search by location
- Online appointment request submission
- Newsletter subscription
- Contact and enquiry form
- Backend API integration
- MongoDB database integration
- Input validation and error handling

## Technologies Used

**Frontend**
- HTML5
- CSS3
- JavaScript

**Backend**
- Node.js
- Express.js

**Database**
- MongoDB
- Mongoose

**Additional Library**
- Nodemailer (installed in the project)

## Project Structure

```text
wecare-fullstack/
├── public/
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   └── photos/
├── server.js
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

## Installation and Setup

1. Clone the repository:

```bash
git clone YOUR_REPOSITORY_URL
```

2. Navigate to the project folder:

```bash
cd wecare-healthcare-website
```

3. Install dependencies:

```bash
npm install
```

4. Create a `.env` file in the project root and configure your MongoDB connection:

```env
MONGODB_URI=your_mongodb_connection_string
PORT=3000
```

5. Start the development server:

```bash
npm run dev
```

6. Open your browser:

```text
http://localhost:3000
```

## Learning Outcomes

- Practical experience in full-stack web development
- Connecting frontend applications with backend APIs
- Working with MongoDB and Mongoose
- Implementing form submissions and data validation
- Managing project dependencies using npm

## Project Status

Developed as a hands-on full-stack web development project. Further improvements and enhancements are planned.

## Author

Developed as a personal learning project.

This is a learning/demo starter, not a production medical system. It does not include login, an admin dashboard, email/SMS notifications, payment, doctor availability scheduling, or protection against double-booking. Do not collect real patient medical information until you have added proper authentication, authorization, HTTPS, privacy/security controls, backups, and any legally required safeguards. Do not expose database credentials or publish `.env`.
