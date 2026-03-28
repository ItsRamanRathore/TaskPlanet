import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { 
    Box, Typography, CircularProgress, Container, Paper, InputBase, 
    IconButton, Button, useMediaQuery, useTheme, Stack, Fade, Divider
} from '@mui/material';
import { Search as SearchIcon, FilterList as FilterIcon, Create as CreateIcon } from '@mui/icons-material';
import axios from 'axios';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get('search') || '';

    useEffect(() => {
        fetchPosts(searchQuery);
    }, [searchQuery]);

    const fetchPosts = async (query = '') => {
        setLoading(true);
        try {
            const res = await axios.get(`/posts${query ? `?search=${query}` : ''}`);
            setPosts(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch posts. Please refresh.');
        } finally {
            setLoading(false);
        }
    };

    const handlePostCreated = (newPost) => {
        setPosts([newPost, ...posts]);
    };

    const FilterButton = ({ label, value }) => (
        <Button
            variant={filter === value ? 'contained' : 'text'}
            onClick={() => setFilter(value)}
            sx={{ 
                borderRadius: 2, px: 2, py: 1, fontWeight: 700,
                bgcolor: filter === value ? 'rgba(24,119,242,0.1)' : 'transparent',
                color: filter === value ? '#1877f2' : '#65676b',
                boxShadow: 'none', textTransform: 'none',
                '&:hover': { bgcolor: filter === value ? 'rgba(24,119,242,0.15)' : 'rgba(0,0,0,0.05)' }
            }}
        >
            {label}
        </Button>
    );

    if (loading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mt: 20, gap: 2 }}>
                <CircularProgress thickness={5} size={50} sx={{ color: '#1877f2' }} />
                <Typography fontWeight={600} color="text.secondary">Loading your feed...</Typography>
            </Box>
        );
    }

    return (
        <Container maxWidth="sm" sx={{ px: { xs: 1.5, sm: 2 }, mt: { xs: 2, sm: 4 } }}>
            {/* Mobile Header */}
            {isMobile && (
                <Fade in={true}>
                    <Box sx={{ mb: 3 }}>
                        <Paper
                            elevation={0}
                            sx={{ p: '6px 12px', display: 'flex', alignItems: 'center', mb: 2, bgcolor: '#f0f2f5', borderRadius: 10 }}
                        >
                            <SearchIcon sx={{ color: '#65676b', fontSize: 20 }} />
                            <InputBase
                                sx={{ ml: 1, flex: 1, fontSize: 14 }}
                                placeholder="Search animations, users, posts..."
                            />
                        </Paper>
                        <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
                            <FilterButton label="All Post" value="all" />
                            <FilterButton label="Following" value="following" />
                            <FilterButton label="Trending" value="trending" />
                            <FilterButton label="Events" value="events" />
                        </Stack>
                    </Box>
                </Fade>
            )}

            {/* Desktop Filters Side (Conceptual) or Just Top Bar */}
            {!isMobile && (
                <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FilterButton label="All Feed" value="all" />
                    <FilterButton label="For You" value="foryou" />
                    <FilterButton label="Recent" value="recent" />
                    <Box sx={{ flex: 1 }} />
                    <IconButton size="small" sx={{ bgcolor: '#f0f2f5' }}><FilterIcon fontSize="small" /></IconButton>
                </Box>
            )}

            <CreatePost onPostCreated={handlePostCreated} />

            {error && (
                <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, mt: 4, bgcolor: '#fff0f0', border: '1px solid #ffcccc' }}>
                    <Typography color="error" fontWeight={700}>{error}</Typography>
                    <Button onClick={() => fetchPosts(searchQuery)} sx={{ mt: 2 }}>Retry</Button>
                </Paper>
            )}
            
            {posts.length === 0 && !error ? (
                <Box sx={{ mt: 8, textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight={800} color="text.secondary">No posts yet</Typography>
                    <Typography color="text.secondary">Be the first to share something amazing!</Typography>
                </Box>
            ) : (
                <Stack spacing={2}>
                    {posts.map((post) => (
                        <Fade in={true} key={post._id} timeout={500}>
                            <Box>
                                <PostCard post={post} />
                            </Box>
                        </Fade>
                    ))}
                </Stack>
            )}
        </Container>
    );
};

export default Feed;
