import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { PromptPicLogo } from '../../components/PromptPicLogo';

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
      setLoading(false);
    }, 1000);
  }, []);

  const handleCameraPress = () => {
    router.push('/(tabs)/camera');
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
});