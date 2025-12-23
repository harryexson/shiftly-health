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

    const { shiftId, feeAmount, description, successUrl, cancelUrl } = await req.json();

    if (!feeAmount || feeAmount <= 0) {
      return Response.json({ error: 'Invalid fee amount' }, { status: 400 });
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

    // Create one-time payment checkout for platform fee
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Shiftly Health Platform Fee',
              description: description || `Platform service fee for shift ${shiftId}`,
            },
            unit_amount: Math.round(feeAmount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      success_url: successUrl || `https://shiftlyhealth.com/EmployerDashboard?fee_payment=success&shift=${shiftId}`,
      cancel_url: cancelUrl || `https://shiftlyhealth.com/BillingCenter?fee_payment=cancelled`,
      metadata: {
        user_email: user.email,
        shift_id: shiftId,
        fee_type: 'platform_fee'
      }
    });

    return Response.json({ 
      sessionId: session.id, 
      url: session.url 
    });
  } catch (error) {
    console.error('Platform fee checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});