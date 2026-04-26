import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface RiskCapacitorProps {
  score: number;
}

const RiskCapacitor: React.FC<RiskCapacitorProps> = ({ score }) => {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: score,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  }, [score]);

  const segments = Array.from({ length: 10 });
  const color = score >= 70 ? '#FF4757' : score >= 40 ? '#FFA502' : '#2ED573';

  return (
    <View style={styles.container}>
      <Text style={styles.header}>ANALYSIS PROBABILITY (%)</Text>
      
      <View style={styles.capacitorBody}>
        <View style={styles.terminalTop} />
        
        <View style={styles.chamber}>
          {segments.map((_, i) => {
            const segmentThreshold = (9 - i) * 10;
            const isActive = score > segmentThreshold;
            
            return (
              <View 
                key={i} 
                style={[
                  styles.segment, 
                  isActive && { backgroundColor: color, shadowColor: color, elevation: 5 }
                ]} 
              />
            );
          })}
          
          <LinearGradient
            colors={['transparent', color + '20', 'transparent']}
            style={StyleSheet.absoluteFill}
          />
        </View>

        <View style={styles.terminalBottom} />
      </View>

      <Text style={[styles.voltage, { color }]}>{score}%</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  header: {
    fontSize: 10,
    fontWeight: '900',
    color: '#A4B0BE',
    letterSpacing: 2,
    marginBottom: 8,
  },
  capacitorBody: {
    width: 60,
    alignItems: 'center',
  },
  terminalTop: {
    width: 20,
    height: 12,
    backgroundColor: '#2F3542',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  chamber: {
    width: 50,
    height: 160,
    backgroundColor: '#1E272E',
    borderRadius: 8,
    padding: 6,
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#2F3542',
  },
  segment: {
    height: 10,
    backgroundColor: '#2F3542',
    borderRadius: 2,
  },
  terminalBottom: {
    width: 20,
    height: 12,
    backgroundColor: '#2F3542',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  voltage: {
    fontSize: 24,
    fontWeight: '900',
    marginTop: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});

export default RiskCapacitor;
