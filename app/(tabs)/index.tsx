import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { PromptPicLogo } from '@/components/PromptPicLogo';
import { api, DailyPrompt, Post } from '@/services/api';

export default function HomeScreen() {
  const router = useRouter();
  const [todayPrompt, setTodayPrompt] = useState<DailyPrompt | null>(null);
  const [yesterdayPrompt, setYesterdayPrompt] = useState<DailyPrompt | null>(null);
  const [yesterdayWinner, setYesterdayWinner] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get today's prompt
      const today = await api.getTodayPrompt();
      setTodayPrompt(today);

      // Get recent prompts to find yesterday's
      const recent = await api.getRecentPrompts();
      if (recent.results && recent.results.length > 1) {
        // Get yesterday's prompt (second most recent)
        const yesterday = recent.results[1];
        setYesterdayPrompt(yesterday);

        // Get posts for yesterday's prompt to find winner
        // For now, we'll get the feed and find the most liked post
        // This is a placeholder - you'll need to implement a proper winner endpoint
        try {
          const feed = await api.getFeed();
          if (feed.results && feed.results.length > 0) {
            // Find post with most likes (simplified - assumes backend provides like_count)
            const winner = feed.results.reduce((prev, current) => {
              return (current.like_count || 0) > (prev.like_count || 0) ? current : prev;
            });
            if (winner && winner.prompt === yesterday.id) {
              setYesterdayWinner(winner);
            }
          }
        } catch (error) {
          console.log('Could not load winner:', error);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load prompts. Please try again.');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCameraPress = () => {
    router.push('/(tabs)/camera');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Logo */}
      <PromptPicLogo />

      {/* Today's Prompt */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Prompt</Text>
        <View style={styles.promptCard}>
          <Text style={styles.promptText}>
            {todayPrompt?.prompt_text || 'Loading...'}
          </Text>
          <Text style={styles.promptDate}>
            {todayPrompt?.date ? new Date(todayPrompt.date).toLocaleDateString() : ''}
          </Text>
        </View>

        {/* Camera Button */}
        <TouchableOpacity style={styles.cameraButton} onPress={handleCameraPress}>
          <Text style={styles.cameraButtonText}>📷 Take Photo</Text>
        </TouchableOpacity>
      </View>

      {/* Yesterday's Prompt & Winner */}
      {yesterdayPrompt && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Yesterday's Prompt</Text>
          <View style={styles.promptCard}>
            <Text style={styles.promptText}>{yesterdayPrompt.prompt_text}</Text>
            <Text style={styles.promptDate}>
              {new Date(yesterdayPrompt.date).toLocaleDateString()}
            </Text>
          </View>

          {yesterdayWinner ? (
            <View style={styles.winnerCard}>
              <Text style={styles.winnerTitle}>🏆 Winner</Text>
              <Text style={styles.winnerCaption}>
                {yesterdayWinner.caption || 'No caption'}
              </Text>
              <Text style={styles.winnerLikes}>
                {yesterdayWinner.like_count || 0} likes
              </Text>
            </View>
          ) : (
            <View style={styles.winnerCard}>
              <Text style={styles.winnerTitle}>No winner yet</Text>
              <Text style={styles.winnerCaption}>
                Check back later for the winner!
              </Text>
            </View>
          )}
        </View>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  promptCard: {
    backgroundColor: '#f0f8ff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#0066CC',
    marginBottom: 15,
  },
  promptText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
  promptDate: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  cameraButton: {
    backgroundColor: '#0066CC',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  cameraButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  winnerCard: {
    backgroundColor: '#fff8dc',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFD700',
    marginTop: 10,
  },
  winnerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  winnerCaption: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  winnerLikes: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
});

