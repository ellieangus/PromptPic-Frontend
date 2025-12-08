import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  TextInput,
  Dimensions,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '@/services/api';
import { localStorage } from '@/services/localStorage';

const { width, height } = Dimensions.get('window');

export default function CameraScreen() {
  const router = useRouter();
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const [todayPrompt, setTodayPrompt] = useState<any>(null);
  const [hasPostedToday, setHasPostedToday] = useState(false);
  const [todaysPost, setTodaysPost] = useState<any>(null);

  useEffect(() => {
    loadTodayPrompt();
    checkDailyPostStatus();
  }, []);

  // Refresh daily post status when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      checkDailyPostStatus();
    }, [])
  );

  const checkDailyPostStatus = () => {
    const hasPosted = localStorage.hasPostedToday();
    const todayPost = localStorage.getTodaysPost();
    setHasPostedToday(hasPosted);
    setTodaysPost(todayPost);
  };

  const loadTodayPrompt = async () => {
    try {
      const prompt = await api.getTodayPrompt();
      setTodayPrompt(prompt);
    } catch (error) {
      console.error('Error loading prompt:', error);
    }
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <View style={styles.permissionContent}>
          <Ionicons name="camera-outline" size={80} color="#0066CC" />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionMessage}>PromptPic needs camera access to let you capture photos for daily prompts.</Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Allow Camera Access</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current) return;
    
    // Check if user already posted today
    if (hasPostedToday) {
      Alert.alert(
        'Daily Limit Reached', 
        'You\'ve already posted today! You can only post once per day.',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Delete Current Post',
            style: 'destructive',
            onPress: () => handleDeleteTodaysPost()
          }
        ]
      );
      return;
    }

    try {
      const photoResult = await cameraRef.current.takePictureAsync();
      if (photoResult?.uri) {
        setPhoto(photoResult.uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take picture. Please try again.');
      console.error('Error taking picture:', error);
    }
  };

  const handleRetake = () => {
    setPhoto(null);
    setCaption('');
  };

  const handleUpload = async () => {
    if (!photo) return;

    try {
      setUploading(true);
      
      // TODO: Replace this mock with real API call when backend is connected
      // await api.createPost(photo, caption, todayPrompt?.id);
      
      // Save to local storage for now
      const newPost = localStorage.addPost(photo, caption, todayPrompt?.id);
      
      // Mock network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert('Success', 'Photo uploaded successfully!', [
        {
          text: 'OK',
          onPress: () => {
            setPhoto(null);
            setCaption('');
            router.push('/(tabs)');
          },
        },
      ]);
    } catch (error) {
      if (error instanceof Error && error.message.includes('only post once per day')) {
        Alert.alert('Daily Limit Reached', error.message, [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Delete Current Post',
            style: 'destructive',
            onPress: () => handleDeleteTodaysPost()
          }
        ]);
      } else {
        Alert.alert('Error', 'Failed to upload photo. Please try again.');
      }
      console.error('Error uploading photo:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteTodaysPost = () => {
    if (todaysPost) {
      const success = localStorage.deletePost(todaysPost.id);
      if (success) {
        Alert.alert('Success', 'Post deleted successfully! You can now take a new photo.', [
          {
            text: 'OK',
            onPress: () => {
              checkDailyPostStatus();
              setPhoto(null);
              setCaption('');
            }
          }
        ]);
      } else {
        Alert.alert('Error', 'Failed to delete post. Please try again.');
      }
    }
  };

  if (photo) {
    return (
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.previewContainer}>
            <Image source={{ uri: photo }} style={styles.preview} />
            
            <View style={styles.uploadSection}>
              {todayPrompt && (
                <Text style={styles.promptHint}>
                  Prompt: {todayPrompt.prompt_text}
                </Text>
              )}
              
              <TextInput
                style={styles.captionInput}
                placeholder="Add a caption (optional)"
                value={caption}
                onChangeText={setCaption}
                multiline
                numberOfLines={3}
                returnKeyType="done"
                blurOnSubmit={true}
              />

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.retakeButton]}
                  onPress={handleRetake}
                  disabled={uploading}
                >
                  <Text style={styles.buttonText}>Retake</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.uploadButton]}
                  onPress={handleUpload}
                  disabled={uploading}
                >
                  {uploading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Upload</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Full-screen camera background */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
      />
      
      {/* Top Header Overlay */}
      <View style={styles.headerOverlay}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Today's Prompt</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Prompt Display Overlay */}
      {todayPrompt && (
        <View style={styles.promptOverlay}>
          <Text style={styles.promptText}>"{todayPrompt.prompt_text}"</Text>
          {hasPostedToday && (
            <Text style={styles.limitReachedText}>✓ Posted today - Tap capture to view options</Text>
          )}
        </View>
      )}

      {/* Bottom Controls Overlay */}
      <View style={styles.bottomControlsOverlay}>
        <TouchableOpacity
          style={styles.flipButton}
          onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
        >
          <Ionicons name="camera-reverse-outline" size={28} color="white" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.captureButton,
            hasPostedToday && styles.captureButtonDisabled
          ]} 
          onPress={takePicture}
        >
          <View style={[
            styles.captureButtonInner,
            hasPostedToday && styles.captureButtonInnerDisabled
          ]}>
            {hasPostedToday && (
              <Ionicons name="checkmark" size={24} color="#4BBF73" />
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.galleryButton} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Permission Screen
  permissionContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  permissionContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 12,
  },
  permissionMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  permissionButton: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Camera Interface
  camera: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  
  // Header Overlay
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    backgroundColor: '#FFFFFF',
    paddingBottom: 15,
    zIndex: 10,
  },
  
  // Prompt Overlay
  promptOverlay: {
    position: 'absolute',
    top: 110,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    zIndex: 10,
  },
  
  // Bottom Controls Overlay
  bottomControlsOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 50,
    paddingHorizontal: 40,
    zIndex: 10,
  },
  
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#1E3A8A',
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  promptText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 24,
  },

  flipButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#0066CC',
  },
  galleryButton: {
    width: 50,
    height: 50,
  },

  // Photo Preview (existing styles)
  previewContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  previewImage: {
    flex: 1,
    width: '100%',
  },
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 40,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  previewTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 8,
  },
  captionContainer: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    margin: 20,
    borderRadius: 12,
    padding: 16,
  },
  captionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  captionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
    paddingBottom: 20,
  },
  retakeButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retakeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  uploadButton: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: '#fff',
    fontSize: 16,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  promptOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 15,
    margin: 20,
    borderRadius: 10,
    marginTop: 60,
  },
  promptText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '600',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 40,
  },
  flipButton: {
    padding: 15,
  },
  flipButtonText: {
    fontSize: 30,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  placeholder: {
    width: 80,
  },
  previewContainer: {
    flex: 1,
  },
  preview: {
    flex: 1,
    width: '100%',
  },
  uploadSection: {
    backgroundColor: '#fff',
    padding: 20,
    paddingBottom: 40,
  },
  promptHint: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  captionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  retakeButton: {
    backgroundColor: '#999',
  },
  uploadButton: {
    backgroundColor: '#0066CC',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  limitReachedText: {
    color: '#4BBF73',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '600',
  },
  captureButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  captureButtonInnerDisabled: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderColor: '#4BBF73',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
