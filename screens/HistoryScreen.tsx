import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getHistory, HistoryItem } from '../utils/history';
import GridBackground from '../components/GridBackground';

const HistoryScreen = ({ navigation }: any) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      loadHistory();
    }
  }, [isFocused]);

  const loadHistory = async () => {
    const data = await getHistory();
    setHistory(data.reverse()); // Newest first
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F8FA" />
      <GridBackground />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>All Analyses</Text>
          <Text style={styles.subtitle}>Full history of scanned news patterns</Text>
        </View>

        {history.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={60} color="#CED6E0" />
            <Text style={styles.emptyText}>No history found</Text>
          </View>
        ) : (
          history.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.historyItem}
              onPress={() => navigation.navigate('Result', { result: item.result, message: item.message })}
            >
              <View style={[styles.statusDot, { backgroundColor: item.result.riskScore > 60 ? '#FF4757' : '#2ED573' }]} />
              <View style={styles.historyTextContent}>
                <Text style={styles.historyMsg} numberOfLines={1}>{item.message}</Text>
                <Text style={styles.historyDate}>{new Date(item.timestamp).toLocaleString()}</Text>
              </View>
              <View style={styles.scoreBadge}>
                 <Text style={styles.scoreText}>{item.result.riskScore}%</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#CED6E0" />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F7F8FA' },
  container: { padding: 20, paddingTop: 40 },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '900', color: '#2F3542' },
  subtitle: { fontSize: 14, color: '#747D8C', fontWeight: '600' },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 12, fontSize: 16, color: '#A4B0BE', fontWeight: '700' },
  historyItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8EDF3',
    elevation: 2,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  historyTextContent: { flex: 1 },
  historyMsg: { fontSize: 14, color: '#2F3542', fontWeight: '700' },
  historyDate: { fontSize: 10, color: '#A4B0BE', marginTop: 2, fontWeight: '800' },
  scoreBadge: {
    backgroundColor: '#F1F2F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  scoreText: { fontSize: 10, fontWeight: '900', color: '#2F3542' },
});

export default HistoryScreen;
