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

  const color = result.riskScore >= 70 ? '#FF4757' : result.riskScore >= 40 ? '#FFA502' : '#2ED573';

  return (
    <View style={[styles.root, { backgroundColor: color + '05' }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F8FA" />
      <GridBackground />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Verification Status */}
        <View style={[styles.statusCard, { borderTopWidth: 8, borderTopColor: color }]}>
          <View style={styles.statusHeader}>
             <Text style={styles.statusLabel}>INTELLIGENCE SCAN</Text>
             <RiskBadge score={result.riskScore} />
          </View>
          
          <AnalysisReportBar score={result.riskScore} />
          
          <View style={styles.summaryBox}>
             <Text style={styles.summaryTitle}>{result.summary}</Text>
             <Text style={styles.summaryDesc}>Based on local linguistic pattern matching and heuristic dataset cross-referencing.</Text>
          </View>
        </View>

        {/* Detailed Verdict Card (THE AI EXPLANATION) */}
        <View style={[styles.verdictCard, { borderLeftColor: color }]}>
          <View style={styles.verdictHeader}>
            <MaterialCommunityIcons name="security-network" size={24} color={color} />
            <Text style={[styles.verdictTitle, { color }]}>Threat Level Analysis</Text>
          </View>
          <Text style={styles.verdictText}>{result.detailedVerdict}</Text>
        </View>

        {/* LIVE NEWS CROSS-REFERENCE */}
        {result.newsCheck?.articles && result.newsCheck.articles.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
               <MaterialCommunityIcons name="newspaper-variant-outline" size={24} color="#4285F4" />
               <Text style={styles.sectionTitle}>Live News Matches</Text>
            </View>
            {result.newsCheck.articles.slice(0, 3).map((article, i) => (
              <TouchableOpacity 
                key={i} 
                style={styles.newsCard} 
                onPress={() => Linking.openURL(article.link)}
              >
                <View style={styles.newsHeader}>
                   <Text style={styles.newsSource}>{article.source.toUpperCase()}</Text>
                   <Text style={styles.newsDate}>{article.pubDate}</Text>
                </View>
                <Text style={styles.newsTitle} numberOfLines={2}>{article.title}</Text>
                <Text style={styles.newsSnippet} numberOfLines={2}>{article.snippet}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* PROFESSIONAL FACT CHECKS */}
        {result.factChecks && result.factChecks.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
               <MaterialCommunityIcons name="shield-check-outline" size={24} color="#2ED573" />
               <Text style={styles.sectionTitle}>Professional Fact Checks</Text>
            </View>
            {result.factChecks.map((fc, i) => (
              <View key={i} style={styles.factCard}>
                <View style={styles.factRatingRow}>
                  <Text style={[styles.factRating, { color: fc.textualRating.toLowerCase().includes('false') ? '#FF4757' : '#2ED573' }]}>
                    {fc.textualRating.toUpperCase()}
                  </Text>
                  <Text style={styles.factSource}>VIA {fc.claimant.toUpperCase()}</Text>
                </View>
                <Text style={styles.factClaim}>{fc.claim}</Text>
                {fc.reviewUrl && (
                  <TouchableOpacity onPress={() => Linking.openURL(fc.reviewUrl)}>
                    <Text style={styles.readFullText}>READ FULL DEBUNK</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}

        {/* LINK & DOMAIN INTELLIGENCE */}
        {result.domainStats && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
               <MaterialCommunityIcons name="web" size={24} color="#4285F4" />
               <Text style={styles.sectionTitle}>Link Intelligence</Text>
            </View>
            <View style={styles.intelligenceRow}>
              <View style={styles.intelItem}>
                <Text style={styles.intelLabel}>DOMAIN AGE</Text>
                <Text style={[styles.intelValue, { color: result.domainStats.isNew ? '#FF4757' : '#2ED573' }]}>
                  {result.domainStats.firstSeen}
                </Text>
              </View>
              <View style={styles.intelItem}>
                <Text style={styles.intelLabel}>REPUTATION</Text>
                <Text style={[styles.intelValue, { color: result.domainStats.isNew ? '#FF4757' : '#2ED573' }]}>
                  {result.domainStats.isNew ? 'RISKY / NEW' : 'ESTABLISHED'}
                </Text>
              </View>
            </View>
            {result.resolvedUrls && result.resolvedUrls.length > 0 && (
              <Text style={styles.resolvedUrl}>REVEALED: {result.resolvedUrls[0]}</Text>
            )}
          </View>
        )}

        {/* ENTITY VERIFICATION (WIKI) */}
        {result.wikiResult && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
               <MaterialCommunityIcons name="wikipedia" size={24} color="#2F3542" />
               <Text style={styles.sectionTitle}>Contextual Verification</Text>
            </View>
            <View style={styles.wikiCard}>
              <Text style={styles.wikiTitle}>{result.wikiResult.title}</Text>
              <Text style={styles.wikiExtract} numberOfLines={3}>{result.wikiResult.extract}</Text>
              <TouchableOpacity onPress={() => Linking.openURL(result.wikiResult.url)}>
                <Text style={styles.wikiLink}>View Wikipedia Record</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* SOCIAL SIGNALS */}
        {result.duplicateCount !== undefined && result.duplicateCount > 0 && (
          <View style={styles.section}>
            <View style={styles.alertCard}>
              <MaterialCommunityIcons name="alert-decagram" size={20} color="#FF4757" />
              <Text style={styles.alertText}>
                This claim has been scanned {result.duplicateCount} times before. Potential coordinated misinformation signature detected.
              </Text>
            </View>
          </View>
        )}

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
  newsCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8EDF3',
    elevation: 2,
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  newsSource: {
    fontSize: 10,
    fontWeight: '900',
    color: '#4285F4',
  },
  newsDate: {
    fontSize: 10,
    color: '#A4B0BE',
    fontWeight: '700',
  },
  newsTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2F3542',
    marginBottom: 4,
  },
  newsSnippet: {
    fontSize: 12,
    color: '#747D8C',
    lineHeight: 18,
  },
  factCard: { backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#2ED573', elevation: 2 },
  factRatingRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  factRating: { fontSize: 11, fontWeight: '900' },
  factSource: { fontSize: 10, color: '#A4B0BE', fontWeight: '800' },
  factClaim: { fontSize: 13, color: '#2F3542', fontWeight: '600', lineHeight: 18, marginBottom: 8 },
  readFullText: { fontSize: 11, color: '#4285F4', fontWeight: '800' },
  intelligenceRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  intelItem: { flex: 1, backgroundColor: '#F1F2F6', padding: 12, borderRadius: 12 },
  intelLabel: { fontSize: 9, color: '#A4B0BE', fontWeight: '800', marginBottom: 4 },
  intelValue: { fontSize: 12, fontWeight: '900' },
  resolvedUrl: { fontSize: 10, color: '#747D8C', fontStyle: 'italic', backgroundColor: '#F1F2F6', padding: 8, borderRadius: 8 },
  wikiCard: { backgroundColor: '#F8F9FA', padding: 16, borderRadius: 20, borderWidth: 1, borderColor: '#E8EDF3' },
  wikiTitle: { fontSize: 15, fontWeight: '900', color: '#2F3542', marginBottom: 6 },
  wikiExtract: { fontSize: 12, color: '#747D8C', lineHeight: 18, marginBottom: 10 },
  wikiLink: { fontSize: 12, color: '#4285F4', fontWeight: '700' },
  alertCard: { backgroundColor: '#FF475715', padding: 16, borderRadius: 16, flexDirection: 'row', gap: 12, alignItems: 'center' },
  alertText: { flex: 1, fontSize: 12, color: '#FF4757', fontWeight: '700', lineHeight: 16 },
  verifyBtn: { backgroundColor: 'white', borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 24, borderWidth: 1.5, borderColor: '#4285F420' },
  googleIconBg: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#4285F4', justifyContent: 'center', alignItems: 'center' },
  btnContent: { flex: 1, marginLeft: 16 },
  btnTitle: { fontSize: 16, fontWeight: '800', color: '#2F3542' },
  btnSub: { fontSize: 11, color: '#4285F4', fontWeight: '700' },
  backBtn: { backgroundColor: '#2F3542', height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  backBtnText: { color: 'white', fontSize: 16, fontWeight: '900', letterSpacing: 2 },
});

export default ResultScreen;
