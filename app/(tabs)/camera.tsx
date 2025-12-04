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
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { api } from '@/services/api';

export default function CameraScreen() {
  const router = useRouter();
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const [todayPrompt, setTodayPrompt] = useState<any>(null);

  useEffect(() => {
    loadTodayPrompt();
  }, []);

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
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to use the camera</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current) return;

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
      
      await api.createPost(
        photo,
        caption,
        todayPrompt?.id
      );

      Alert.alert('Success', 'Photo uploaded successfully!', [
        {
          text: 'OK',
          onPress: () => {
            setPhoto(null);
            setCaption('');
            router.push('/(tabs)/voting');
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to upload photo. Please try again.');
      console.error('Error uploading photo:', error);
    } finally {
      setUploading(false);
    }
  };

  if (photo) {
    return (
      <View style={styles.container}>
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
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
      >
        <View style={styles.overlay}>
          {todayPrompt && (
            <View style={styles.promptOverlay}>
              <Text style={styles.promptText}>{todayPrompt.prompt_text}</Text>
            </View>
          )}

          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.flipButton}
              onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
            >
              <Text style={styles.flipButtonText}>🔄</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>

            <View style={styles.placeholder} />
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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
});
