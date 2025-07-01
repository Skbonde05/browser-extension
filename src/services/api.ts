const BACKEND_URL = process.env.BACKEND_URL;

export interface SignupData {
  username: string;
  password: string;
  email?: string;
  displayName?: string;
}

export interface LoginData {
  username: string;
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

export const cancelFriendRequest = async (userId: string, token: string) => {
  // Find the pending request ID first (you may want to optimize this)
  // For now, assume you have the requestId, or fetch it if needed
  // Example:
  // const req = await fetchPendingRequestId(userId, token);
  // await fetch(`${BACKEND_URL}/api/friends/request/${req.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
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