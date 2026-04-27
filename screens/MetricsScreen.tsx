import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getHistory } from '../utils/history';
import { useTheme } from '../context/ThemeContext';
import GridBackground from '../components/GridBackground';

const MetricsScreen = () => {
  const [stats, setStats] = useState({ total: 0, fake: 0, real: 0, avgRisk: 0 });

  const { colors, isDark } = useTheme();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const history = await getHistory();
    const fake = history.filter(h => h.result.riskScore > 60).length;
    const real = history.length - fake;
    const avg = history.reduce((acc, h) => acc + h.result.riskScore, 0) / (history.length || 1);
    setStats({ total: history.length, fake, real, avgRisk: Math.round(avg) });
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <GridBackground color={isDark ? '#33415520' : '#4285F410'} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>System Metrics</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>AI Performance & Analysis insights</Text>
        </View>

        <View style={styles.statsGrid}>
           <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={styles.statLabel}>TOTAL SCANS</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.total}</Text>
           </View>
           <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={styles.statLabel}>AVG PROBABILITY</Text>
              <Text style={[styles.statValue, {color: colors.primary}]}>{stats.avgRisk}%</Text>
           </View>
        </View>

        <View style={[styles.wideStat, { backgroundColor: colors.card, borderColor: colors.border }]}>
           <View style={[styles.chartBar, { backgroundColor: colors.accent }]}>
              <View style={[styles.progress, { width: `${(stats.fake / (stats.total || 1)) * 100}%`, backgroundColor: colors.riskHigh }]} />
           </View>
           <View style={styles.labelRow}>
              <Text style={styles.smallLabel}>FLAGGED FAKE ({stats.fake})</Text>
              <Text style={styles.smallLabel}>AUTHENTIC ({stats.real})</Text>
           </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: isDark ? '#FFA50210' : '#FFF9F0', borderColor: '#FFA50230' }]}>
           <MaterialCommunityIcons name="lightning-bolt" size={24} color="#FFA502" />
           <Text style={[styles.infoText, { color: isDark ? '#F59E0B' : '#FFA502' }]}>
             The engine has learned from {stats.total} unique data points in your local environment.
           </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { padding: 20, paddingTop: 40 },
  header: { marginBottom: 30 },
  title: { fontSize: 28, fontWeight: '900', color: '#2F3542' },
  subtitle: { fontSize: 14, color: '#747D8C', fontWeight: '600' },
  statsGrid: { flexDirection: 'row', gap: 15, marginBottom: 20 },
  statBox: { flex: 1, backgroundColor: 'white', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: '#E8EDF3', elevation: 2 },
  statLabel: { fontSize: 9, fontWeight: '900', color: '#A4B0BE', letterSpacing: 1, marginBottom: 4 },
  statValue: { fontSize: 24, fontWeight: '900', color: '#2F3542' },
  wideStat: { backgroundColor: 'white', padding: 20, borderRadius: 24, marginBottom: 20, borderWidth: 1, borderColor: '#E8EDF3' },
  chartBar: { height: 12, backgroundColor: '#2ED573', borderRadius: 6, overflow: 'hidden', marginBottom: 10 },
  progress: { height: '100%' },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  smallLabel: { fontSize: 9, fontWeight: '900', color: '#A4B0BE' },
  infoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF9F0', padding: 20, borderRadius: 20, gap: 15, borderWidth: 1, borderColor: '#FFA50230' },
  infoText: { flex: 1, fontSize: 13, color: '#FFA502', fontWeight: '700', lineHeight: 18 },
});

export default MetricsScreen;
