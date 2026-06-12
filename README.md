# Interview Simulator

A full-stack interview practice application that creates mock interviews, lets users answer questions in a timed environment, evaluates responses, and stores results.

## Features
- Create and manage mock interviews
- Timed interview rooms with question navigation
- Automatic answer evaluation and results dashboard
- User authentication and profile management

## Tech Stack
- Backend: Node.js, Express, MongoDB (Mongoose)
- Frontend: React + Vite, Tailwind/DaisyUI
- Auth: JSON Web Tokens

## Repository Structure

- `backend/` — Express API, models, controllers, routes
- `frontend/` — React app and UI components

## Prerequisites
- Node.js (v16+ recommended)
- npm (or yarn)
- MongoDB instance (local or hosted)

## Backend Setup

1. Open a terminal in the `backend` folder.
2. Install dependencies:

```bash
cd backend
npm install
```

3. Create a `.env` file (copy from `.env.example` if present) and set the MongoDB connection string and any JWT secrets:

```
PORT=5000
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret
```

4. Run the server in development:

```bash
npm run dev
```

Or start the production server:

```bash
npm start
```

The backend runs on the port defined in the environment (default `5000`). The backend scripts are defined in `backend/package.json` (`dev` uses `nodemon`, `start` runs `node server.js`).

## Frontend Setup

1. Open a terminal in the `frontend` folder.
2. Install dependencies:

```bash
cd frontend
npm install
```

3. Create a `.env` file if needed (refer to `frontend/.env.example`), then run the dev server:

```bash
npm run dev
```

4. Build for production:

```bash
npm run build
```

The frontend uses Vite and serves on `http://localhost:5173` by default.

## Important Files
- `backend/server.js` — Backend entrypoint
- `frontend/src/App.jsx` — Frontend entrypoint
- `frontend/.env.example` — Example frontend environment variables

## API & Environment
The app expects typical REST endpoints for auth, interviews, questions, and results. Configure `MONGO_URI` and `JWT_SECRET` in the backend `.env` and any frontend API base URL in `frontend/.env`.

## Development Tips
- Run backend and frontend concurrently in separate terminals.
- Use Postman or similar to exercise API routes.

## Contributing
- Open issues or PRs with feature requests or bug fixes.

## License
This project does not include a license file. Add one if you plan to open-source it.

---
Created for the Interview Simulator project.
