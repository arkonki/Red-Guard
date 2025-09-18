
import React from 'react';
import { Box, Typography } from '@mui/material';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import { useTranslation } from 'react-i18next';

const Welcome: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Box
      sx={{
        display: { xs: 'none', md: 'flex' },
        height: '100%',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        p: 3,
        bgcolor: 'grey.100'
      }}
    >
      <MailOutlineIcon sx={{ fontSize: 80, color: 'grey.300', mb: 2 }} />
      <Typography variant="h5" component="h2" fontWeight="bold">
        {t('welcomeTitle')}
      </Typography>
      <Typography sx={{ mt: 1, maxWidth: '400px' }} color="text.secondary">
        {t('welcomeMessage')}
      </Typography>
    </Box>
  );
};

export default Welcome;