import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, StatusBar } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import GridBackground from './components/GridBackground';

const SplashScreen = ({ onFinish }: { onFinishBase?: () => void, [key: string]: any }) => {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <GridBackground />
      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
        ]}
      >
        <View style={styles.logoCircle}>
          <MaterialCommunityIcons name="shield-check" size={80} color="#4285F4" />
        </View>
        <Text style={styles.title}>Fake News Detector</Text>
        <Text style={styles.subtitle}>Evolving AI Truth Engine</Text>
        
        <View style={styles.loaderContainer}>
           <Text style={styles.loadingText}>Initializing Model...</Text>
           {/* Simple pulsing bar would go here */}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#4285F4',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#2F3542',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: '#4285F4',
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 4,
  },
  loaderContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#A4B0BE',
    letterSpacing: 1,
  }
});

export default SplashScreen;
