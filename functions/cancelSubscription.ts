import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe';

const stripe = new Stripe(Deno.env.get("STRIPE_API_KEY"));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subscriptionId, cancelImmediately } = await req.json();

    if (!subscriptionId) {
      return Response.json({ error: 'Subscription ID required' }, { status: 400 });
    }

    // Verify the subscription belongs to this user
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const customer = await stripe.customers.retrieve(subscription.customer);

    if (customer.email !== user.email) {
      return Response.json({ error: 'Unauthorized to cancel this subscription' }, { status: 403 });
    }

    let result;
    if (cancelImmediately) {
      // Cancel immediately
      result = await stripe.subscriptions.cancel(subscriptionId);
    } else {
      // Cancel at period end
      result = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true
      });
    }

    return Response.json({
      success: true,
      status: result.status,
      cancelAtPeriodEnd: result.cancel_at_period_end,
      currentPeriodEnd: new Date(result.current_period_end * 1000).toISOString()
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});