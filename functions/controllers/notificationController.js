const admin = require('firebase-admin');
const { https } = require('firebase-functions/v2');
const { onCall } = require('firebase-functions/v2/https');
const {
  onDocumentCreated,
  onDocumentUpdated,
  onDocumentDeleted,
} = require('firebase-functions/v2/firestore');
const { Timestamp, Filter } = require('firebase-admin/firestore');
const { logger } = require('firebase-functions/v1');

const DEBUG = true;

/**
 * Gets notifications for a user from the Firestore collection "personal-notifications".
 *
 * @async
 * @function getNotifications
 * @param {Object} context - The context object containing information about the authenticated user.
 * @param {Object} context.data - The data given to the request.
 * @param {String} context.data.uid - The user id of the request.
 * @param {String} context.data.nid - The notification id of the request(Optional).
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of notifications.
 * @returns {Array<Object>} return.data - The array of notifications.
 * @throws {https.HttpsError} If uid is missing in the data object.
 */
exports.getNotifications = onCall(async (context) => {
  const { uid, nid } = context.data;

  if (!uid) {
    throw new https.HttpsError(
      'failed-precondition',
      'The user id was not provided'
    );
  }
  try {
    const personalRef = admin.firestore().collection('personal-notifications');
    let filter = Filter.where('user', '==', uid);
    if (nid != null) {
      filter = Filter.and(filter, Filter.where('nid', '==', nid));
    }
    const notifications = [];
    const result = await personalRef.where(filter).get();
    result.docs.forEach((res) => {
      notifications.push(res.data());
    });
    DEBUG &&
      logger.log('Returning ' + notifications.length + ' notifications.');
    return notifications;
  } catch (err) {
    DEBUG && logger.log(err);
    throw new https.HttpsError('internal-server-error', err.toString());
  }
});

/**
 * Updates the is_read status of a user's notification(s).
 *
 * @async
 * @function setNotificationStats
 * @param {Object} context - The context object containing information about the authenticated user.
 * @param {Object} context.data - The data given to the request.
 * @param {String} context.data.uid - The user id of the request.
 * @param {String} context.data.nid - The notification id of the request(Optional).
 * @param {String} context.data.status - The status to change the notification(s) to.
 * @returns {Promise<Object>} A promise that resolves to a success message.
 * @returns {Array<Object>} return.data - The array of notifications.
 * @throws {https.HttpsError} If uid or status is missing in the data object.
 */
exports.setNotificationStats = onCall(async (context) => {
  const { uid, nid, status } = context.data;
  if (!uid || !status) {
    throw new https.HttpsError(
      'failed-precondition',
      'The user id was not provided'
    );
  }
  try {
    const personalRef = admin.firestore().collection('personal-notifications');
    let filter = Filter.where('user', '==', uid);
    if (nid) {
      filter = Filter.and(filter, Filter.where('id', '==', nid));
    }

    const personalNotif = await personalRef.where(filter).get();

    if (personalNotif.docs.length < 1) {
      throw new Error('Database has no notification under this name');
    }

    for (let i = 0; i < personalNotif.docs.length; i++) {
      const datum = personalNotif.docs.at(i).data();
      datum.is_read = status;
      await admin
        .firestore()
        .collection('personal-notifications')
        .doc(datum.id)
        .set(datum);
    }

    DEBUG &&
      logger.log(
        'Successfully updated ' +
          personalNotif.docs.length +
          ' notification(s) to ' +
          status
      );
    return { result: 'Success', data: 'Updated Successfully' };
  } catch (err) {
    DEBUG && logger.log(err);
    throw new https.HttpsError('internal-server-error', err.toString());
  }
});

/**
 * Trigger that creates a personal copy of a global notification for every user
 * when a global notification is created
 *
 * @async
 * @function onNewNotification
 */
exports.onNewNotification = onDocumentCreated(
  'notifications/{newId}',
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      DEBUG &&
        logger.log(
          'No data in notification. Trigger will not generate new notifications'
        );
      return;
    }
    const newNotification = snapshot.data();
    try {
      const users = await admin.firestore().collection('users').get();

      users.docs.forEach((userdoc) => {
        const id = crypto.randomUUID();
        const personalNotification = admin
          .firestore()
          .collection('personal-notifications')
          .doc(newNotification.id + ' ' + id);
        const notification_read = newNotification;
        notification_read.is_read = false;
        notification_read.nid = newNotification.id;
        notification_read.id = newNotification.id + ' ' + id;
        notification_read.user = userdoc.data().id;

        personalNotification.set(notification_read).catch((error) => {
          DEBUG &&
            logger.log(
              'Failed to create personal notification:',
              event.params.newId,
              'for user:',
              userdoc.data().id
            );
        });
      });
    } catch (err) {
      DEBUG && logger.log('Failed to generate personal notifications:', err);
    }
  }
);

