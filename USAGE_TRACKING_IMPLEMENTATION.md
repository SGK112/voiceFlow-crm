# Usage-Based Pricing Implementation

## Summary

VoiceFlow CRM now uses **minute-based billing** that matches ElevenLabs' actual costs.

### ElevenLabs Pricing
- **$0.10/minute** for Conversational AI calls
- Billing is per minute (rounded up)
- Your platform passes through this cost + markup

---

## New Pricing Plans

| Plan | Monthly Fee | Included Minutes | Cost to You | Your Profit | Overage Rate |
|------|-------------|------------------|-------------|-------------|--------------|
| **Trial** | $0 | 30 min | $3 | -$3 | No overages |
| **Starter** | $99 | 200 min | $20 | $79 (80%) | $0.60/min |
| **Professional** | $299 | 1,000 min | $100 | $199 (67%) | $0.50/min |
| **Enterprise** | $999 | 5,000 min | $500 | $499 (50%) | $0.40/min |

### Overage Pricing
- **Starter**: $0.60/min (6x markup = $0.50 profit/min)
- **Professional**: $0.50/min (5x markup = $0.40 profit/min)
- **Enterprise**: $0.40/min (4x markup = $0.30 profit/min)

---

## Implementation Details

### 1. Database Models Updated

#### CallLog Model (`backend/models/CallLog.js`)
Added fields:
```javascript
{
  duration: Number,          // Duration in seconds
  durationMinutes: Number,   // Rounded up to nearest minute for billing
  cost: {
    costPerMinute: Number,   // ElevenLabs cost ($0.10)
    totalCost: Number,       // Total platform cost
    userCharge: Number       // What customer pays (if overage)
  }
}
```

#### Usage Model (`backend/models/Usage.js`)
New model for monthly tracking:
```javascript
{
  userId: ObjectId,
  month: String,              // "2025-01"
  plan: String,               // "trial", "starter", etc.
  minutesUsed: Number,        // Total minutes this month
  minutesIncluded: Number,    // Plan allowance
  minutesOverage: Number,     // minutesUsed - minutesIncluded
  callCount: Number,
  platformCost: Number,       // Total cost to you
  overageCharge: Number,      // What customer pays for overages
  costs: {
    elevenLabs: Number,
    twilio: Number
  }
}
```

**Key Methods**:
- `Usage.getOrCreateForUser(userId, user)` - Gets or creates usage for current month
- `usage.addCall(durationMinutes, cost)` - Updates usage after a call
- `Usage.calculateOverageCharge(plan, minutes)` - Calculates overage fees
- `Usage.getPlanLimits(plan)` - Returns plan configuration

### 2. Call Controller Updated

**Before Call** (`backend/controllers/callController.js`):
```javascript
// Check minute limits instead of call counts
const usage = await Usage.getOrCreateForUser(req.user._id, user);
const minutesRemaining = usage.minutesIncluded - usage.minutesUsed;

// Block trial users who run out
if (user.plan === 'trial' && minutesRemaining <= 0) {
  return res.status(403).json({
    message: 'You've used all your trial minutes. Upgrade to continue.'
  });
}

// Warn when low on minutes
if (minutesRemaining <= 10) {
  res.locals.warningMessage = `Only ${Math.floor(minutesRemaining)} minutes remaining`;
}
```

### 3. Webhook Updated

**After Call** (`backend/controllers/webhookController.js`):
```javascript
// Calculate costs when call completes
const durationSeconds = callData.duration || 0;
const durationMinutes = Math.ceil(durationSeconds / 60); // Round up
const costPerMinute = 0.10; // ElevenLabs rate
const totalCost = durationMinutes * costPerMinute;

// Save call with duration and cost
await CallLog.create({
  duration: durationSeconds,
  durationMinutes: durationMinutes,
  cost: {
    costPerMinute: costPerMinute,
    totalCost: totalCost,
    userCharge: 0 // Calculated during billing
  },
  // ... other fields
});

// Update monthly usage
const usage = await Usage.getOrCreateForUser(userId, user);
await usage.addCall(durationMinutes, { costPerMinute, totalCost });
```

---

## Usage Flow

### 1. User Initiates Call

