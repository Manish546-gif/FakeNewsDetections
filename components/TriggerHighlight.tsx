import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface TriggerHighlightProps {
  message: string;
  triggers: string[];
}

const TriggerHighlight: React.FC<TriggerHighlightProps> = ({ message, triggers }) => {
  if (triggers.length === 0) {
    return <Text style={styles.text}>{message}</Text>;
  }

  const escaped = triggers.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escaped.join('|')})`, 'gi');
  const parts = message.split(regex);

  return (
    <Text style={styles.text}>
      {parts.map((part, index) => {
        const isHighlighted = triggers.some(
          (t) => t.toLowerCase() === part.toLowerCase()
        );
        return isHighlighted ? (
          <Text key={index} style={styles.highlight}>
            {part}
          </Text>
        ) : (
          <Text key={index}>{part}</Text>
        );
      })}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 15,
    color: '#2F3542',
    lineHeight: 22,
    fontFamily: 'System',
    fontWeight: '400',
  },
  highlight: {
    backgroundColor: '#4285F420',
    color: '#4285F4',
    fontWeight: '800',
  },
});

export default TriggerHighlight;
