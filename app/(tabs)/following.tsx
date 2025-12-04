import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api, User } from '@/services/api';

export default function FollowingScreen() {
  const [following, setFollowing] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get current user ID (you may need to adjust this based on your auth implementation)
      // For now, we'll assume we can get it from the API
      const currentUser = await api.getCurrentUser().catch(() => null);
      if (currentUser) {
        setCurrentUserId(currentUser.id);
        const followingList = await api.getFollowing(currentUser.id);
        
        // Get followers to determine who follows back
        const followers = await api.getFollowers(currentUser.id);
        const followersIds = new Set(followers.results?.map(u => u.id) || []);
        
        // Mark who follows back
        const followingWithStatus = (followingList.results || []).map(user => ({
          ...user,
          follows_me: followersIds.has(user.id),
        }));
        
        // Sort: users who follow back first, then others
        const sorted = followingWithStatus.sort((a, b) => {
          if (a.follows_me && !b.follows_me) return -1;
          if (!a.follows_me && b.follows_me) return 1;
          return 0;
        });
        
        setFollowing(sorted);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load following list. Please try again.');
      console.error('Error loading following:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleUnfollow = async (userId: number) => {
    try {
      await api.unfollowUser(userId);
      setFollowing(following.filter(user => user.id !== userId));
      Alert.alert('Success', 'Unfollowed user');
    } catch (error) {
      Alert.alert('Error', 'Failed to unfollow user. Please try again.');
      console.error('Error unfollowing:', error);
    }
  };

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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Following</Text>
        <Text style={styles.headerSubtitle}>
          {following.length} {following.length === 1 ? 'person' : 'people'}
        </Text>
      </View>

      {following.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>You're not following anyone yet</Text>
          <Text style={styles.emptySubtext}>
            Follow people to see their posts in your feed!
          </Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {/* Users who follow back */}
          {following.filter(u => u.follows_me).length > 0 && (
            <>
              {following
                .filter(user => user.follows_me)
                .map((user) => (
                  <FollowingItem
                    key={user.id}
                    user={user}
                    onUnfollow={handleUnfollow}
                  />
                ))}
              
              {/* Separator */}
              {following.filter(u => !u.follows_me).length > 0 && (
                <View style={styles.separator}>
                  <Text style={styles.separatorText}>
                    Not Following Back
                  </Text>
                </View>
              )}
            </>
          )}
          
          {/* Users who don't follow back */}
          {following
            .filter(user => !user.follows_me)
            .map((user) => (
              <FollowingItem
                key={user.id}
                user={user}
                onUnfollow={handleUnfollow}
              />
            ))}
        </View>
      )}
    </ScrollView>
  );
}

interface FollowingItemProps {
  user: User;
  onUnfollow: (userId: number) => void;
}

function FollowingItem({ user, onUnfollow }: FollowingItemProps) {
  const [showUnfollow, setShowUnfollow] = useState(false);

  return (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => setShowUnfollow(!showUnfollow)}
    >
      <View style={styles.userInfo}>
        {user.profile_picture ? (
          <Image
            source={{ uri: user.profile_picture }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {(user.display_name || user.username)[0].toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.userDetails}>
          <Text style={styles.username}>
            {user.display_name || user.username}
          </Text>
          <Text style={styles.userHandle}>@{user.username}</Text>
          {user.follows_me && (
            <View style={styles.followsBackBadge}>
              <Text style={styles.followsBackText}>Follows you</Text>
            </View>
          )}
        </View>
      </View>
      
      {showUnfollow ? (
        <TouchableOpacity
          style={styles.unfollowButton}
          onPress={() => onUnfollow(user.id)}
        >
          <Text style={styles.unfollowButtonText}>Unfollow</Text>
        </TouchableOpacity>
      ) : (
        <Ionicons name="chevron-forward" size={20} color="#999" />
      )}
    </TouchableOpacity>
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
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  listContainer: {
    backgroundColor: '#fff',
  },
  separator: {
    padding: 15,
    paddingHorizontal: 20,
    backgroundColor: '#f5f5f5',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  separatorText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#0066CC',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  userHandle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  followsBackBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e8f4f8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  followsBackText: {
    fontSize: 12,
    color: '#0066CC',
    fontWeight: '600',
  },
  unfollowButton: {
    backgroundColor: '#ff3040',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  unfollowButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});


