import { View, Text, StyleSheet } from 'react-native';

export default function HealthMetricCard({ icon, label, value, unit, color }) {
  return (
    <View style={[styles.card, { borderTopColor: color, borderTopWidth: 3 }]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.unit}>{unit}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  icon: { fontSize: 24, marginBottom: 6 },
  value: { fontSize: 24, fontWeight: 'bold' },
  unit: { fontSize: 12, color: '#94a3b8' },
  label: { fontSize: 13, color: '#64748b', marginTop: 2, fontWeight: '500' },
});
