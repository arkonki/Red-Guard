import React, { useState, useEffect } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import api from '../services/api';

// Helper function to convert base64 string to Uint8Array
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const NotificationBell: React.FC = () => {
  const [permission, setPermission] = useState<NotificationPermission>(Notification.permission);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    // Check initial subscription status when component mounts
    if (Notification.permission === 'granted') {
      navigator.serviceWorker.ready.then(reg => {
        reg.pushManager.getSubscription().then(sub => {
          setIsSubscribed(!!sub);
        });
      });
    }
  }, []);

  const subscribeUser = async () => {
    try {
      // 1. Get VAPID public key from backend
      const response = await api.get('/notifications/vapid-public-key');
      const vapidPublicKey = response.data.publicKey;
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

      // 2. Subscribe the user
      const serviceWorkerRegistration = await navigator.serviceWorker.ready;
      const subscription = await serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      // 3. Send subscription to backend
      await api.post('/notifications/subscribe', subscription);
      
      console.log('User is subscribed.');
      setIsSubscribed(true);
      setPermission('granted');

      // Optional: Send a test notification
      await api.post('/notifications/notify-me');

    } catch (error) {
      console.error('Failed to subscribe the user: ', error);
      setPermission('denied');
    }
  };

  const handleBellClick = async () => {
    if (isSubscribed) {
      // Logic to unsubscribe might be added here in the future
      console.log('User is already subscribed.');
      return;
    }

    const currentPermission = await Notification.requestPermission();
    setPermission(currentPermission);

    if (currentPermission === 'granted') {
      await subscribeUser();
    }
  };

  let icon = <NotificationsIcon />;
  let tooltip = 'Click to enable notifications';

  if (permission === 'granted' && isSubscribed) {
    icon = <NotificationsActiveIcon color="success" />;
    tooltip = 'Notifications are enabled';
  } else if (permission === 'denied') {
    icon = <NotificationsOffIcon color="error" />;
    tooltip = 'Notifications are blocked';
  } else if (permission === 'granted' && !isSubscribed) {
    icon = <NotificationsIcon color="warning" />;
    tooltip = 'Click to finish enabling notifications';
  }

  return (
    <Tooltip title={tooltip}>
      <IconButton color="inherit" onClick={handleBellClick}>
        {icon}
      </IconButton>
    </Tooltip>
  );
};

export default NotificationBell;
