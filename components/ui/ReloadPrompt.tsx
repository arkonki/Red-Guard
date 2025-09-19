import { useRegisterSW } from 'virtual:pwa-register/react';
import { Snackbar, Button, Alert } from '@mui/material';

function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r);
    },
    onRegisterError(error) {
      console.log('SW registration error:', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  return (
    <>
      <Snackbar
        open={offlineReady}
        autoHideDuration={6000}
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={close} severity="info" sx={{ width: '100%' }}>
          App is ready to work offline.
        </Alert>
      </Snackbar>
      <Snackbar
        open={needRefresh}
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ mb: offlineReady ? '56px' : 0 }}
      >
        <Alert
          severity="warning"
          sx={{ width: '100%' }}
          action={
            <Button color="inherit" size="small" onClick={() => updateServiceWorker(true)}>
              Reload
            </Button>
          }
        >
          A new version is available, please reload.
        </Alert>
      </Snackbar>
    </>
  );
}

export default ReloadPrompt;