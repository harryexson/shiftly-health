import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MoodSelector from '../../components/MoodSelector';
import HealthMetricCard from '../../components/HealthMetricCard';

const greetingByHour = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const recentMoods = [
  { day: 'Mon', emoji: '😊', score: 4 },
  { day: 'Tue', emoji: '😐', score: 3 },
  { day: 'Wed', emoji: '��', score: 5 },
  { day: 'Thu', emoji: '😕', score: 2 },
  { day: 'Fri', emoji: '😊', score: 4 },
  { day: 'Sat', emoji: '😊', score: 4 },
  { day: 'Sun', emoji: '😐', score: 3 },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greetingByHour()},</Text>
            <Text style={styles.name}>How are you feeling? 💜</Text>
          </View>
          <View style={styles.streakBadge}>
            <Text style={styles.streakText}>🔥 7</Text>
          </View>
        </View>

        {/* Quick mood log */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Log Today's Mood</Text>
          <MoodSelector />
        </View>

        {/* Weekly overview */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>This Week</Text>
          <View style={styles.weekRow}>
            {recentMoods.map(({ day, emoji, score }) => (
              <View key={day} style={styles.dayCol}>
                <Text style={styles.emoji}>{emoji}</Text>
                <Text style={styles.dayLabel}>{day}</Text>
                <View style={[styles.scoreBar, { height: score * 8, backgroundColor: score >= 4 ? '#8b5cf6' : score >= 3 ? '#eab308' : '#ef4444' }]} />
              </View>
            ))}
          </View>
        </View>

        {/* Health metrics */}
        <Text style={styles.sectionTitle}>Today's Metrics</Text>
        <View style={styles.metricsGrid}>
          <HealthMetricCard icon="🌙" label="Sleep" value="7.5" unit="hrs" color="#6366f1" />
          <HealthMetricCard icon="🏃" label="Exercise" value="35" unit="min" color="#10b981" />
          <HealthMetricCard icon="💧" label="Water" value="2.1" unit="L" color="#3b82f6" />
          <HealthMetricCard icon="😤" label="Stress" value="4" unit="/10" color="#f59e0b" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scroll: { padding: 16, paddingBottom: 32 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  greeting: { fontSize: 14, color: '#64748b' },
  name: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  streakBadge: { backgroundColor: '#fef3c7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  streakText: { fontWeight: 'bold', color: '#92400e' },
  card: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginBottom: 12 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  dayCol: { alignItems: 'center', gap: 4 },
  emoji: { fontSize: 20 },
  dayLabel: { fontSize: 11, color: '#94a3b8' },
  scoreBar: { width: 6, borderRadius: 3, minHeight: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginBottom: 12 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
});
