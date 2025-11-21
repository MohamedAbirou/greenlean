# Stripe Webhook Testing Guide

## Overview
Test Stripe webhooks locally using Stripe CLI to ensure payment flows work correctly before deploying to production.

---

## 1. Install Stripe CLI

### macOS (Homebrew):
```bash
brew install stripe/stripe-cli/stripe
```

### Linux:
```bash
# Download latest release
wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_linux_amd64.tar.gz

# Extract
tar -xvf stripe_linux_amd64.tar.gz

# Move to PATH
sudo mv stripe /usr/local/bin/

# Verify installation
stripe --version
```

### Windows:
```bash
# Using Scoop
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe

# Or download from: https://github.com/stripe/stripe-cli/releases/latest
```

---

## 2. Login to Stripe CLI

```bash
stripe login
```

This will:
1. Open browser for authentication
2. Link CLI to your Stripe account
3. Save credentials locally

Verify login:
```bash
stripe config --list
```

---

## 3. Forward Webhooks to Local Server

### Start your local server first:

**Terminal 1 - Backend (if using API):**
```bash
cd greenlean
npm run dev

# Server should be running on http://localhost:5173 (or your port)
```

**Terminal 2 - Stripe CLI:**
```bash
# Forward webhooks to your local endpoint
stripe listen --forward-to localhost:5173/api/webhooks/stripe

# You should see:
# > Ready! Your webhook signing secret is whsec_xxxxx (^C to quit)
```

**Copy the webhook signing secret** (`whsec_xxxxx`) - you'll need it!

---

## 4. Configure Webhook Signing Secret

Add to your `.env` file:

```env
# Stripe Webhook Secret (from stripe listen command)
VITE_STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

**For Production:**
- Go to Stripe Dashboard → Developers → Webhooks
- Add endpoint: `https://greenlean.app/api/webhooks/stripe`
- Copy the signing secret
- Add to Vercel environment variables

---

## 5. Stripe Webhook Handler

**File:** `src/pages/api/webhooks/stripe.ts` (or your webhook handler location)

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

const webhookSecret = import.meta.env.VITE_STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return new Response('No signature', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return new Response('Invalid signature', { status: 400 });
  }

  // Handle different event types
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response('Webhook processed', { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response('Webhook processing failed', { status: 500 });
  }
}

