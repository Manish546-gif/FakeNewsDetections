import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { analyzeMessage } from '../utils/analyzeMessage';
import { checkCurrentNews } from '../utils/newsChecker';
import { 
  fetchFactCheck, 
  wikipediaLookup, 
  getDomainAge, 
  expandUrl, 
  checkDuplicates 
} from '../utils/tier1Utils';
import { getHistory, saveToHistory, HistoryItem } from '../utils/history';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Clipboard from '@react-native-clipboard/clipboard';
import { useIsFocused } from '@react-navigation/native';
import GridBackground from '../components/GridBackground';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isFocused = useIsFocused();

  const handleAnalyze = async () => {
    if (!message.trim()) {
      setError('Please provide news content or a link');
      return;
    }
    setLoading(true);
    try {
      // 1. Run local AI analysis
      const result = analyzeMessage(message);
      
      // 2. Run live news cross-reference (parallel)
      const newsResult = await checkCurrentNews(message);
      
      // 3. Calibrate score based on live news findings
      if (newsResult.status === 'found') {
        result.riskScore = Math.max(0, Math.min(100, result.riskScore + newsResult.scoreAdjustment));
        result.newsCheck = {
          articles: newsResult.articles,
          topicVerified: newsResult.topicVerified,
          status: newsResult.status
        };
      }

      // 4. Run Tier 1 Verifications
      const duplicates = await checkDuplicates(message);
      result.duplicateCount = duplicates;

      // Extract entities (simplified: capitalized words)
      const entities = message.match(/[A-Z][a-z]+/g) || [];
      if (entities.length > 0) {
        const wiki = await wikipediaLookup(entities[0]);
        if (wiki) result.wikiResult = wiki;
      }

      // Fact Check Lookup
      const factChecks = await fetchFactCheck(message.substring(0, 100));
      if (factChecks.length > 0) {
        result.factChecks = factChecks;
        // Significant risk increase if "False" or "Fake" is in a fact check rating
        const isDebunked = factChecks.some(fc => /false|fake|misleading|incorrect/i.test(fc.textualRating));
        if (isDebunked) result.riskScore = Math.min(100, result.riskScore + 30);
      }

      // URL Intelligence
      if (result.urls.length > 0) {
        const expanded = await expandUrl(result.urls[0]);
        const domain = expanded.split('/')[2];
        const age = await getDomainAge(domain);
        result.domainStats = age;
        result.resolvedUrls = [expanded];
        if (age?.isNew) result.riskScore = Math.min(100, result.riskScore + 20);
      }

      await saveToHistory(message, result);
      setLoading(false);
      navigation.navigate('Result', { result, message });
    } catch (err) {
      setLoading(false);
      setError('Analysis failed. Please try again.');
    }
  };

  const handlePaste = async () => {
    const text = await Clipboard.getString();
    if (text) {
      setMessage(text);
      setError('');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F7F8FA" />
      <GridBackground />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="shield-check" size={44} color="#4285F4" />
          </View>
          <Text style={styles.title}>AI Security Shield</Text>
          <Text style={styles.subtitle}>Fake News • Email Phishing • SMS Traps</Text>
          <View style={styles.learningBadge}>
            <MaterialCommunityIcons name="brain" size={12} color="#2ED573" />
            <Text style={styles.learningText}>Adaptive Learning Active</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.labelRow}>
              <MaterialCommunityIcons name="text-box-search-outline" size={16} color="#4285F4" />
              <Text style={styles.cardLabel}>NEWS CONTENT</Text>
            </View>
          </View>
          
          <TextInput
            style={styles.input}
            multiline
            placeholder="Paste News, Email, or SMS message here..."
            placeholderTextColor="#A4B0BE"
            value={message}
            onChangeText={(t) => {
              setMessage(t);
              setError('');
            }}
          />

          <View style={styles.utilityRow}>
            <TouchableOpacity style={styles.utilBtn} onPress={handlePaste}>
              <MaterialCommunityIcons name="content-paste" size={18} color="#4285F4" />
              <Text style={styles.utilBtnText}>PASTE</Text>
            </TouchableOpacity>
            
            {message.length > 0 && (
              <TouchableOpacity style={styles.utilBtn} onPress={() => setMessage('')}>
                <MaterialCommunityIcons name="delete-sweep-outline" size={18} color="#FF4757" />
                <Text style={[styles.utilBtnText, {color: '#FF4757'}]}>CLEAR</Text>
              </TouchableOpacity>
            )}
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleAnalyze}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text style={styles.buttonText}>Scan for Threats</Text>
              <MaterialCommunityIcons name="shield-search" size={24} color="white" />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  container: {
    padding: 20,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#4285F4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8EDF3',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#2F3542',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#747D8C',
    textAlign: 'center',
    fontWeight: '600',
  },
  learningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2ED57315',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#2ED57340',
  },
  learningText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2ED573',
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E8EDF3',
  },
  cardHeader: {
    marginBottom: 12,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4285F4',
    letterSpacing: 1,
  },
  input: {
    fontSize: 16,
    color: '#2F3542',
    minHeight: 140,
    textAlignVertical: 'top',
    lineHeight: 24,
    fontWeight: '500',
  },
  utilityRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F2F6',
  },
  utilBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F2F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  utilBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4285F4',
  },
  errorText: {
    color: '#FF4757',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 12,
  },
  button: {
    backgroundColor: '#2F3542',
    borderRadius: 20,
    height: 64,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    elevation: 6,
    marginBottom: 32,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
  },
  historySection: {
    marginBottom: 32,
  },
  historyTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#A4B0BE',
    letterSpacing: 2,
    marginBottom: 12,
    marginLeft: 4,
  },
  historyItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E8EDF3',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  historyTextContent: {
    flex: 1,
  },
  historyMsg: {
    fontSize: 14,
    color: '#2F3542',
    fontWeight: '600',
  },
  historyDate: {
    fontSize: 10,
    color: '#A4B0BE',
    marginTop: 2,
    fontWeight: '700',
  },
});

export default HomeScreen;
