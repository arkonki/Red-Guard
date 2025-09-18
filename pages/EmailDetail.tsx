
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/store';
import { fetchMessageById } from '../store/slices/mailSlice';
import { Box, Typography, Avatar, Skeleton, Chip } from '@mui/material';

const EmailDetail: React.FC = () => {
  const { emailId } = useParams<{ emailId: string }>();
  const dispatch = useAppDispatch();
  const { selectedMessage: email, selectedMessageStatus: status } = useAppSelector((state) => state.mail);

  useEffect(() => {
    if (emailId) {
      dispatch(fetchMessageById(emailId));
    }
  }, [emailId, dispatch]);

  if (status === 'loading') {
    return (
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Skeleton variant="text" width="75%" height={48} />
        <Box sx={{ display: 'flex', alignItems: 'center', my: 3 }}>
          <Skeleton variant="circular" width={48} height={48} sx={{ mr: 2 }}/>
          <Box>
            <Skeleton variant="text" width={150} />
            <Skeleton variant="text" width={100} />
          </Box>
        </Box>
        <Skeleton variant="rectangular" width="100%" height={200} />
      </Box>
    );
  }

  if (status === 'failed' || !email) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">Email not found or could not be loaded.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ pb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h4" component="h1" gutterBottom>
            {email.subject}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', my: 3 }}>
        <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.dark', width: 48, height: 48, mr: 2 }}>
          {email.sender.charAt(0)}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="body1" fontWeight="bold">
            {email.sender}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
                To: 
            </Typography>
            <Chip label={email.recipient} size="small" />
          </Box>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
            {new Date(email.timestamp).toLocaleString()}
        </Typography>
      </Box>
      <Box
        className="email-body"
        sx={{
            wordBreak: 'break-word',
            '& p': { my: '1em' },
            '& a': { color: 'primary.main' },
            '& ul, & ol': { pl: '2em' },
            '& h3': { mt: '1.5em', mb: '0.5em', fontSize: '1.25rem' }
        }}
        dangerouslySetInnerHTML={{ __html: email.body }} 
      />
    </Box>
  );
};

export default EmailDetail;