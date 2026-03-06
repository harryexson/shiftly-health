-- ============================================================
-- Shiftly Health - Row Level Security Policies
-- Migration: 002_rls_policies.sql
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Helper function to check admin role
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function to check staff roles (admin, support, marketing, accounting)
CREATE OR REPLACE FUNCTION is_staff()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('admin', 'support', 'marketing', 'accounting')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function to check support role
CREATE OR REPLACE FUNCTION is_support()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('admin', 'support')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================================
-- PROFILES POLICIES
-- ============================================================
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (is_staff());

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  USING (is_admin());

DROP POLICY IF EXISTS "Service can insert profiles" ON profiles;
CREATE POLICY "Service can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- MOOD ENTRIES POLICIES
-- ============================================================
DROP POLICY IF EXISTS "Users can view own mood entries" ON mood_entries;
CREATE POLICY "Users can view own mood entries"
  ON mood_entries FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own mood entries" ON mood_entries;
CREATE POLICY "Users can insert own mood entries"
  ON mood_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own mood entries" ON mood_entries;
CREATE POLICY "Users can update own mood entries"
  ON mood_entries FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own mood entries" ON mood_entries;
CREATE POLICY "Users can delete own mood entries"
  ON mood_entries FOR DELETE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all mood entries" ON mood_entries;
CREATE POLICY "Admins can view all mood entries"
  ON mood_entries FOR SELECT
  USING (is_admin());

-- ============================================================
-- HEALTH METRICS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "Users can view own health metrics" ON health_metrics;
CREATE POLICY "Users can view own health metrics"
  ON health_metrics FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own health metrics" ON health_metrics;
CREATE POLICY "Users can insert own health metrics"
  ON health_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own health metrics" ON health_metrics;
CREATE POLICY "Users can update own health metrics"
  ON health_metrics FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own health metrics" ON health_metrics;
CREATE POLICY "Users can delete own health metrics"
  ON health_metrics FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- SUBSCRIPTION PLANS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "Anyone can view active plans" ON subscription_plans;
CREATE POLICY "Anyone can view active plans"
  ON subscription_plans FOR SELECT
  USING (is_active = true OR is_admin());

DROP POLICY IF EXISTS "Admins can manage plans" ON subscription_plans;
CREATE POLICY "Admins can manage plans"
  ON subscription_plans FOR ALL
  USING (is_admin());

-- ============================================================
-- USER SUBSCRIPTIONS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "Users can view own subscriptions" ON user_subscriptions;
CREATE POLICY "Users can view own subscriptions"
  ON user_subscriptions FOR SELECT
  USING (auth.uid() = user_id OR is_staff());

DROP POLICY IF EXISTS "Admins can manage subscriptions" ON user_subscriptions;
CREATE POLICY "Admins can manage subscriptions"
  ON user_subscriptions FOR ALL
  USING (is_admin());

-- ============================================================
-- PAYMENTS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id OR is_staff());

DROP POLICY IF EXISTS "Admins can manage payments" ON payments;
CREATE POLICY "Admins can manage payments"
  ON payments FOR ALL
  USING (is_admin());

-- ============================================================
-- SUPPORT TICKETS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "Users can view own tickets" ON support_tickets;
CREATE POLICY "Users can view own tickets"
  ON support_tickets FOR SELECT
  USING (auth.uid() = user_id OR is_support());

DROP POLICY IF EXISTS "Users can create tickets" ON support_tickets;
CREATE POLICY "Users can create tickets"
  ON support_tickets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own open tickets" ON support_tickets;
CREATE POLICY "Users can update own open tickets"
  ON support_tickets FOR UPDATE
  USING (auth.uid() = user_id AND status IN ('open'));

DROP POLICY IF EXISTS "Support can update any ticket" ON support_tickets;
CREATE POLICY "Support can update any ticket"
  ON support_tickets FOR UPDATE
  USING (is_support());

-- ============================================================
-- TICKET COMMENTS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "Users can view comments on their tickets" ON ticket_comments;
CREATE POLICY "Users can view comments on their tickets"
  ON ticket_comments FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM support_tickets WHERE id = ticket_id AND user_id = auth.uid())
    OR is_support()
  );

DROP POLICY IF EXISTS "Users can add comments to their tickets" ON ticket_comments;
CREATE POLICY "Users can add comments to their tickets"
  ON ticket_comments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND (
      EXISTS (SELECT 1 FROM support_tickets WHERE id = ticket_id AND user_id = auth.uid())
      OR is_support()
    )
  );

-- ============================================================
-- API KEYS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "Users can manage own API keys" ON api_keys;
CREATE POLICY "Users can manage own API keys"
  ON api_keys FOR ALL
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all API keys" ON api_keys;
CREATE POLICY "Admins can view all API keys"
  ON api_keys FOR SELECT
  USING (is_admin());

-- ============================================================
-- AUDIT LOGS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (is_admin());

DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;
CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);

-- ============================================================
-- NOTIFICATIONS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can mark notifications as read" ON notifications;
CREATE POLICY "Users can mark notifications as read"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (is_admin() OR auth.uid() = user_id);
