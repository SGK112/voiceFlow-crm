# VoiceFlow CRM - Usage-Based Pricing Model

## ElevenLabs Cost Structure

Your platform uses **ElevenLabs Conversational AI**, which charges by the **minute of call time**:

### Your Cost (from ElevenLabs):
- **Creator/Pro Plan**: $0.10/minute
- **Business Plan (Annual)**: $0.08/minute
- **Enterprise**: < $0.08/minute (volume discounts)

**Your Current Plan**: Likely Creator or Pro at **$0.10/minute**

### What This Means:
- A 5-minute call costs YOU: $0.50
- A 10-minute call costs YOU: $1.00
- 100 minutes/month costs YOU: $10.00
- 1,000 minutes/month costs YOU: $100.00

---

## Recommended Pricing Strategy

### Option 1: Fixed Plans with Included Minutes (Recommended)

**Trial Plan** (Free, 14 days)
- **Included**: 30 minutes of calling ($3 cost to you)
- **Purpose**: Let users test the platform
- **After trial**: Auto-upgrade prompt or manual upgrade

**Starter Plan** ($99/month)
- **Included**: 200 minutes of calling ($20 cost to you)
- **Overage**: $0.60/minute (6x markup)
- **Best for**: 1-2 contractors, light usage
- **Your profit**: $79/month + overages

**Professional Plan** ($299/month)
- **Included**: 1,000 minutes of calling ($100 cost to you)
- **Overage**: $0.50/minute (5x markup)
- **Best for**: Small teams, moderate usage
- **Your profit**: $199/month + overages

**Enterprise Plan** ($999/month)
- **Included**: 5,000 minutes of calling ($500 cost to you)
- **Overage**: $0.40/minute (4x markup)
- **Best for**: Large operations, high volume
- **Your profit**: $499/month + overages

**Custom/Volume**: Contact for pricing (for 10,000+ min/month)

---

### Option 2: Pay-As-You-Go (Alternative)

**Base Platform Fee**: $49/month (access to dashboard, CRM, agents)

**Usage Pricing**:
- **First 500 minutes**: $0.50/minute (5x markup = $250)
- **501-2,000 minutes**: $0.40/minute (4x markup)
- **2,001-5,000 minutes**: $0.30/minute (3x markup)
- **5,000+ minutes**: $0.25/minute (2.5x markup)

**Example Bills**:
- 100 minutes: $49 + $50 = **$99**
- 500 minutes: $49 + $250 = **$299**
- 1,000 minutes: $49 + $250 + $200 = **$499**

---

### Option 3: Hybrid Model (Best Long-Term)

Combine both: **Base plan + included minutes + overage**

This is what most SaaS platforms use (Twilio, AWS, etc.)

---

## Cost Breakdown Analysis

### Scenario 1: 100 Customers on Starter Plan

**Assumptions**:
- 100 customers × $99/month = $9,900 MRR
- Average usage: 150 minutes/customer/month
- Total minutes: 15,000 minutes/month

**Your Costs**:
- ElevenLabs: 15,000 min × $0.10 = $1,500
- Twilio: ~$0.02/min × 15,000 = $300
- Email (Gmail): Free (or SendGrid $15)
- Hosting (Render): $25-50
- **Total Costs**: ~$1,850/month

**Your Profit**: $9,900 - $1,850 = **$8,050/month (~81% margin)**

---

### Scenario 2: Heavy Users (Average 180 minutes/month)

**Assumptions**:
- 100 customers on Starter ($99, includes 200 min)
- Average: 180 minutes/customer/month (within limit)
- Total: 18,000 minutes/month

**Your Costs**:
- ElevenLabs: 18,000 × $0.10 = $1,800
- Other services: ~$400
- **Total Costs**: ~$2,200/month

**Your Profit**: $9,900 - $2,200 = **$7,700/month (~78% margin)**

Still very profitable!

---

### Scenario 3: Mixed Customer Base

**Customer Breakdown**:
- 50 Starter ($99) = $4,950
- 30 Professional ($299) = $8,970
- 10 Enterprise ($999) = $9,990
- **Total MRR**: $23,910

