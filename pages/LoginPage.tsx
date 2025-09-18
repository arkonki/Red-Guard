
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/store';
import { loginUser } from '../store/slices/authSlice';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('test@example.com');
    const [password, setPassword] = useState('password');
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, status, error } = useAppSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email && password) {
          dispatch(loginUser({ email, password: password }));
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Typography component="h1" variant="h4" color="primary" sx={{ mb: 3, fontWeight: 'bold' }}>
                    Veebimajutus Mail
                </Typography>
                <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {error && status === 'failed' && (
                             <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>
                        )}
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={status === 'loading'}
                            sx={{ mt: 3, mb: 2, py: 1.5 }}
                        >
                            {status === 'loading' ? <CircularProgress size={24} color="inherit" /> : 'Log In'}
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default LoginPage;
