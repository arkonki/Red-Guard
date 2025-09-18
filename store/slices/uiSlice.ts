import { createSlice } from '@reduxjs/toolkit';

interface UiState {
  isComposeOpen: boolean;
}

const initialState: UiState = {
  isComposeOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openComposeDialog: (state) => {
      state.isComposeOpen = true;
    },
    closeComposeDialog: (state) => {
      state.isComposeOpen = false;
    },
  },
});

export const { openComposeDialog, closeComposeDialog } = uiSlice.actions;
export default uiSlice.reducer;
