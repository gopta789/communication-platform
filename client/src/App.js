import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import HomePage from './components/HomePage';
import VideoRoom from './components/VideoRoom';
import ContactFooter from './components/ContactFooter';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#667eea',
    },
    secondary: {
      main: '#764ba2',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

function App() {
  const [roomId, setRoomId] = useState(null);
  const [userName, setUserName] = useState('');

  const handleJoinRoom = (id, name, isCreating = false) => {
    setRoomId(id);
    setUserName(name);
    // Store if this is a new room creation
    sessionStorage.setItem('isCreatingRoom', isCreating.toString());
  };

  const handleLeaveRoom = () => {
    setRoomId(null);
    setUserName('');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ color: 'rgba(10, 10, 51, 0.66)', fontWeight: 'bold' }}>
            Video Communication Platform
          </Typography>
          {/* <Typography variant="h6" sx={{ color: 'rgba(93, 58, 58, 0.9)', mb: 4 }}>
            Real-time multi-room video conferencing
          </Typography> */}
        </Box>
        {!roomId ? (
          <>
            <HomePage onJoinRoom={handleJoinRoom} />
            <ContactFooter />
          </>
        ) : (
          <VideoRoom 
            roomId={roomId} 
            userName={userName}
            onLeaveRoom={handleLeaveRoom}
          />
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;

