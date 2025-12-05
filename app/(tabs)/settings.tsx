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
        <ActivityIndicator size="large" color="#3A7AFE" />
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
      {/* Header with clean background */}
      <View style={styles.headerGradient}>
        <View style={styles.profileHeader}>
          <Text style={styles.pageTitle}>Profile</Text>
          <View style={styles.greenAccentLine} />
          
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
        <View style={styles.settingsCard}>
        
        <TouchableOpacity style={styles.settingsItem}>
          <Ionicons name="person-outline" size={24} color="#3A7AFE" />
          <Text style={styles.settingsItemText}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={20} color="#4A4A4A" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingsItem}>
          <Ionicons name="notifications-outline" size={24} color="#3A7AFE" />
          <Text style={styles.settingsItemText}>Notifications</Text>
          <Ionicons name="chevron-forward" size={20} color="#4A4A4A" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingsItem}>
          <Ionicons name="lock-closed-outline" size={24} color="#3A7AFE" />
          <Text style={styles.settingsItemText}>Privacy</Text>
          <Ionicons name="chevron-forward" size={20} color="#4A4A4A" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingsItem}>
          <Ionicons name="help-circle-outline" size={24} color="#3A7AFE" />
          <Text style={styles.settingsItemText}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={20} color="#4A4A4A" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingsItem}>
          <Ionicons name="information-circle-outline" size={24} color="#3A7AFE" />
          <Text style={styles.settingsItemText}>About</Text>
          <Ionicons name="chevron-forward" size={20} color="#4A4A4A" />
        </TouchableOpacity>
        
        </View>

        <View style={styles.logoutCard}>
          <TouchableOpacity style={[styles.settingsItem, styles.logoutItem]}>
            <Ionicons name="log-out-outline" size={24} color="#EF4444" />
            <Text style={[styles.settingsItemText, styles.logoutText]}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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
  headerGradient: {
    backgroundColor: '#1E3A8A',
    paddingBottom: 20,
  },
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  greenAccentLine: {
    height: 3,
    width: '30%',
    backgroundColor: '#4BBF73',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#3A7AFE',
  },
  profilePicturePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#3A7AFE',
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#E5E7EB',
  },
  profilePictureText: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '700',
  },
  displayName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 15,
    textAlign: 'center',
  },
  username: {
    fontSize: 16,
    color: '#E5E7EB',
    fontWeight: '500',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E3A8A',
    marginBottom: 16,
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  logoutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyGallery: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 15,
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#4A4A4A',
    textAlign: 'center',
    marginBottom: 20,
  },
  cameraButton: {
    backgroundColor: '#3A7AFE',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  cameraButtonText: {
    color: '#FFFFFF',
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
    borderRadius: 12,
    overflow: 'hidden',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E7EB',
  },
  viewAllButton: {
    marginTop: 15,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#E0ECFF',
    borderRadius: 12,
  },
  viewAllButtonText: {
    color: '#3A7AFE',
    fontSize: 16,
    fontWeight: '600',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingsItemText: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 15,
    fontWeight: '500',
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: '#EF4444',
    fontWeight: '600',
  },
});


