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

import styles from './styles';

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
      <Badge badgeContent={notifications} {...styles.notificationsBadge}>
        <IconButton onClick={toggleNotificationSidebar} aria-label="toggle">
          <NotificationsIcon />
        </IconButton>
      </Badge>
    );
  };

  const notificationsDropdown = () => {
    return (
      <Box {...styles.notificationsBox}>
        <Card {...styles.notificationsMenuBorder}>
          <CardContent>
            <Box {...styles.notificationsTitleBar}>
              <Typography {...styles.notificationsTitle}>
                Notifications
              </Typography>
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
      <Box sx={{ visibility: notificationsShow ? 'visible' : 'hidden' }}>
        {notificationsDropdown()}
      </Box>
    </>
  );
};

export default NotificationsButton;
