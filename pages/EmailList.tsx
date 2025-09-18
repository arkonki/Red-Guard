import React, { useEffect } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/store';
import { fetchMessages } from '../store/slices/mailSlice';
import { Box, Typography, List, ListItemButton, ListItemText, Divider, Skeleton, Alert } from '@mui/material';
import { format, isToday, isThisYear } from 'date-fns';

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
        return format(date, 'p'); // e.g., 4:30 PM
    }
    if (isThisYear(date)) {
        return format(date, 'MMM d'); // e.g., Sep 18
    }
    return format(date, 'PP'); // e.g., Sep 18, 2023
};

const EmailList: React.FC = () => {
  const { folderId } = useParams<{ folderId: string }>();
  const dispatch = useAppDispatch();
  const { messages, status, error } = useAppSelector((state) => state.mail);

  useEffect(() => {
    if (folderId) {
      dispatch(fetchMessages(folderId));
    }
  }, [dispatch, folderId]);

  if (status === 'loading') {
    return (
        <Box>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Skeleton variant="text" width="40%" height={32} />
                <Skeleton variant="text" width="20%" height={20} />
            </Box>
            <List>
            {[...Array(8)].map((_, i) => (
                <Box key={i} sx={{ px: 2, py: 1.5 }}>
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="80%" />
                    <Skeleton variant="text" width="90%" />
                </Box>
            ))}
            </List>
        </Box>
    );
  }
  
  if (status === 'failed') {
      return <Alert severity="error" sx={{ m: 2 }}>{error || 'Failed to load emails.'}</Alert>;
  }


  return (
    <Box sx={{ height: '100%' }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 1 }}>
            <Typography variant="h6" component="h2" textTransform="capitalize">
                {folderId}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {messages.length} messages
            </Typography>
        </Box>
        <List disablePadding>
            {messages.map((email, index) => (
                <React.Fragment key={email.id}>
                    <ListItemButton
                        component={NavLink}
                        to={`/folder/${folderId}/email/${email.id}`}
                        alignItems="flex-start"
                        sx={{
                            '&.active': {
                                borderLeft: 3,
                                borderColor: 'primary.main',
                                bgcolor: 'action.selected'
                            }
                        }}
                    >
                        <ListItemText
                            primary={email.sender}
                            primaryTypographyProps={{
                                fontWeight: email.read ? 'normal' : 'bold',
                                color: email.read ? 'text.secondary' : 'text.primary',
                                noWrap: true,
                            }}
                            secondary={
                                <>
                                    <Typography
                                        component="span"
                                        variant="body2"
                                        color={email.read ? 'text.secondary' : 'text.primary'}
                                        sx={{ display: 'block' }}
                                        noWrap
                                    >
                                        {email.subject}
                                    </Typography>
                                    <Typography
                                        component="span"
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                          display: '-webkit-box',
                                          WebkitLineClamp: 2,
                                          WebkitBoxOrient: 'vertical',
                                          overflow: 'hidden',
                                        }}
                                    >
                                        {email.snippet}
                                    </Typography>
                                </>
                            }
                        />
                         <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0, ml: 1, pt: 0.5 }}>
                            {formatDate(email.timestamp)}
                        </Typography>
                    </ListItemButton>
                    {index < messages.length -1 && <Divider component="li" />}
                </React.Fragment>
            ))}
        </List>
    </Box>
  );
};

export default EmailList;