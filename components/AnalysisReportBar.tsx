import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface AnalysisReportBarProps {
  score: number;
}

const AnalysisReportBar: React.FC<AnalysisReportBarProps> = ({ score }) => {
  const color = score >= 70 ? '#FF4757' : score >= 40 ? '#FFA502' : '#2ED573';
  
  return (
    <View style={styles.container}>
      <View style={styles.barHeader}>
        <Text style={styles.label}>PROBABILITY OF FAKE NEWS</Text>
        <Text style={[styles.percentage, { color }]}>{score}%</Text>
      </View>
      
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${score}%`, backgroundColor: color }]} />
      </View>
      
      <View style={styles.scale}>
        <Text style={styles.scaleText}>AUTHENTIC</Text>
        <Text style={styles.scaleText}>SUSPICIOUS</Text>
        <Text style={styles.scaleText}>UNRELIABLE</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 15,
  },
  barHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  label: {
    fontSize: 10,
    fontWeight: '900',
    color: '#A4B0BE',
    letterSpacing: 1,
  },
  percentage: {
    fontSize: 28,
    fontWeight: '900',
  },
  barTrack: {
    height: 16,
    backgroundColor: '#F1F2F6',
    borderRadius: 8,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 8,
  },
  scale: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  scaleText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#CED6E0',
  }
});

export default AnalysisReportBar;
