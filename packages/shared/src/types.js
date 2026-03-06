/**
 * @typedef {Object} UserProfile
 * @property {string} id
 * @property {string} email
 * @property {string} full_name
 * @property {'user'|'admin'|'support'|'marketing'|'accounting'} role
 * @property {string} avatar_url
 * @property {string} created_at
 * @property {string} subscription_tier
 * @property {boolean} is_active
 */

/**
 * @typedef {Object} MoodEntry
 * @property {string} id
 * @property {string} user_id
 * @property {1|2|3|4|5} mood_score
 * @property {string} mood_label
 * @property {string} emoji
 * @property {string} note
 * @property {string[]} tags
 * @property {string} created_at
 */

/**
 * @typedef {Object} HealthMetrics
 * @property {string} id
 * @property {string} user_id
 * @property {number} sleep_hours
 * @property {number} exercise_minutes
 * @property {number} water_intake_ml
 * @property {number} stress_level
 * @property {string} date
 * @property {string} created_at
 */

/**
 * @typedef {Object} SubscriptionPlan
 * @property {string} id
 * @property {string} name
 * @property {'free'|'basic'|'premium'|'enterprise'} tier
 * @property {number} price_monthly
 * @property {number} price_yearly
 * @property {string[]} features
 * @property {boolean} is_active
 */

/**
 * @typedef {Object} SupportTicket
 * @property {string} id
 * @property {string} user_id
 * @property {string} subject
 * @property {string} description
 * @property {'open'|'in_progress'|'resolved'|'closed'} status
 * @property {'low'|'medium'|'high'|'urgent'} priority
 * @property {string} assigned_to
 * @property {string} created_at
 * @property {string} updated_at
 */

export const MOOD_OPTIONS = [
  { score: 1, label: 'Terrible', emoji: '😭', color: '#ef4444' },
  { score: 2, label: 'Bad', emoji: '😕', color: '#f97316' },
  { score: 3, label: 'Okay', emoji: '😐', color: '#eab308' },
  { score: 4, label: 'Good', emoji: '😊', color: '#22c55e' },
  { score: 5, label: 'Excellent', emoji: '🤩', color: '#8b5cf6' },
];
