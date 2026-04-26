import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import GridBackground from '../components/GridBackground';

const AboutScreen = () => {
  return (
    <View style={styles.root}>
      <GridBackground />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
           <MaterialCommunityIcons name="information-outline" size={40} color="#4285F4" />
           <Text style={styles.title}>About AI Engine</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>OUR MISSION</Text>
          <Text style={styles.text}>
            We aim to empower users by providing real-time analysis of digital content. Our engine identifies linguistic patterns associated with misinformation to help you make informed decisions.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>DATASET TRAINING</Text>
          <Text style={styles.text}>
            The model is trained on diverse datasets including public news archives and established truth-checking repositories. It continuously adapts to new types of "fake news" tactics.
          </Text>
        </View>

        <View style={styles.card}>
            <Text style={styles.sectionTitle}>TECHNICAL STACK</Text>
            <View style={styles.tagRow}>
                <View style={styles.tag}><Text style={styles.tagText}>REACT NATIVE</Text></View>
                <View style={styles.tag}><Text style={styles.tagText}>HEURISTIC AI</Text></View>
                <View style={styles.tag}><Text style={styles.tagText}>GRYPHON ENGINE</Text></View>
            </View>
        </View>

        <TouchableOpacity 
          style={styles.linkBtn}
          onPress={() => Linking.openURL('https://github.com/manish/FakeNewsDetector')}
        >
          <MaterialCommunityIcons name="github" size={20} color="white" />
          <Text style={styles.linkBtnText}>View Source on GitHub</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F7F8FA' },
  container: { padding: 20, paddingTop: 40 },
  header: { alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 24, fontWeight: '900', color: '#2F3542', marginTop: 10 },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8EDF3',
  },
  sectionTitle: { fontSize: 10, fontWeight: '900', color: '#4285F4', letterSpacing: 2, marginBottom: 8 },
  text: { fontSize: 14, color: '#57606F', lineHeight: 22, fontWeight: '600' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  tag: { backgroundColor: '#F1F2F6', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  tagText: { fontSize: 9, fontWeight: '900', color: '#2F3542' },
  linkBtn: {
    backgroundColor: '#2F3542',
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginTop: 20,
  },
  linkBtnText: { color: 'white', fontSize: 14, fontWeight: '800' },
});

export default AboutScreen;
