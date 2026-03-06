/**
 * @typedef {Object} Profile
 * @property {string} id - UUID references auth.users
 * @property {string} email
 * @property {string} full_name
 * @property {'user'|'admin'|'support'|'marketing'|'accounting'} role
 * @property {string|null} avatar_url
 * @property {'free'|'basic'|'premium'|'enterprise'} subscription_tier
 * @property {boolean} is_active
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} MoodEntry
 * @property {string} id
 * @property {string} user_id
 * @property {1|2|3|4|5} mood_score
 * @property {string} mood_label
 * @property {string} emoji
 * @property {string|null} note
 * @property {string[]} tags
 * @property {string} created_at
 */

/**
 * @typedef {Object} HealthMetric
 * @property {string} id
 * @property {string} user_id
 * @property {number|null} sleep_hours
 * @property {number|null} exercise_minutes
 * @property {number|null} water_intake_ml
 * @property {number|null} stress_level
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
 * @property {Object} features
 * @property {boolean} is_active
 * @property {string} created_at
 */

/**
 * @typedef {Object} UserSubscription
 * @property {string} id
 * @property {string} user_id
 * @property {string} plan_id
 * @property {'active'|'canceled'|'past_due'|'trialing'} status
 * @property {string|null} stripe_subscription_id
 * @property {string} current_period_start
 * @property {string} current_period_end
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} Payment
 * @property {string} id
 * @property {string} user_id
 * @property {string|null} subscription_id
 * @property {number} amount
 * @property {string} currency
 * @property {'succeeded'|'pending'|'failed'|'refunded'} status
 * @property {string|null} stripe_payment_intent_id
 * @property {string} created_at
 */

/**
 * @typedef {Object} SupportTicket
 * @property {string} id
 * @property {string} user_id
 * @property {string} subject
 * @property {string} description
 * @property {'open'|'in_progress'|'resolved'|'closed'} status
 * @property {'low'|'medium'|'high'|'urgent'} priority
 * @property {string|null} assigned_to
 * @property {string|null} resolved_at
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} TicketComment
 * @property {string} id
 * @property {string} ticket_id
 * @property {string} user_id
 * @property {string} content
 * @property {string} created_at
 */

/**
 * @typedef {Object} ApiKey
 * @property {string} id
 * @property {string} user_id
 * @property {string} name
 * @property {string} key_hash
 * @property {string|null} last_used_at
 * @property {boolean} is_active
 * @property {string} created_at
 */

/**
 * @typedef {Object} AuditLog
 * @property {string} id
 * @property {string|null} user_id
 * @property {string} action
 * @property {string} resource_type
 * @property {string|null} resource_id
 * @property {Object|null} metadata
 * @property {string|null} ip_address
 * @property {string} created_at
 */

/**
 * @typedef {Object} Notification
 * @property {string} id
 * @property {string} user_id
 * @property {string} title
 * @property {string} body
 * @property {string} type
 * @property {boolean} is_read
 * @property {Object|null} data
 * @property {string} created_at
 */
