import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Feed from './pages/Feed';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import './index.css';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: { main: '#1877f2', dark: '#1565d8' },
        secondary: { main: '#e7f3ff' },
        background: { default: '#f0f2f5', paper: '#ffffff' },
        text: { primary: '#050505', secondary: '#65676b' },
    },
    typography: {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: { borderRadius: 8 },
    components: {
        MuiButton: {
            styleOverrides: {
                root: { borderRadius: 20, boxShadow: 'none', '&:hover': { boxShadow: 'none' } },
                containedPrimary: {
                    background: '#1877f2',
                    '&:hover': { background: '#1565d8' },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: { borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.10)', border: '1px solid #e4e6eb' },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 8,
                        backgroundColor: '#f0f2f5',
                        '& fieldset': { borderColor: 'transparent' },
                        '&:hover fieldset': { borderColor: '#1877f2' },
                        '&.Mui-focused fieldset': { borderColor: '#1877f2' },
                    },
                },
            },
        },
        MuiAvatar: {
            styleOverrides: { root: { fontWeight: 700 } },
        },
    },
});

const ProtectedRoute = ({ children }) => {
    const { user } = useContext(AuthContext);
    if (!user) return <Navigate to="/login" replace />;
    return children;
};

const AppContent = () => {
    const { user } = useContext(AuthContext);
    return (
        <Router>
            {user && <Navbar />}
            <Box sx={{ pt: user ? 0 : 0, pb: { xs: user ? '70px' : 0, sm: 4 } }}>
                <Routes>
                    <Route path="/login"  element={!user ? <Login />  : <Navigate to="/" />} />
                    <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" />} />
                    <Route path="/dashboard" element={<Navigate to="/" replace />} />
                    <Route path="/"       element={<ProtectedRoute><Feed /></ProtectedRoute>} />
                    {/* Fallback for any unknown routes to prevent blank screens */}
                    <Route path="*"       element={<Navigate to="/" replace />} />
                </Routes>
            </Box>
        </Router>
    );
};

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '20px', color: 'red', background: 'white' }}>
                    <h1>CRITICAL RENDER ERROR</h1>
                    <pre>{this.state.error?.toString()}</pre>
                </div>
            );
        }
        return this.props.children;
    }
}

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <ErrorBoundary>
                <AuthProvider>
                    <AppContent />
                </AuthProvider>
            </ErrorBoundary>
        </ThemeProvider>
    );
}

export default App;
