// API service for connecting to PromptPic backend
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:8000/api'  // For local development
  : 'http://YOUR_EC2_IP:8000/api';  // Update with your EC2 IP

export interface DailyPrompt {
  id: number;
  prompt_text: string;
  date: string;
  created_at: string;
  post_count: number;
}

export interface Post {
  id: number;
  user: User; // Full user object, not just ID
  image: string;
  caption?: string;
  prompt?: number;
  prompt_text?: string;
  created_at: string;
  updated_at: string;
  like_count: number;
  is_liked: boolean;
}

export interface User {
  id: number;
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  followers_count?: number;
  following_count?: number;
  posts_count?: number;
  is_following?: boolean;
  is_blocked?: boolean;
  has_blocked_me?: boolean;
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
    // Django UserViewSet doesn't have /me/ endpoint, so we need to store user ID after login
    if (!this.currentUserId) {
      throw new Error('User not authenticated. Please implement login and set user ID.');
    }
    return await this.request<User>(`/users/${this.currentUserId}/`);
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

  async blockUser(userId: number): Promise<void> {
    return this.request(`/users/${userId}/block/`, { method: 'POST' });
  }

  async unblockUser(userId: number): Promise<void> {
    return this.request(`/users/${userId}/block/`, { method: 'DELETE' });
  }

  async getBlockedUsers(): Promise<{ results: User[] }> {
    return this.request<{ results: User[] }>('/users/blocked-users/');
  }

  async getDiscoverUsers(): Promise<{ results: User[] }> {
    return this.request<{ results: User[] }>('/users/discover/');
  }

  // Authentication (you'll need to implement these endpoints in Django)
  async login(username: string, password: string): Promise<User> {
    const response = await this.request<User>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    // You might need to extract user ID from response and set it
    if (response.id) {
      this.setCurrentUserId(response.id);
    }
    return response;
  }

  async logout(): Promise<void> {
    await this.request('/auth/logout/', { method: 'POST' });
    this.currentUserId = null;
    this.sessionId = null;
  }

  async register(username: string, email: string, password: string): Promise<User> {
    const response = await this.request<User>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
    if (response.id) {
      this.setCurrentUserId(response.id);
    }
    return response;
  }
}

export const api = new ApiService();

