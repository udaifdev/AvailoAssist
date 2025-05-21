import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path'
import cookieParser from 'cookie-parser';
import connectDB from './models/dbConfig';

import { createServer } from 'http';
import { Server } from 'socket.io';

import userRoutes from './routes/UserRoutes/userRouter';
import workerRoutes from './routes/WorkerRoutes/workerRouter';
import chatRoutes from './routes/ChatRoutes/chatRoutes'
import uploadsRoutesrouter from "../src/routes/Uploads/uploadsRoutes"; // Fixed import

const app = express();

// Load .env variables
dotenv.config();

// Connect to MongoDB
connectDB();

app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from your frontend
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


// const httpServer = createServer(app);
// const io = new Server(httpServer, {
//   cors: {
//     origin: 'http://localhost:3000', // Frontend URL
//     methods: ['GET', 'POST']
//   }
// });

// Example of middleware that handles errors
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('User Service Error:', err);
  res.status(500).json({ error: 'Server Error', details: err.message });
});

app.use(cookieParser()); // Middleware to parse cookies
app.use(express.json()); // Parse JSON data
app.use(express.urlencoded({ extended: true })); // Parse form data

// API Routes
app.use('/api/user', userRoutes); // User-related routes
app.use('/api/worker', workerRoutes); // Worker-related routes
app.use('/api/chat', chatRoutes); // chat-related routes




app.get('/worker.js', (req, res) => {
  res.set('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, 'public', 'worker.js'));
});

// Upload route
app.use('/api', uploadsRoutesrouter);

// const PORT = process.env.PORT;


const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

httpServer.listen(8081, () => {
  console.log(`Server is running on http://localhost:${8081}`);
});

// Update socket handlers
io.on('connection', (socket) => {
  console.log('A user connected..........', socket.id);
  socket.on('joinRoom', (room) => {
    console.log('Joining room..........', room);
    socket.join(room);
  });

  socket.on('sendMessage', (data) => {
    console.log('New message:', data);
    // Broadcast to all clients in the room INCLUDING sender
    io.in(data.room).emit('receiveMessage', data.message);
  });

  socket.on('leaveRoom', (room) => {
    console.log('Leaving room:', room);
    socket.leave(room);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});