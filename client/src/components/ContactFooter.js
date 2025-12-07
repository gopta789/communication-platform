import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

function ContactFooter() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState({ type: null, text: '' });
  const [submitting, setSubmitting] = useState(false);

  const isValidEmail = (val) => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(val);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: null, text: '' });

    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus({ type: 'error', text: 'Please fill in all fields.' });
      return;
    }
    if (!isValidEmail(email.trim())) {
      setStatus({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to send message');
      }

      setStatus({ type: 'success', text: 'Thanks! Your message was sent.' });
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setStatus({ type: 'error', text: err.message || 'Something went wrong.' });
    } finally {
      setSubmitting(false);
    }
  };

  const textFieldSx = {
    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.9)' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#fff' },
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      '& fieldset': { borderColor: 'rgba(255,255,255,0.35)' },
      '&:hover fieldset': { borderColor: '#fff' },
      '&.Mui-focused fieldset': { borderColor: '#fff', borderWidth: '2px' },
      '& .MuiInputBase-input': { color: '#fff' },
    },
  };

  return (
    <Box
      component="footer"
      sx={{
        mt: 8,
        py: 6,
        px: { xs: 2, sm: 4 },
        color: 'common.white',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius:'40px'
      }}
    >
      <Grid container spacing={4} alignItems="flex-start">
        <Grid item xs={12} md={5}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            Made by AASHU SINGH
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, mb: 2 }}>
            Have changes or suggestions? I’d love to hear from you.
          </Typography>
          <Stack spacing={1.5} sx={{ opacity: 0.9, mb: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <EmailOutlinedIcon fontSize="small" />
              <Link href="mailto:rgopta13@gmail.com" color="inherit" underline="hover">rgopta13@gmail.com</Link>
            </Stack>
          </Stack>
          <Stack direction="row" spacing={1}>
            <IconButton aria-label="GitHub" color="inherit" component={Link} href="https://github.com/" target="_blank" rel="noopener">
              <GitHubIcon />
            </IconButton>
            <IconButton aria-label="LinkedIn" color="inherit" component={Link} href="https://linkedin.com/" target="_blank" rel="noopener">
              <LinkedInIcon />
            </IconButton>
            <IconButton aria-label="Email" color="inherit" component={Link} href="mailto:aashu@example.com">
              <EmailOutlinedIcon />
            </IconButton>
          </Stack>
        </Grid>

        <Grid item xs={12} md={7}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, sm: 3 },
              borderRadius: 3,
              bgcolor: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.2)',
              backdropFilter: 'blur(6px)',
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, color: '#fff' }}>
              Send a Message
            </Typography>
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    fullWidth
                    size="small"
                    autoComplete="name"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <PersonOutlineIcon sx={{ color: 'rgba(255,255,255,0.9)' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={textFieldSx}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    fullWidth
                    size="small"
                    autoComplete="email"
                    error={Boolean(email) && !isValidEmail(email)}
                    helperText={Boolean(email) && !isValidEmail(email) ? 'Enter a valid email' : ''}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <EmailOutlinedIcon sx={{ color: 'rgba(255,255,255,0.9)' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={textFieldSx}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    fullWidth
                    multiline
                    minRows={4}
                    autoComplete="off"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <ChatBubbleOutlineIcon sx={{ color: 'rgba(255,255,255,0.9)' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={textFieldSx}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                    <Button type="submit" variant="contained" disabled={submitting} sx={{ px: 3 }}>
                      {submitting ? 'Sending…' : 'Send Message'}
                    </Button>
                    <Divider flexItem orientation="vertical" sx={{ borderColor: 'rgba(255,255,255,0.2)', display: { xs: 'none', sm: 'block' } }} />
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                      By sending, you agree we may contact you about your suggestion.
                    </Typography>
                  </Stack>
                </Grid>
                {status.type && (
                  <Grid item xs={12}>
                    <Alert severity={status.type}>{status.text}</Alert>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default ContactFooter;
