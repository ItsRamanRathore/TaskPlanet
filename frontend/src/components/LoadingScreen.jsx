import React from 'react';
import { Box, CircularProgress, Typography, Fade } from '@mui/material';

const LoadingScreen = () => {
    return (
        <Fade in timeout={800}>
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#ffffff',
                    zIndex: 9999,
                }}
            >
                {/* Brand Logo Placeholder */}
                <Box
                    sx={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 4,
                    }}
                >
                    <CircularProgress
                        variant="determinate"
                        sx={{
                            color: '#e7f3ff',
                            position: 'absolute',
                        }}
                        size={80}
                        thickness={4}
                        value={100}
                    />
                    <CircularProgress
                        variant="indeterminate"
                        disableShrink
                        sx={{
                            color: '#1877f2',
                            animationDuration: '550ms',
                        }}
                        size={80}
                        thickness={4}
                    />
                    <Typography
                        variant="h4"
                        sx={{
                            position: 'absolute',
                            fontWeight: 800,
                            color: '#1877f2',
                            letterSpacing: -1,
                        }}
                    >
                        T
                    </Typography>
                </Box>

                <Typography
                    variant="h5"
                    sx={{
                        fontWeight: 700,
                        color: '#050505',
                        mb: 1,
                        fontFamily: '"Inter", sans-serif',
                    }}
                >
                    TaskPlanet
                </Typography>
                <Typography
                    variant="body2"
                    sx={{
                        color: '#65676b',
                        fontWeight: 500,
                    }}
                >
                    Connecting your world...
                </Typography>

                {/* Subtle loading indicator at bottom */}
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 40,
                        width: '100%',
                        textAlign: 'center',
                    }}
                >
                    <Typography
                        variant="caption"
                        sx={{
                            color: '#bcc0c4',
                            textTransform: 'uppercase',
                            letterSpacing: 2,
                        }}
                    >
                        Securely Loading
                    </Typography>
                </Box>
            </Box>
        </Fade>
    );
};

export default LoadingScreen;
