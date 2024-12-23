import { useEffect, useState } from 'react';

import { Box, Button, Card, Divider, Typography } from '@mui/material';
import { collection, query, where } from 'firebase/firestore';

import { useRouter } from 'next/router';
import { useFirestoreCollectionData } from 'reactfire';

import Notification from '../Notification/Notification';

import ROUTES from '@/libs/constants/routes';

import { auth, firestore } from '@/libs/redux/store';

import { setReadStatus } from '@/libs/services/notifications/setReadStatus';

/**
 * Generates a list of notifications for the signed in user.
 *
 * @param {Function} notifications - The parent's setState function passed to set the number of notifications.
 * @return {JSX.Element} The JSX element representing the notifications list.
 */
const NotificationList = (props) => {
  const { notifications = () => {} } = props;

  const router = useRouter();

  const [messages, setMessages] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState([]);
  const [hideRead, setHideRead] = useState(false);

  const notifCol = collection(firestore, 'personal-notifications');
  const notifQuery = query(notifCol, where('user', '==', auth.currentUser.uid));
  const { status, data: notifs } = useFirestoreCollectionData(notifQuery, {
    idField: 'id',
  });

  useEffect(() => {
    if (status !== 'loading') {
      notifs.sort((notif1, notif2) => {
        if (notif1.date.seconds === notif2.date.seconds) {
          return notif1.date.nanoseconds - notif2.date.nanoseconds;
        }
        return notif1.date.seconds - notif2.date.seconds;
      });
      setMessages(notifs);
      const unread = notifs.filter((notif) => {
        return !notif.is_read;
      });
      setUnreadMessages(unread);
      notifications(unread.length);
    }
  }, [notifs]);

  const displayUnread = () => {
    if (unreadMessages.length > 0) {
      return `Unread (${unreadMessages.length})`;
    }
    return 'Unread';
  };

  const showReadAlertButtons = () => {
    return (
      <Card sx={{ display: 'inlineBlock' }}>
        <Button
          variant={hideRead ? 'text' : 'contained'}
          sx={{ minWidth: 300, borderRadius: '5px', margin: '5px' }}
          color="primary"
          onClick={() => {
            setHideRead(false);
          }}
        >
          <Typography>All</Typography>
        </Button>
        <Button
          variant={hideRead ? 'contained' : 'text'}
          sx={{ minWidth: 300, borderRadius: '5px', margin: '5px' }}
          color="primary"
          onClick={() => {
            setHideRead(true);
          }}
        >
          <Typography>{displayUnread()}</Typography>
        </Button>
      </Card>
    );
  };

  const notificationsList = () => {
    let msgs = messages;
    if (hideRead) {
      msgs = unreadMessages;
    }
    return (
      <Box sx={{ maxHeight: '50vh', overflowY: 'scroll', margin: '3px' }}>
        {msgs.map((notif) => {
          return <Notification key={notif.id} notif={notif} />;
        })}
      </Box>
    );
  };

  const setAllRead = () => {
    messages.forEach((message) => {
      message.is_read = true;
    });
    setReadStatus(messages);
  };

  const globalButtons = () => {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          onClick={() => {
            router.replace(ROUTES.NOTIFICATIONS);
          }}
          aria-label="toSettings"
        >
          Go to Settings
        </Button>
        <Button onClick={setAllRead} variant="contained" aria-label="readAll">
          Mark all as read
        </Button>
      </Box>
    );
  };

  return (
    <Box>
      {showReadAlertButtons()}
      <Divider sx={{ width: '100%', padding: '3px' }} />
      {notificationsList()}
      {globalButtons()}
    </Box>
  );
};

export default NotificationList;
