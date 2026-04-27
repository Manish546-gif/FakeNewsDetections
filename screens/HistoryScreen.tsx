import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getHistory, HistoryItem, clearHistory } from '../utils/history';
import GridBackground from '../components/GridBackground';
import { useTheme } from '../context/ThemeContext';
import { Alert } from 'react-native';

const HistoryScreen = ({ navigation }: any) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const isFocused = useIsFocused();
  const { colors, isDark } = useTheme();

  useEffect(() => {
    if (isFocused) {
      loadHistory();
    }
  }, [isFocused]);

  const loadHistory = async () => {
    const data = await getHistory();
    setHistory(data.reverse()); // Newest first
  };

  const handleClear = () => {
    Alert.alert(
      "Clear History",
      "Are you sure you want to delete all scan logs?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete All", 
          style: "destructive",
          onPress: async () => {
            await clearHistory();
            loadHistory();
          }
        }
      ]
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />
      <GridBackground color={isDark ? '#33415520' : '#4285F410'} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Security Logs</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Chronological Threat History</Text>
          </View>
          {history.length > 0 && (
            <TouchableOpacity style={[styles.clearBtn, { backgroundColor: isDark ? '#FF475720' : '#FF475710' }]} onPress={handleClear}>
              <MaterialCommunityIcons name="delete-sweep" size={24} color="#FF4757" />
            </TouchableOpacity>
          )}
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
              style={[styles.historyItem, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => navigation.navigate('Result', { result: item.result, message: item.message })}
            >
              <View style={[styles.statusDot, { backgroundColor: item.result.riskScore > 60 ? colors.riskHigh : colors.riskLow }]} />
              <View style={styles.historyTextContent}>
                <Text style={[styles.historyMsg, { color: colors.text }]} numberOfLines={1}>{item.message}</Text>
                <Text style={[styles.historyDate, { color: colors.textSecondary }]}>{new Date(item.timestamp).toLocaleString()}</Text>
              </View>
              <View style={[styles.scoreBadge, { backgroundColor: isDark ? '#334155' : '#F1F2F6' }]}>
                 <Text style={[styles.scoreText, { color: colors.text }]}>{item.result.riskScore}%</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { padding: 20, paddingTop: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 28, fontWeight: '900' },
  subtitle: { fontSize: 13, fontWeight: '700' },
  clearBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
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
