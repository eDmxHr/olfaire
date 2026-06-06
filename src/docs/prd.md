# PRD

**Version:** 1.0 — May 2026
**Status:** Pre-build
**Build type:** Solo · Side project · React Native

---

## Vision

Olfaire is a personal fragrance intelligence app that turns any perfume collection into a curated, daily experience — powered by AI, guided by Lumi.

**Problem:** Collectors own beautiful bottles they rarely wear intelligently — no guidance on when, how, or what to combine.

**Solution:** AI-powered daily picks, deep layering chemistry, and a social layer — all personalised to what's actually on your shelf.

**Differentiator:** Layering chemistry done right — note interaction science that anyone can act on, not surface-level suggestions.

---

## Target Users

### Primary — The Collector
25–42 · Urban · High income. Owns 15–60 bottles. Reads Fragrantica. Frustrated that half her shelf never gets worn. Wants a rotation that feels intentional. Will pay for premium on day one if the quality is there.

### Secondary — The Explorer
22–35 · Growing collection. Owns 5–15 bottles. Wants to understand layering but doesn't know where to start. Craves a trusted guide. As her collection grows, so does Olfaire's value.

### Tertiary — The Social One
20–38 · Trend-aware. Owns 8–25 bottles. Follows fragrance creators. Loves sharing her rotation. Drives organic growth through shareable signature cards.

---

## Feature Map

### Phase 1 — MVP (Months 1–4)

- **Collection Manager** — Auto-fill from fragrance database. Manual fallback. Notes pyramid, concentration, quantity tracking.
- **Lumi Onboarding** — Conversational setup. Skin type, lifestyle, climate. Builds preference profile.
- **Daily Suggestion** — Morning mood check-in (5 scent moods). One pick per day with Lumi's reasoning.
- **Layering Explorer** — Pick 2 bottles. AI explains note chemistry, application order, ratio, body placement.
- **Shareable Signature Card** — Save a layering combo. Generate a branded image card to share.
- **Wishlist** — Bottles the user wants to own. Lumi identifies collection gaps and suggests fills.
- **Settings** — Account, notifications, skin type, lifestyle, theme (light/dark/system), subscription, sign out, delete account.

### Phase 2 — Growth (Months 5–9)

- **Weather Integration** — Real-time weather shapes daily pick.
- **Calendar Sync** — Read upcoming events (opt-in, read-only).
- **Weekly Rotation Planner** — 7-day editorial layout.
- **Fragrance DNA Profile** — Radar chart of note preferences.
- **Social Profiles + Following** — Public collection, DNA, signatures. Follow others. Steal a combo.
- **Next Buy / Discovery** — Collection gap analysis by season and occasion. Lumi suggests what to buy next.

### Phase 3 — Scale (Months 10+)

- **Barcode Scanning** — EAN scan to auto-add bottles.
- **Community Ratings** — Crowd-sourced layering pair scores.
- **Morning Ritual Push** — Optional daily notification in Lumi's voice.
- **Low Stock Tracking** — Mark a bottle as running low. Lumi deprioritises it automatically.

---

## Monetisation

**Free tier:** Up to 10 perfumes, daily suggestion, basic layering (3 uses/day), 1 saved signature, shareable cards.

**Olfaire Premium features:**
- Unlimited collection
- Unlimited layering chemistry
- Full chemistry breakdown + application guide
- Unlimited saved signatures
- Weekly rotation planner
- Fragrance DNA profile
- Morning ritual push notification
- Early access to new features

**Early adopter pricing** (first 500 subscribers): $2.99/month · $29.99/year · $79.99 lifetime.

**Regular pricing:** $4.99/month · $39.99/year (33% saving).

Pricing is managed in App Store Connect and RevenueCat — no app changes needed to switch. Existing subscribers keep their grandfathered rate when prices update.

---

## Success Metrics

| Metric | Target |
|---|---|
| Day 7 retention | 40% |
| Day 30 retention | 20% |
| Avg bottles per user | 8+ |
| Layering uses/week | 3× |
| Premium conversion | 8% |
| NPS | 60+ |

---

## Risks

| Risk | Mitigation |
|---|---|
| Fragrance DB gaps | Manual entry fallback + AI inference. Community contributions Phase 3. |
| Claude API costs spike | Response caching, Haiku for simple calls, rate-limit free tier. |
| App Store rejection | Build in 2-week buffer. Follow guidelines carefully before submission. |
| Layering chemistry accuracy | Lumi frames all chemistry as suggestions not facts. Beta test with fragrance users first. |
| Low conversion free → paid | Paywall sits at the right point. Free tier is useful but clearly limited. |
| Solo burnout | Strict 4-month MVP scope. Ship something real, then iterate. |
