import React, { useEffect, useState } from 'react';
import { fetchUserProfile, sendFriendRequest, cancelFriendRequest } from '../../../../services/api';
import { useAuth } from '../../../context/AuthContext';

interface UserProfileProps {
  username: string;
  friendStatus?: string;
  userId?: string;
  onBack: () => void;
  onStatusChange?: (status: string) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({
  username,
  friendStatus,
  userId,
  onBack,
  onStatusChange,
}) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(friendStatus);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetchUserProfile(username, user.token)
      .then(res => setProfile(res.data))
      .finally(() => setLoading(false));
  }, [username, user]);

  useEffect(() => {
    setStatus(friendStatus);
  }, [friendStatus]);

  const handleAdd = async () => {
    if (!userId || !user) return;
    await sendFriendRequest(userId, user.token);
    setStatus('pending_sent');
    onStatusChange && onStatusChange('pending_sent');
  };

  const handleCancel = async () => {
    if (!userId || !user) return;
    await cancelFriendRequest(userId, user.token);
    setStatus('none');
    onStatusChange && onStatusChange('none');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <span className="text-gray-500">Loading profile...</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center text-red-500 py-8">Profile not found.</div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-6">
      <button
        onClick={onBack}
        className="mb-4 text-blue-600 hover:underline text-sm"
      >
        &larr; Back to Search
      </button>
      <div className="flex items-center space-x-4 mb-4">
        <div className="bg-blue-100 rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold text-blue-600">
          {profile.displayName?.[0]?.toUpperCase() || profile.username[0]?.toUpperCase()}
        </div>
        <div>
          <div className="text-xl font-semibold text-gray-800">{profile.displayName || profile.username}</div>
          <div className="text-gray-500 text-sm">@{profile.username}</div>
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div>
          <span className="font-medium text-gray-700">Joined:</span>{' '}
          <span className="text-gray-600">{new Date(profile.createdAt).toLocaleDateString()}</span>
        </div>
        {profile.lastOnlineAt && (
          <div>
            <span className="font-medium text-gray-700">Last Seen:</span>{' '}
            <span className="text-gray-600">{new Date(profile.lastOnlineAt).toLocaleString()}</span>
          </div>
        )}
        {profile.email && (
          <div>
            <span className="font-medium text-gray-700">Email:</span>{' '}
            <span className="text-gray-600">{profile.email}</span>
          </div>
        )}
        {profile.dateOfBirth && (
          <div>
            <span className="font-medium text-gray-700">Date of Birth:</span>{' '}
            <span className="text-gray-600">{new Date(profile.dateOfBirth).toLocaleDateString()}</span>
          </div>
        )}
      </div>
      {/* Friend status and action */}
      <div className="mt-4 flex items-center space-x-2">
        {status === 'friends' && (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded">Friends</span>
        )}
        {status === 'pending_sent' && (
          <>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded">Request Sent</span>
            <button
              className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              onClick={handleCancel}
            >
              Cancel Request
            </button>
          </>
        )}
        {status === 'pending_received' && (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded">Requested You</span>
        )}
        {status === 'none' && (
          <button
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={handleAdd}
          >
            Add Friend
          </button>
        )}
        {status === 'ignored' && (
          <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded">Ignored</span>
        )}
      </div>
    </div>
  );
};

export default UserProfile;