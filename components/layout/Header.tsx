import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Avatar, Box, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '../../store/store';
import { logout } from '../../store/slices/authSlice';
import NotificationBell from '../NotificationBell';

interface HeaderProps {
  onMenuClick: () => void;
  // FIX: Add drawerWidth to props to fix type error and allow for proper layout with sidebar.
  drawerWidth: number;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, drawerWidth }) => {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const { t, i18n } = useTranslation();

  const handleLogout = () => {
    dispatch(logout());
  };
  
  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <AppBar
      position="fixed"
      color="primary"
      elevation={1}
      sx={{
        // FIX: Adjust AppBar width and margin for permanent drawer on desktop.
        width: { md: `calc(100% - ${drawerWidth}px)` },
        ml: { md: `${drawerWidth}px` },
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
            <Box>
                <Button 
                    color="inherit" 
                    onClick={() => handleLanguageChange('en')} 
                    disabled={i18n.resolvedLanguage === 'en'}
                    size="small"
                >
                    EN
                </Button>
                <Button 
                    color="inherit" 
                    onClick={() => handleLanguageChange('et')} 
                    disabled={i18n.resolvedLanguage === 'et'}
                    size="small"
                >
                    ET
                </Button>
            </Box>
            <Button color="inherit" variant="outlined" onClick={handleLogout}>
              {t('logout')}
            </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;