```
User clicks "Call Lead"
  ↓
Check monthly usage: await Usage.getOrCreateForUser()
  ↓
Calculate remaining minutes: minutesIncluded - minutesUsed
  ↓
If trial && no minutes left → Block call
If paid plan && low minutes → Show warning
  ↓
Initiate call via ElevenLabs
  ↓
Create CallLog with status='initiated'
```

### 2. Call Completes (Webhook)

```
ElevenLabs sends webhook with call data
  ↓
Extract duration in seconds
  ↓
Calculate durationMinutes = Math.ceil(seconds / 60)
  ↓
Calculate cost = durationMinutes × $0.10
  ↓
Update CallLog with duration and cost
  ↓
Update Usage.minutesUsed += durationMinutes
  ↓
Calculate overage if minutesUsed > minutesIncluded
  ↓
Calculate overageCharge based on plan rate
```

### 3. Monthly Billing

```
Cron job runs on 1st of each month
  ↓
For each user:
  - Get Usage record for previous month
  - Calculate total: planPrice + overageCharge
  - Create Stripe invoice
  - Charge customer
  - Create new Usage record for new month
```

---

## Example Scenarios

### Scenario 1: Starter User Within Limits

**Plan**: Starter ($99/month, 200 minutes)
**Usage**: 150 minutes (30 calls × 5 min avg)

**Your Costs**:
- ElevenLabs: 150 min × $0.10 = $15
- Twilio: ~$3
- **Total**: ~$18

**Your Revenue**: $99
**Your Profit**: $81 (~82% margin)

---

### Scenario 2: Professional User with Overages

**Plan**: Professional ($299/month, 1,000 minutes)
**Usage**: 1,200 minutes (overage of 200 minutes)

**Your Costs**:
- ElevenLabs: 1,200 min × $0.10 = $120
- Twilio: ~$24
- **Total**: ~$144

**Customer Pays**:
- Base plan: $299
- Overage: 200 min × $0.50 = $100
- **Total**: $399

**Your Revenue**: $399
**Your Profit**: $255 (~64% margin)

---

### Scenario 3: Trial User

**Plan**: Trial ($0, 30 minutes)
**Usage**: 30 minutes exactly

**Your Costs**:
- ElevenLabs: 30 min × $0.10 = $3
- Twilio: ~$0.60
- **Total**: ~$3.60

**Your Revenue**: $0
**Your Loss**: -$3.60

**But**: This is customer acquisition cost. If they convert to Starter, you make $81/month.

---

## Dashboard Display (To Be Implemented)

### Usage Widget

```
┌──────────────────────────────────────┐
│ 📞 Call Usage This Month             │
├──────────────────────────────────────┤
│                                      │
│  ████████████░░░░░░░░  185/200 min  │
│                                      │
│  ⚠️ You've used 93% of your minutes  │
│                                      │
│  Calls: 38                          │
│  Avg duration: 4.9 min              │
│                                      │
│  [Upgrade to Professional] →        │
└──────────────────────────────────────┘
```

### Billing Preview

```
┌──────────────────────────────────────┐
│ 💳 Estimated Bill                    │
├──────────────────────────────────────┤
│ Starter Plan             $99.00     │
│ 200 minutes included                │
│                                      │
│ Current Usage: 185 minutes          │
│ Remaining: 15 minutes               │
│                                      │
│ Estimated Total:         $99.00     │
└──────────────────────────────────────┘
```

With overage:

```
┌──────────────────────────────────────┐
│ 💳 Estimated Bill                    │
├──────────────────────────────────────┤
│ Starter Plan             $99.00     │
│ 200 minutes included                │
│                                      │
│ Usage: 245 minutes                  │
│ Overage: 45 minutes                 │
│ @ $0.60/minute                      │
│ Overage Charge:          $27.00     │
│                                      │
│ ─────────────────────────────────  │
│ Estimated Total:        $126.00     │
│                                      │
│ 💡 Upgrade to Pro and save $6/month │
└──────────────────────────────────────┘
```

---

## Next Steps for Complete Implementation

### 1. Frontend Dashboard (Priority: High)

**Create Usage Dashboard Component**:
- `frontend/src/pages/UsageDashboard.jsx`
- Show minutes used/remaining
- Display current month usage
- Show cost breakdown
- Upgrade prompts when near limit

### 2. Billing Integration (Priority: High)

**Stripe Metered Billing**:
- Create Stripe subscription products
- Configure overage pricing
- Set up monthly invoice generation
- Report usage to Stripe API

