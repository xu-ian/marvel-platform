require('dotenv').config({ path: '../.env' }); // Ensure this is at the top
const admin = require('firebase-admin');

admin.initializeApp();

const userController = require('./controllers/userController');
const marvelAIController = require('./controllers/marvelAIController');
const notificationController = require('./controllers/notificationController');
const { seedDatabase } = require('./cloud_db_seed');

seedDatabase();

/* Migration Scripts */
// const {
// } = require("./migrationScripts/modifyChallengePlayersData");
const migrationScripts = {};

module.exports = {
  /* Authenticaition */
  signUpUser: userController.signUpUser,

  /* Marvel AI */
  chat: marvelAIController.chat,
  createChatSession: marvelAIController.createChatSession,

  /* Notifications */
  getNotifications: notificationController.getNotifications,
  setReadStatus: notificationController.setNotificationStats,
  onNewNotification: notificationController.onNewNotification,
  onRemovedNotification: notificationController.onRemovedNotification,
  onNewTool: notificationController.onNewTool,
  onUpdatedTool: notificationController.onUpdatedTool,
  onNewAssistant: notificationController.onNewAssistant,
  onUpdatedAssistant: notificationController.onUpdatedAssistant,

  /* Migration Scripts - For running  */
  ...migrationScripts,
};
