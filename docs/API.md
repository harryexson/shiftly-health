# API Documentation

Shiftly Health uses Supabase as its backend. All data access goes through the Supabase client SDK.

## Authentication

```javascript
import { supabase } from '@shiftly-health/supabase';

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password',
});

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password',
  options: { data: { full_name: 'John Doe' } },
});

// Sign out
await supabase.auth.signOut();
```

## Profiles

```javascript
// Get current user profile
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();

// Update profile
const { data } = await supabase
  .from('profiles')
  .update({ full_name: 'New Name' })
  .eq('id', userId);
```

## Mood Entries

```javascript
// Log a mood entry
const { data } = await supabase.from('mood_entries').insert({
  user_id: userId,
  mood_score: 4,
  mood_label: 'Good',
  emoji: '😊',
  note: 'Feeling great today!',
  tags: ['work', 'exercise'],
});

// Get mood history
const { data } = await supabase
  .from('mood_entries')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(30);
```

## Health Metrics

```javascript
// Log health metrics
const { data } = await supabase.from('health_metrics').upsert({
  user_id: userId,
  sleep_hours: 7.5,
  exercise_minutes: 30,
  water_intake_ml: 2000,
  stress_level: 3,
  date: new Date().toISOString().split('T')[0],
});
```

## Support Tickets

```javascript
// Create ticket
const { data } = await supabase.from('support_tickets').insert({
  user_id: userId,
  subject: 'Issue with app',
  description: 'Detailed description...',
  priority: 'medium',
});

// Get user tickets
const { data } = await supabase
  .from('support_tickets')
  .select('*, ticket_comments(*)')
  .eq('user_id', userId);
```

## Realtime Subscriptions

```javascript
// Subscribe to new notifications
const channel = supabase
  .channel('notifications')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `user_id=eq.${userId}`,
  }, (payload) => {
    console.log('New notification:', payload.new);
  })
  .subscribe();

// Cleanup
channel.unsubscribe();
```
