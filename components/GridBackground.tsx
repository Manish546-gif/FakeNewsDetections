import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const GridBackground: React.FC = () => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={styles.grid}>
        {Array.from({ length: 20 }).map((_, i) => (
          <View key={`v-${i}`} style={[styles.vLine, { left: (width / 10) * i }]} />
        ))}
        {Array.from({ length: 40 }).map((_, i) => (
          <View key={`h-${i}`} style={[styles.hLine, { top: (height / 20) * i }]} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.03,
  },
  vLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#000',
  },
  hLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#000',
  },
});

export default GridBackground;
