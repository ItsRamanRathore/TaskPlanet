import { useContext, useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Badge, Avatar, useMediaQuery, useTheme, Box, InputBase, Paper, Tooltip } from '@mui/material';
import { 
    Search as SearchIcon, 
    Notifications as NotificationsIcon, 
    Home as HomeIcon, 
    Assignment as AssignmentIcon, 
    Campaign as CampaignIcon, 
    Language as LanguageIcon, 
    Leaderboard as LeaderboardIcon, 
    Star as StarIcon,
    ExitToApp as LogoutIcon
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (user) {
            fetchUnreadCount();
        }
    }, [user]);

    const fetchUnreadCount = async () => {
        try {
            const res = await axios.get('/notifications');
            const count = res.data.filter(n => !n.read).length;
            setUnreadCount(count);
        } catch (err) {
            console.error('Error fetching unread count', err);
        }
    };

    const handleNotificationOpen = (event) => setAnchorEl(event.currentTarget);
    const handleNotificationClose = () => setAnchorEl(null);

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            navigate(`/?search=${searchQuery}`);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const StatusBadge = ({ icon, text, bgColor, textColor }) => (
        <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 0.5, 
            bgcolor: bgColor || '#f0f2f5', 
            px: 1.5, 
            py: 0.5, 
            borderRadius: 10,
            border: '1px solid #e4e6eb',
            transition: 'all 0.2s',
            '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }
        }}>
            {icon}
            <Typography variant="body2" fontWeight={700} color={textColor || 'text.primary'}>
                {text}
            </Typography>
        </Box>
    );

    if (isMobile) {
        return (
            <>
                <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: '1px solid #e4e6eb', bgcolor: 'white' }}>
                    <Toolbar sx={{ justifyContent: 'space-between', px: 2, minHeight: 60 }}>
                        <Typography variant="h6" fontWeight={800} color="primary" component={Link} to="/" sx={{ textDecoration: 'none' }}>
                            Social
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <StatusBadge 
                                text="152" 
                                icon={<StarIcon sx={{ color: '#ffc107', fontSize: 18 }} />} 
                            />
                            <StatusBadge 
                                text="₹0.00" 
                                bgColor="#e7f3ff" 
                                textColor="#1877f2"
                            />
                            <IconButton color="inherit" size="small" onClick={handleNotificationOpen}>
                                <Badge badgeContent={unreadCount} color="error" overlap="circular">
                                    <NotificationsIcon />
                                </Badge>
                            </IconButton>
                        </Box>
                        <NotificationDropdown 
                            anchorEl={anchorEl} 
                            open={Boolean(anchorEl)} 
                            onClose={handleNotificationClose} 
                            onNotificationRead={fetchUnreadCount}
                        />
                    </Toolbar>
                </AppBar>

                {/* Bottom Bar */}
                <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, bgcolor: 'white', borderTop: '1px solid #e4e6eb', zIndex: 1100, pb: 'env(safe-area-inset-bottom)' }}>
                    <Toolbar sx={{ justifyContent: 'space-around' }}>
                        <IconButton component={Link} to="/" color="primary"><HomeIcon /></IconButton>
                        <IconButton><AssignmentIcon /></IconButton>
                        <IconButton sx={{ 
                            bgcolor: '#1877f2', color: 'white', 
                            '&:hover': { bgcolor: '#1565d8' },
                            width: 48, height: 48, mt: -3,
                            boxShadow: '0 4px 12px rgba(24,119,242,0.4)'
                        }}>
                            <CampaignIcon />
                        </IconButton>
                        <IconButton><LanguageIcon /></IconButton>
                        <IconButton onClick={handleLogout}><LogoutIcon /></IconButton>
                    </Toolbar>
                </Box>
            </>
        );
    }

    return (
        <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: '1px solid #e4e6eb', bgcolor: 'white', zIndex: 1200 }}>
            <Toolbar sx={{ justifyContent: 'space-between', maxWidth: 1200, width: '100%', mx: 'auto' }}>
                <Typography variant="h5" fontWeight={800} color="primary" component={Link} to="/" sx={{ textDecoration: 'none', letterSpacing: -1 }}>
                    TaskPlanet
                </Typography>

                <Paper
                    elevation={0}
                    sx={{ 
                        p: '2px 4px', display: 'flex', alignItems: 'center', width: 400, 
                        bgcolor: '#f0f2f5', borderRadius: 20, border: '1px solid transparent',
                        transition: 'all 0.2s',
                        '&:focus-within': { bgcolor: 'white', borderColor: '#1877f2', boxShadow: '0 0 0 2px rgba(24,119,242,0.1)' }
                    }}
                >
                    <IconButton sx={{ p: '10px' }} disabled><SearchIcon sx={{ fontSize: 20 }} /></IconButton>
                    <InputBase
                        sx={{ ml: 1, flex: 1, fontSize: 14 }}
                        placeholder="Search TaskPlanet..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearch}
                    />
                </Paper>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <StatusBadge text="152" icon={<StarIcon sx={{ color: '#ffc107', fontSize: 18 }} />} />
                    <StatusBadge text="₹0.00" bgColor="#e7f3ff" textColor="#1877f2" />
                    
                    <Box sx={{ width: 1, height: 24, bgcolor: '#e4e6eb', mx: 0.5 }} />

                    <Tooltip title="Notifications">
                        <IconButton 
                            color="inherit" 
                            sx={{ bgcolor: '#f0f2f5' }}
                            onClick={handleNotificationOpen}
                        >
                            <Badge badgeContent={unreadCount} color="error" overlap="circular">
                                <NotificationsIcon />
                            </Badge>
                        </IconButton>
                    </Tooltip>

                    <NotificationDropdown 
                        anchorEl={anchorEl} 
                        open={Boolean(anchorEl)} 
                        onClose={handleNotificationClose} 
                        onNotificationRead={fetchUnreadCount}
                    />

                    <Box sx={{ 
                        display: 'flex', alignItems: 'center', gap: 1, 
                        pl: 1, pr: 0.5, py: 0.5, borderRadius: 10,
                        cursor: 'pointer', transition: 'all 0.2s',
                        '&:hover': { bgcolor: '#f0f2f5' }
                    }} onClick={handleLogout}>
                        <Avatar sx={{ 
                            width: 36, height: 36, border: '2px solid #1877f2', padding: '2px',
                            bgcolor: 'white', color: '#1877f2'
                        }}>
                            {user?.username?.[0].toUpperCase()}
                        </Avatar>
                        <Box>
                            <Typography variant="subtitle2" fontWeight={700} sx={{ lineHeight: 1 }}>{user?.username}</Typography>
                            <Typography variant="caption" color="text.secondary">Logout</Typography>
                        </Box>
                    </Box>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
