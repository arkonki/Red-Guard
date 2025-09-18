import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import ComposeEmail from '../email/ComposeEmail';
import { useAppDispatch } from '../../store/store';
import { openComposeDialog } from '../../store/slices/uiSlice';
import { fetchMessages } from '../../store/slices/mailSlice';
import api from '../../services/api';

const DRAWER_WIDTH = 256;

const MainLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isSidebarOpen, setSidebarOpen] = React.useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const checkMail = async () => {
        try {
            const response = await api.post('/mail/check-new');
            if (response.data?.newMail) {
                console.log('New mail detected, refreshing mailbox...');
                const pathParts = window.location.hash.split('/');
                // URL is like #/folder/inbox or #/folder/inbox/email/123
                if (pathParts[1] === 'folder' && pathParts[2]) {
                    const currentFolderId = pathParts[2];
                    // Fetch page 1 of the current folder
                    dispatch(fetchMessages({ folderId: currentFolderId, page: 1 }));
                }
            }
        } catch (error) {
            console.error('Failed to check for new mail:', error);
        }
    };

    // Check immediately on load and then set up the interval
    checkMail();
    const intervalId = setInterval(checkMail, 90000); // 1.5 minutes

    // Cleanup function
    return () => {
        clearInterval(intervalId);
    };
}, [dispatch]);

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Header
        drawerWidth={DRAWER_WIDTH}
        onMenuClick={() => setSidebarOpen(!isSidebarOpen)}
      />
      <Sidebar
        drawerWidth={DRAWER_WIDTH}
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onComposeClick={() => dispatch(openComposeDialog())}
        isMobile={isMobile}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: '64px', // AppBar height
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          height: '100vh',
        }}
      >
        <Outlet />
      </Box>
      <ComposeEmail />
    </Box>
  );
};

export default MainLayout;