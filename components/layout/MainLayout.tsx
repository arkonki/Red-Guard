import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import ComposeEmail from '../email/ComposeEmail';
import { useAppDispatch } from '../../store/store';
import { openComposeDialog } from '../../store/slices/uiSlice';

const DRAWER_WIDTH = 256;

const MainLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isSidebarOpen, setSidebarOpen] = React.useState(false);
  const dispatch = useAppDispatch();

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