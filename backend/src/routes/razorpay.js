import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', notes } = req.body;

    const minAmount = currency === 'USD' ? 50 : 100;

    if (!amount || amount < minAmount) {
      return res.status(400).json({ 
        error: `Amount must be at least ${minAmount} cents (USD) or 100 paise (INR)` 
      });
    }

    const orderNotes = {};
    if (notes && typeof notes === 'object') {
      if (notes.user_id) orderNotes.user_id = String(notes.user_id).slice(0, 100);
      if (notes.plan) orderNotes.plan = String(notes.plan).slice(0, 20);
      if (notes.billing) orderNotes.billing = String(notes.billing).slice(0, 20);
    }

    const options = {
      amount: amount,
      currency: currency.toUpperCase(),
      receipt: `receipt_${Date.now()}`,
      notes: orderNotes,
    };

    const order = await razorpay.orders.create(options);

    res.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error('Razorpay create order error:', error);
    if (error.statusCode === 401) {
      return res.status(401).json({ error: 'Razorpay authentication failed' });
    }
    res.status(500).json({ error: 'Failed to create order' });
  }
});

router.post('/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ error: 'Signature verification failed' });
    }

    const order = await razorpay.orders.fetch(razorpay_order_id);
    const notes = order.notes || {};
    const userId = notes.user_id;
    const plan = notes.plan;
    const billing = notes.billing || 'monthly';

    if (userId && plan && ['pro', 'elite'].includes(plan)) {
      try {
        const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
          user_metadata: {
            subscription_tier: plan,
            billing_cycle: billing,
            subscription_date: new Date().toISOString(),
            razorpay_payment_id,
            razorpay_order_id,
          }
        });

        if (error) {
          console.error('Failed to update tier after payment:', error);
        } else {
          console.log(`Tier updated: ${userId} -> ${plan} (${billing})`);
        }
      } catch (err) {
        console.error('Tier update error:', err);
      }
    }

    res.json({ success: true, message: 'Payment verified successfully' });
  } catch (error) {
    console.error('Razorpay verify error:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

router.post('/webhook/razorpay', express.raw({ type: 'application/json' }), async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('RAZORPAY_WEBHOOK_SECRET not configured');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  const signature = req.headers['x-razorpay-signature'];
  if (!signature) {
    return res.status(400).json({ error: 'Missing webhook signature' });
  }

  const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(body)
    .digest('hex');

  if (signature !== expectedSignature) {
    return res.status(400).json({ error: 'Invalid webhook signature' });
  }

  let event;
  try {
    event = JSON.parse(body);
  } catch {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }

  if (event.event === 'payment.captured') {
    const payment = event.payload.payment?.entity;
    if (!payment) {
      return res.json({ received: true });
    }

    const notes = payment.notes || {};
    const userId = notes.user_id;
    const plan = notes.plan;
    const billing = notes.billing || 'monthly';

    if (!userId || !plan || !['pro', 'elite'].includes(plan)) {
      console.warn('Webhook missing required notes:', { userId, plan });
      return res.json({ received: true });
    }

    try {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: {
          subscription_tier: plan,
          billing_cycle: billing,
          subscription_date: new Date().toISOString(),
          razorpay_payment_id: payment.id,
          razorpay_order_id: payment.order_id,
        }
      });

      if (error) {
        console.error('Failed to update tier from webhook:', error);
        return res.status(500).json({ error: 'Failed to update subscription' });
      }

      console.log(`Tier updated via webhook: ${userId} -> ${plan} (${billing})`);
    } catch (err) {
      console.error('Webhook tier update error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  res.json({ received: true });
});

export default router;
