import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api, User, Post } from '@/services/api';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAllPosts, setShowAllPosts] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const currentUser = await api.getCurrentUser();
      setUser(currentUser);
      
      // Get user's posts
      const userPosts = await api.getMyPosts();
      setPosts(userPosts.results || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile. Please try again.');
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const displayedPosts = showAllPosts ? posts : posts.slice(0, 3);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        {user?.profile_picture ? (
          <Image
            source={{ uri: user.profile_picture }}
            style={styles.profilePicture}
          />
        ) : (
          <View style={styles.profilePicturePlaceholder}>
            <Text style={styles.profilePictureText}>
              {(user?.display_name || user?.username || 'U')[0].toUpperCase()}
            </Text>
          </View>
        )}
        
        <Text style={styles.displayName}>
          {user?.display_name || user?.username || 'User'}
        </Text>
        <Text style={styles.username}>@{user?.username || 'username'}</Text>
      </View>

      {/* Gallery Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Posts</Text>
        
        {posts.length === 0 ? (
          <View style={styles.emptyGallery}>
            <Ionicons name="images-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No posts yet</Text>
            <Text style={styles.emptySubtext}>
              Take your first photo to get started!
            </Text>
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={() => router.push('/(tabs)/camera')}
            >
              <Text style={styles.cameraButtonText}>Take Photo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.galleryGrid}>
              {displayedPosts.map((post) => {
                const imageUrl = post.image.startsWith('http')
                  ? post.image
                  : `http://YOUR_EC2_IP:8000${post.image}`; // Update with your EC2 IP
                
                return (
                  <TouchableOpacity key={post.id} style={styles.galleryItem}>
                    <Image source={{ uri: imageUrl }} style={styles.galleryImage} />
                  </TouchableOpacity>
                );
              })}
            </View>

            {posts.length > 3 && !showAllPosts && (
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => setShowAllPosts(true)}
              >
                <Text style={styles.viewAllButtonText}>View All ({posts.length})</Text>
              </TouchableOpacity>
            )}

            {showAllPosts && posts.length > 3 && (
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => setShowAllPosts(false)}
              >
                <Text style={styles.viewAllButtonText}>Show Less</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        
        <TouchableOpacity style={styles.settingsItem}>
          <Ionicons name="person-outline" size={24} color="#333" />
          <Text style={styles.settingsItemText}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingsItem}>
          <Ionicons name="notifications-outline" size={24} color="#333" />
          <Text style={styles.settingsItemText}>Notifications</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingsItem}>
          <Ionicons name="lock-closed-outline" size={24} color="#333" />
          <Text style={styles.settingsItemText}>Privacy</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingsItem}>
          <Ionicons name="help-circle-outline" size={24} color="#333" />
          <Text style={styles.settingsItemText}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingsItem}>
          <Ionicons name="information-circle-outline" size={24} color="#333" />
          <Text style={styles.settingsItemText}>About</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.settingsItem, styles.logoutItem]}>
          <Ionicons name="log-out-outline" size={24} color="#ff3040" />
          <Text style={[styles.settingsItemText, styles.logoutText]}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  profileHeader: {
    alignItems: 'center',
    padding: 30,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#0066CC',
  },
  profilePicturePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#0066CC',
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#0066CC',
  },
  profilePictureText: {
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  username: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  emptyGallery: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 15,
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  cameraButton: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cameraButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  galleryItem: {
    width: '31%',
    aspectRatio: 1,
    margin: 5,
    borderRadius: 8,
    overflow: 'hidden',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0e0e0',
  },
  viewAllButton: {
    marginTop: 15,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
  },
  viewAllButtonText: {
    color: '#0066CC',
    fontSize: 16,
    fontWeight: '600',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingsItemText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  logoutItem: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    borderBottomWidth: 0,
  },
  logoutText: {
    color: '#ff3040',
  },
});


