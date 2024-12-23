import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import ErrorIcon from '@mui/icons-material/Error';

import { Box, Button, Divider, Typography } from '@mui/material';

import { setReadStatus } from '@/libs/services/notifications/setReadStatus';

/**
 * A component that displays a notification message.
 *
 * @param {Object} notif - The notification object
 * @param {string} notif.id - The id of the message
 * @param {string} notif.type - The type of message.
 * @param {string} notif.title - The title of the message.
 * @param {Date} notif.date - The date of the message.
 * @param {string} notif.description - The contents of the message.
 * @param {string} notif.is_read - The read status of the message.
 * @param {string} notif.user - The user id the message is assigned to.
 * @param {string} notif.nid - The global notification(optional).
 * @param {string} notif.action_link - The link to the action associated with the notification.
 * @return {JSX.Element} The JSX element representing the notifcation component.
 */

const Notification = (props) => {
  const { notif } = props;

  const messageIcon = () => {
    if (notif.is_read) {
      return (
        <CheckCircleIcon
          fontSize="large"
          aria-label="readIcon"
          sx={{ margin: '3px' }}
        />
      );
    }
    return (
      <ErrorIcon
        fontSize="large"
        aria-label="unreadIcon"
        sx={{ margin: '3px' }}
      />
    );
  };

  const notificationTitle = () => {
    return (
      <Typography>
        {notif.type} - {notif.title}
      </Typography>
    );
  };

  const convertDateToTime = (notificate) => {
    const milliseconds =
      notificate.date.seconds * 1000 +
      Math.floor(notificate.date.nanoseconds / 1000000);
    const date = new Date(milliseconds);
    const ampm = Math.floor(date.getHours() / 12) < 1 ? 'AM' : 'PM';
    const minutes =
      date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
    const hours = date.getHours() % 12;
    const timeOfDay = `${hours}:${minutes}${ampm}`;
    const year = date.getFullYear();
    const month = date.getMonth();
    const dayOfMonth = date.getDate();
    const dayOfYear = `${year}/${month}/${dayOfMonth}`;
    return `${dayOfYear} - ${timeOfDay}`;
  };

  const notificationDate = () => {
    return (
      <Typography color="text.secondary">{convertDateToTime(notif)}</Typography>
    );
  };

  const toggleRead = () => {
    const message = notif;
    message.is_read = !message.is_read;
    setReadStatus([message]);
  };

  const toggleReadButton = () => {
    return (
      <Button onClick={toggleRead} aria-label="toggleRead">
        <Typography>
          {notif.is_read ? 'Mark As Unread' : 'Mark As Read'}
        </Typography>
      </Button>
    );
  };

  const viewNotification = () => {
    // eslint-disable-next-line no-console
    console.log('Placeholder. Going to message details');
  };

  const actionButtons = () => {
    return (
      <Box>
        <Button
          onClick={viewNotification}
          variant="contained"
          aria-label="viewNotif"
        >
          <Typography>View Details</Typography>
        </Button>
        {toggleReadButton()}
      </Box>
    );
  };

  const displayNotification = () => {
    return (
      <Box id={notif.id} sx={{ display: 'flex' }}>
        {messageIcon()}
        <Box>
          {notificationTitle()}
          {notificationDate()}
          {actionButtons()}
        </Box>
      </Box>
    );
  };

  return (
    <Box>
      {displayNotification()}
      <Divider style={{ width: '100%', padding: '3px' }} />
    </Box>
  );
};

export default Notification;
