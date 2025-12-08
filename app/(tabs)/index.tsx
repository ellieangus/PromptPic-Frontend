import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Image, Alert, TextInput, Modal } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { PromptPicLogo } from '../../components/PromptPicLogo';
import { localStorage, LocalPost, Comment } from '../../services/localStorage';
import { userStorage } from '../../services/userStorage';

interface Prompt {
  id: string;
  prompt_text: string;
  date: string;
}

interface Post {
  id: string;
  caption: string;
  like_count: number;
}

export default function HomeScreen() {
  const router = useRouter();
  const [todayPrompt, setTodayPrompt] = useState<Prompt | null>(null);
  const [yesterdayPrompt, setYesterdayPrompt] = useState<Prompt | null>(null);
  const [yesterdayWinner, setYesterdayWinner] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<LocalPost[]>([]);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<LocalPost | null>(null);
  const [commentText, setCommentText] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Mock data for now
    setTimeout(() => {
      setTodayPrompt({
        id: '1',
        prompt_text: 'Show us your workspace!',
        date: new Date().toISOString()
      });
      setYesterdayPrompt({
        id: '2', 
        prompt_text: 'Your favorite coffee spot',
        date: new Date(Date.now() - 86400000).toISOString()
      });
      setYesterdayWinner({
        id: '1',
        caption: 'Perfect morning brew!',
        like_count: 23
      });
      
      // Load posts
      localStorage.addMockPosts();
      
      // Ensure user is synced with localStorage for proper post attribution
      const currentUser = userStorage.getCurrentUser();
      if (currentUser) {
        localStorage.setCurrentUser(currentUser.username, currentUser.displayName);
      }
      setCurrentUser(currentUser);
      
      setPosts(localStorage.getPosts());
      
      setLoading(false);
    }, 1000);
  }, []);

  // Refresh posts when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Don't add mock posts again, just refresh the list
      setPosts(localStorage.getPosts());
    }, [])
  );

  const handleCameraPress = () => {
    router.push('/(tabs)/camera');
  };

  const handleLike = (postId: string) => {
    const success = localStorage.toggleLike(postId);
    if (success) {
      // Refresh posts to show updated like count
      const updatedPosts = localStorage.getPosts();
      setPosts(updatedPosts);
    } else {
      Alert.alert('Cannot Like', 'You cannot like your own posts!');
    }
  };

  const handleComment = (post: LocalPost) => {
    setSelectedPost(post);
    setCommentModalVisible(true);
  };

  const submitComment = () => {
    if (!selectedPost || !commentText.trim()) return;
    
    const success = localStorage.addComment(selectedPost.id, commentText);
    if (success) {
      // Refresh posts to show new comment
      const updatedPosts = localStorage.getPosts();
      setPosts(updatedPosts);
      setCommentText('');
      setCommentModalVisible(false);
      Alert.alert('Success', 'Comment added!');
    } else {
      Alert.alert('Error', 'Failed to add comment');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3A7AFE" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header with clean background */}
      <View style={styles.headerGradient}>
        <PromptPicLogo />
      </View>

      {/* Today's Prompt */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Prompt</Text>
        <View style={styles.greenAccentLine} />
        <View style={styles.promptCard}>
          <View style={styles.promptContent}>
            <Text style={styles.promptText}>
              {todayPrompt?.prompt_text || 'Loading...'}
            </Text>
            <Text style={styles.promptDate}>
              {todayPrompt?.date ? new Date(todayPrompt.date).toLocaleDateString() : ''}
            </Text>
          </View>
        </View>

        {/* Camera Button */}
        <TouchableOpacity 
          onPress={handleCameraPress}
          activeOpacity={0.9}
          style={styles.cameraButton}
        >
          <Text style={styles.cameraButtonText}>📷 Take Photo</Text>
          <View style={styles.greenAccentDot} />
        </TouchableOpacity>
      </View>

      {yesterdayPrompt && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Yesterday's Prompt</Text>
          <View style={styles.greenAccentLine} />
          <View style={[styles.promptCard, styles.yesterdayCard]}>
            <View style={styles.promptContent}>
              <Text style={styles.promptText}>{yesterdayPrompt.prompt_text}</Text>
              <Text style={styles.promptDate}>
                {new Date(yesterdayPrompt.date).toLocaleDateString()}
              </Text>
            </View>
          </View>

          {yesterdayWinner ? (
            <View style={styles.winnerCard}>
              <View style={styles.winnerContent}>
                <Text style={styles.winnerTitle}>🏆 Winner</Text>
                <View style={styles.blueAccentLine} />
                <Text style={styles.winnerCaption}>
                  {yesterdayWinner.caption || 'No caption'}
                </Text>
                <Text style={styles.winnerLikes}>
                  {yesterdayWinner.like_count || 0} likes
                </Text>
              </View>
            </View>
          ) : (
            <View style={[styles.winnerCard, styles.noWinnerCard]}>
              <View style={styles.winnerContent}>
                <Text style={styles.winnerTitle}>No winner yet</Text>
                <View style={styles.blueAccentLine} />
                <Text style={styles.winnerCaption}>
                  Check back later for the winner!
                </Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Posts Feed */}
      {posts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Posts</Text>
          <View style={styles.greenAccentLine} />
          {posts.map((post) => (
            <View key={post.id} style={styles.postCard}>
              <View style={styles.postHeader}>
                <View style={styles.authorInfo}>
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                      {post.author.displayName[0].toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.authorName}>{post.author.displayName}</Text>
                    <Text style={styles.postTime}>
                      {new Date(post.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </View>
              
              <Image source={{ uri: post.photo }} style={styles.postImage} />
              
              {post.caption && (
                <View style={styles.postContent}>
                  <Text style={styles.postCaption}>{post.caption}</Text>
                </View>
              )}
              
              <View style={styles.postFooter}>
                <View style={styles.postActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleLike(post.id)}
                    disabled={post.author.username === currentUser?.username}
                  >
                    <Ionicons 
                      name={localStorage.hasLikedPost(post.id) ? "heart" : "heart-outline"} 
                      size={24} 
                      color={localStorage.hasLikedPost(post.id) ? "#E11D48" : "#6B7280"} 
                    />
                    <Text style={styles.actionText}>{post.likes}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleComment(post)}
                  >
                    <Ionicons name="chatbubble-outline" size={24} color="#6B7280" />
                    <Text style={styles.actionText}>{post.comments.length}</Text>
                  </TouchableOpacity>
                </View>
                
                {post.comments.length > 0 && (
                  <View style={styles.commentsSection}>
                    <Text style={styles.commentsHeader}>Comments:</Text>
                    {post.comments.slice(-2).map((comment) => (
                      <View key={comment.id} style={styles.comment}>
                        <Text style={styles.commentAuthor}>{comment.author.displayName}</Text>
                        <Text style={styles.commentText}>{comment.text}</Text>
                      </View>
                    ))}
                    {post.comments.length > 2 && (
                      <TouchableOpacity onPress={() => handleComment(post)}>
                        <Text style={styles.viewAllComments}>View all {post.comments.length} comments</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      )}
      
      {/* Comment Modal */}
      <Modal
        visible={commentModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCommentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.commentModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Comments</Text>
              <TouchableOpacity onPress={() => setCommentModalVisible(false)}>
                <Ionicons name="close" size={24} color="#1E3A8A" />
              </TouchableOpacity>
            </View>
            
            {selectedPost && (
              <>
                <ScrollView style={styles.commentsList}>
                  {selectedPost.comments.map((comment) => (
                    <View key={comment.id} style={styles.commentItem}>
                      <Text style={styles.commentAuthor}>{comment.author.displayName}</Text>
                      <Text style={styles.commentText}>{comment.text}</Text>
                      <Text style={styles.commentTime}>
                        {new Date(comment.createdAt).toLocaleString()}
                      </Text>
                    </View>
                  ))}
                  {selectedPost.comments.length === 0 && (
                    <Text style={styles.noComments}>No comments yet. Be the first to comment!</Text>
                  )}
                </ScrollView>
                
                <View style={styles.commentInput}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Add a comment..."
                    value={commentText}
                    onChangeText={setCommentText}
                    multiline
                  />
                  <TouchableOpacity
                    style={[styles.submitButton, !commentText.trim() && styles.submitButtonDisabled]}
                    onPress={submitComment}
                    disabled={!commentText.trim()}
                  >
                    <Ionicons name="send" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FB',
  },
  
  // Header with clean background
  headerGradient: {
    backgroundColor: '#FFFFFF',
    paddingTop: 28,
    paddingBottom: 20,
    marginHorizontal: -20,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E3A8A',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  promptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  greenAccentLine: {
    height: 3,
    width: '40%',
    backgroundColor: '#4BBF73',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 10,
  },
  promptContent: {
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  promptText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 24,
  },
  promptDate: {
    fontSize: 14,
    color: '#4A4A4A',
    textAlign: 'center',
    fontWeight: '400',
  },
  cameraButton: {
    backgroundColor: '#3A7AFE',
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    flexDirection: 'row',
  },
  cameraButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 6,
  },
  greenAccentDot: {
    width: 6,
    height: 6,
    backgroundColor: '#4BBF73',
    borderRadius: 3,
  },
  yesterdayCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4BBF73',
  },
  winnerCard: {
    backgroundColor: '#F9C80E',
    borderRadius: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  noWinnerCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  winnerContent: {
    paddingVertical: 20,
    paddingHorizontal: 22,
  },
  blueAccentLine: {
    height: 2,
    width: '30%',
    backgroundColor: '#3A7AFE',
    alignSelf: 'center',
    borderRadius: 1,
    marginVertical: 8,
  },
  winnerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E3A8A',
    textAlign: 'center',
    marginBottom: 8,
  },
  winnerCaption: {
    fontSize: 16,
    color: '#1F2937',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 22,
    fontWeight: '400',
  },
  winnerLikes: {
    fontSize: 14,
    color: '#4A4A4A',
    textAlign: 'center',
    marginTop: 6,
    fontWeight: '400',
  },
  
  // Posts Feed Styles
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  postHeader: {
    padding: 16,
    paddingBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3A7AFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  postTime: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  postImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  postContent: {
    padding: 16,
    paddingTop: 12,
  },
  postCaption: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 22,
  },
  postFooter: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  postLikes: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    padding: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
    fontWeight: '500',
  },
  commentsSection: {
    marginTop: 8,
  },
  commentsHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  comment: {
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  commentText: {
    fontSize: 13,
    color: '#1F2937',
    marginTop: 1,
  },
  viewAllComments: {
    fontSize: 13,
    color: '#3A7AFE',
    fontWeight: '500',
    marginTop: 4,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  commentModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  commentsList: {
    flex: 1,
    padding: 20,
  },
  commentItem: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  commentTime: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
  noComments: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 40,
  },
  commentInput: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 80,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#3A7AFE',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
});