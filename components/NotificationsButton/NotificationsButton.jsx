import { useState } from 'react';

import CloseIcon from '@mui/icons-material/Close';

import NotificationsIcon from '@mui/icons-material/Notifications';

import {
  Badge,
  Box,
  Card,
  CardContent,
  IconButton,
  Typography,
} from '@mui/material';

import NotificationList from '../NotificationList';

import Firebase from '../Reactfire/Firebase';

/**
 * A button component that toggles the visibility of the notifications sidebar.
 *
 * @return {JSX.Element} The JSX element representing the toggle component.
 */
const NotificationsButton = () => {
  const [notificationsShow, setNotificationsShow] = useState(false);
  const [notifications, setNotifications] = useState(0);

  const toggleNotificationSidebar = () => {
    setNotificationsShow(!notificationsShow);
  };

  const notificationsButton = () => {
    return (
      <Badge badgeContent={notifications} size="large" color="error">
        <IconButton onClick={toggleNotificationSidebar} aria-label="toggle">
          <NotificationsIcon />
        </IconButton>
      </Badge>
    );
  };

  const notificationsDropdown = () => {
    return (
      <Box
        sx={{
          minWidth: 600,
          minHeight: 100,
          position: 'fixed',
          top: 100,
          right: 50,
          visibility: notificationsShow ? 'visible' : 'hidden',
        }}
      >
        <Card variant="outlined">
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="h5">Notifications</Typography>
              <IconButton onClick={toggleNotificationSidebar}>
                <CloseIcon />
              </IconButton>
            </Box>
            <Firebase>
              <NotificationList
                notifications={setNotifications}
                closeMenu={toggleNotificationSidebar}
              />
            </Firebase>
          </CardContent>
        </Card>
      </Box>
    );
  };

  return (
    <>
      {notificationsButton()}
      {notificationsDropdown()}
    </>
  );
};

export default NotificationsButton;
