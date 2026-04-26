import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface RiskBadgeProps {
  score: number;
}

const COLORS = {
  high: '#FF4757',
  medium: '#FFA502',
  low: '#2ED573',
};

const RiskBadge: React.FC<RiskBadgeProps> = ({ score }) => {
  let color = COLORS.low;
  let icon = 'check-circle-outline';
  let label = 'TRUSTED NEWS';

  if (score >= 70) {
    color = COLORS.high;
    icon = 'alert-decogram-outline';
    label = 'LIKELY FAKE';
  } else if (score >= 40) {
    color = COLORS.medium;
    icon = 'help-circle-outline';
    label = 'UNVERIFIED';
  }

  return (
    <View style={[styles.badge, { backgroundColor: color + '15', borderColor: color }]}>
      <MaterialCommunityIcons name={icon} size={20} color={color} />
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    alignSelf: 'center',
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

export default RiskBadge;