// Handler functions
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout completed:', session.id);

  // Update database with subscription info
  const userId = session.metadata?.user_id;
  const subscriptionId = session.subscription as string;

  if (userId && subscriptionId) {
    // Update user's subscription in database
    await updateUserSubscription(userId, {
      stripe_subscription_id: subscriptionId,
      subscription_status: 'active',
      subscription_plan: session.metadata?.plan || 'premium',
    });

    // Send welcome email
    // await emailService.sendWelcomeEmail(...);
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('Subscription created:', subscription.id);

  const customerId = subscription.customer as string;

  // Update database
  await updateSubscriptionStatus(customerId, {
    status: subscription.status,
    current_period_end: new Date(subscription.current_period_end * 1000),
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Subscription updated:', subscription.id);

  const customerId = subscription.customer as string;

  // Update database
  await updateSubscriptionStatus(customerId, {
    status: subscription.status,
    current_period_end: new Date(subscription.current_period_end * 1000),
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Subscription deleted:', subscription.id);

  const customerId = subscription.customer as string;

  // Update database
  await updateSubscriptionStatus(customerId, {
    status: 'cancelled',
    cancelled_at: new Date(),
  });

  // Send cancellation email
  // await emailService.sendCancellationEmail(...);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Payment succeeded:', invoice.id);

  const customerId = invoice.customer as string;

  // Update payment history
  await recordPayment(customerId, {
    amount: invoice.amount_paid / 100,
    status: 'succeeded',
    invoice_id: invoice.id,
  });

  // Send receipt email
  // await emailService.sendReceiptEmail(...);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Payment failed:', invoice.id);

  const customerId = invoice.customer as string;

  // Record failed payment
  await recordPayment(customerId, {
    amount: invoice.amount_due / 100,
    status: 'failed',
    invoice_id: invoice.id,
    error: invoice.last_payment_error?.message,
  });

  // Send payment failed email
  // await emailService.sendPaymentFailedEmail(...);

  // Send admin alert
  // await alertService.critical('Payment Failed', ...);
}

// Database helper functions (implement based on your DB)
async function updateUserSubscription(userId: string, data: any) {
  // Update in Supabase or your database
}

async function updateSubscriptionStatus(customerId: string, data: any) {
  // Update in Supabase or your database
}

async function recordPayment(customerId: string, data: any) {
  // Record in database
}
```

---

## 6. Testing Workflow

### Step 1: Start Services

**Terminal 1 - App:**
```bash
npm run dev
```

**Terminal 2 - Stripe CLI:**
```bash
stripe listen --forward-to localhost:5173/api/webhooks/stripe
```

### Step 2: Trigger Test Events

**Terminal 3 - Trigger Events:**

```bash
# Test successful checkout
stripe trigger checkout.session.completed

# Test subscription created
stripe trigger customer.subscription.created

# Test subscription updated
stripe trigger customer.subscription.updated

# Test subscription deleted
stripe trigger customer.subscription.deleted

# Test payment succeeded
stripe trigger invoice.payment_succeeded

# Test payment failed
stripe trigger invoice.payment_failed
```

### Step 3: Verify Events

Check Terminal 1 (app logs) for:
```
Checkout completed: cs_test_xxxxx
Subscription created: sub_xxxxx
Payment succeeded: in_xxxxx
```

Check Terminal 2 (Stripe CLI) for:
```
--> checkout.session.completed [200]
--> customer.subscription.created [200]
--> invoice.payment_succeeded [200]
```

**200 = Success, 400/500 = Error**

---

## 7. Test Specific Scenarios

### Scenario 1: New Subscription Flow

```bash
# 1. Create checkout session (in your app UI or via API)
# 2. Complete checkout
stripe trigger checkout.session.completed

# 3. Verify subscription created
stripe trigger customer.subscription.created

# 4. Verify first payment succeeded
stripe trigger invoice.payment_succeeded
```

**Expected database changes:**
- User's `subscription_status` = 'active'
- User's `stripe_subscription_id` = 'sub_xxxxx'
- Payment record created

### Scenario 2: Subscription Cancellation

```bash
# Cancel subscription
stripe trigger customer.subscription.deleted
```

**Expected database changes:**
- User's `subscription_status` = 'cancelled'
- User's `cancelled_at` = current timestamp
- Cancellation email sent

### Scenario 3: Payment Failure

```bash
# Trigger payment failure
stripe trigger invoice.payment_failed
```

**Expected outcomes:**
- Payment failure recorded in database
- Alert sent to admins (Slack)
- Payment failed email sent to user

### Scenario 4: Subscription Upgrade/Downgrade

```bash
# Update subscription
stripe trigger customer.subscription.updated
```

**Expected database changes:**
- User's `subscription_plan` updated
- User's `subscription_status` updated

---

## 8. Debug Webhook Issues

### Issue: Webhook returns 400 (Bad Request)

**Check:**
1. Signature verification failing
2. Webhook secret mismatch

**Solution:**
```bash
# Get new webhook secret
stripe listen --forward-to localhost:5173/api/webhooks/stripe --print-secret

# Update .env with new secret
```

### Issue: Webhook returns 500 (Server Error)

**Check:**
1. Handler function throwing error
2. Database connection issues

**Solution:**
```typescript
// Add detailed logging
console.log('Event type:', event.type);
console.log('Event data:', JSON.stringify(event.data.object, null, 2));

// Add try/catch with error details
try {
  await handleCheckoutCompleted(session);
} catch (error) {
  console.error('Handler error:', error);
  throw error;
}
```

### Issue: Webhook not receiving events

**Check:**
1. Stripe CLI running?
2. Correct endpoint URL?
3. Server running?

**Solution:**
```bash
# Check Stripe CLI status
stripe listen --print-secret

# Check server is accessible
curl http://localhost:5173/api/webhooks/stripe
# Should return 400 or 405 (method not allowed), not connection error
```

---

## 9. Testing with Real Stripe Test Cards

Use Stripe test cards to trigger real webhooks:

### Successful Payment:
```
Card: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits
```

### Card Declined:
```
Card: 4000 0000 0000 0002
```

### Insufficient Funds:
```
Card: 4000 0000 0000 9995
```

### Payment Requires Authentication (3D Secure):
```
Card: 4000 0025 0000 3155
```

### Test Flow:
1. Go to your checkout page
2. Use test card
3. Complete purchase
4. Watch webhooks in Stripe CLI terminal
5. Verify database updates
6. Check email sends (if configured)

---

## 10. Verify Signature Validation

**Critical security test:**

```bash
# Send invalid webhook (should be rejected)
curl -X POST http://localhost:5173/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -H "stripe-signature: invalid" \
  -d '{"type":"customer.subscription.created"}'

# Expected: 400 Bad Request (Invalid signature)
```

If this returns 200, **your signature verification is broken!**

---

## 11. Production Webhook Setup

### Step 1: Deploy to Production
```bash
git push origin main
# Wait for Vercel deployment
```

### Step 2: Add Webhook Endpoint in Stripe

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Endpoint URL: `https://greenlean.app/api/webhooks/stripe`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click "Add endpoint"

### Step 3: Get Production Webhook Secret

1. Click on your new webhook endpoint
2. Click "Reveal" next to "Signing secret"
3. Copy the secret (starts with `whsec_`)
4. Add to Vercel:
   - Go to Vercel → Project Settings → Environment Variables
   - Add `VITE_STRIPE_WEBHOOK_SECRET` = your production secret

### Step 4: Test Production Webhooks

Use Stripe test mode in production:

```bash
# Send test event from Stripe dashboard
# Dashboard → Webhooks → Your endpoint → "Send test webhook"
```

Or trigger with Stripe CLI:
```bash
# Point to production endpoint
stripe listen --forward-to https://greenlean.app/api/webhooks/stripe
```

---

## 12. Monitoring Webhooks

### Stripe Dashboard

1. Go to [Developers → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click on your endpoint
3. View recent attempts:
   - ✅ Success (200)
   - ❌ Failed (400, 500)
   - ⏱️ Timeout

### Failed Webhook Handling

Stripe automatically retries failed webhooks:
- Immediate retry
- After 1 hour
- After 2 hours
- After 4 hours
- After 8 hours
- After 16 hours

**Best practice:** Implement idempotency to handle duplicate events.

```typescript
// Use Stripe event ID to prevent duplicate processing
const processedEvents = new Set<string>();

if (processedEvents.has(event.id)) {
  console.log('Event already processed:', event.id);
  return new Response('Event already processed', { status: 200 });
}

// Process event
await handleEvent(event);

// Mark as processed
processedEvents.add(event.id);

// Or use database:
await db.insert('processed_webhook_events').values({
  event_id: event.id,
  processed_at: new Date(),
});
```

---

## 13. Webhook Testing Checklist

### Development Testing:
- [ ] Stripe CLI installed and authenticated
- [ ] Local server running
- [ ] Webhook secret configured in `.env`
- [ ] Webhook handler returns 200 for all events
- [ ] Signature verification working
- [ ] All event handlers implemented
- [ ] Database updates working
- [ ] Email notifications working (if applicable)

### Production Testing:
- [ ] Webhook endpoint added in Stripe dashboard
- [ ] Production webhook secret in Vercel env vars
- [ ] Test event sent from Stripe dashboard (success)
- [ ] Real test payment completed successfully
- [ ] Failed payment handled correctly
- [ ] Subscription cancellation working
- [ ] Monitoring webhooks in Stripe dashboard

### Security Testing:
- [ ] Invalid signature rejected (400)
- [ ] Missing signature rejected (400)
- [ ] Duplicate events handled gracefully
- [ ] Only Stripe IPs allowed (optional firewall rule)

---

## 14. Common Issues & Solutions

### Issue: "No signatures found matching the expected signature"

**Cause:** Raw body not preserved (body parsing middleware)

**Solution:**
```typescript
// Ensure you use raw body for signature verification
const body = await request.text(); // Not request.json()!
```

### Issue: Events processed multiple times

**Cause:** No idempotency check

**Solution:** Implement event ID tracking (see section 12)

### Issue: Webhook timeouts

**Cause:** Handler taking too long (>30 seconds)

**Solution:** Process webhooks asynchronously
```typescript
// Acknowledge webhook immediately
response.status(200).send('Webhook received');

// Process asynchronously
processWebhook(event).catch(error => {
  console.error('Async webhook processing failed:', error);
});
```

---

## 15. Next Steps

1. ✅ Install Stripe CLI
2. ✅ Test locally with `stripe listen`
3. ✅ Implement all webhook event handlers
4. ✅ Test signature verification
5. ✅ Test all payment scenarios
6. ✅ Deploy to production
7. ✅ Add production webhook endpoint
8. ✅ Monitor webhook reliability

---

## Status: Ready to Test! ✅

Webhook handler template provided. Install Stripe CLI and start testing your payment flows locally before deploying to production.

**Testing locally ensures production webhooks work correctly!**
