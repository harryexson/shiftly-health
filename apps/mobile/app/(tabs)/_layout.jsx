import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#8b5cf6',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#f1f5f9',
          paddingBottom: 8,
          paddingTop: 8,
          height: 64,
        },
        headerStyle: { backgroundColor: '#8b5cf6' },
        headerTintColor: '#ffffff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerTitle: 'Shiftly Health',
        }}
      />
      <Tabs.Screen
        name="track"
        options={{
          title: 'Track',
          headerTitle: 'Log Entry',
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          headerTitle: 'My Insights',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerTitle: 'My Profile',
        }}
      />
    </Tabs>
  );
}
