import React, { useContext } from 'react';
import ApiContext from '../context/ApiContext';
import UserAvatar from './UserAvatar';

const ProfilePage = () => {
  const { user } = useContext(ApiContext);

  return (
    <div className="container mx-auto p-4">
      <UserAvatar user={user} />
      {/* Other profile components will automatically update */}
    </div>
  );
};

export default ProfilePage;