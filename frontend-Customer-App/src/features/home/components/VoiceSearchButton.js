import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { colors } from '../../../theme';

export default function VoiceSearchButton({ onVoiceSearch }) {
  const handleVoicePress = () => {
    Alert.alert(
      'Voice Search',
      'Voice search feature will be implemented with speech recognition API',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Try Demo',
          onPress: () => onVoiceSearch('Pizza near me'),
        },
      ]
    );
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handleVoicePress}
      activeOpacity={0.7}
    >
      <Text style={styles.icon}>🎤</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray[50],
    borderRadius: 20,
    marginLeft: 8,
  },
  icon: {
    fontSize: 20,
  },
});