import React, { useEffect, useState } from 'react';
import { fetchUserProfile, sendFriendRequest, cancelFriendRequest, acceptFriendRequest, ignoreFriendRequest, getFriendshipStatus, fetchUserPosition, startConversation } from '../../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FiGithub, FiTwitter, FiLinkedin, FiGlobe, FiCalendar, FiClock, FiUsers, FiMail, FiChevronLeft, FiMessageCircle } from 'react-icons/fi';
import { FaTelegram, FaSnapchat, FaDiscord, FaInstagram, FaTrophy } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

interface SocialMediaLinks {
  twitter?: string | null;
  linkedin?: string | null;
  instagram?: string | null;
  github?: string | null;
  website?: string | null;
  telegram?: string | null;
  snapchat?: string | null;
  discord?: string | null;
}

interface UserProfile {
  id: string;
  username: string;
  displayName?: string;
  bio?: string;
  email?: string;
  dateOfBirth?: string;
  location?: string;
  occupation?: string;
  interests?: string;
  totalOnlineSeconds: number;
  lastOnlineAt?: string;
  createdAt: string;
  isOnline?: boolean;
  socialMedia?: SocialMediaLinks;
}

interface UserProfileProps {
  username: string;
  friendStatus?: { status: string; requestId?: string };
  userId?: string;
  onBack: () => void;
  onStatusChange?: (statusObj: { status: string; requestId?: string }) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({
  username,
  friendStatus,
  userId: propUserId,
  onBack,
  onStatusChange,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userRank, setUserRank] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusObj, setStatusObj] = useState(friendStatus);
  const [userId, setUserId] = useState(propUserId);
  const [startingConversation, setStartingConversation] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    
    const loadProfileData = async () => {
      try {
        const profileRes = await fetchUserProfile(username, user.token);
        if (profileRes.success) {
          setProfile(profileRes.data);
          const profileUserId = propUserId || profileRes.data?.id;
          if (profileUserId) {
            setUserId(profileUserId);
            // Fetch user's leaderboard rank
            try {
              const rankRes = await fetchUserPosition(user.token, profileUserId);
              if (rankRes.success) {
                setUserRank(rankRes.data);
              }
            } catch (error) {
              console.error('Error fetching user rank:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [username, user, propUserId]);

  useEffect(() => {
    if (!user || !userId || friendStatus) return;
    
    const fetchStatus = async () => {
      try {
        const statusRes = await getFriendshipStatus(userId, user.token);
        if (statusRes.success) {
          const newStatus = { 
            status: statusRes.status, 
            requestId: statusRes.requestId 
          };
          setStatusObj(newStatus);
        }
      } catch (error) {
        console.error("Error fetching friendship status:", error);
      }
    };
    
    fetchStatus();
  }, [user, userId, friendStatus]);

  useEffect(() => {
    if (friendStatus) {
      setStatusObj(friendStatus);
    }
  }, [friendStatus]);

  const handleAdd = async () => {
    if (!userId || !user) return;
    await sendFriendRequest(userId, user.token);
    const statusRes = await getFriendshipStatus(userId, user.token);
    const newStatus = { status: statusRes.status, requestId: statusRes.requestId };
    setStatusObj(newStatus);
    onStatusChange && onStatusChange(newStatus);
  };

  const handleCancel = async () => {
    if (!statusObj?.requestId || !user) return;
    await cancelFriendRequest(statusObj.requestId, user.token);
    setStatusObj({ status: 'none' });
    onStatusChange && onStatusChange({ status: 'none' });
  };

  const handleAccept = async () => {
    if (!statusObj?.requestId || !user) return;
    await acceptFriendRequest(statusObj.requestId, user.token);
    setStatusObj({ status: 'friends' });
    onStatusChange && onStatusChange({ status: 'friends' });
  };

  const handleIgnore = async () => {
    if (!statusObj?.requestId || !user) return;
    await ignoreFriendRequest(statusObj.requestId, user.token);
    setStatusObj({ status: 'none' });
    onStatusChange && onStatusChange({ status: 'none' });
  };

  const handleStartConversation = async () => {
    if (!userId || !user || startingConversation) return;
    
    setStartingConversation(true);
    try {
      const response = await startConversation(userId, user.token);
      
      if (response.success) {
        if (response.exists && response.conversationId) {
          navigate('/inbox', { 
            state: { 
              selectedConversationId: response.conversationId 
            }
          });
        } else {
          navigate('/inbox', { 
            state: { 
              newConversation: {
                receiverId: userId,
                receiverName: profile?.displayName || profile?.username,
                receiverUsername: profile?.username
              }
            }
          });
        }
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
    } finally {
      setStartingConversation(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = seconds / 3600;
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    return `${hours.toFixed(1)}h`;
  };

  const getSocialIcon = (platform: string) => {
    const iconProps = { size: 24, className: "text-gray-600 hover:text-blue-600 transition-colors" };
    switch (platform) {
      case 'github': return <FiGithub {...iconProps} />;
      case 'twitter': return <FiTwitter {...iconProps} />;
      case 'linkedin': return <FiLinkedin {...iconProps} />;
      case 'instagram': return <FaInstagram {...iconProps} />;
      case 'website': return <FiGlobe {...iconProps} />;
      case 'telegram': return <FaTelegram {...iconProps} />;
      case 'snapchat': return <FaSnapchat {...iconProps} />;
      case 'discord': return <FaDiscord {...iconProps} />;
      default: return <FiGlobe {...iconProps} />;
    }
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
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
      >
        <FiChevronLeft size={16} className="mr-1" />
        Back
      </button>

      {/* Profile Header */}
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="flex items-start space-x-3">
          <div className="relative">
            <div className="bg-blue-600 rounded-full h-14 w-14 flex items-center justify-center text-lg font-bold text-white">
              {profile.displayName?.[0]?.toUpperCase() || profile.username[0]?.toUpperCase()}
            </div>
            {profile.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>
          
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900">
              {profile.displayName || profile.username}
            </h2>
            <p className="text-gray-600 text-sm">@{profile.username}</p>
            
            {profile.bio && (
              <p className="text-gray-700 text-sm mt-2 leading-relaxed">
                {profile.bio}
              </p>
            )}

            <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <FiCalendar size={11} />
                <span>Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
              </div>
              {profile.isOnline !== undefined && (
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${profile.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span>{profile.isOnline ? 'Online' : 'Offline'}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Friend Action Buttons */}
        <div className="mt-3 flex space-x-2">
          <button
            onClick={handleStartConversation}
            disabled={startingConversation}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center space-x-1 disabled:opacity-50"
          >
            {startingConversation ? (
              <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white"></div>
            ) : (
              <FiMessageCircle size={14} />
            )}
            <span>{startingConversation ? 'Opening...' : 'Message'}</span>
          </button>

          {statusObj?.status === 'friends' && (
            <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium flex items-center space-x-1">
              <FiUsers size={14} />
              <span>Friends</span>
            </span>
          )}
          {statusObj?.status === 'pending_sent' && (
            <>
              <span className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium">
                Request Sent
              </span>
              <button
                className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </>
          )}
          {statusObj?.status === 'pending_received' && (
            <>
              <button
                className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                onClick={handleAccept}
              >
                Accept
              </button>
              <button
                className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
                onClick={handleIgnore}
              >
                Decline
              </button>
            </>
          )}
          {statusObj?.status === 'none' && (
            <button
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center space-x-1"
              onClick={handleAdd}
            >
              <FiUsers size={14} />
              <span>Add Friend</span>
            </button>
          )}
          {statusObj?.status === 'ignored' && (
            <span className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-lg text-sm font-medium">
              Request Ignored
            </span>
          )}
        </div>

        {/* Social Media Links */}
        {profile.socialMedia && Object.values(profile.socialMedia).some(link => link && typeof link === 'string' && link.trim() !== '') && (
          <div className="mt-2 flex flex-wrap gap-1">
            {Object.entries(profile.socialMedia).map(([platform, link]) => {
              if (!link || typeof link !== 'string' || link.trim() === '') return null;
              
              return (
                <a
                  key={platform}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors group"
                  title={`${platform}: ${link}`}
                >
                  {getSocialIcon(platform)}
                </a>
              );
            })}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-blue-600">
            {formatDuration(profile.totalOnlineSeconds)}
          </div>
          <div className="text-xs text-gray-600">Total Online</div>
        </div>
        
        {userRank && userRank.user && (
          <div className="bg-yellow-50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center space-x-1">
              <FaTrophy className="text-yellow-600" size={16} />
              <span className="text-lg font-bold text-yellow-600">#{userRank.rank}</span>
            </div>
            <div className="text-xs text-gray-600">This Month</div>
          </div>
        )}
      </div>

      {userRank && userRank.user && (
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-600 mb-1">Monthly Progress</div>
          <div className="text-sm font-semibold text-gray-900">
            {formatDuration(userRank.user.monthlySeconds)} this month
          </div>
        </div>
      )}

      {/* Personal Info */}
      <div className="space-y-2">
        {profile.email && (
          <div className="flex items-center space-x-3 text-sm">
            <FiMail className="text-gray-500" size={16} />
            <span className="text-gray-700">{profile.email}</span>
          </div>
        )}
        
        {profile.dateOfBirth && (
          <div className="flex items-center space-x-3 text-sm">
            <FiCalendar className="text-gray-500" size={16} />
            <span className="text-gray-700">
              Born {new Date(profile.dateOfBirth).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </span>
          </div>
        )}

        {profile.lastOnlineAt && (
          <div className="flex items-center space-x-3 text-sm">
            <FiClock className="text-gray-500" size={16} />
            <span className="text-gray-700">
              Last seen {new Date(profile.lastOnlineAt).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;