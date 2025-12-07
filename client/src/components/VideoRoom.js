import React, { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import {
  Box,
  Paper,
  Button,
  Typography,
  Grid,
  IconButton,
  Chip,
  Alert,
} from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';

const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';

function VideoRoom({ roomId, userName, onLeaveRoom }) {
  const [socket, setSocket] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [error, setError] = useState(null);
  const [roomNotFound, setRoomNotFound] = useState(false);
  
  const screenShareStream = useRef(null);
  const cameraStream = useRef(null);

  const localVideoRef = useRef(null);
  const remoteVideoRefs = useRef(new Map());
  const peerConnections = useRef(new Map());
  const userId = useRef(uuidv4());

  // Leave room function
  const handleLeaveRoom = useCallback(() => {
    console.log('Leaving room - cleaning up media');
    
    // Close all peer connections
    peerConnections.current.forEach(pc => {
      pc.close();
    });
    peerConnections.current.clear();
    
    // Stop all tracks in local stream
    if (localStream) {
      localStream.getTracks().forEach(track => {
        track.stop();
        console.log(`Stopped ${track.kind} track`);
      });
    }
    
    // Stop screen share stream if active
    if (screenShareStream.current) {
      screenShareStream.current.getTracks().forEach(track => {
        track.stop();
        console.log(`Stopped screen share ${track.kind} track`);
      });
      screenShareStream.current = null;
    }
    
    // Stop camera stream
    if (cameraStream.current) {
      cameraStream.current.getTracks().forEach(track => {
        track.stop();
        console.log(`Stopped camera ${track.kind} track`);
      });
      cameraStream.current = null;
    }
    
    // Clear local video element
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    
    // Clear all remote video elements
    remoteVideoRefs.current.forEach((ref) => {
      if (ref) {
        ref.srcObject = null;
      }
    });
    remoteVideoRefs.current.clear();
    
    // Clear remote streams
    setRemoteStreams(new Map());
    
    // Clear local stream state
    setLocalStream(null);
    
    // Close socket connection
    if (socket) {
      socket.disconnect();
      socket.close();
    }
    
    // Reset UI states
    setIsVideoEnabled(true);
    setIsAudioEnabled(true);
    setIsScreenSharing(false);
    setParticipants([]);
    setError(null);
    setRoomNotFound(false);
    
    // Call parent callback to return to home
    onLeaveRoom();
  }, [localStream, socket, onLeaveRoom]);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      // Check if this is a new room creation
      const isCreating = sessionStorage.getItem('isCreatingRoom') === 'true';
      newSocket.emit('join-room', roomId, userId.current, userName, isCreating);
      // Clear the flag after use
      sessionStorage.removeItem('isCreatingRoom');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
      setError('Connection error. Please try again.');
    });

    // Handle room not found
    newSocket.on('room-not-found', ({ roomId: notFoundRoomId }) => {
      console.error('Room not found:', notFoundRoomId);
      setRoomNotFound(true);
      setError(`Room "${notFoundRoomId}" not found. Please check the room ID.`);
      // Redirect back to home after 3 seconds
      setTimeout(() => {
        handleLeaveRoom();
      }, 3000);
    });

    // Handle successful room join
    newSocket.on('room-joined', ({ roomId: joinedRoomId, roomExists }) => {
      console.log('Successfully joined room:', joinedRoomId);
      setRoomNotFound(false);
      setError(null);
    });

    setSocket(newSocket);

    return () => {
      newSocket.off('room-not-found');
      newSocket.off('room-joined');
      newSocket.close();
    };
  }, [roomId, userName, handleLeaveRoom]);

  // Get user media
  useEffect(() => {
    const getMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(stream);
        cameraStream.current = stream; // Store camera stream
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing media devices:', err);
        setError('Unable to access camera/microphone. Please check permissions.');
      }
    };

    getMedia();

    return () => {
      // Cleanup on unmount
      if (localStream) {
        localStream.getTracks().forEach(track => {
          track.stop();
          console.log(`Cleanup: Stopped ${track.kind} track on unmount`);
        });
      }
      if (cameraStream.current) {
        cameraStream.current.getTracks().forEach(track => {
          track.stop();
        });
        cameraStream.current = null;
      }
      if (screenShareStream.current) {
        screenShareStream.current.getTracks().forEach(track => {
          track.stop();
        });
        screenShareStream.current = null;
      }
      // Clear video element
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
    };
  }, []);

  // Update local video when stream changes
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // WebRTC configuration
  const rtcConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  // Create peer connection
  const createPeerConnection = (targetSocketId, targetUserId) => {
    const peerConnection = new RTCPeerConnection(rtcConfiguration);

    // Add local stream tracks
    if (localStream) {
      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
      });
    }

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setRemoteStreams(prev => {
        const newMap = new Map(prev);
        newMap.set(targetSocketId, { stream: remoteStream, userId: targetUserId });
        return newMap;
      });

      // Update video element
      setTimeout(() => {
        const videoElement = remoteVideoRefs.current.get(targetSocketId);
        if (videoElement && remoteStream) {
          videoElement.srcObject = remoteStream;
        }
      }, 100);
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('ice-candidate', {
          candidate: event.candidate,
          targetSocketId: targetSocketId,
        });
      }
    };

    peerConnections.current.set(targetSocketId, peerConnection);
    return peerConnection;
  };

  // Handle socket events
  useEffect(() => {
    if (!socket || !localStream) return;

    // User joined - create offer
    socket.on('user-joined', async ({ userId: newUserId, socketId: newSocketId }) => {
      console.log('User joined:', newSocketId);
      const peerConnection = createPeerConnection(newSocketId, newUserId);
      
      try {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        
        socket.emit('offer', {
          offer,
          targetSocketId: newSocketId,
          roomId,
        });
      } catch (error) {
        console.error('Error creating offer:', error);
      }
    });

    // Receive offer - create answer
    socket.on('offer', async ({ offer, senderSocketId }) => {
      console.log('Received offer from:', senderSocketId);
      const peerConnection = createPeerConnection(senderSocketId, 'unknown');
      
      try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        
        socket.emit('answer', {
          answer,
          targetSocketId: senderSocketId,
        });
      } catch (error) {
        console.error('Error handling offer:', error);
      }
    });

    // Receive answer
    socket.on('answer', async ({ answer, senderSocketId }) => {
      console.log('Received answer from:', senderSocketId);
      const peerConnection = peerConnections.current.get(senderSocketId);
      
      if (peerConnection) {
        try {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (error) {
          console.error('Error handling answer:', error);
        }
      }
    });

    // Receive ICE candidate
    socket.on('ice-candidate', async ({ candidate, senderSocketId }) => {
      const peerConnection = peerConnections.current.get(senderSocketId);
      
      if (peerConnection && candidate) {
        try {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
          console.error('Error adding ICE candidate:', error);
        }
      }
    });

    // Get existing participants
    socket.on('room-participants', async (existingParticipants) => {
      console.log('Existing participants:', existingParticipants);
      
      for (const participant of existingParticipants) {
        const peerConnection = createPeerConnection(participant.socketId, participant.userId);
        
        try {
          const offer = await peerConnection.createOffer();
          await peerConnection.setLocalDescription(offer);
          
          socket.emit('offer', {
            offer,
            targetSocketId: participant.socketId,
            roomId,
          });
        } catch (error) {
          console.error('Error creating offer for existing participant:', error);
        }
      }
    });

    // User left
    socket.on('user-left', ({ socketId }) => {
      console.log('User left:', socketId);
      
      // Close peer connection
      const peerConnection = peerConnections.current.get(socketId);
      if (peerConnection) {
        peerConnection.close();
        peerConnections.current.delete(socketId);
      }
      
      // Remove remote stream
      setRemoteStreams(prev => {
        const newMap = new Map(prev);
        newMap.delete(socketId);
        return newMap;
      });
      
      // Remove video element
      remoteVideoRefs.current.delete(socketId);
    });

    return () => {
      socket.off('user-joined');
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
      socket.off('room-participants');
      socket.off('user-left');
    };
  }, [socket, localStream, roomId]);

  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
        setIsVideoEnabled(!isVideoEnabled);
      }
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
        setIsAudioEnabled(!isAudioEnabled);
      }
    }
  };

  // Toggle screen sharing
  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        // Start screen sharing
        let screenStream;
        
        // Try to get display media with audio if supported
        try {
          screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: {
              cursor: 'always',
              displaySurface: 'monitor'
            },
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              sampleRate: 44100
            }
          });
        } catch (audioError) {
          // If audio capture fails, try without audio (some browsers don't support it)
          console.warn('Audio capture not supported, sharing video only');
          screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: {
              cursor: 'always',
              displaySurface: 'monitor'
            }
          });
        }

        screenShareStream.current = screenStream;

        // Handle screen share end (user clicks stop in browser UI)
        screenStream.getVideoTracks()[0].onended = () => {
          stopScreenShare();
        };

        // Replace video track in local stream
        const videoTrack = screenStream.getVideoTracks()[0];
        if (localStream && videoTrack) {
          const oldVideoTrack = localStream.getVideoTracks()[0];
          
          // Replace video track in all peer connections
          peerConnections.current.forEach((peerConnection) => {
            const senders = peerConnection.getSenders();
            const videoSender = senders.find(s => s.track && s.track.kind === 'video');
            if (videoSender && oldVideoTrack) {
              videoSender.replaceTrack(videoTrack).catch(err => {
                console.error('Error replacing track in peer connection:', err);
              });
            }
          });
          
          // Update local stream
          if (oldVideoTrack) {
            localStream.removeTrack(oldVideoTrack);
            oldVideoTrack.stop();
          }
          localStream.addTrack(videoTrack);
          
          // Update video element
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
          }
        }

        setIsScreenSharing(true);
      } else {
        // Stop screen sharing
        stopScreenShare();
      }
    } catch (err) {
      console.error('Error toggling screen share:', err);
      if (err.name === 'NotAllowedError') {
        setError('Screen sharing permission denied. Please allow screen sharing.');
      } else if (err.name === 'NotFoundError') {
        setError('No screen/window/tab available for sharing.');
      } else {
        setError('Unable to start screen sharing. Please try again.');
      }
    }
  };

  // Stop screen sharing
  const stopScreenShare = async () => {
    if (screenShareStream.current) {
      screenShareStream.current.getTracks().forEach(track => track.stop());
      screenShareStream.current = null;
    }

    // Restore camera video track
    try {
      if (cameraStream.current && localStream) {
        const currentVideoTrack = localStream.getVideoTracks()[0];
        
        // Get fresh camera track
        const newCameraStream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: false 
        });
        const newCameraTrack = newCameraStream.getVideoTracks()[0];
        
        // Replace screen share track with camera track in all peer connections
        peerConnections.current.forEach((peerConnection) => {
          const senders = peerConnection.getSenders();
          const videoSender = senders.find(s => s.track && s.track.kind === 'video');
          if (videoSender) {
            videoSender.replaceTrack(newCameraTrack).catch(err => {
              console.error('Error replacing track with camera:', err);
            });
          }
        });

        // Update local stream
        if (currentVideoTrack) {
          localStream.removeTrack(currentVideoTrack);
          currentVideoTrack.stop();
        }
        localStream.addTrack(newCameraTrack);

        // Update video element
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }
        
        // Update camera stream reference - stop old tracks
        if (cameraStream.current) {
          cameraStream.current.getVideoTracks().forEach(t => {
            if (t !== newCameraTrack) t.stop();
          });
        }
        cameraStream.current = newCameraStream;
      }
    } catch (err) {
      console.error('Error restoring camera:', err);
      setError('Unable to restore camera. Please refresh the page.');
    }

    setIsScreenSharing(false);
  };

  // Copy room ID
  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    alert('Room ID copied to clipboard!');
  };

  const remoteStreamsArray = Array.from(remoteStreams.entries());

  return (
    <Box>
      {(error || roomNotFound) && (
        <Alert 
          severity={roomNotFound ? "warning" : "error"} 
          sx={{ mb: 2 }} 
          onClose={() => {
            setError(null);
            setRoomNotFound(false);
          }}
        >
          {error || 'Room not found. Redirecting to home...'}
        </Alert>
      )}
      
      <Paper sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h6" gutterBottom>
            Room: {roomId}
            <IconButton size="small" onClick={copyRoomId} sx={{ ml: 1 }}>
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You: {userName}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip 
            label={`${remoteStreamsArray.length + 1} participant${remoteStreamsArray.length + 1 !== 1 ? 's' : ''}`}
            color="primary"
            variant="outlined"
          />
          <Button
            variant="contained"
            color="error"
            startIcon={<ExitToAppIcon />}
            onClick={handleLeaveRoom}
          >
            Leave Room
          </Button>
        </Box>
      </Paper>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <Paper sx={{ position: 'relative', paddingTop: '56.25%', overflow: 'hidden' }}>
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                backgroundColor: '#000',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: 8,
                left: 8,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                color: 'white',
                px: 1,
                py: 0.5,
                borderRadius: 1,
                fontSize: '0.875rem',
              }}
            >
              {userName} (You)
            </Box>
          </Paper>
        </Grid>

        {remoteStreamsArray.map(([socketId, { stream, userId: remoteUserId }]) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={socketId}>
            <Paper sx={{ position: 'relative', paddingTop: '56.25%', overflow: 'hidden' }}>
              <video
                ref={(el) => {
                  if (el) {
                    remoteVideoRefs.current.set(socketId, el);
                    el.srcObject = stream;
                  }
                }}
                autoPlay
                playsInline
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  backgroundColor: '#000',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 8,
                  left: 8,
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  color: 'white',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  fontSize: '0.875rem',
                }}
              >
                Participant
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 2, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
        <IconButton
          color={isVideoEnabled ? 'primary' : 'default'}
          onClick={toggleVideo}
          sx={{ bgcolor: isVideoEnabled ? 'action.selected' : 'action.disabled' }}
          title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
        >
          {isVideoEnabled ? <VideocamIcon /> : <VideocamOffIcon />}
        </IconButton>
        <IconButton
          color={isAudioEnabled ? 'primary' : 'default'}
          onClick={toggleAudio}
          sx={{ bgcolor: isAudioEnabled ? 'action.selected' : 'action.disabled' }}
          title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
        >
          {isAudioEnabled ? <MicIcon /> : <MicOffIcon />}
        </IconButton>
        <IconButton
          color={isScreenSharing ? 'secondary' : 'default'}
          onClick={toggleScreenShare}
          sx={{ bgcolor: isScreenSharing ? 'action.selected' : 'action.hover' }}
          title={isScreenSharing ? 'Stop sharing screen' : 'Share screen'}
        >
          {isScreenSharing ? <StopScreenShareIcon /> : <ScreenShareIcon />}
        </IconButton>
      </Paper>
    </Box>
  );
}

export default VideoRoom;

