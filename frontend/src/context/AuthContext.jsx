import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

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
            setLoading(false);
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
            setLoading(false);
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
            {!loading && children}
        </AuthContext.Provider>
    );
};
