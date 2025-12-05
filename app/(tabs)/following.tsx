import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api, User } from '@/services/api';

interface FollowingUser extends User {
  follows_me?: boolean;
}

export default function FollowingScreen() {
  const [following, setFollowing] = useState<FollowingUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Mock data since backend isn't connected
      const mockFollowing: FollowingUser[] = [
        { id: 1, username: 'alex_photo', first_name: 'Alex', last_name: 'Johnson', email: 'alex@example.com', follows_me: true },
        { id: 2, username: 'sarah_snaps', first_name: 'Sarah', last_name: 'Chen', email: 'sarah@example.com', follows_me: true },
        { id: 3, username: 'mike_captures', first_name: 'Mike', last_name: 'Davis', email: 'mike@example.com', follows_me: false },
      ];

      setFollowing(mockFollowing);
    } catch (error) {
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = (userId: number) => {
    Alert.alert(
      'Unfollow User',
      'Are you sure you want to unfollow this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unfollow',
          style: 'destructive',
          onPress: () => {
            setFollowing(following.filter(user => user.id !== userId));
          },
        },
      ]
    );
  };

  const renderUser = ({ item }: { item: FollowingUser }) => (
    <View style={styles.userItem}>
      <View style={styles.userInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(item.first_name || item.username)[0].toUpperCase()}
          </Text>
        </View>
        <View style={styles.userDetails}>
          <Text style={styles.username}>
            {item.first_name && item.last_name 
              ? `${item.first_name} ${item.last_name}` 
              : item.username
            }
          </Text>
          <Text style={styles.userHandle}>@{item.username}</Text>
          {item.follows_me && (
            <Text style={styles.followsYou}>Follows you</Text>
          )}
        </View>
      </View>
      
      <TouchableOpacity
        style={styles.unfollowButton}
        onPress={() => handleUnfollow(item.id)}
      >
        <Text style={styles.unfollowButtonText}>Unfollow</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3A7AFE" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with clean background */}
      <View style={styles.headerGradient}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Following</Text>
          <View style={styles.greenAccentLine} />
          <Text style={styles.headerSubtitle}>
            {following.length} {following.length === 1 ? 'person' : 'people'}
          </Text>
        </View>
      </View>

      <FlatList
        data={following}
        renderItem={renderUser}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>You're not following anyone yet</Text>
            <Text style={styles.emptySubtext}>
              Follow people to see their posts in your feed!
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
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
    paddingTop: 10,
    paddingBottom: 20,
    marginHorizontal: 0,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  greenAccentLine: {
    height: 3,
    width: '30%',
    backgroundColor: '#4BBF73',
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    paddingTop: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#3A7AFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  userHandle: {
    fontSize: 14,
    color: '#4A4A4A',
    marginBottom: 2,
  },
  followsYou: {
    fontSize: 12,
    color: '#4BBF73',
    fontWeight: '600',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  unfollowButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  unfollowButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A4A4A',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
});


