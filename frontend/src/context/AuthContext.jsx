import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import LoadingScreen from '../components/LoadingScreen';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');
        const userId = localStorage.getItem('userId');

        if (token && username && userId) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchProfile();
        } else {
            // Briefly delay setting loading(false) to ensure smooth transition
            const timer = setTimeout(() => {
                setLoading(false);
            }, 600);
            return () => clearTimeout(timer);
        }
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/users/profile');
            if (res.data && typeof res.data === 'object') {
                setUser(prev => prev ? { ...prev, ...res.data } : res.data);
            }
        } catch (err) {
            console.error('Auth: Failed to fetch profile', err);
            if (err.response?.status === 401) {
                logout();
            }
        } finally {
            // Give a bit of extra time for the loading screen to feel natural
            setTimeout(() => {
                setLoading(false);
            }, 600);
        }
    };

    const login = (token, username, userId) => {
        localStorage.setItem('token', token);
        localStorage.setItem('username', username);
        localStorage.setItem('userId', userId);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser({ _id: userId, username });
        fetchProfile();
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('userId');
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {loading ? <LoadingScreen /> : children}
        </AuthContext.Provider>
    );
};
