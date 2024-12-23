import { doc, setDoc } from 'firebase/firestore';

import { firestore } from '@/libs/redux/store';

const setReadStatus = (messages) => {
  try {
    messages.forEach((message) => {
      const newMessage = message;
      const setCol = doc(firestore, 'personal-notifications', message.id);
      setDoc(setCol, newMessage);
    });
  } catch (err) {
    console.error(err);
  }
};

export { setReadStatus };