**Usage**:
- Starter: 150 min/customer × 50 = 7,500 min
- Pro: 800 min/customer × 30 = 24,000 min
- Enterprise: 3,500 min/customer × 10 = 35,000 min
- **Total**: 66,500 minutes/month

**Your Costs**:
- ElevenLabs: 66,500 × $0.10 = $6,650
- Twilio: ~$1,330
- Other: ~$500
- **Total Costs**: ~$8,480/month

**Your Profit**: $23,910 - $8,480 = **$15,430/month (~65% margin)**

---

## Revenue Optimization Strategies

### 1. Tiered Pricing Encourages Upgrades

Set limits so users naturally want to upgrade:

- **Trial**: 30 minutes (enough to test, not enough to rely on)
- **Starter**: 200 minutes (~7 min/day for 30 days)
- **Professional**: 1,000 minutes (~33 min/day)
- **Enterprise**: 5,000 minutes (serious volume)

### 2. Overage Charges Create Revenue

Users who exceed limits pay premium rates:
- Starter overage: $0.60/min (you make $0.50 profit per min)
- Pro overage: $0.50/min (you make $0.40 profit per min)

### 3. Annual Discounts Lock in Revenue

Offer 2 months free for annual:
- Starter: $990/year (save $198) vs $1,188
- Pro: $2,990/year (save $598) vs $3,588
- Enterprise: $9,990/year (save $1,998) vs $11,988

You get cash upfront, reduce churn, and lock in customers.

### 4. Usage Analytics Drive Upgrades

Show users their usage:
```
Your Usage This Month:
━━━━━━━━━━━━━━━━━━━━━━ 185/200 minutes (93%)

⚠️ You're close to your limit!
Upgrade to Professional for 1,000 minutes/month →
```

### 5. Volume Discounts for Large Customers

Enterprise customers negotiating? Offer volume pricing:
- 10,000 min/month: $0.35/min = $3,500/month
- 20,000 min/month: $0.30/min = $6,000/month
- 50,000 min/month: $0.25/min = $12,500/month

You still make 2.5x-3.5x markup!

---

## Implementation Requirements

### 1. Call Duration Tracking

**Update CallLog model** to track:
```javascript
{
  duration: Number,          // Total call duration in seconds
  durationMinutes: Number,   // Rounded up to nearest minute
  costPerMinute: Number,     // ElevenLabs cost (e.g., 0.10)
  totalCost: Number,         // duration × costPerMinute
  userCharge: Number         // What customer pays (if overage)
}
```

### 2. Monthly Usage Tracking

**Create Usage model**:
```javascript
{
  userId: ObjectId,
  month: String,             // "2025-01"
  minutesUsed: Number,       // Total minutes this month
  minutesIncluded: Number,   // Plan allowance
  minutesOverage: Number,    // minutesUsed - minutesIncluded
  overageCharge: Number,     // minutesOverage × overageRate
  totalCost: Number          // Platform cost (ElevenLabs + Twilio)
}
```

### 3. Plan Limits Enforcement

Before initiating call:
```javascript
const usage = await Usage.findOne({
  userId,
  month: getCurrentMonth()
});

const minutesRemaining = user.plan.minutesIncluded - usage.minutesUsed;

if (minutesRemaining <= 0 && user.plan.allowOverage === false) {
  throw new Error('Monthly minute limit reached. Please upgrade.');
}

if (minutesRemaining <= 10) {
  // Warn user: "Only 10 minutes remaining this month"
}
```

### 4. Billing Integration

**Stripe Metered Billing**:
- Report usage to Stripe monthly
- Stripe automatically charges overages
- User sees itemized bill

**Example Bill**:
```
VoiceFlow CRM - Invoice for January 2025

Professional Plan         $299.00
Included minutes: 1,000

Usage Charges:
- 1,245 minutes used
- 245 overage minutes × $0.50   $122.50

Total Due:                $421.50
```

---

## Recommended Initial Pricing

Start with **Option 1: Fixed Plans with Included Minutes**

