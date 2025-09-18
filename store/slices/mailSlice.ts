import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import type { Email } from '../../types';

interface Mailbox {
  id: string;
  name: string;
}

interface MailState {
  mailboxes: Mailbox[];
  messages: Email[];
  selectedMessage: Email | null;
  selectedMailbox: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  selectedMessageStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: MailState = {
  mailboxes: [],
  messages: [],
  selectedMessage: null,
  selectedMailbox: null,
  status: 'idle',
  selectedMessageStatus: 'idle',
  error: null,
};

// --- Thunks ---

export const fetchMailboxes = createAsyncThunk(
  'mail/fetchMailboxes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/mail/mailboxes');
      return response.data as Mailbox[];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'mail/fetchMessages',
  async (mailboxId: string, { rejectWithValue }) => {
    try {
        const response = await api.get('/mail/messages', {
            params: { mailbox: mailboxId },
        });
        return response.data as Email[];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchMessageById = createAsyncThunk(
  'mail/fetchMessageById',
  async ({ messageId, mailboxId }: { messageId: string, mailboxId: string }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/mail/message/${messageId}`, {
          params: { mailbox: mailboxId },
      });
      return response.data as Email;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const sendMessage = createAsyncThunk(
  'mail/sendMessage',
  async (emailData: { to: string; subject: string; body: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/mail/send', emailData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);


const mailSlice = createSlice({
  name: 'mail',
  initialState,
  reducers: {
    selectMailbox: (state, action: PayloadAction<string>) => {
      state.selectedMailbox = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Mailboxes
      .addCase(fetchMailboxes.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMailboxes.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.mailboxes = action.payload;
      })
      .addCase(fetchMailboxes.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Fetch Messages
      .addCase(fetchMessages.pending, (state) => {
        state.status = 'loading';
        state.messages = []; // Clear previous messages
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
        state.messages = [];
      })
      // Fetch Single Message
      .addCase(fetchMessageById.pending, (state) => {
        state.selectedMessageStatus = 'loading';
        state.selectedMessage = null;
      })
      .addCase(fetchMessageById.fulfilled, (state, action) => {
        state.selectedMessageStatus = 'succeeded';
        state.selectedMessage = action.payload;
      })
      .addCase(fetchMessageById.rejected, (state, action) => {
        state.selectedMessageStatus = 'failed';
        state.error = action.payload as string;
      })
      // Send Message
      .addCase(sendMessage.fulfilled, (_, action) => {
        console.log('Message sent successfully:', action.payload.message);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = `Failed to send message: ${action.payload as string}`;
        console.error('Failed to send message:', action.payload);
      });
  },
});

export const { selectMailbox } = mailSlice.actions;
export default mailSlice.reducer;
