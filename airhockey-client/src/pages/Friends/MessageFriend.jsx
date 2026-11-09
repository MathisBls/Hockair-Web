import React from 'react';
import { useParams } from 'react-router-dom';

import Messenger from '../Discussion/Messenger';

const MessageFriend = () => {
  const { id } = useParams();

  return <Messenger selectedContactId={id ?? null} />;
};

export default MessageFriend;
