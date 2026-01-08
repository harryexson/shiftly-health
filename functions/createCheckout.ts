import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@17.4.0';

const stripe = new Stripe(Deno.env.get("STRIPE_API_KEY"));

// Regional pricing in local currency
const regionalPricing = {
  USD: {
    basic: 9900,    // $99/month
    premium: 19900, // $199/month
    enterprise: 49900 // $499/month
  },
  CAD: {
    basic: 13500,   // $135 CAD/month
    premium: 26900, // $269 CAD/month
    enterprise: 67500 // $675 CAD/month
  },
  EUR: {
    basic: 9200,    // €92/month
    premium: 18400, // €184/month
    enterprise: 46000 // €460/month
  },
  GBP: {
    basic: 7900,    // £79/month
    premium: 15800, // £158/month
    enterprise: 39500 // £395/month
  }
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan, currency = 'USD', successUrl, cancelUrl } = await req.json();

    // Validate currency
    if (!['USD', 'CAD', 'EUR', 'GBP'].includes(currency)) {
      return Response.json({ error: 'Invalid currency' }, { status: 400 });
    }

    // Get pricing for selected currency
    const pricing = regionalPricing[currency];
    if (!pricing || !pricing[plan]) {
      return Response.json({ error: 'Invalid plan selected' }, { status: 400 });
    }

    const selectedPrice = pricing[plan];

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
            currency: currency.toLowerCase(),
            product_data: {
              name: `Shiftly Health - ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
              description: `Healthcare staffing platform ${plan} subscription`,
            },
            unit_amount: selectedPrice,
            recurring: {
              interval: 'month'
            }
          },
          quantity: 1,
        },
      ],
      success_url: successUrl || `https://shiftlyhealth.com/EmployerDashboard?payment=success`,
      cancel_url: cancelUrl || `https://shiftlyhealth.com/Billing?payment=cancelled`,
      metadata: {
        user_email: user.email,
        plan: plan,
        currency: currency
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