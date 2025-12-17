import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@17.4.0';

const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY'));
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

Deno.serve(async (req) => {
  try {
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return Response.json({ error: 'No signature provided' }, { status: 400 });
    }

    const body = await req.text();
    
    // Verify webhook signature
    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return Response.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const customerEmail = session.customer_email || session.customer_details?.email;
        
        if (session.mode === 'subscription') {
          // Update subscription status
          const subscriptions = await base44.asServiceRole.entities.Subscription.filter({
            employer_email: customerEmail
          });

          if (subscriptions.length > 0) {
            await base44.asServiceRole.entities.Subscription.update(subscriptions[0].id, {
              status: 'active',
              payment_status: 'current',
              billing_cycle_start: new Date().toISOString().split('T')[0],
              last_payment_date: new Date().toISOString().split('T')[0],
              last_payment_amount: session.amount_total / 100
            });
          }

          // Update employer profile
          const profiles = await base44.asServiceRole.entities.EmployerProfile.filter({
            user_email: customerEmail
          });

          if (profiles.length > 0) {
            await base44.asServiceRole.entities.EmployerProfile.update(profiles[0].id, {
              subscription_status: 'active',
              payment_method_type: 'card',
              payment_method_last4: session.payment_method_details?.card?.last4 || 'xxxx'
            });
          }
        } else if (session.mode === 'payment') {
          // Record one-time payment
          await base44.asServiceRole.entities.Payment.create({
            employer_email: customerEmail,
            amount: session.amount_total / 100,
            payment_type: 'service_fee',
            payment_method: 'credit_card',
            transaction_id: session.payment_intent,
            status: 'completed',
            payment_date: new Date().toISOString().split('T')[0],
            description: 'Platform service fee'
          });
        }

        // Send notification
        await base44.asServiceRole.entities.Notification.create({
          user_email: customerEmail,
          type: 'payment_due',
          title: 'Payment Successful',
          message: 'Your payment has been processed successfully.',
          priority: 'medium',
          status: 'unread'
        });
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const customerEmail = invoice.customer_email;

        // Record payment
        await base44.asServiceRole.entities.Payment.create({
          employer_email: customerEmail,
          amount: invoice.amount_paid / 100,
          payment_type: 'subscription',
          payment_method: 'credit_card',
          transaction_id: invoice.payment_intent,
          status: 'completed',
          payment_date: new Date().toISOString().split('T')[0],
          description: `Invoice ${invoice.number}`,
          invoice_number: invoice.number
        });

        // Update subscription status
        const subscriptions = await base44.asServiceRole.entities.Subscription.filter({
          employer_email: customerEmail
        });

        if (subscriptions.length > 0) {
          await base44.asServiceRole.entities.Subscription.update(subscriptions[0].id, {
            payment_status: 'current',
            last_payment_date: new Date().toISOString().split('T')[0],
            last_payment_amount: invoice.amount_paid / 100
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerEmail = invoice.customer_email;

        // Update subscription to failed status
        const subscriptions = await base44.asServiceRole.entities.Subscription.filter({
          employer_email: customerEmail
        });

        if (subscriptions.length > 0) {
          await base44.asServiceRole.entities.Subscription.update(subscriptions[0].id, {
            payment_status: 'failed',
            suspension_reason: 'Payment failed'
          });
        }

        // Send alert notification
        await base44.asServiceRole.entities.Notification.create({
          user_email: customerEmail,
          type: 'payment_due',
          title: 'Payment Failed',
          message: 'Your payment could not be processed. Please update your payment method.',
          priority: 'urgent',
          status: 'unread'
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customer = await stripe.customers.retrieve(subscription.customer);
        const customerEmail = customer.email;

        // Update subscription status
        const subscriptions = await base44.asServiceRole.entities.Subscription.filter({
          employer_email: customerEmail
        });

        if (subscriptions.length > 0) {
          await base44.asServiceRole.entities.Subscription.update(subscriptions[0].id, {
            status: 'cancelled',
            payment_status: 'current'
          });
        }

        // Update employer profile
        const profiles = await base44.asServiceRole.entities.EmployerProfile.filter({
          user_email: customerEmail
        });

        if (profiles.length > 0) {
          await base44.asServiceRole.entities.EmployerProfile.update(profiles[0].id, {
            subscription_status: 'cancelled'
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});