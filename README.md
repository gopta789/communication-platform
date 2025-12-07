# Real-Time Video Communication Platform

A full-stack, multi-room video conferencing application that enables users to create and join distinct virtual rooms for simultaneous, high-quality video and audio communication.

## Features

- 🎥 **Real-time Video & Audio**: WebRTC-powered low-latency communication
- 🏠 **Multi-room Support**: Create and join multiple isolated video rooms
- 🔒 **Room Isolation**: Complete privacy between different room instances
- 🎨 **Modern UI**: Responsive interface built with React and Material UI
- 📱 **Cross-platform**: Works on desktop and mobile browsers
- ⚡ **Low Latency**: Direct peer-to-peer connections via WebRTC

## Tech Stack

### Frontend
- **React** - UI framework
- **Material UI** - Component library
- **Socket.io Client** - Real-time signaling
- **WebRTC** - Peer-to-peer video/audio streaming

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web server
- **Socket.io** - WebSocket server for signaling
- **UUID** - Unique room ID generation

## Project Structure

```
communication platform/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── HomePage.js
│   │   │   └── VideoRoom.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── server/                # Node.js backend
│   ├── index.js
│   └── package.json
├── package.json          # Root package.json
└── README.md
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Setup

1. **Clone or navigate to the project directory**

2. **Install all dependencies** (root, server, and client):
   ```bash
   npm run install-all
   ```

   Or install manually:
   ```bash
   npm install
   cd server && npm install
   cd ../client && npm install
   ```

## Running the Application

### Development Mode (Both Server and Client)

From the root directory:
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- React frontend on `http://localhost:3000`

### Run Separately

**Backend only:**
```bash
cd server
npm start
# or for development with auto-reload
npm run dev
```

**Frontend only:**
```bash
cd client
npm start
```

## Usage

1. **Open the application** in your browser at `http://localhost:3000`

2. **Create a Room**:
   - Enter your name
   - Click "Create Room"
   - A unique room ID will be generated
   - Allow camera and microphone permissions when prompted

3. **Join a Room**:
   - Enter the room ID and your name
   - Click "Join Room"
   - Allow camera and microphone permissions

4. **In the Video Room**:
   - Your video will appear in the grid
   - Other participants' videos will appear as they join
   - Use the controls to toggle video/audio
   - Copy the room ID to share with others
   - Click "Leave Room" to exit

## How It Works

### WebRTC Architecture

1. **Signaling Server**: The Node.js/Socket.io backend handles signaling between peers
2. **Peer Connections**: Each user establishes direct peer-to-peer connections with other participants
3. **Room Management**: The server manages room instances and ensures isolation between rooms
4. **Media Streaming**: Video and audio streams are transmitted directly between peers using WebRTC

### Room Isolation

- Each room is identified by a unique UUID
- Participants can only communicate within their room
- Rooms are completely isolated from each other
- Empty rooms are automatically cleaned up

## Environment Variables

Create a `.env` file in the root directory (optional):

```env
PORT=5000
CLIENT_URL=http://localhost:3000
REACT_APP_SERVER_URL=http://localhost:5000
```

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari (iOS 11+)
- Opera

**Note**: WebRTC requires HTTPS in production. For local development, `localhost` is allowed.

## Production Deployment

For production deployment:

1. Build the React app:
   ```bash
   cd client
   npm run build
   ```

2. Serve the built files from the Express server or use a static hosting service

3. Use HTTPS (required for WebRTC in production)

4. Consider using a TURN server for better connectivity across different networks

## Troubleshooting

### Camera/Microphone Not Working
- Check browser permissions
- Ensure you're using HTTPS (or localhost for development)
- Try refreshing the page

### Connection Issues
- Check that both server and client are running
- Verify firewall settings
- Check browser console for errors

### Video Not Showing
- Ensure camera permissions are granted
- Check that other participants have joined
- Verify WebRTC is supported in your browser

## Future Enhancements

- Screen sharing
- Chat functionality
- Recording capabilities
- Room password protection
- User authentication
- TURN server integration for better NAT traversal

## License

MIT

## Author

Developed as a full-stack project demonstrating WebRTC, React, and Node.js integration.