### Why?
1. **Predictable Revenue**: Monthly recurring revenue
2. **Simple to Understand**: Users know what they pay
3. **Profitable**: High margins on base plans
4. **Upsell Opportunity**: Overages encourage upgrades
5. **Industry Standard**: Same model as Twilio, AWS, etc.

### Pricing Table:

| Plan | Price | Included Minutes | Cost to You | Profit | Margin |
|------|-------|------------------|-------------|---------|--------|
| Trial | $0 | 30 min | $3 | -$3 | - |
| Starter | $99 | 200 min | $20 | $79 | 80% |
| Professional | $299 | 1,000 min | $100 | $199 | 67% |
| Enterprise | $999 | 5,000 min | $500 | $499 | 50% |

**Overage Rates**:
- Starter: $0.60/min (cost: $0.10, profit: $0.50)
- Pro: $0.50/min (cost: $0.10, profit: $0.40)
- Enterprise: $0.40/min (cost: $0.10, profit: $0.30)

---

## Competitive Analysis

### Your Pricing vs. Competitors

**Direct Competitors** (AI calling platforms):
- **Bland.ai**: $0.12-0.20/minute (higher than yours)
- **Vapi.ai**: $0.10-0.15/minute (similar)
- **Synthflow**: $99-499/month (similar model)

**Your Advantage**:
- **All-in-one CRM**: Competitors often need separate CRM
- **Pre-built agents**: Save setup time
- **Contractor-focused**: Specific templates for the industry

### Value Proposition

**What customers pay elsewhere**:
- ElevenLabs direct: $0.10/min (but no CRM, no management)
- Twilio + ElevenLabs DIY: $0.12/min + dev time
- Traditional auto-dialers: $100-500/month + per-minute fees

**Your bundle**:
- Voice AI ($0.10/min cost to you)
- CRM (lead management, analytics)
- Pre-built agents (saves hours of setup)
- Phone service (Twilio included)
- Email automation (included)
- **All for $99-999/month**

**You're competitively priced and offering more value!**

---

## Next Steps

1. **Update Database Models**:
   - Add `minutesIncluded` to plan configs
   - Add `duration` tracking to CallLog
   - Create Usage tracking model

2. **Implement Usage Tracking**:
   - Track call duration from ElevenLabs webhooks
   - Calculate monthly usage per user
   - Enforce limits before calls

3. **Update Frontend**:
   - Show usage dashboard
   - Display "X/Y minutes used this month"
   - Warn when approaching limit
   - Upgrade prompts

4. **Set Up Billing**:
   - Configure Stripe products with metered billing
   - Implement overage reporting
   - Monthly invoice generation

5. **Update Marketing**:
   - Pricing page with minute allocations
   - Usage calculator ("How many calls can I make?")
   - ROI calculator ("Save $X vs hiring a receptionist")

---

## FAQs for Your Sales Page

**Q: How many calls can I make per month?**
A: It depends on call length! Starter includes 200 minutes, which is approximately:
- 40 calls × 5 minutes each
- 20 calls × 10 minutes each
- Adjust based on your typical call length

**Q: What happens if I go over my minutes?**
A: No worries! We'll send you a notification when you reach 80% of your limit. You can either upgrade your plan or pay a small overage fee of $0.60/minute (Starter) or $0.50/minute (Professional).

**Q: Can I see my usage in real-time?**
A: Yes! Your dashboard shows exactly how many minutes you've used this month and how many you have remaining.

**Q: Do unused minutes roll over?**
A: Minutes reset each month, but you can upgrade or downgrade anytime. If you consistently use less, consider downgrading to save money!

**Q: How long is the average call?**
A: Most lead qualification calls are 3-7 minutes. Appointment booking calls are typically 5-10 minutes.

---

## Bottom Line

**Recommended Pricing** (Option 1):
- **Starter**: $99/month (200 minutes included)
- **Professional**: $299/month (1,000 minutes included)
- **Enterprise**: $999/month (5,000 minutes included)

**Your Margins**:
- 65-80% profit margin
- Scalable as you grow
- Competitive with market rates
- Simple for customers to understand

**Implementation Priority**: High - This affects your entire revenue model!
