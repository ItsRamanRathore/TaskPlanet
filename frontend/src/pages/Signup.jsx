import { useState } from 'react';
import {
    Box, TextField, Button, Typography, Link, Alert, InputAdornment, IconButton, CircularProgress
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock, Person } from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Signup = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [showPwd, setShowPwd]   = useState(false);
    const [error, setError]       = useState('');
    const [success, setSuccess]   = useState(false);
    const [loading, setLoading]   = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
        setError('');
        setLoading(true);
        try {
            await axios.post('/auth/signup', { username, email, password });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Signup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', p: 2
        }}>
            <Box sx={{
                bgcolor: 'white', borderRadius: 4, p: { xs: 3, sm: 5 },
                width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
            }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Box sx={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 56, height: 56, borderRadius: 3, mb: 2,
                        background: 'linear-gradient(135deg, #1877f2, #42b3f5)',
                        boxShadow: '0 8px 20px rgba(24,119,242,0.4)'
                    }}>
                        <Typography sx={{ fontSize: 26, color: 'white' }}>🌍</Typography>
                    </Box>
                    <Typography variant="h5" fontWeight={800} color="#050505" letterSpacing={-0.5}>
                        Create Account
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Join TaskPlanet Social today
                    </Typography>
                </Box>

                {error   && <Alert severity="error"   sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>🎉 Account created! Redirecting to login…</Alert>}

                <Box component="form" onSubmit={handleSubmit}>
                    <TextField
                        fullWidth margin="normal" label="Username"
                        value={username} onChange={e => setUsername(e.target.value)} required autoFocus
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><Person sx={{ color: '#1877f2', fontSize: 20 }} /></InputAdornment>
                        }}
                    />
                    <TextField
                        fullWidth margin="normal" label="Email Address" type="email"
                        value={email} onChange={e => setEmail(e.target.value)} required
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><Email sx={{ color: '#1877f2', fontSize: 20 }} /></InputAdornment>
                        }}
                    />
                    <TextField
                        fullWidth margin="normal" label="Password (min 6 chars)"
                        type={showPwd ? 'text' : 'password'}
                        value={password} onChange={e => setPassword(e.target.value)} required
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><Lock sx={{ color: '#1877f2', fontSize: 20 }} /></InputAdornment>,
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowPwd(!showPwd)} edge="end" size="small">
                                        {showPwd ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />

                    <Button
                        type="submit" fullWidth variant="contained" disabled={loading || success}
                        sx={{ mt: 3, py: 1.4, fontSize: 15, fontWeight: 700, borderRadius: 3,
                            background: 'linear-gradient(90deg, #1877f2, #42b3f5)',
                            '&:hover': { background: 'linear-gradient(90deg, #1565d8, #1877f2)' }
                        }}
                    >
                        {loading ? <CircularProgress size={22} color="inherit" /> : 'Create Account'}
                    </Button>
                </Box>

                <Box sx={{ textAlign: 'center', mt: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                        Already have an account?{' '}
                        <Link component={RouterLink} to="/login" fontWeight={700} underline="hover">
                            Sign In
                        </Link>
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default Signup;
