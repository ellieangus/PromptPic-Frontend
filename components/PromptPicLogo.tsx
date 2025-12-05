import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const PromptPicLogo: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.promptText}>PROMPT</Text>
      <View style={styles.greenLine} />
      <View style={styles.cameraContainer}>
        <View style={styles.cameraBody}>
          <View style={styles.viewfinder} />
          <View style={styles.lens}>
            <Text style={styles.star}>★</Text>
          </View>
        </View>
      </View>
      <Text style={styles.picText}>PIC</Text>
      <View style={styles.greenLine} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    width: '100%',
  },
  promptText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1E3A8A',
    letterSpacing: 1.2,
  },
  picText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1E3A8A',
    letterSpacing: 1.2,
  },
  greenLine: {
    width: '60%',
    height: 2.5,
    backgroundColor: '#4BBF73',
    marginVertical: 4,
    borderRadius: 1.25,
  },
  cameraContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 3,
  },
  cameraBody: {
    width: 70,
    height: 52,
    borderWidth: 2.5,
    borderColor: '#888888',
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  viewfinder: {
    position: 'absolute',
    top: -7,
    left: 13,
    width: 17,
    height: 13,
    borderWidth: 2,
    borderColor: '#888888',
    borderRadius: 3,
  },
  lens: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2.5,
    borderColor: '#888888',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
  },
  star: {
    fontSize: 17,
    color: '#FFD700',
  },
});