/**
 * Trigger that removes all personal copies of a global notification
 * when the global notification is removed
 *
 * @async
 * @function onRemovedNotification
 */
exports.onRemovedNotification = onDocumentDeleted(
  'notifications/{id}',
  async (event) => {
    try {
      const notifRef = admin.firestore().collection('personal-notifications');
      const filter = Filter.where('nid', '==', event.params.id);
      const personalNotifications = await notifRef.where(filter).get();
      for (let i = 0; i < personalNotifications.docs.length; i++) {
        const info = personalNotifications.docs.at(i).data();
        await admin
          .firestore()
          .collection('personal-notifications')
          .doc(info.id)
          .delete();
      }
    } catch (err) {
      DEBUG && logger.log('Could not remove personal notifications: ', err);
    }
  }
);

/**
 * Helper function that takes a notification and adds it to the notification collection
 *
 * @async
 * @function
 * @param {Object} notification - The notification structure that is added to the database
 */
const createNewNotification = async (notification) => {
  try {
    await admin
      .firestore()
      .collection('notifications')
      .doc(notification.id)
      .set(notification);
    DEBUG && logger.log('New Tool notification created');
  } catch (err) {
    DEBUG && logger.log('Failed to create a notification: ', err);
  }
};

/**
 * Trigger that occurs when a new tool is created. Creates a global
 * notification related to the tool when triggered.
 *
 * @async
 * @function onNewTool
 */
exports.onNewTool = onDocumentCreated('tools/{newId}', async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    DEBUG && logger.log('Created an empty tool. No notification is crreated');
    return;
  }
  const tool = snapshot.data();

  const notification = {
    id: 'Announcement ' + tool.name,
    type: 'Announcement',
    title: 'New Tool',
    description:
      tool.name + ' has been created. Check it out on the main menu.',
    date: Timestamp.fromMillis(Date.now()),
    action_link: tool.name,
  };

  await createNewNotification(notification);
});

/**
 * Trigger that occurs when a tool is updated. Creates a global
 * notification related to the tool when triggered.
 *
 * @async
 * @function onUpdatedTool
 */
exports.onUpdatedTool = onDocumentUpdated('tools/{id}', async (event) => {
  const tool = event.data.after.data();
  if (!tool) {
    DEBUG && logger.log('Updated an empty tool. No notification is created');
    return;
  }
  const notification = {
    id: 'Update ' + tool.name,
    type: 'Update',
    title: 'Tool Updated',
    description:
      tool.name + ' has been updated. Check it out on the main menu.',
    date: Timestamp.fromMillis(Date.now()),
    action_link: tool.name,
  };

  await createNewNotification(notification);
});

/**
 * Trigger that occurs when a new assistant is created. Creates a global
 * notification related to the assistant when triggered.
 *
 * @async
 * @function onNewAssistant
 */
exports.onNewAssistant = onDocumentCreated(
  'assistants/{newId}',
  async (event) => {
    const snapshot = event.data;

    if (!snapshot) {
      DEBUG &&
        logger.log('Updated an empty assistant. No notification is created');
      return;
    }

    const assistant = snapshot.data();

    const notification = {
      id: 'Announcement ' + assistant.name,
      type: 'Announcement',
      title: 'New Assistant',
      description:
        assistant.name + ' has been created. Check it out from the main menu.',
      date: Timestamp.fromMillis(Date.now()),
      action_link: assistant.name,
    };

    await createNewNotification(notification);
  }
);

/**
 * Trigger that occurs when an assistant is updated. Creates a global
 * notification related to the assistant when triggered.
 *
 * @async
 * @function onUpdatedAssistant
 */
exports.onUpdatedAssistant = onDocumentUpdated(
  'assistants/{id}',
  async (event) => {
    const assistant = event.data.after.data();

    if (!assistant) {
      DEBUG &&
        logger.log('Updated an empty assistant. No notification is created');
      return;
    }

    const notification = {
      id: 'Update ' + assistant.name,
      type: 'Update',
      title: 'Assistant Updated',
      description:
        assistant.name + ' has been updated. Check it out from the main menu.',
      date: Timestamp.fromMillis(Date.now()),
      action_link: assistant.name,
    };

    await createNewNotification(notification);
  }
);
