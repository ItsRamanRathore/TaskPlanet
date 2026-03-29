import { useState, useEffect } from 'react';
import { 
    Menu, MenuItem, Typography, Box, Avatar, Divider, 
    List, ListItem, ListItemAvatar, ListItemText, Badge, CircularProgress
} from '@mui/material';
import { 
    Favorite as LikeIcon, 
    ChatBubble as CommentIcon, 
    PersonAdd as FollowIcon 
} from '@mui/icons-material';
import axios from 'axios';

const NotificationDropdown = ({ anchorEl, open, onClose, onNotificationRead }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            fetchNotifications();
        }
    }, [open]);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/notifications');
            setNotifications(res.data);
        } catch (err) {
            console.error('Error fetching notifications', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRead = async (id) => {
        try {
            await axios.put(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
            if (onNotificationRead) onNotificationRead();
        } catch (err) {
            console.error('Error marking notification as read', err);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'like': return <LikeIcon sx={{ color: '#e0245e', fontSize: 16 }} />;
            case 'comment': return <CommentIcon sx={{ color: '#1877f2', fontSize: 16 }} />;
            case 'follow': return <FollowIcon sx={{ color: '#45bd62', fontSize: 16 }} />;
            default: return null;
        }
    };

    const getMessage = (notification) => {
        const sender = notification.sender?.username || 'Someone';
        switch (notification.type) {
            case 'like': return `liked your post.`;
            case 'comment': return `commented on your post.`;
            case 'follow': return `started following you.`;
            default: return '';
        }
    };

    return (
        <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={onClose}
            PaperProps={{
                elevation: 3,
                sx: {
                    width: 360,
                    maxHeight: 480,
                    borderRadius: 3,
                    mt: 1.5,
                    overflow: 'hidden',
                    '& .MuiList-root': { py: 0 }
                }
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight={800}>Notifications</Typography>
            </Box>
            <Divider />
            
            <Box sx={{ maxHeight: 380, overflowY: 'auto' }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress size={24} />
                    </Box>
                ) : notifications.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography color="text.secondary">No notifications yet</Typography>
                    </Box>
                ) : (
                    <List>
                        {notifications.map((n) => (
                            <MenuItem 
                                key={n._id} 
                                onClick={() => handleRead(n._id)}
                                sx={{ 
                                    py: 1.5, px: 2, 
                                    bgcolor: n.read ? 'transparent' : 'rgba(24,119,242,0.05)',
                                    whiteSpace: 'normal',
                                    '&:hover': { bgcolor: n.read ? '#f0f2f5' : 'rgba(24,119,242,0.08)' }
                                }}
                            >
                                <ListItemAvatar sx={{ minWidth: 56, position: 'relative' }}>
                                    <Avatar sx={{ width: 40, height: 40, bgcolor: '#1877f2' }}>
                                        {n.sender?.username?.[0]?.toUpperCase() || '?'}
                                    </Avatar>
                                    <Box sx={{ 
                                        position: 'absolute', bottom: 0, right: 12, 
                                        bgcolor: 'white', borderRadius: '50%', p: 0.2, 
                                        display: 'flex', border: '1px solid #eee' 
                                    }}>
                                        {getIcon(n.type)}
                                    </Box>
                                </ListItemAvatar>
                                <ListItemText 
                                    primary={
                                        <Typography variant="body2" sx={{ fontWeight: n.read ? 400 : 700 }}>
                                            <span style={{ fontWeight: 800 }}>{n.sender?.username}</span> {getMessage(n)}
                                        </Typography>
                                    }
                                    secondary={new Date(n.createdAt).toLocaleDateString()}
                                />
                                {!n.read && <Box sx={{ width: 8, height: 8, bgcolor: '#1877f2', borderRadius: '50%', ml: 1 }} />}
                            </MenuItem>
                        ))}
                    </List>
                )}
            </Box>
        </Menu>
    );
};

export default NotificationDropdown;
