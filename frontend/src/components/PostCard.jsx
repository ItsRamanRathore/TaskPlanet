import { useState, useContext, useEffect } from 'react';
import { 
    Card, CardHeader, CardContent, CardActions, Avatar, Typography, IconButton, 
    Box, Divider, TextField, Button, List, ListItem, ListItemText, ListItemAvatar,
    Collapse, Stack, Tooltip, Paper, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { 
    Favorite as FavoriteIcon, 
    FavoriteBorder as FavoriteBorderIcon, 
    ChatBubbleOutline as CommentIcon, 
    Send as SendIcon,
    ShareOutlined as ShareIcon,
    MoreHoriz as MoreIcon,
    CheckCircle as VerifiedIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    VolumeUp as VolumeUpIcon
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const PostCard = ({ post }) => {
    const { user, login } = useContext(AuthContext); // login is used to refresh user state
    const [likes, setLikes] = useState(post.likes || []);
    const [comments, setComments] = useState(post.comments || []);
    const [liked, setLiked] = useState(user ? post.likes.includes(user._id) : false);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editContent, setEditContent] = useState(post.content);
    const [isDeleted, setIsDeleted] = useState(false);

    useEffect(() => {
        if (user && post.user) {
            setIsFollowing(user.following?.includes(post.user._id));
        }
    }, [user, post.user]);

    const handleLike = async () => {
        if (!user) return;
        try {
            const res = await axios.put(`/posts/${post._id}/like`);
            setLikes(res.data.likes);
            setLiked(!liked);
        } catch (err) {
            console.error('Error liking post', err);
        }
    };

    const handleFollow = async () => {
        if (!user || followLoading) return;
        setFollowLoading(true);
        try {
            const res = await axios.put(`/users/${post.user._id}/follow`);
            setIsFollowing(res.data.isFollowing);
            
            // Update AuthContext user state locally instead of full refresh for better UX
            // Or just trigger a refresh if context provider supports it.
            // For now, let's assume the user object in context needs update.
        } catch (err) {
            console.error('Error following user', err);
        } finally {
            setFollowLoading(false);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim() || !user) return;

        try {
            const res = await axios.post(`/posts/${post._id}/comment`, { text: commentText });
            setComments([...comments, res.data.comment]);
            setCommentText('');
        } catch (err) {
            console.error('Error adding comment', err);
        }
    };

    const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;
        try {
            await axios.delete(`/posts/${post._id}`);
            setIsDeleted(true);
        } catch (err) {
            console.error('Error deleting post', err);
        }
        handleMenuClose();
    };

    const handleUpdate = async () => {
        try {
            const res = await axios.put(`/posts/${post._id}`, { content: editContent });
            post.content = res.data.post.content; // Update local reference
            setEditDialogOpen(false);
        } catch (err) {
            console.error('Error updating post', err);
        }
    };

    const isOwnPost = user?._id === post.user?._id;

    if (isDeleted) return null;

    const getImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url; // Cloudinary or full URL
        const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        return `${baseUrl}${url}`;
    };

    return (
        <Card sx={{ 
            mb: 2, border: '1px solid #e4e6eb', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', 
            transition: 'transform 0.1s', '&:active': { transform: 'scale(0.998)' }
        }}>
            <CardHeader
                avatar={
                    <Avatar sx={{ bgcolor: '#1877f2', width: 40, height: 40, fontWeight: 700 }}>
                        {post.user?.username?.[0].toUpperCase()}
                    </Avatar>
                }
                action={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {post.isPromoted && (
                            <Chip 
                                icon={<VolumeUpIcon sx={{ fontSize: '14px !important', color: 'white !important' }} />} 
                                label="Promoted" 
                                size="small"
                                sx={{ 
                                    height: 24, fontSize: 11, fontWeight: 900, 
                                    bgcolor: '#1877f2', color: 'white',
                                    borderRadius: 1,
                                    boxShadow: '0 2px 4px rgba(24,119,242,0.3)',
                                    '& .MuiChip-label': { px: 1 }
                                }}
                            />
                        )}
                        {!isOwnPost && (
                            <Button 
                                variant={isFollowing ? "outlined" : "contained"}
                                size="small"
                                onClick={handleFollow}
                                disabled={followLoading}
                                sx={{ 
                                    borderRadius: 1.5, px: 2, fontWeight: 700, 
                                    textTransform: 'none', height: 32,
                                    bgcolor: isFollowing ? 'transparent' : '#e7f3ff',
                                    color: '#1877f2',
                                    boxShadow: 'none',
                                    '&:hover': { bgcolor: isFollowing ? 'rgba(24,119,242,0.05)' : '#dbeafe', boxShadow: 'none' }
                                }}
                            >
                                {isFollowing ? 'Following' : 'Follow'}
                            </Button>
                        )}
                        <IconButton onClick={handleMenuOpen}><MoreIcon /></IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        >
                            {isOwnPost ? [
                                <MenuItem key="edit" onClick={() => { setEditDialogOpen(true); handleMenuClose(); }}>
                                    <EditIcon sx={{ mr: 1, fontSize: 18 }} /> Edit Post
                                </MenuItem>,
                                <MenuItem key="delete" onClick={handleDelete} sx={{ color: 'error.main' }}>
                                    <DeleteIcon sx={{ mr: 1, fontSize: 18 }} /> Delete Post
                                </MenuItem>
                            ] : (
                                <MenuItem onClick={handleMenuClose}>Report Post</MenuItem>
                            )}
                        </Menu>
                    </Box>
                }
                title={
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                            {post.user?.username}
                        </Typography>
                        <VerifiedIcon sx={{ fontSize: 16, color: '#1877f2' }} />
                    </Stack>
                }
                subheader={
                    <Typography variant="caption" color="text.secondary">
                        {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • 🌍
                    </Typography>
                }
            />
            
            <CardContent sx={{ pt: 1, pb: 1 }}>
                {post.content && (
                    <Typography variant="body1" sx={{ color: '#050505', fontSize: 15, mb: post.imageUrl ? 2 : 0, whiteSpace: 'pre-wrap' }}>
                        {post.content}
                    </Typography>
                )}
            </CardContent>

            {post.imageUrl && (
                <Box sx={{ bgcolor: '#f0f2f5', width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <Box component="img" src={getImageUrl(post.imageUrl)} alt="Post preview" sx={{ width: '100%', maxHeight: 600, objectFit: 'contain' }} />
                </Box>
            )}

            <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Stack direction="row" spacing={-0.5} alignItems="center">
                    <Box sx={{ bgcolor: '#1877f2', borderRadius: '50%', p: 0.4, display: 'flex', zIndex: 2 }}>
                        <FavoriteIcon sx={{ color: 'white', fontSize: 12 }} />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        {likes.length} others
                    </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }} onClick={() => setShowComments(!showComments)}>
                    {comments.length} comments
                </Typography>
            </Box>

            <Divider sx={{ mx: 2 }} />

            <CardActions sx={{ px: 2, py: 0.5, justifyContent: 'space-between' }}>
                <Button 
                    fullWidth startIcon={liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                    onClick={handleLike}
                    sx={{ color: liked ? '#e0245e' : '#65676b', fontWeight: 600, '&:hover': { bgcolor: '#f0f2f5' } }}
                >
                    Like
                </Button>
                <Button 
                    fullWidth startIcon={<CommentIcon />}
                    onClick={() => setShowComments(!showComments)}
                    sx={{ color: '#65676b', fontWeight: 600, '&:hover': { bgcolor: '#f0f2f5' } }}
                >
                    Comment
                </Button>
                <Button 
                    fullWidth startIcon={<ShareIcon />}
                    sx={{ color: '#65676b', fontWeight: 600, '&:hover': { bgcolor: '#f0f2f5' } }}
                >
                    Share
                </Button>
            </CardActions>

            <Collapse in={showComments}>
                <Divider />
                <Box sx={{ p: 2, bgcolor: '#f9fafb' }}>
                    {comments.length > 0 && (
                        <List sx={{ pb: 2 }}>
                            {comments.map((comment, idx) => (
                                <ListItem key={idx} alignItems="flex-start" sx={{ px: 0, py: 0.8 }}>
                                    <ListItemAvatar sx={{ minWidth: 42 }}>
                                        <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>{comment.username?.[0].toUpperCase()}</Avatar>
                                    </ListItemAvatar>
                                    <Paper elevation={0} sx={{ bgcolor: '#f0f2f5', px: 2, py: 1, borderRadius: 3, maxWidth: '85%' }}>
                                        <Typography variant="subtitle2" fontWeight={700}>{comment.username}</Typography>
                                        <Typography variant="body2">{comment.text}</Typography>
                                    </Paper>
                                </ListItem>
                            ))}
                        </List>
                    )}

                    <Box component="form" onSubmit={handleAddComment} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>{user?.username?.[0].toUpperCase()}</Avatar>
                        <TextField
                            fullWidth size="small" placeholder="Write a comment..."
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 10, bgcolor: '#f0f2f5' } }}
                            value={commentText} onChange={e => setCommentText(e.target.value)}
                        />
                        <IconButton color="primary" type="submit" disabled={!commentText.trim()}>
                            <SendIcon />
                        </IconButton>
                    </Box>
                </Box>
            </Collapse>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle sx={{ fontWeight: 800 }}>Edit Post</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        sx={{ mt: 1 }}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleUpdate} sx={{ borderRadius: 2 }}>Save Changes</Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
};

export default PostCard;