**Implementation**:
```javascript
// backend/services/billingService.js
export async function reportUsageToStripe(userId, usage) {
  const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);

  // Report overage usage
  if (usage.minutesOverage > 0) {
    await stripe.subscriptionItems.createUsageRecord(
      subscription.items.data[0].id,
      {
        quantity: usage.minutesOverage,
        timestamp: Math.floor(Date.now() / 1000)
      }
    );
  }
}
```

### 3. Admin Analytics (Priority: Medium)

**Create Admin Dashboard**:
- Total revenue vs. costs
- Profit margins per plan
- Average usage per customer
- Conversion rates (trial → paid)

### 4. Usage Notifications (Priority: Medium)

**Email Alerts**:
- 80% of minutes used
- 100% of minutes used (paid plans)
- End of trial period
- Overage charges applied

### 5. Documentation Updates (Priority: High)

Update these files:
- ✅ `PRICING_MODEL.md` - Complete pricing breakdown (DONE)
- ⏳ `PLATFORM_ARCHITECTURE.md` - Update with minute-based pricing
- ⏳ `QUICK_START.md` - Update pricing tables
- ⏳ `README.md` - Update pricing overview

---

## Testing

### Test Scenarios

1. **Trial User**:
   - Create trial account
   - Make 30 minutes of calls
   - Attempt 31st minute → Should be blocked
   - Upgrade to Starter → Should work

2. **Starter User with Overages**:
   - Create Starter account
   - Make 200 minutes of calls
   - Make additional call → Should warn but allow
   - End of month → Should charge overage

3. **Professional User**:
   - Make 1,000 minutes of calls
   - Check usage dashboard shows correct remaining
   - Make additional calls → Calculate overage

4. **Webhook Testing**:
   - Send test webhook with various durations
   - Verify CallLog has correct durationMinutes
   - Verify Usage is updated correctly
   - Verify costs are calculated correctly

---

## Migration Plan

If you have existing users with call-count based limits:

```javascript
// Migration script
async function migrateToMinuteBased() {
  const users = await User.find({ plan: { $in: ['trial', 'starter', 'professional', 'enterprise'] } });

  for (const user of users) {
    // Get this month's calls
    const calls = await CallLog.find({
      userId: user._id,
      createdAt: { $gte: startOfMonth }
    });

    // Calculate total minutes used
    const minutesUsed = calls.reduce((total, call) => {
      return total + Math.ceil(call.duration / 60);
    }, 0);

    // Create usage record
    const usage = await Usage.getOrCreateForUser(user._id, user);
    usage.minutesUsed = minutesUsed;
    usage.callCount = calls.length;
    await usage.save();

    console.log(`Migrated ${user.email}: ${calls.length} calls, ${minutesUsed} minutes`);
  }
}
```

---

## Revenue Projections with New Model

### Conservative (100 customers, average 150 min/month)

**Breakdown**:
- 50 Starter users: 50 × $99 = $4,950
- 30 Pro users: 30 × $299 = $8,970
- 10 Enterprise: 10 × $999 = $9,990
- **Base MRR**: $23,910

**Costs**:
- Total minutes: (50×150) + (30×800) + (10×3500) = 66,500 min
- ElevenLabs: 66,500 × $0.10 = $6,650
- Twilio: ~$1,330
- Infrastructure: ~$500
- **Total Costs**: $8,480

**Profit**: $23,910 - $8,480 = **$15,430/month** (~65% margin)

### With Overages (10% of users exceed limits)

**Additional Revenue**:
- 5 Starter users × 50 overage min × $0.60 = $150
- 3 Pro users × 200 overage min × $0.50 = $300
- **Overage Revenue**: +$450

**Additional Costs**:
- 400 extra minutes × $0.10 = $40

**Additional Profit**: $450 - $40 = **+$410/month**

**Total Profit**: $15,430 + $410 = **$15,840/month**

---

## Summary

✅ **Implemented**:
- CallLog model tracks duration and costs
- Usage model tracks monthly minutes
- Call controller checks minute limits
- Webhook updates usage automatically
- Overage calculation logic

⏳ **Next Steps**:
1. Build frontend usage dashboard
2. Set up Stripe metered billing
3. Create billing cron job
4. Update documentation
5. Add email notifications

**Impact**:
- More accurate cost tracking
- Better profit margins (65-82%)
- Fair pricing for customers
- Scalable billing model
