import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface AnimatedProgressBarProps {
  score: number;
}

const AnimatedProgressBar: React.FC<AnimatedProgressBarProps> = ({ score }) => {
  const animWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animWidth, {
      toValue: score,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [score]);

  const width = animWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const color = score >= 70 ? '#FF4757' : score >= 40 ? '#FFA502' : '#7B61FF';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Analysis Probability</Text>
        <Text style={[styles.value, { color }]}>{score}%</Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width, backgroundColor: color }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#57606F',
  },
  value: {
    fontSize: 18,
    fontWeight: '900',
  },
  track: {
    height: 10,
    backgroundColor: '#F1F2F6',
    borderRadius: 5,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 5,
  },
});

export default AnimatedProgressBar;
