import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MOOD_OPTIONS = [
  { score: 1, emoji: '😭', label: 'Terrible', color: '#ef4444' },
  { score: 2, emoji: '😕', label: 'Bad', color: '#f97316' },
  { score: 3, emoji: '😐', label: 'Okay', color: '#eab308' },
  { score: 4, emoji: '😊', label: 'Good', color: '#22c55e' },
  { score: 5, emoji: '🤩', label: 'Excellent', color: '#8b5cf6' },
];

export default function TrackScreen() {
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState('');
  const [sleep, setSleep] = useState('');
  const [exercise, setExercise] = useState('');
  const [water, setWater] = useState('');

  function handleSave() {
    if (!selectedMood) {
      Alert.alert('Select your mood', 'Please choose how you are feeling today.');
      return;
    }
    Alert.alert('Logged! 🎉', `Your ${selectedMood.label} mood has been saved.`);
    setSelectedMood(null);
    setNote('');
    setSleep('');
    setExercise('');
    setWater('');
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Mood selection */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>How are you feeling?</Text>
          <View style={styles.moodRow}>
            {MOOD_OPTIONS.map(mood => (
              <TouchableOpacity
                key={mood.score}
                style={[styles.moodBtn, selectedMood?.score === mood.score && { backgroundColor: mood.color + '20', borderColor: mood.color, borderWidth: 2 }]}
                onPress={() => setSelectedMood(mood)}
              >
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                <Text style={[styles.moodLabel, selectedMood?.score === mood.score && { color: mood.color, fontWeight: '600' }]}>{mood.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Note */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Add a note (optional)</Text>
          <TextInput
            style={styles.noteInput}
            placeholder="What's on your mind today?"
            placeholderTextColor="#94a3b8"
            multiline
            value={note}
            onChangeText={setNote}
          />
        </View>

        {/* Health metrics */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Health Metrics</Text>
          {[
            { icon: '🌙', label: 'Sleep (hours)', value: sleep, setter: setSleep, placeholder: '8.0' },
            { icon: '🏃', label: 'Exercise (minutes)', value: exercise, setter: setExercise, placeholder: '30' },
            { icon: '💧', label: 'Water (ml)', value: water, setter: setWater, placeholder: '2000' },
          ].map(({ icon, label, value, setter, placeholder }) => (
            <View key={label} style={styles.metricRow}>
              <Text style={styles.metricIcon}>{icon}</Text>
              <Text style={styles.metricLabel}>{label}</Text>
              <TextInput
                style={styles.metricInput}
                keyboardType="decimal-pad"
                placeholder={placeholder}
                placeholderTextColor="#94a3b8"
                value={value}
                onChangeText={setter}
              />
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save Entry</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scroll: { padding: 16, paddingBottom: 32 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginBottom: 12 },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between' },
  moodBtn: { alignItems: 'center', padding: 10, borderRadius: 12, flex: 1, marginHorizontal: 2 },
  moodEmoji: { fontSize: 28 },
  moodLabel: { fontSize: 10, color: '#94a3b8', marginTop: 4 },
  noteInput: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 12, minHeight: 80, textAlignVertical: 'top', fontSize: 14, color: '#1e293b' },
  metricRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  metricIcon: { fontSize: 20, width: 32 },
  metricLabel: { flex: 1, fontSize: 14, color: '#475569' },
  metricInput: { width: 80, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 8, textAlign: 'right', fontSize: 14, color: '#1e293b' },
  saveBtn: { backgroundColor: '#8b5cf6', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
