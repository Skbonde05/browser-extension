import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { searchUsers, getFriendshipStatus, sendFriendRequest, cancelFriendRequest } from '../../../../services/api';
import UserProfile from './UserProfile';

interface UserResult {
  id: string;
  username: string;
  displayName?: string;
}

const SearchFriends: React.FC = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserResult[]>([]);
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [selectedUsername, setSelectedUsername] = useState<string | null>(null);

  if (!user) {
    return <div className="text-center text-gray-400 py-4">Please log in to search for friends.</div>;
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await searchUsers(query, user.token);
      setResults(res.data || []);
      // Fetch friendship status for each result
      const statusMap: Record<string, string> = {};
      await Promise.all(
        (res.data || []).map(async (u: UserResult) => {
          const statusRes = await getFriendshipStatus(u.id, user.token);
          statusMap[u.id] = statusRes.status;
        })
      );
      setStatuses(statusMap);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (id: string) => {
    await sendFriendRequest(id, user.token);
    // Refresh status
    const statusRes = await getFriendshipStatus(id, user.token);
    setStatuses(s => ({ ...s, [id]: statusRes.status }));
  };

  const handleCancel = async (id: string) => {
    await cancelFriendRequest(id, user.token);
    setStatuses(s => ({ ...s, [id]: 'none' }));
  };

  if (selectedUsername) {
    const selectedUser = results.find(u => u.username === selectedUsername);
    const friendStatus = selectedUser ? statuses[selectedUser.id] : undefined;
    return (
      <UserProfile
        username={selectedUsername}
        friendStatus={friendStatus}
        userId={selectedUser?.id}
        onBack={() => setSelectedUsername(null)}
        onStatusChange={status => setStatuses(s => selectedUser?.id ? { ...s, [selectedUser.id]: status } : s)}
      />
    );
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="flex mb-4">
        <input
          type="text"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-l focus:outline-none"
          placeholder="Search by username or display name"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-r hover:bg-blue-700"
          disabled={loading}
        >
          Search
        </button>
      </form>
      <div className="overflow-y-auto">
        {loading && <div className="text-center text-gray-500 py-4">Searching...</div>}
        {!loading && results.length === 0 && <div className="text-center text-gray-400 py-4">No users found.</div>}
        {results.map(userRes => (
          <div
            key={userRes.id}
            className="flex items-center justify-between border-b py-2 cursor-pointer hover:bg-blue-50 transition rounded"
            onClick={() => setSelectedUsername(userRes.username)}
          >
            <div>
              <div className="font-medium text-blue-700">{userRes.displayName || userRes.username}</div>
              <div className="text-xs text-gray-500">@{userRes.username}</div>
            </div>
            <div>
              {statuses[userRes.id] === 'none' && (
                <button
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={e => { e.stopPropagation(); handleAdd(userRes.id); }}
                >
                  Add
                </button>
              )}
              {statuses[userRes.id] === 'pending_sent' && (
                <button
                  className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  onClick={e => { e.stopPropagation(); handleCancel(userRes.id); }}
                >
                  Cancel Request
                </button>
              )}
              {statuses[userRes.id] === 'pending_received' && (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded">Requested You</span>
              )}
              {statuses[userRes.id] === 'friends' && (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded">Friends</span>
              )}
              {statuses[userRes.id] === 'ignored' && (
                <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded">Ignored</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchFriends;