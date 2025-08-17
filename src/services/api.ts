const BACKEND_URL = process.env.BACKEND_URL;

export interface SignupData {
  username: string;
  password: string;
  email?: string;
  displayName?: string;
}

export interface LoginData {
  identifier: string;
  password: string;
}

export const signup = async (data: SignupData) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/users/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    return await response.json();
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};

export const login = async (data: LoginData) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    return await response.json();
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const fetchFriends = async (token: string) => {
  const response = await fetch(`${process.env.BACKEND_URL}/api/friends`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return await response.json();
};

export const searchUsers = async (query: string, token: string) => {
  const res = await fetch(`${BACKEND_URL}/api/users/search?username=${encodeURIComponent(query)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return await res.json();
};

export const getFriendshipStatus = async (userId: string, token: string) => {
  const res = await fetch(`${BACKEND_URL}/api/friends/status?userId=${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return await res.json();
};

export const sendFriendRequest = async (receiverId: string, token: string) => {
  const res = await fetch(`${BACKEND_URL}/api/friends/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ receiverId })
  });
  return await res.json();
};

export const cancelFriendRequest = async (requestId: string, token: string) => {
  const res = await fetch(`${BACKEND_URL}/api/friends/request/${requestId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  return await res.json();
};

export const fetchPendingReceivedRequests = async (token: string) => {
  const res = await fetch(`${BACKEND_URL}/api/friends/requests/pending`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return await res.json();
};

export const fetchPendingSentRequests = async (token: string) => {
  const res = await fetch(`${BACKEND_URL}/api/friends/requests/sent`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return await res.json();
};

export const fetchIgnoredRequests = async (token: string) => {
  const res = await fetch(`${BACKEND_URL}/api/friends/requests/ignored`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return await res.json();
};

export const acceptFriendRequest = async (requestId: string, token: string) => {
  const res = await fetch(`${BACKEND_URL}/api/friends/accept/${requestId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` }
  });
  return await res.json();
};

export const ignoreFriendRequest = async (requestId: string, token: string) => {
  const res = await fetch(`${BACKEND_URL}/api/friends/ignore/${requestId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` }
  });
  return await res.json();
};

export const fetchFriendsWithStatus = async (token: string) => {
  const response = await fetch(`${BACKEND_URL}/api/friends/firends-with-status`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await response.json();
};

export const fetchUserProfile = async (username: string, token: string) => {
  const res = await fetch(`${BACKEND_URL}/api/profile/${encodeURIComponent(username)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return await res.json();
};

export const fetchWeeklyTabUsage = async (token: string) => {
  const res = await fetch(`${BACKEND_URL}/api/analytics/tab-usage/weekly`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return await res.json();
};

export const updatePrivacySettings = async (data: any, token: string) => {
  const res = await fetch(`${BACKEND_URL}/api/profile/privacy`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return await res.json();
};

export const flushAnalytics = async (token: string) => {
  const res = await fetch(`${BACKEND_URL}/api/analytics/flush`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
  return await res.json();
};

export async function fetchHourlyPresence(token: string, days = 7) {
  const res = await fetch(`${BACKEND_URL}/api/analytics/presence/hourly?days=${days}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export async function fetchLeaderboard(token: string, page = 1, limit = 10, month?: string) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(month && { month })
  });
  
  const res = await fetch(`${BACKEND_URL}/api/leaderboard/top?${params}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export async function fetchUserRank(token: string, month?: string) {
  const params = new URLSearchParams();
  if (month) params.append('month', month);
  
  const res = await fetch(`${BACKEND_URL}/api/leaderboard/rank?${params}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export const fetchUserPosition = async (token: string, userId: string) => {
  const res = await fetch(`${BACKEND_URL}/api/leaderboard/user-position?userId=${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return await res.json();
};

// Conversation APIs
export const getUserConversations = async (token: string) => {
  const response = await fetch(`${BACKEND_URL}/api/conversation`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return await response.json();
};

export const getConversationMessages = async (conversationId: string, token: string, limit = 50, cursor?: string) => {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.append('cursor', cursor);
  
  const response = await fetch(`${BACKEND_URL}/api/conversation/${conversationId}/messages?${params}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return await response.json();
};

export const sendMessage = async (data: { conversationId?: string, receiverId?: string, content: string }, token: string) => {
  const response = await fetch(`${BACKEND_URL}/api/conversation/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  return await response.json();
};
