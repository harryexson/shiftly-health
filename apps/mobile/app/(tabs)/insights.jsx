import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const weeklyData = [
  { day: 'M', score: 4, emoji: '😊' },
  { day: 'T', score: 3, emoji: '😐' },
  { day: 'W', score: 5, emoji: '🤩' },
  { day: 'T', score: 2, emoji: '😕' },
  { day: 'F', score: 4, emoji: '😊' },
  { day: 'S', score: 4, emoji: '😊' },
  { day: 'S', score: 3, emoji: '😐' },
];

const avgScore = (weeklyData.reduce((s, d) => s + d.score, 0) / weeklyData.length).toFixed(1);

const stats = [
  { label: 'Avg Mood', value: avgScore, unit: '/ 5', icon: '💜' },
  { label: 'Streak', value: '7', unit: 'days', icon: '🔥' },
  { label: 'Entries', value: '142', unit: 'total', icon: '📝' },
  { label: 'Avg Sleep', value: '7.2', unit: 'hrs', icon: '🌙' },
];

const maxScore = 5;

export default function InsightsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={styles.statsGrid}>
          {stats.map(({ label, value, unit, icon }) => (
            <View key={label} style={styles.statCard}>
              <Text style={styles.statIcon}>{icon}</Text>
              <Text style={styles.statValue}>{value}</Text>
              <Text style={styles.statUnit}>{unit}</Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Weekly mood bar chart */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>This Week's Mood</Text>
          <View style={styles.barChart}>
            {weeklyData.map(({ day, score, emoji }, i) => (
              <View key={i} style={styles.barCol}>
                <Text style={styles.barEmoji}>{emoji}</Text>
                <View style={styles.barWrapper}>
                  <View style={[styles.bar, {
                    height: (score / maxScore) * 100,
                    backgroundColor: score >= 4 ? '#8b5cf6' : score === 3 ? '#eab308' : '#ef4444',
                  }]} />
                </View>
                <Text style={styles.barDay}>{day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Insights */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>AI Insights</Text>
          {[
            { icon: '📈', text: 'Your mood is highest on Wednesdays. Consider what makes those days special!' },
            { icon: '😴', text: 'Better sleep (7.5+ hrs) correlates with a +0.8 mood score increase.' },
            { icon: '🏃', text: 'Days with exercise show 23% higher average mood scores.' },
          ].map(({ icon, text }) => (
            <View key={text} style={styles.insightRow}>
              <Text style={styles.insightIcon}>{icon}</Text>
              <Text style={styles.insightText}>{text}</Text>
            </View>
          ))}
        </View>

        {/* Monthly heatmap placeholder */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>30-Day Heatmap</Text>
          <View style={styles.heatmap}>
            {Array.from({ length: 30 }, (_, i) => {
              const score = Math.floor(Math.random() * 5) + 1;
              const colors = ['#fee2e2', '#fed7aa', '#fef9c3', '#dcfce7', '#ede9fe'];
              return <View key={i} style={[styles.heatCell, { backgroundColor: colors[score - 1] }]} />;
            })}
          </View>
          <View style={styles.legend}>
            {['Terrible', 'Bad', 'Okay', 'Good', 'Excellent'].map((l, i) => {
              const colors = ['#fee2e2', '#fed7aa', '#fef9c3', '#dcfce7', '#ede9fe'];
              return (
                <View key={l} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors[i] }]} />
                  <Text style={styles.legendLabel}>{l}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scroll: { padding: 16, paddingBottom: 32 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  statCard: { flex: 1, minWidth: '45%', backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  statIcon: { fontSize: 24, marginBottom: 4 },
  statValue: { fontSize: 28, fontWeight: 'bold', color: '#1e293b' },
  statUnit: { fontSize: 12, color: '#94a3b8' },
  statLabel: { fontSize: 13, color: '#64748b', marginTop: 2 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginBottom: 16 },
  barChart: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 140 },
  barCol: { alignItems: 'center', gap: 4, flex: 1 },
  barEmoji: { fontSize: 16 },
  barWrapper: { height: 80, justifyContent: 'flex-end', width: '100%', alignItems: 'center' },
  bar: { width: 24, borderRadius: 4 },
  barDay: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  insightRow: { flexDirection: 'row', gap: 10, marginBottom: 12, alignItems: 'flex-start' },
  insightIcon: { fontSize: 18, width: 24 },
  insightText: { flex: 1, fontSize: 14, color: '#475569', lineHeight: 20 },
  heatmap: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  heatCell: { width: 28, height: 28, borderRadius: 6 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 3 },
  legendLabel: { fontSize: 10, color: '#94a3b8' },
});
