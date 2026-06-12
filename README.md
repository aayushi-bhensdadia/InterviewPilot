# Interview Pilot

A full-stack interview practice platform built with React, Vite, Node.js, and MongoDB.

The application lets users sign up, create interview sessions, answer questions in a live interview room, evaluate responses, and review results.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Overview](#api-overview)
- [Available Pages](#available-pages)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## Features

- User registration, login, and authenticated sessions
- Create and manage interview templates
- Add questions to interviews
- Real-time interview room experience
- Submit answers and complete interviews
- View interview results and score breakdown
- Protected routes for dashboard, interview room, results, and profile

## Tech Stack

- Backend: Node.js, Express, MongoDB, Mongoose
- Frontend: React, Vite, Tailwind CSS / DaisyUI
- Authentication: JSON Web Tokens (JWT)
- API client: Axios

## Repository Structure

- `backend/`
  - `server.js` — Express server entry point
  - `routes/` — API route definitions
  - `controllers/` — Route handlers
  - `models/` — Mongoose schemas
  - `middleware/` — Auth middleware
  - `config/` — Database connection logic
- `frontend/`
  - `src/` — React source code
  - `src/pages/` — Application page views
  - `src/components/` — Reusable UI components
  - `src/services/api.js` — Axios API client
  - `src/context/AuthContext.jsx` — Authentication state

## Getting Started

### Prerequisites

- Node.js 16+ installed
- npm (or yarn)
- MongoDB instance (local or hosted)

### Backend Setup

1. Open a terminal in the `backend` folder.
2. Install dependencies:

```bash
cd backend
npm install
```

3. Create a `.env` file in `backend/`.
4. Add the required values:

```env
PORT=5000
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret
```

5. Start the backend server:

```bash
npm run dev
```

The backend listens on the port defined in `PORT`, defaulting to `5000`.

### Frontend Setup

1. Open a terminal in the `frontend` folder.
2. Install dependencies:

```bash
cd frontend
npm install
```

3. If needed, copy `frontend/.env.example` to `frontend/.env` and configure `VITE_API_URL`.
4. Run the frontend app:

```bash
npm run dev
```

The frontend runs on `http://localhost:5173` by default.

## Environment Variables

### Backend (`backend/.env`)

- `PORT` — Backend server port
- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — Secret key for signing JWT tokens

### Frontend (`frontend/.env`)

- `VITE_API_URL` — Optional API base URL (defaults to `http://localhost:5000/api`)

## API Overview

The backend exposes the following API paths:

- `POST /api/users/signup` — Register a new user
- `POST /api/users/login` — Authenticate user and return JWT
- `GET /api/users/profile` — Get current user profile
- `POST /api/interviews` — Create a new interview
- `GET /api/interviews` — Get interviews for current user
- `GET /api/interviews/:id` — Get interview details
- `POST /api/interviews/:id/answer` — Submit an interview answer
- `POST /api/interviews/:id/complete` — Complete the interview
- `POST /api/questions` — Create a question for an interview
- `GET /api/questions/interview/:interviewId` — Get questions for an interview
- `GET /api/results/:interviewId` — Get results for an interview

## Available Pages

- `/` — Login page
- `/signup` — Signup page
- `/dashboard` — User dashboard
- `/createInterview` — Create a new interview
- `/interview/:id` — Interview room
- `/results/:id` — Interview results
- `/profile` — User profile

## Development

- Run backend and frontend in separate terminals.
- Use the frontend proxy or set `VITE_API_URL` when the backend is on a different port.
- Test API routes with a tool like Postman if needed.

## Contributing

Contributions are welcome.

1. Fork the repository
2. Create a new branch
3. Open a pull request with a summary of changes

## License

This repository does not include a license file. Add one before publishing or sharing the project.
