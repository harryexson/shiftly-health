import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@17.4.0';

const stripe = new Stripe(Deno.env.get("STRIPE_API_KEY"));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find customer by email
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1
    });

    if (customers.data.length === 0) {
      return Response.json({ 
        hasSubscription: false,
        status: 'no_customer'
      });
    }

    const customerId = customers.data[0].id;

    // Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1
    });

    if (subscriptions.data.length === 0) {
      // Check for any subscription (including cancelled, past_due)
      const allSubscriptions = await stripe.subscriptions.list({
        customer: customerId,
        limit: 1
      });

      if (allSubscriptions.data.length > 0) {
        const sub = allSubscriptions.data[0];
        return Response.json({
          hasSubscription: false,
          status: sub.status,
          subscriptionId: sub.id,
          currentPeriodEnd: new Date(sub.current_period_end * 1000).toISOString()
        });
      }

      return Response.json({ 
        hasSubscription: false,
        status: 'no_subscription'
      });
    }

    const subscription = subscriptions.data[0];
    
    return Response.json({
      hasSubscription: true,
      status: subscription.status,
      subscriptionId: subscription.id,
      plan: subscription.items.data[0]?.price?.nickname || 'Standard',
      currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
      cancelAtPeriodEnd: subscription.cancel_at_period_end
    });
  } catch (error) {
    console.error('Subscription status error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});