# Stack

Every technology decision made for Olfaire, with rationale.

---

## App Framework

**Expo (Managed Workflow)**
Not bare React Native. Expo handles iOS and Android builds from a single codebase, OTA updates, signing certificates, and provisioning profiles. Every Olfaire feature (camera, calendar, notifications, location) is covered by Expo's library. No native modules needed.

EAS Build free tier: 30 builds/month. Upgrade to EAS Production ($29/mo) when builds become frequent.

---

## Language

**TypeScript**
Strict mode throughout. The schema types in `stores.md` map directly to Supabase table types — generate with `supabase gen types typescript` for full type safety end to end.

---

## Navigation

**Expo Router (file-based)**
File structure in `app/` maps directly to routes. Tab groups, auth groups, and modals all handled with folder conventions. See `sitemap.md` for the full file tree.

---

## State Management

**Zustand**
4 stores: `authStore`, `collectionStore`, `todayStore`, `layeringStore`. See `stores.md` for full architecture.

Persistence via `zustand/middleware` + `@react-native-async-storage/async-storage`. Only `authStore` and `collectionStore` persist — session and collection data cached for offline access.

No Redux. No Context API for global state. No `uiStore` — theme is in `authStore`, modals stay local, toasts use `sonner-native`.

---

## Backend

**Supabase**
PostgreSQL database, auth, real-time, and storage — all managed. No server to maintain.

- **Auth:** Apple Sign In + Google OAuth via Supabase Auth
- **Database:** PostgreSQL with RLS on all user-owned tables
- **Storage:** Two buckets — `user-uploads` (private) and `signature-cards` (private, public URL on share)
- **RPC functions:** `get_daily_layering_count`, `increment_wear_count`

Free tier handles early users (up to 50K MAU). Upgrade to Pro ($25/mo) when needed.

See `schema.md` for full table definitions and SQL.

---

## AI

**Claude API (Anthropic)**

| Feature | Model | Reason |
|---|---|---|
| Daily suggestion | `claude-haiku-4-5` | Simple call — cost optimisation |
| Morning opening line | `claude-haiku-4-5` | Simple generative copy |
| Signature naming | `claude-haiku-4-5` | Simple generative copy |
| Layering chemistry | `claude-sonnet-4-6` | Complex reasoning needed |
| Conflict detection | `claude-sonnet-4-6` | Complex reasoning needed |

All calls use the Lumi system prompt. See `prompts.md` for full prompt library and caching strategy.

Caching layering analysis in Supabase cuts API costs by 50–70% at scale — chemistry between two bottles never changes.

---

## Component Library

**React Native Reusables**
Universal shadcn/ui for React Native. Built with NativeWind v4. Provides Button, Card, Switch, TextField, Checkbox, Tabs and more.

**NativeWind v4** is a hard dependency — configure at project init, not as an afterthought.

Install: `npm install nativewind react-native-reusables`

Docs: https://reactnativereusables.com/docs

---

## Bottom Sheets (Modals)

**Gorhom Bottom Sheet**
React Native Reusables does not include a bottom sheet. Use Gorhom for all modal screens: `stock-update`, `premium-gate`, `signature-share`, `bottle-quick-add`.

Install: `npm install @gorhom/bottom-sheet react-native-reanimated react-native-gesture-handler`

---

## Toast Notifications

**sonner-native**
Port of Sonner for React Native. Replaces any need for global toast state in Zustand.

Install: `npm install sonner-native`

---

## Icons

**Tabler Icons** (`@tabler/icons-react-native`)
Stroke width 1 globally. Never change stroke for active states — only change color. See `icons.md` for full mapping.

Install: `npm install @tabler/icons-react-native`

---

## SVG

**react-native-svg**
Required for rendering the Lumi mascot component. The `<Lumi />` component in `brand.md` uses this.

Install: `npm install react-native-svg`

---

## Weather

**OpenWeather API**
Free tier: 1,000 calls/day — sufficient for MVP. City-level location only, no GPS precision needed. Exceeds free tier above ~1,000 DAU — upgrade to Startup plan (~$40/mo) at scale.

---

## Subscriptions

**RevenueCat**
In-app subscription management for the freemium gate. Handles Apple App Store and Google Play billing. Webhooks update `profiles.is_premium` and `profiles.premium_expires_at` in Supabase.

Set up at build start — required before any premium gate can function.

---

## Error Monitoring

**Sentry**
Free tier: 5K errors/month — sufficient for MVP.

Install: `npm install @sentry/react-native`

---

## Analytics

**PostHog**
Free tier: 1M events/month. Track: daily suggestion confirmed, layering analysis triggered, signature saved, premium gate shown, premium conversion.

---

## Fonts

**Google Fonts** (free, open license)
- Cormorant Garamond — display/serif
- DM Sans — interface/sans

Load via `expo-font` or `@expo-google-fonts`.

---

## Monthly Cost Summary

| Stage | Monthly cost |
|---|---|
| MVP (0–1K users) | ~$53–98/mo |
| At scale (5K–15K users) | ~$404–694/mo |

Biggest variable: Claude API. Controlled with response caching and model selection (Haiku for simple calls). See `prd.md` for full cost breakdown.
