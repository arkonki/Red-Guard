import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Box,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { closeComposeDialog } from '../../store/slices/uiSlice';
import { sendMessage } from '../../store/slices/mailSlice';

const ComposeEmail: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isComposeOpen } = useAppSelector((state) => state.ui);
  
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleClose = () => {
    if (isSending) return; // Don't close while sending
    dispatch(closeComposeDialog());
  };
  
  const handleSend = async () => {
    if (!to || !subject) return;
    setIsSending(true);
    try {
      await dispatch(sendMessage({ to, subject, body })).unwrap();
      // On success, close the dialog and reset state
      dispatch(closeComposeDialog());
      setTo('');
      setSubject('');
      setBody('');
    } catch (error) {
      console.error('Failed to send email:', error);
      alert('Failed to send email. Please try again.'); // Simple error feedback
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isComposeOpen} onClose={handleClose} fullWidth maxWidth="md" aria-labelledby="compose-email-dialog-title">
      <DialogTitle sx={{ m: 0, p: 2 }} id="compose-email-dialog-title">
        New Message
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
          disabled={isSending}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Box component="form" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
        <DialogContent dividers>
          <TextField
            autoFocus
            required
            margin="dense"
            id="to"
            label="To"
            type="email"
            fullWidth
            variant="standard"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            disabled={isSending}
          />
          <TextField
            required
            margin="dense"
            id="subject"
            label="Subject"
            type="text"
            fullWidth
            variant="standard"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={isSending}
          />
          <TextField
            margin="dense"
            id="body"
            label="Message"
            type="text"
            fullWidth
            multiline
            rows={12}
            variant="outlined"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            sx={{ mt: 2 }}
            disabled={isSending}
          />
        </DialogContent>
        <DialogActions sx={{ p: '16px 24px' }}>
          <Button onClick={handleClose} disabled={isSending}>Discard</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!to || !subject || isSending}
          >
            {isSending ? <CircularProgress size={24} color="inherit" /> : 'Send'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default ComposeEmail;
