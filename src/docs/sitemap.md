# Sitemap

Navigation architecture. Expo Router file-based routing.

---

## Bottom Navigation — 4 Tabs

| Tab | Icon | Route |
|---|---|---|
| Today | `IconSparkles` | `/today` |
| Layer | `IconLayersIntersect` | `/layer` |
| Collection | `IconBottle` | `/collection` |
| Profile | `IconUserCircle` | `/profile` |

Active state: change `color` to `colors.amber`. Never change `stroke`.

---

## Full Route Map

### Auth (unauthenticated only)
```
/auth/splash
/auth/sign-in
```

### Onboarding (first-run only, skipped if onboarding_completed = true)
```
/onboarding/meet-lumi
/onboarding/lifestyle
/onboarding/preferences
/onboarding/add-perfume
/onboarding/ready
```

### Today tab
```
/today              ← morning check-in (index)
/today/pick         ← daily pick
/today/wearing      ← confirmed wearing
/today/week         ← week view
```

### Layer tab
```
/layer              ← pick bottles (index)
/layer/analysis     ← chemistry analysis
/layer/application  ← application guide
/layer/conflict     ← conflict warning
/layer/signature    ← save signature
```

### Collection tab
```
/collection              ← overview (index)
/collection/[id]         ← bottle detail (dynamic)
/collection/add          ← add perfume
/collection/dna          ← fragrance DNA
/collection/low-stock    ← low stock alert
/collection/wishlist     ← wishlist
```

### Profile tab
```
/profile              ← my profile (index)
/profile/signatures   ← my signatures
/profile/settings     ← settings
```

### Modals (global, any tab)
```
/modals/bottle-quick-add
/modals/signature-share
/modals/stock-update
/modals/premium-gate
```

### Phase 2 (structure now, activate later)
```
/today/week-rotation
/profile/[username]
/profile/following
/profile/discover
/profile/explore
/modals/calendar-sync
/modals/barcode-scan
```

---

## Deep Links

| Deep link | Destination | Trigger |
|---|---|---|
| `olfaire://today` | Today check-in | Morning push notification |
| `olfaire://today/pick` | Daily pick | Mood already selected today |
| `olfaire://layer` | Layer index | Layering teaser on wearing screen |
| `olfaire://layer/analysis?a=[id]&b=[id]` | Chemistry analysis | Pre-selected pair |
| `olfaire://collection/[id]` | Bottle detail | Tap bottle in daily log |
| `olfaire://collection/add` | Add perfume | + button in overview |
| `olfaire://collection/low-stock` | Low stock alert | Amber counter tap |
| `olfaire://profile/signatures/[id]` | Specific signature | Phase 2 — shared card link |

### Notification tap routing logic
```typescript
// On olfaire://today tap:
if (!todayLog) → /today
else if (todayLog.worn_fragrance_id) → /today/wearing
else if (todayLog.mood) → /today/pick
else → /today
```

---

## Expo Router File Structure

```
app/
  _layout.tsx                ← root layout · auth check · redirect logic
  (auth)/
    splash.tsx
    sign-in.tsx
  (onboarding)/
    meet-lumi.tsx
    lifestyle.tsx
    preferences.tsx
    add-perfume.tsx
    ready.tsx
  (tabs)/
    _layout.tsx              ← bottom tab bar config · 4 tabs
    today/
      index.tsx              ← morning check-in
      pick.tsx
      wearing.tsx
      week.tsx
    layer/
      index.tsx              ← pick bottles
      analysis.tsx
      application.tsx
      conflict.tsx
      signature.tsx
    collection/
      index.tsx
      [id].tsx               ← dynamic bottle detail route
      add.tsx
      dna.tsx
      low-stock.tsx
      wishlist.tsx
    profile/
      index.tsx
      signatures.tsx
      settings.tsx
  modals/
    bottle-quick-add.tsx
    signature-share.tsx
    stock-update.tsx
    premium-gate.tsx
```
