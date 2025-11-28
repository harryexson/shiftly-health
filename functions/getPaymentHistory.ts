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

    // Find customer by email
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1
    });

    if (customers.data.length === 0) {
      return Response.json({ payments: [] });
    }

    const customerId = customers.data[0].id;

    // Get payment intents
    const paymentIntents = await stripe.paymentIntents.list({
      customer: customerId,
      limit: 50
    });

    // Get invoices for subscriptions
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: 50
    });

    const payments = [
      ...paymentIntents.data.map(pi => ({
        id: pi.id,
        type: 'payment',
        amount: pi.amount / 100,
        currency: pi.currency,
        status: pi.status,
        description: pi.description || 'Platform Fee',
        created: new Date(pi.created * 1000).toISOString(),
        metadata: pi.metadata
      })),
      ...invoices.data.map(inv => ({
        id: inv.id,
        type: 'invoice',
        amount: inv.amount_paid / 100,
        currency: inv.currency,
        status: inv.status,
        description: inv.lines.data[0]?.description || 'Subscription',
        created: new Date(inv.created * 1000).toISOString(),
        invoicePdf: inv.invoice_pdf,
        hostedInvoiceUrl: inv.hosted_invoice_url
      }))
    ].sort((a, b) => new Date(b.created) - new Date(a.created));

    return Response.json({ payments });
  } catch (error) {
    console.error('Payment history error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});