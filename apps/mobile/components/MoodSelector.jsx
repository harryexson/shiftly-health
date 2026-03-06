import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';

const MOODS = [
  { score: 1, emoji: '😭', label: 'Terrible', color: '#ef4444' },
  { score: 2, emoji: '😕', label: 'Bad', color: '#f97316' },
  { score: 3, emoji: '😐', label: 'Okay', color: '#eab308' },
  { score: 4, emoji: '😊', label: 'Good', color: '#22c55e' },
  { score: 5, emoji: '🤩', label: 'Excellent', color: '#8b5cf6' },
];

export default function MoodSelector({ onSelect }) {
  const [selected, setSelected] = useState(null);

  function handleSelect(mood) {
    setSelected(mood.score);
    onSelect?.(mood);
  }

  return (
    <View style={styles.container}>
      {MOODS.map(mood => (
        <TouchableOpacity
          key={mood.score}
          style={[
            styles.moodBtn,
            selected === mood.score && { backgroundColor: mood.color + '20', borderColor: mood.color, borderWidth: 2 },
          ]}
          onPress={() => handleSelect(mood)}
          activeOpacity={0.7}
        >
          <Text style={styles.emoji}>{mood.emoji}</Text>
          <Text style={[styles.label, selected === mood.score && { color: mood.color, fontWeight: '600' }]}>
            {mood.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  moodBtn: { flex: 1, alignItems: 'center', padding: 10, borderRadius: 12, borderWidth: 2, borderColor: 'transparent', backgroundColor: '#f8fafc' },
  emoji: { fontSize: 28 },
  label: { fontSize: 9, color: '#94a3b8', marginTop: 4, textAlign: 'center' },
});
