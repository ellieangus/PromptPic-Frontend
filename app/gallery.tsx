import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { localStorage, LocalPost } from '../services/localStorage';

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 40) / 3 - 8; // 3 columns with padding and margins

export default function GalleryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [posts, setPosts] = useState<LocalPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<LocalPost | null>(null);

  useEffect(() => {
    loadUserPosts();
  }, []);

  const loadUserPosts = () => {
    try {
      const userPosts = localStorage.getUserPosts();
      setPosts(userPosts);
    } catch (error) {
      console.error('Error loading user posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostPress = (post: LocalPost) => {
    setSelectedPost(post);
  };

  const handleCloseModal = () => {
    setSelectedPost(null);
  };

  const handleDeletePost = (post: LocalPost) => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const success = localStorage.deletePost(post.id);
            if (success) {
              // Refresh the posts list
              loadUserPosts();
              // Close modal
              setSelectedPost(null);
              Alert.alert('Success', 'Post deleted successfully!');
            } else {
              Alert.alert('Error', 'Failed to delete post. Please try again.');
            }
          },
        },
      ]
    );
  };

  const renderPost = ({ item }: { item: LocalPost }) => (
    <TouchableOpacity
      style={styles.galleryItem}
      onPress={() => handlePostPress(item)}
    >
      <Image source={{ uri: item.photo }} style={styles.galleryImage} />
      {item.caption && (
        <View style={styles.captionOverlay}>
          <Ionicons name="chatbubble" size={12} color="#FFFFFF" />
        </View>
      )}
    </TouchableOpacity>
  );

  const renderPostModal = () => {
    if (!selectedPost) return null;

    return (
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalBackground} onPress={handleCloseModal} />
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleCloseModal}>
              <Ionicons name="close" size={24} color="#1E3A8A" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => handleDeletePost(selectedPost)}
            >
              <Ionicons name="trash" size={20} color="#E11D48" />
            </TouchableOpacity>
          </View>
          
          <Image source={{ uri: selectedPost.photo }} style={styles.modalImage} />
          
          <View style={styles.modalInfo}>
            <Text style={styles.modalDate}>
              {new Date(selectedPost.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
            
            {selectedPost.caption && (
              <Text style={styles.modalCaption}>{selectedPost.caption}</Text>
            )}
            
            <View style={styles.modalStats}>
              <View style={styles.statItem}>
                <Ionicons name="heart" size={16} color="#E11D48" />
                <Text style={styles.statText}>{selectedPost.likes} likes</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="chatbubble" size={16} color="#6B7280" />
                <Text style={styles.statText}>{selectedPost.comments?.length || 0} comments</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3A7AFE" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1E3A8A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Photos</Text>
        <View style={styles.placeholder} />
      </View>

      {posts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="images-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No Photos Yet</Text>
          <Text style={styles.emptySubtitle}>
            Start taking photos to build your gallery!
          </Text>
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={() => router.push('/(tabs)/camera')}
          >
            <Ionicons name="camera" size={20} color="#FFFFFF" />
            <Text style={styles.cameraButtonText}>Take Photo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.galleryInfo}>
            <Text style={styles.photoCount}>
              {posts.length} {posts.length === 1 ? 'Photo' : 'Photos'}
            </Text>
          </View>
          
          <FlatList
            data={posts}
            renderItem={renderPost}
            keyExtractor={(item) => item.id}
            numColumns={3}
            contentContainerStyle={styles.gallery}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      {renderPostModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  galleryInfo: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  photoCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  gallery: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  galleryItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E7EB',
  },
  captionOverlay: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E3A8A',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3A7AFE',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  cameraButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  
  // Modal Styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  deleteButton: {
    padding: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
  },
  modalImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#E5E7EB',
  },
  modalInfo: {
    padding: 16,
  },
  modalDate: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  modalCaption: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 22,
    marginBottom: 12,
  },
  modalStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
});