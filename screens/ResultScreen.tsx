import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Linking,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import RiskBadge from '../components/RiskBadge';
import AnalysisReportBar from '../components/AnalysisReportBar';
import GridBackground from '../components/GridBackground';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

type ResultScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Result'>;
  route: RouteProp<RootStackParamList, 'Result'>;
};

const ResultScreen: React.FC<ResultScreenProps> = ({ navigation, route }) => {
  const { result, message } = route.params;

  const handleDeepVerify = () => {
    const searchTerm = result.urls.length > 0 ? result.urls[0] : message.substring(0, 100);
    const query = encodeURIComponent(`"${searchTerm}" news fact check`);
    const url = `https://www.google.com/search?q=${query}`;
    Linking.openURL(url).catch(() => Alert.alert("Error", "Could not open browser"));
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F8FA" />
      <GridBackground />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Verification Status */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
             <Text style={styles.statusLabel}>COMPLETE AI REPORT</Text>
             <RiskBadge score={result.riskScore} />
          </View>
          
          <AnalysisReportBar score={result.riskScore} />
          
          <View style={styles.summaryBox}>
             <Text style={styles.summaryTitle}>{result.summary}</Text>
             <Text style={styles.summaryDesc}>Based on local linguistic pattern matching and heuristic dataset cross-referencing.</Text>
          </View>
        </View>

        {/* Detailed Verdict Card (THE AI EXPLANATION) */}
        <View style={styles.verdictCard}>
          <View style={styles.verdictHeader}>
            <MaterialCommunityIcons name="robot-confused-outline" size={24} color="#4285F4" />
            <Text style={styles.verdictTitle}>AI Critical Analysis</Text>
          </View>
          <Text style={styles.verdictText}>{result.detailedVerdict}</Text>
        </View>

        {/* RED FLAG FINDINGS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
             <MaterialCommunityIcons name="flag-triangle" size={24} color="#FF4757" />
             <Text style={styles.sectionTitle}>Detected Red Flags</Text>
          </View>
          {result.issues.length > 0 ? (
            result.issues.map((issue, i) => (
                <View key={i} style={styles.issueRow}>
                <View style={styles.flagIcon}>
                    <MaterialCommunityIcons name="alert-circle" size={18} color="#FF4757" />
                </View>
                <View style={styles.flagContent}>
                    <Text style={styles.flagLabel}>{result.triggers[i] || 'Anomaly'}</Text>
                    <Text style={styles.issueText}>{issue}</Text>
                </View>
                </View>
            ))
          ) : (
            <View style={styles.cleanRow}>
                <MaterialCommunityIcons name="check-decagram" size={24} color="#2ED573" />
                <Text style={styles.cleanText}>No major misinformation triggers detected in this content.</Text>
            </View>
          )}
        </View>

        {/* GOOGLE VERIFY ACTION */}
        <TouchableOpacity style={styles.verifyBtn} onPress={handleDeepVerify}>
          <View style={styles.googleIconBg}>
            <MaterialCommunityIcons name="google" size={24} color="white" />
          </View>
          <View style={styles.btnContent}>
            <Text style={styles.btnTitle}>Cross-Check with Google</Text>
            <Text style={styles.btnSub}>Find official reports or debunking articles</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#4285F4" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>New Analysis</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F7F8FA' },
  container: { padding: 20, paddingBottom: 40 },
  statusCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#E8EDF3',
  },
  statusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  statusLabel: { fontSize: 10, fontWeight: '900', color: '#A4B0BE', letterSpacing: 2 },
  summaryBox: { marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#F1F2F6' },
  summaryTitle: { fontSize: 18, fontWeight: '900', color: '#2F3542' },
  summaryDesc: { fontSize: 12, color: '#747D8C', marginTop: 4, fontWeight: '600' },
  verdictCard: { backgroundColor: 'white', borderRadius: 20, padding: 22, marginBottom: 20, borderLeftWidth: 8, borderLeftColor: '#4285F4', elevation: 3 },
  verdictHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  verdictTitle: { fontSize: 17, fontWeight: '900', color: '#2F3542' },
  verdictText: { fontSize: 14, color: '#57606F', lineHeight: 22, fontWeight: '600' },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: '#2F3542' },
  issueRow: { flexDirection: 'row', backgroundColor: 'white', padding: 16, borderRadius: 20, marginBottom: 12, gap: 12, borderWidth: 1, borderColor: '#E8EDF3' },
  flagIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FF475715', justifyContent: 'center', alignItems: 'center' },
  flagContent: { flex: 1 },
  flagLabel: { fontSize: 10, fontWeight: '900', color: '#FF4757', textTransform: 'uppercase', marginBottom: 2 },
  issueText: { fontSize: 14, color: '#2F3542', fontWeight: '600', lineHeight: 20 },
  cleanRow: { backgroundColor: '#2ED57315', padding: 20, borderRadius: 20, alignItems: 'center', gap: 10 },
  cleanText: { fontSize: 14, color: '#2ED573', fontWeight: '800', textAlign: 'center' },
  verifyBtn: { backgroundColor: 'white', borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 24, borderWidth: 1.5, borderColor: '#4285F420' },
  googleIconBg: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#4285F4', justifyContent: 'center', alignItems: 'center' },
  btnContent: { flex: 1, marginLeft: 16 },
  btnTitle: { fontSize: 16, fontWeight: '800', color: '#2F3542' },
  btnSub: { fontSize: 11, color: '#4285F4', fontWeight: '700' },
  backBtn: { backgroundColor: '#2F3542', height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  backBtnText: { color: 'white', fontSize: 16, fontWeight: '900', letterSpacing: 2 },
});

export default ResultScreen;
