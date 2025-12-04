import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

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
    padding: 20,
    width: '100%',
  },
  promptText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0066CC',
    letterSpacing: 2,
  },
  picText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0066CC',
    letterSpacing: 2,
  },
  greenLine: {
    width: '80%',
    height: 3,
    backgroundColor: '#00AA00',
    marginVertical: 10,
  },
  cameraContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
  },
  cameraBody: {
    width: 80,
    height: 60,
    borderWidth: 3,
    borderColor: '#888888',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  viewfinder: {
    position: 'absolute',
    top: -8,
    left: 15,
    width: 20,
    height: 15,
    borderWidth: 2,
    borderColor: '#888888',
    borderRadius: 4,
  },
  lens: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#888888',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
  },
  star: {
    fontSize: 20,
    color: '#FFD700',
  },
});

