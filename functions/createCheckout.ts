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

    const { plan, successUrl, cancelUrl } = await req.json();

    // Define subscription plans
    const plans = {
      basic: {
        name: 'Basic Plan',
        price: 9900, // $99/month in cents
        interval: 'month'
      },
      premium: {
        name: 'Premium Plan',
        price: 19900, // $199/month in cents
        interval: 'month'
      },
      enterprise: {
        name: 'Enterprise Plan',
        price: 49900, // $499/month in cents
        interval: 'month'
      }
    };

    const selectedPlan = plans[plan];
    if (!selectedPlan) {
      return Response.json({ error: 'Invalid plan selected' }, { status: 400 });
    }

    // Check if customer already exists
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1
    });

    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      // Create new customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.full_name,
        metadata: {
          user_email: user.email,
          platform: 'shiftly_health'
        }
      });
      customerId = customer.id;
    }

    // Create checkout session for subscription
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Shiftly Health - ${selectedPlan.name}`,
              description: `Healthcare staffing platform ${selectedPlan.name.toLowerCase()}`,
            },
            unit_amount: selectedPlan.price,
            recurring: {
              interval: selectedPlan.interval
            }
          },
          quantity: 1,
        },
      ],
      success_url: successUrl || `${req.headers.get('origin')}/EmployerDashboard?payment=success`,
      cancel_url: cancelUrl || `${req.headers.get('origin')}/Billing?payment=cancelled`,
      metadata: {
        user_email: user.email,
        plan: plan
      }
    });

    return Response.json({ 
      sessionId: session.id, 
      url: session.url 
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});