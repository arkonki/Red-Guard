
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Paper } from '@mui/material';
import EmailList from './EmailList';

const Mailbox: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden', height: '100%' }}>
      <Paper
        elevation={0}
        square
        sx={{
          width: { xs: '100%', md: '40%', lg: '33.33%' },
          flexShrink: 0,
          borderRight: 1,
          borderColor: 'divider',
          overflowY: 'auto',
          height: '100%',
        }}
      >
        <EmailList />
      </Paper>
      <Box sx={{ flexGrow: 1, overflowY: 'auto', height: '100%' }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default Mailbox;
