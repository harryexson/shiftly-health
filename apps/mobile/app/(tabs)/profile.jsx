import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const menuItems = [
  { icon: '🔔', label: 'Notifications', badge: '3' },
  { icon: '🔒', label: 'Privacy & Security' },
  { icon: '💳', label: 'Subscription' },
  { icon: '📤', label: 'Export Data' },
  { icon: '🎯', label: 'Goals & Reminders' },
  { icon: '❓', label: 'Help & Support' },
  { icon: '📋', label: 'Terms & Privacy Policy' },
];

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Profile header */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>S</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Sarah Chen</Text>
            <Text style={styles.profileEmail}>sarah.chen@example.com</Text>
            <View style={styles.tierBadge}>
              <Text style={styles.tierText}>⭐ Premium</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { value: '142', label: 'Entries' },
            { value: '7', label: 'Day Streak' },
            { value: '3.9', label: 'Avg Mood' },
          ].map(({ value, label }) => (
            <View key={label} style={styles.stat}>
              <Text style={styles.statValue}>{value}</Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Menu */}
        <View style={styles.menuCard}>
          {menuItems.map(({ icon, label, badge }, i) => (
            <TouchableOpacity
              key={label}
              style={[styles.menuItem, i < menuItems.length - 1 && styles.menuBorder]}
              onPress={() => Alert.alert(label, 'This feature is coming soon!')}
            >
              <Text style={styles.menuIcon}>{icon}</Text>
              <Text style={styles.menuLabel}>{label}</Text>
              <View style={styles.menuRight}>
                {badge && <View style={styles.badge}><Text style={styles.badgeText}>{badge}</Text></View>}
                <Text style={styles.menuArrow}>›</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign out */}
        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={() => Alert.alert('Sign Out', 'Are you sure?', [{ text: 'Cancel' }, { text: 'Sign Out', style: 'destructive' }])}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Shiftly Health v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scroll: { padding: 16, paddingBottom: 32 },
  profileCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, flexDirection: 'row', gap: 16, alignItems: 'center', marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#8b5cf6', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 26, fontWeight: 'bold' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  profileEmail: { fontSize: 13, color: '#64748b', marginTop: 2 },
  tierBadge: { backgroundColor: '#ede9fe', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, alignSelf: 'flex-start', marginTop: 6 },
  tierText: { fontSize: 12, color: '#6d28d9', fontWeight: '600' },
  statsRow: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#8b5cf6' },
  statLabel: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  menuCard: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  menuIcon: { fontSize: 20, width: 28 },
  menuLabel: { flex: 1, fontSize: 15, color: '#334155' },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: { backgroundColor: '#8b5cf6', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  menuArrow: { fontSize: 20, color: '#cbd5e1' },
  signOutBtn: { borderWidth: 1, borderColor: '#fca5a5', borderRadius: 14, padding: 14, alignItems: 'center', marginBottom: 16 },
  signOutText: { color: '#ef4444', fontWeight: '600', fontSize: 15 },
  version: { textAlign: 'center', color: '#cbd5e1', fontSize: 12 },
});
