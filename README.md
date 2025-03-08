# AI Chatbot with Server-Sent Events Demo

This project demonstrates a real-time AI chatbot application using Server-Sent Events (SSE) for streaming LLM responses. The application features a React frontend and an Egg.js-powered Node.js backend, enabling real-time, synchronous rendering of AI responses as they are generated.

## Key Features

- Real-time streaming of LLM responses using Server-Sent Events (SSE)
- Token-by-token rendering of AI responses
- Built with Egg.js framework for robust backend services
- React-based interactive chat interface

## Project Structure

```
.
├── src/           # Frontend React application with SSE client implementation
├── server/        # Egg.js backend server with SSE controller
├── public/        # Static files
└── package.json   # Frontend dependencies
```

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- An LLM API key (if using external AI services)

## Installation

### Frontend Setup

1. Install frontend dependencies:
```bash
npm install
```

### Backend Setup (Egg.js Server)

1. Navigate to the server directory:
```bash
cd server
```

2. Install backend dependencies:
```bash
npm install
```

3. Configure your environment variables:
   - Create a `.env` file in the server directory
   - Add your LLM API credentials (if required)

## Running the Application

### Start the Egg.js Backend Server

1. From the server directory:
```bash
cd server
npm start
```

The Egg.js server will start and listen for incoming connections, handling SSE streams for AI responses.

### Start the Frontend Development Server

1. In a new terminal, from the project root:
```bash
npm start
```

The frontend development server will start and automatically open your default browser to `http://localhost:3000`.

## Development

- Frontend runs on: `http://localhost:3000`
- Egg.js backend API runs on: `http://localhost:7001`
- SSE endpoint: `http://localhost:7001/api/chat/stream`

## Scripts

Frontend:
- `npm start` - Starts the development server
- `npm test` - Runs the test suite
- `npm run build` - Creates a production build
- `npm run eject` - Ejects from create-react-app

Backend (Egg.js):
- `npm start` - Starts the Egg.js server
- `npm test` - Runs the backend tests
- `npm run dev` - Starts the server in development mode with hot reload

## Technical Implementation

### Server-Sent Events (SSE)
The application uses SSE to establish a one-way communication channel from the server to the client, enabling real-time streaming of LLM responses. This provides several benefits:
- Efficient streaming of AI responses
- Real-time token-by-token display
- Reduced latency compared to traditional polling
- Native browser support without WebSocket complexity

### Egg.js Framework
The backend is built with Egg.js, a robust Node.js framework that provides:
- Built-in security features
- Efficient middleware system
- Easy-to-use plugin system
- Production-ready architecture

## License

This project is licensed under the MIT License - see the LICENSE file for details. 