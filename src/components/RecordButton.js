import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Colors } from '../constants/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const RecordButton = ({ onPress, onLongPress, disabled }) => (
  <TouchableOpacity
    style={styles.button}
    onPress={onPress}
    onLongPress={onLongPress}
    disabled={disabled}
    activeOpacity={0.7}
  >
    <View style={styles.inner}>
      <Icon name="microphone" size={48} color={Colors.cardBackground} />
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 999,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  inner: {
    backgroundColor: Colors.accent,
    borderRadius: 999,
    padding: 12,
  },
});

export default RecordButton;
