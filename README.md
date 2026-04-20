# Orientation Morocco - Backend API

Career guidance SaaS platform for Moroccan students.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start development server:**
   ```bash
   npm start
   ```

   Server runs on: `http://localhost:3000` (or PORT from .env)

## Project Structure

```
├── server.js          # Express server entry point
├── package.json       # Dependencies & scripts
├── .env.example       # Environment template
└── README.md          # This file
```

## API Health Check

```bash
curl http://localhost:3000
```

Expected response:
```json
{ "message": "Server is running", "timestamp": "2026-04-20T..." }
```

## Next Steps

- Implement JWT authentication routes
- Connect MongoDB models
- Build API endpoints
