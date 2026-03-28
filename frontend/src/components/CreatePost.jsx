import { useState, useContext, useRef } from 'react';
import { Card, CardContent, Typography, TextField, Button, Box, IconButton, Collapse, Avatar, Divider, Chip, Stack, Alert, Tooltip, useTheme, useMediaQuery, Menu, MenuItem } from '@mui/material';
import { 
    Image as ImageIcon, 
    InsertEmoticon as EmojiIcon, 
    BarChart as BarChartIcon, 
    VolumeUp as VolumeUpIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const CreatePost = ({ onPostCreated }) => {
    const { user } = useContext(AuthContext);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [content, setContent] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [isPromoted, setIsPromoted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab ] = useState('all');
    const [emojiAnchor, setEmojiAnchor] = useState(null);
    const fileInputRef = useRef(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleEmojiClick = (emoji) => {
        setContent(prev => prev + ' ' + emoji);
        setEmojiAnchor(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim() && !imageFile) return;
        
        setError('');
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('content', content);
            formData.append('isPromoted', isPromoted);
            if (imageFile) {
                formData.append('image', imageFile);
            }

            const res = await axios.post('/posts', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setContent('');
            setIsPromoted(false);
            removeImage();
            if (onPostCreated) onPostCreated(res.data.post);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card sx={{ mb: 3, border: ' none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', bgcolor: 'white' }}>
            <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight={800} letterSpacing={-0.5}>
                        Create Post
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ bgcolor: '#f0f2f5', p: 0.5, borderRadius: 10 }}>
                        <Button 
                            size="small"
                            variant={activeTab === 'all' ? 'contained' : 'text'}
                            sx={{ 
                                borderRadius: 10, px: 2, 
                                bgcolor: activeTab === 'all' ? 'white' : 'transparent',
                                color: activeTab === 'all' ? '#1877f2' : '#65676b',
                                boxShadow: activeTab === 'all' ? '0 2px 5px rgba(0,0,0,0.1)' : 'none',
                                '&:hover': { bgcolor: activeTab === 'all' ? 'white' : 'rgba(0,0,0,0.05)' }
                            }}
                            onClick={() => setActiveTab('all')}
                        >
                            All Posts
                        </Button>
                        <Button 
                            size="small"
                            variant={activeTab === 'promo' ? 'contained' : 'text'}
                            sx={{ 
                                borderRadius: 10, px: 2, 
                                bgcolor: activeTab === 'promo' ? 'white' : 'transparent',
                                color: activeTab === 'promo' ? '#1877f2' : '#65676b',
                                boxShadow: activeTab === 'promo' ? '0 2px 5px rgba(0,0,0,0.1)' : 'none',
                                '&:hover': { bgcolor: activeTab === 'promo' ? 'white' : 'rgba(0,0,0,0.05)' }
                            }}
                            onClick={() => setActiveTab('promo')}
                        >
                            Promotions
                        </Button>
                    </Stack>
                </Box>

                <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
                    <Avatar sx={{ width: 42, height: 42, bgcolor: '#1877f2', fontSize: 18 }}>
                        {user?.username?.[0].toUpperCase()}
                    </Avatar>
                    <TextField
                        fullWidth
                        placeholder={`What's on your mind, ${user?.username}?`}
                        multiline
                        maxRows={5}
                        variant="standard"
                        InputProps={{ disableUnderline: true, sx: { fontSize: 18, fontWeight: 500, mt: 0.5 } }}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                </Box>

                {imagePreview && (
                    <Box sx={{ position: 'relative', mt: 2, mb: 1, borderRadius: 2, overflow: 'hidden' }}>
                        <Box component="img" src={imagePreview} alt="Preview" sx={{ width: '100%', maxHeight: 300, objectFit: 'cover' }} />
                        <IconButton 
                            onClick={removeImage}
                            sx={{ position: 'absolute', top: 10, right: 10, bgcolor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}
                            size="small"
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Box>
                )}

                <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    ref={fileInputRef}
                    onChange={handleImageChange}
                />


                {error && <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>{error}</Alert>}

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Add Image">
                            <IconButton 
                                onClick={() => fileInputRef.current.click()} 
                                sx={{ color: '#45bd62', bgcolor: imageFile ? 'rgba(69,189,98,0.1)' : 'transparent' }}
                            >
                                <ImageIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Feelings">
                            <IconButton 
                                onClick={(e) => setEmojiAnchor(e.currentTarget)}
                                sx={{ color: '#f7b928' }}
                            >
                                <EmojiIcon />
                            </IconButton>
                        </Tooltip>
                        <Menu
                            anchorEl={emojiAnchor}
                            open={Boolean(emojiAnchor)}
                            onClose={() => setEmojiAnchor(null)}
                        >
                            <Box sx={{ p: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
                                {['😊', '😂', '🔥', '❤️', '🙌', '🚀', '🤔', '😎'].map(emoji => (
                                    <IconButton key={emoji} onClick={() => handleEmojiClick(emoji)} size="small">
                                        {emoji}
                                    </IconButton>
                                ))}
                            </Box>
                        </Menu>
                        <Tooltip title="Poll">
                            <IconButton sx={{ color: '#1877f2' }}><BarChartIcon /></IconButton>
                        </Tooltip>
                        {!isMobile && (
                            <Chip 
                                icon={<VolumeUpIcon sx={{ color: isPromoted ? 'white !important' : '#1877f2 !important' }} />} 
                                label="Promote" 
                                color={isPromoted ? "primary" : "default"}
                                variant={isPromoted ? "filled" : "outlined"}
                                onClick={() => setIsPromoted(!isPromoted)}
                                sx={{ 
                                    border: isPromoted ? 'none' : 'none', 
                                    fontWeight: 700, 
                                    color: isPromoted ? 'white' : '#1877f2', 
                                    height: 36, 
                                    '&:hover': { bgcolor: isPromoted ? '#1565d8' : '#e7f3ff' },
                                    transition: 'all 0.2s'
                                }}
                            />
                        )}
                    </Stack>
                    <Button 
                        variant="contained" 
                        disabled={loading || (!content.trim() && !imageFile)}
                        sx={{ 
                            px: 4, py: 1, borderRadius: 2, fontWeight: 700,
                            boxShadow: '0 4px 10px rgba(24,119,242,0.3)',
                            background: 'linear-gradient(90deg, #1877f2, #42b3f5)'
                        }}
                        onClick={handleSubmit}
                    >
                        {loading ? 'Posting...' : 'Post'}
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};

export default CreatePost;
