// Simple local storage for posts until Django backend is connected
export interface Comment {
  id: string;
  text: string;
  author: {
    username: string;
    displayName: string;
  };
  createdAt: string;
}

export interface LocalPost {
  id: string;
  photo: string;
  caption: string;
  promptId?: number;
  createdAt: string;
  author: {
    username: string;
    displayName: string;
  };
  likes: number;
  likedBy: string[]; // Array of usernames who liked this post
  comments: Comment[];
}

class LocalStorageService {
  private posts: LocalPost[] = [];

  // Add a new post (only one per day per user)
  addPost(photo: string, caption: string, promptId?: number): LocalPost | null {
    // Check if user has already posted today
    if (this.hasPostedToday()) {
      throw new Error('You can only post once per day. Delete your existing post to create a new one.');
    }

    // Get current user info - will be set by userStorage when available
    const currentUser = this.getCurrentUserInfo();
    
    const newPost: LocalPost = {
      id: Date.now().toString(),
      photo,
      caption,
      promptId,
      createdAt: new Date().toISOString(),
      author: {
        username: currentUser.username,
        displayName: currentUser.displayName
      },
      likes: 0,
      likedBy: [],
      comments: []
    };

    this.posts.unshift(newPost); // Add to beginning of array
    return newPost;
  }

  // Get current user info for posts
  private getCurrentUserInfo(): { username: string; displayName: string } {
    // This will be updated when userStorage is available
    return {
      username: 'you',
      displayName: 'Your Name'
    };
  }

  // Set current user info (called by userStorage)
  setCurrentUser(username: string, displayName: string): void {
    this.getCurrentUserInfo = () => ({ username, displayName });
  }

  // Clear current user and all their posts (called on logout)
  clearCurrentUser(): void {
    const currentUser = this.getCurrentUserInfo();
    
    // Remove all posts from current user
    this.posts = this.posts.filter(post => post.author.username !== currentUser.username);
    
    // Reset to default user info
    this.getCurrentUserInfo = () => ({
      username: 'guest',
      displayName: 'Your Name'
    });
  }

  // Get all posts (newest first)
  getPosts(): LocalPost[] {
    return [...this.posts];
  }

  // Get posts for current user
  getUserPosts(): LocalPost[] {
    const currentUserInfo = this.getCurrentUserInfo();
    return this.posts.filter(post => post.author.username === currentUserInfo.username);
  }

  // Check if current user has posted today
  hasPostedToday(): boolean {
    const currentUser = this.getCurrentUserInfo();
    const today = new Date().toDateString();
    
    return this.posts.some(post => {
      const postDate = new Date(post.createdAt).toDateString();
      return post.author.username === currentUser.username && postDate === today;
    });
  }

  // Get today's post for current user
  getTodaysPost(): LocalPost | null {
    const currentUser = this.getCurrentUserInfo();
    const today = new Date().toDateString();
    
    return this.posts.find(post => {
      const postDate = new Date(post.createdAt).toDateString();
      return post.author.username === currentUser.username && postDate === today;
    }) || null;
  }

  // Delete a post by ID
  deletePost(postId: string): boolean {
    const initialLength = this.posts.length;
    this.posts = this.posts.filter(post => post.id !== postId);
    return this.posts.length < initialLength;
  }

  // Toggle like on a post
  toggleLike(postId: string): boolean {
    const currentUser = this.getCurrentUserInfo();
    const post = this.posts.find(p => p.id === postId);
    
    if (!post) return false;
    
    // Don't allow users to like their own posts
    if (post.author.username === currentUser.username) {
      return false;
    }
    
    const hasLiked = post.likedBy.includes(currentUser.username);
    
    if (hasLiked) {
      // Unlike the post
      post.likedBy = post.likedBy.filter(username => username !== currentUser.username);
      post.likes = Math.max(0, post.likes - 1);
    } else {
      // Like the post
      post.likedBy.push(currentUser.username);
      post.likes += 1;
    }
    
    return true;
  }

  // Add comment to a post
  addComment(postId: string, commentText: string): boolean {
    const currentUser = this.getCurrentUserInfo();
    const post = this.posts.find(p => p.id === postId);
    
    if (!post || !commentText.trim()) return false;
    
    const newComment: Comment = {
      id: Date.now().toString(),
      text: commentText.trim(),
      author: {
        username: currentUser.username,
        displayName: currentUser.displayName
      },
      createdAt: new Date().toISOString()
    };
    
    post.comments.push(newComment);
    return true;
  }

  // Check if current user has liked a post
  hasLikedPost(postId: string): boolean {
    const currentUser = this.getCurrentUserInfo();
    const post = this.posts.find(p => p.id === postId);
    return post ? post.likedBy.includes(currentUser.username) : false;
  }

  // Add some mock follower posts for demonstration
  addMockPosts(): void {
    const mockPosts: LocalPost[] = [
      {
        id: 'mock1',
        photo: 'https://picsum.photos/400/600?random=1',
        caption: 'Beautiful sunset today! 🌅',
        promptId: 1,
        createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        author: {
          username: 'friend1',
          displayName: 'Sarah Johnson'
        },
        likes: 12,
        likedBy: ['friend2', 'friend3', 'otheruser1'],
        comments: [
          {
            id: 'comment1',
            text: 'Absolutely gorgeous! 😍',
            author: {
              username: 'friend2',
              displayName: 'Mike Chen'
            },
            createdAt: new Date(Date.now() - 3000000).toISOString()
          },
          {
            id: 'comment2',
            text: 'Where was this taken?',
            author: {
              username: 'friend3',
              displayName: 'Emma Wilson'
            },
            createdAt: new Date(Date.now() - 2400000).toISOString()
          }
        ]
      },
      {
        id: 'mock2',
        photo: 'https://picsum.photos/400/600?random=2',
        caption: 'Coffee and creativity ☕',
        promptId: 1,
        createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        author: {
          username: 'friend2',
          displayName: 'Mike Chen'
        },
        likes: 8,
        likedBy: ['friend1', 'otheruser2'],
        comments: [
          {
            id: 'comment3',
            text: 'Perfect morning vibes!',
            author: {
              username: 'friend1',
              displayName: 'Sarah Johnson'
            },
            createdAt: new Date(Date.now() - 6600000).toISOString()
          }
        ]
      }
    ];

    // Only add mock posts if we don't have any posts yet
    if (this.posts.length === 0) {
      this.posts.push(...mockPosts);
    }
  }
}

export const localStorage = new LocalStorageService();