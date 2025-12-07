const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const fs = require('fs');
const path = require('path');

// Configure allowed origins using environment variable and include localhost for development
const allowedOrigins = [
  process.env.CLIENT_URL || 'https://communication-platform-1.onrender.com',
  'http://localhost:3000'
];

app.use(cors({ origin: allowedOrigins, credentials: true }));

// Configure CORS for Socket.io using the same allowed origins
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});
app.use(express.json());

// Store active rooms and their participants
const rooms = new Map();

// Store socket connections
const socketToRoom = new Map();

// Room cleanup timeout (5 minutes after last person leaves)
const ROOM_CLEANUP_DELAY = 5 * 60 * 1000; // 5 minutes
const roomCleanupTimers = new Map();

// Helper: Load rooms from file
function loadRooms() {
  try {
    const dataDir = path.join(__dirname, 'data');
    const filePath = path.join(dataDir, 'rooms.json');
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(raw);
      data.forEach(room => {
        rooms.set(room.roomId, {
          participants: [],
          createdAt: room.createdAt,
          persistent: true
        });
      });
      console.log(`Loaded ${data.length} rooms from disk`);
    }
  } catch (err) {
    console.error('Failed to load rooms:', err);
  }
}

// Helper: Save rooms to file
function saveRooms() {
  try {
    const dataDir = path.join(__dirname, 'data');
    const filePath = path.join(dataDir, 'rooms.json');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const roomsArray = Array.from(rooms.entries())
      .filter(([_, room]) => room.persistent)
      .map(([roomId, room]) => ({
        roomId,
        createdAt: room.createdAt
      }));
    fs.writeFileSync(filePath, JSON.stringify(roomsArray, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save rooms:', err);
  }
}

// Load existing rooms on startup
loadRooms();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Contact message endpoint
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body || {};

  // Basic validation
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, Email, and Message are required' });
  }

  // Prepare message payload
  const payload = {
    id: uuidv4(),
    name: String(name).trim(),
    email: String(email).trim(),
    message: String(message).trim(),
    timestamp: new Date().toISOString()
  };

  try {
    const dataDir = path.join(__dirname, 'data');
    const filePath = path.join(dataDir, 'messages.json');

    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Read existing messages
    let existing = [];
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      existing = raw ? JSON.parse(raw) : [];
    }

    // Append new message
    existing.push(payload);

    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(existing, null, 2), 'utf8');

    return res.status(201).json({ success: true, id: payload.id });
  } catch (err) {
    console.error('Failed to save contact message:', err);
    return res.status(500).json({ error: 'Failed to save message' });
  }
});

// Create a new room
app.post('/api/room/create', (req, res) => {
  const { roomId } = req.body;
  
  if (!roomId) {
    return res.status(400).json({ error: 'roomId is required' });
  }
  
  console.log(`API: Creating room ${roomId}`);
  
  // Create room if it doesn't exist
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      participants: [],
      createdAt: new Date().toISOString(),
      persistent: true
    });
    saveRooms();
    console.log(`Room ${roomId} created via API and saved to disk`);
  } else {
    console.log(`Room ${roomId} already exists`);
  }
  
  const room = rooms.get(roomId);
  res.json({
    roomId,
    participants: room.participants.length,
    createdAt: room.createdAt,
    exists: true
  });
});

// Get room info
app.get('/api/room/:roomId', (req, res) => {
  const { roomId } = req.params;
  const room = rooms.get(roomId);
  
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  
  res.json({
    roomId,
    participants: room.participants.length,
    createdAt: room.createdAt
  });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join room
  socket.on('join-room', (roomId, userId, userName, isCreating = false) => {
    console.log(`User ${userId} (${userName}) ${isCreating ? 'creating' : 'joining'} room ${roomId}`);
    console.log(`Current rooms in memory: ${Array.from(rooms.keys()).join(', ')}`);
    
    // Check if room exists
    let roomExists = rooms.has(roomId);
    console.log(`Room ${roomId} exists: ${roomExists}`);
    
    // Only create room if explicitly creating, not when joining
    if (!roomExists) {
      if (isCreating) {
        // Create new room
        rooms.set(roomId, {
          participants: [],
          createdAt: new Date().toISOString(),
          persistent: true
        });
        saveRooms();
        console.log(`Room ${roomId} created by user ${userId}`);
        roomExists = true;
      } else {
        // Trying to join non-existent room
        socket.emit('room-not-found', { roomId });
        console.log(`Room ${roomId} not found - user ${userId} cannot join`);
        return;
      }
    }

    // Cancel cleanup timer if room was scheduled for deletion
    if (roomCleanupTimers.has(roomId)) {
      clearTimeout(roomCleanupTimers.get(roomId));
      roomCleanupTimers.delete(roomId);
      console.log(`Room ${roomId} cleanup cancelled - user joined`);
    }

    const room = rooms.get(roomId);
    
    // Add participant to room
    room.participants.push({
      socketId: socket.id,
      userId,
      userName
    });

    // Store room mapping
    socketToRoom.set(socket.id, roomId);
    
    // Join socket room
    socket.join(roomId);

    // Notify others in the room about new user
    socket.to(roomId).emit('user-joined', {
      userId,
      userName,
      socketId: socket.id
    });

    // Send list of existing participants to the new user
    const existingParticipants = room.participants
      .filter(p => p.socketId !== socket.id)
      .map(p => ({
        userId: p.userId,
        userName: p.userName,
        socketId: p.socketId
      }));

    socket.emit('room-participants', existingParticipants);
    socket.emit('room-joined', { roomId, roomExists: true });
  });

  // WebRTC signaling - offer
  socket.on('offer', (data) => {
    const { offer, targetSocketId, roomId } = data;
    socket.to(targetSocketId).emit('offer', {
      offer,
      senderSocketId: socket.id
    });
  });

  // WebRTC signaling - answer
  socket.on('answer', (data) => {
    const { answer, targetSocketId } = data;
    socket.to(targetSocketId).emit('answer', {
      answer,
      senderSocketId: socket.id
    });
  });

  // WebRTC signaling - ICE candidate
  socket.on('ice-candidate', (data) => {
    const { candidate, targetSocketId } = data;
    socket.to(targetSocketId).emit('ice-candidate', {
      candidate,
      senderSocketId: socket.id
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    const roomId = socketToRoom.get(socket.id);
    
    if (roomId && rooms.has(roomId)) {
      const room = rooms.get(roomId);
      
      // Find and remove the participant
      const participant = room.participants.find(p => p.socketId === socket.id);
      
      if (participant) {
        // Notify others in the room
        socket.to(roomId).emit('user-left', {
          userId: participant.userId,
          socketId: socket.id
        });

        // Remove participant from room
        room.participants = room.participants.filter(p => p.socketId !== socket.id);

        // Schedule room deletion if empty (with delay to allow rejoining)
        if (room.participants.length === 0) {
          // Clear any existing timer
          if (roomCleanupTimers.has(roomId)) {
            clearTimeout(roomCleanupTimers.get(roomId));
          }
          
          // Schedule room deletion
          const timer = setTimeout(() => {
            rooms.delete(roomId);
            roomCleanupTimers.delete(roomId);
            console.log(`Room ${roomId} deleted (empty for ${ROOM_CLEANUP_DELAY / 1000}s)`);
          }, ROOM_CLEANUP_DELAY);
          
          roomCleanupTimers.set(roomId, timer);
          console.log(`Room ${roomId} scheduled for deletion in ${ROOM_CLEANUP_DELAY / 1000}s`);
        }
      }
    }

    socketToRoom.delete(socket.id);
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.io server ready for connections`);
});