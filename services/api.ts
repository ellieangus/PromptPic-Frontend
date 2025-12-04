// API service for connecting to PromptPic backend
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:8000/api'  // For local development
  : 'http://YOUR_EC2_IP:8000/api';  // Update with your EC2 IP

export interface DailyPrompt {
  id: number;
  prompt_text: string;
  date: string;
  created_at: string;
}

export interface Post {
  id: number;
  user: number;
  user_username?: string;
  image: string;
  caption?: string;
  prompt?: number;
  prompt_text?: string;
  created_at: string;
  updated_at: string;
  like_count?: number;
  is_liked?: boolean;
}

export interface User {
  id: number;
  username: string;
  email?: string;
  display_name?: string;
  profile_picture?: string;
  follows_me?: boolean; // Whether this user follows me back
}

class ApiService {
  private baseUrl: string;
  private sessionId: string | null = null;
  private currentUserId: number | null = null;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }
  
  // Alternative: Set current user ID manually after authentication
  setCurrentUserId(userId: number): void {
    this.currentUserId = userId;
  }
  
  getCurrentUserId(): number | null {
    return this.currentUserId;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add session cookie if available
    if (this.sessionId) {
      headers['Cookie'] = `sessionid=${this.sessionId}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Important for session cookies
    });

    // Extract session cookie from response
    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      const match = setCookie.match(/sessionid=([^;]+)/);
      if (match) {
        this.sessionId = match[1];
      }
    }

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Prompts
  async getTodayPrompt(): Promise<DailyPrompt> {
    return this.request<DailyPrompt>('/prompts/today/');
  }

  async getRecentPrompts(): Promise<{ results: DailyPrompt[] }> {
    return this.request<{ results: DailyPrompt[] }>('/prompts/recent/');
  }

  async getPrompt(id: number): Promise<DailyPrompt> {
    return this.request<DailyPrompt>(`/prompts/${id}/`);
  }

  // Posts
  async getFeed(): Promise<{ results: Post[] }> {
    return this.request<{ results: Post[] }>('/feed/');
  }

  async getMyPosts(): Promise<{ results: Post[] }> {
    return this.request<{ results: Post[] }>('/posts/me/');
  }

  async getDiscoverPosts(): Promise<{ results: Post[] }> {
    return this.request<{ results: Post[] }>('/posts/discover/');
  }

  async createPost(imageUri: string, caption: string, promptId?: number): Promise<Post> {
    const formData = new FormData();
    
    // For React Native, FormData accepts file objects directly
    const filename = imageUri.split('/').pop() || 'photo.jpg';
    const fileType = 'image/jpeg';
    
    // React Native FormData expects an object with uri, type, and name
    formData.append('image', {
      uri: imageUri,
      type: fileType,
      name: filename,
    } as any);
    
    formData.append('caption', caption);
    if (promptId) {
      formData.append('prompt', promptId.toString());
    }

    const url = `${this.baseUrl}/posts/`;
    const headers: HeadersInit = {};
    
    // Don't set Content-Type - let fetch set it with boundary for multipart/form-data
    if (this.sessionId) {
      headers['Cookie'] = `sessionid=${this.sessionId}`;
    }

    const uploadResponse = await fetch(url, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: formData,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Failed to create post: ${uploadResponse.statusText} - ${errorText}`);
    }

    return uploadResponse.json();
  }

  async likePost(postId: number): Promise<void> {
    return this.request(`/posts/${postId}/like/`, { method: 'POST' });
  }

  async unlikePost(postId: number): Promise<void> {
    return this.request(`/posts/${postId}/like/`, { method: 'DELETE' });
  }

  async getPostLikes(postId: number): Promise<{ results: User[] }> {
    return this.request<{ results: User[] }>(`/posts/${postId}/likes/`);
  }

  // Users
  async getUsers(): Promise<{ results: User[] }> {
    return this.request<{ results: User[] }>('/users/');
  }

  async getUser(userId: number): Promise<User> {
    return this.request<User>(`/users/${userId}/`);
  }

  async getCurrentUser(): Promise<User> {
    // Note: You may need to adjust this endpoint based on your backend
    // Some backends use /users/me/, /api/user/, or require passing user ID
    // For now, we'll try /users/me/ first, but you may need to store user ID after login
    try {
      return await this.request<User>('/users/me/');
    } catch {
      // Fallback - you may need to implement authentication first
      throw new Error('User not authenticated. Please implement login.');
    }
  }

  async getFollowing(userId: number): Promise<{ results: User[] }> {
    return this.request<{ results: User[] }>(`/users/${userId}/following/`);
  }

  async getFollowers(userId: number): Promise<{ results: User[] }> {
    return this.request<{ results: User[] }>(`/users/${userId}/followers/`);
  }

  async getUserPosts(userId: number): Promise<{ results: Post[] }> {
    return this.request<{ results: Post[] }>(`/users/${userId}/posts/`);
  }

  async followUser(userId: number): Promise<void> {
    return this.request(`/users/${userId}/follow/`, { method: 'POST' });
  }

  async unfollowUser(userId: number): Promise<void> {
    return this.request(`/users/${userId}/follow/`, { method: 'DELETE' });
  }

  async getDiscoverUsers(): Promise<{ results: User[] }> {
    return this.request<{ results: User[] }>('/users/discover/');
  }
}

export const api = new ApiService();

