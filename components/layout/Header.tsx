import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Avatar, Box, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useAppSelector, useAppDispatch } from '../../store/store';
import { logout } from '../../store/slices/authSlice';
import NotificationBell from '../NotificationBell';

interface HeaderProps {
  onMenuClick: () => void;
  drawerWidth: number;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, drawerWidth }) => {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <AppBar
      position="fixed"
      color="primary"
      elevation={1}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2, display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          Veebimajutus Mail
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <NotificationBell />
            <Avatar sx={{ bgcolor: 'primary.dark' }}>
                {user?.name?.charAt(0) || 'A'}
            </Avatar>
            <Button color="inherit" variant="outlined" onClick={handleLogout}>
              Logout
            </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
