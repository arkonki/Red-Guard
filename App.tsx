import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import MainLayout from './components/layout/MainLayout';
import Mailbox from './pages/Mailbox';
import EmailDetail from './pages/EmailDetail';
import Welcome from './pages/Welcome';
import LoginPage from './pages/LoginPage';
import { useAppSelector } from './store/store';
import theme from './theme';
import ReloadPrompt from './components/ui/ReloadPrompt';

// A wrapper component to protect routes that require authentication
const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <HashRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              {/* These nested routes are protected because their parent element is wrapped */}
              <Route index element={<Navigate to="/folder/inbox" replace />} />
              <Route path="folder/:folderId" element={<Mailbox />}>
                <Route index element={<Welcome />} />
                <Route path="email/:emailId" element={<EmailDetail />} />
              </Route>
              <Route path="*" element={<Navigate to="/folder/inbox" replace />} />
            </Route>
          </Routes>
        </HashRouter>
        <ReloadPrompt />
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;