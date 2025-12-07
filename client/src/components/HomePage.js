import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Alert,
  CircularProgress,
} from '@mui/material';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';

const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';

function HomePage({ onJoinRoom }) {
  const [roomId, setRoomId] = useState('');
  const [userName, setUserName] = useState('');
  const [juserName, jsetUserName]= useState('');
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  const handleCreateRoom = async () => {
    if (!userName.trim()) {
      setError('Please Enter your name');
      return;
    }
    setError('');
    setIsChecking(true);
    
    try {
      const newRoomId = uuidv4();
      
      // Create the room on the server first
      const response = await fetch(`${SERVER_URL}/api/room/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: newRoomId })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create room');
      }
      
      // Pass true to indicate this is a new room creation
      onJoinRoom(newRoomId, userName.trim(), true);
    } catch (err) {
      console.error('Error creating room:', err);
      setError('Unable to create room. Please check your connection and try again.');
    } finally {
      setIsChecking(false);
    }
  };

  const handleJoinExistingRoom = async () => {
    if (!roomId.trim() || !juserName.trim()) {
      setError('Please enter both room ID and your name');
      return;
    }

    setError('');
    setIsChecking(true);

    try {
      // Check if room exists - try multiple times with delay for race conditions
      let roomExists = false;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (!roomExists && attempts < maxAttempts) {
        const response = await fetch(`${SERVER_URL}/api/room/${roomId.trim()}`);
        
        if (response.ok) {
          const roomData = await response.json();
          roomExists = true;
          // Room exists, proceed to join (pass false to indicate joining existing room)
          onJoinRoom(roomId.trim(), juserName.trim(), false);
          return;
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          // Wait a bit before retrying (in case room was just created)
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      // Room doesn't exist after all attempts - show error
      setError('Room not found. Please check the room ID or create a new room.');
    } catch (err) {
      console.error('Error checking room:', err);
      setError('Unable to verify room. Please check your connection and try again.');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}  >
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column',borderRadius: 10,background: 'linear-gradient(135deg, #666c8aff 0%, #764ba2 100%)',color: 'black' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <VideoCallIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" component="h2" gutterBottom>
                  Create New Room
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Start a new video conference room
                </Typography>
              </Box>
              <TextField
                fullWidth
                label="Your Name"
                variant="outlined"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                //sx={{ mb: 2 }}
                sx={{ 
    mb: 2,
    '& .MuiInputLabel-root': { borderColor: '#183234ff' },  // label color
    '& .MuiOutlinedInput-root': {
      '& fieldset': {borderColor: '#183234ff',borderWidth:'3px',borderRadius: '12px'},  // border color
      '&:hover fieldset': { borderColor: 'rgba(58, 69, 69, 1)' },  // hover border
      '&.Mui-focused fieldset': {borderColor: 'rgba(58, 69, 69, 1)' },  // focused border
    },
  }}
                placeholder="Enter your name"
              />
            </CardContent>
            <CardActions sx={{ p: 2, pt: 0 }}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleCreateRoom}
                disabled={isChecking}
                startIcon={isChecking ? <CircularProgress size={20} /> : <VideoCallIcon />}
              >
                {isChecking ? 'Creating...' : 'Create Room'}
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column',borderRadius: 10,background: 'linear-gradient(135deg, #666c8aff 0%, #764ba2 100%)',color: 'black' } }>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <MeetingRoomIcon sx={{ fontSize: 60, color: 'rgba(132, 46, 212, 1)', mb: 2 }} />
                <Typography variant="h5" component="h2" gutterBottom>
                  Join Existing Room
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Enter a room ID to join
                </Typography>
              </Box>
              <TextField
                fullWidth
                label="Room ID"
                variant="outlined"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                // sx={{ mb: 2 }}
                sx={{ 
    mb: 2,
    '& .MuiInputLabel-root': {color:'black', borderColor: '#183234ff' },  // label color
    '& .MuiOutlinedInput-root': {
      '& fieldset': { borderColor: '#183234ff',borderWidth:'3px',borderRadius: '12px'},  // border color
      '&:hover fieldset': { borderColor: 'rgba(58, 69, 69, 1)' },  // hover border
      '&.Mui-focused fieldset': { borderColor: 'rgba(58, 69, 69, 1)' },  // focused border
    },
  }}
                placeholder="Enter room ID"
              />
              <TextField
                fullWidth
                label="Your Name"
                variant="outlined"
                value={juserName}
                onChange={(e) => jsetUserName(e.target.value)}
                sx={{ 
    mb: 2,
    '& .MuiInputLabel-root': {color:'black', borderColor: '#183234ff' },  // label color
    '& .MuiOutlinedInput-root': {
      '& fieldset': { borderColor: '#183234ff',borderWidth:'3px',borderRadius: '12px'},  // border color
      '&:hover fieldset': { borderColor: 'rgba(58, 69, 69, 1)' },  // hover border
      '&.Mui-focused fieldset': { borderColor: 'rgba(58, 69, 69, 1)' },  // focused border
    },
  }}
                placeholder="Enter your name"
              />
            </CardContent>
            <CardActions sx={{ p: 2, pt: 0 }}>
              <Button
                fullWidth
                variant="contained"
                color="secondary"
                size="large"
                onClick={handleJoinExistingRoom}
                disabled={isChecking}
                startIcon={isChecking ? <CircularProgress size={20} /> : <MeetingRoomIcon />}
              >
                {isChecking ? 'Checking...' : 'Join Room'}
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
export default HomePage;

