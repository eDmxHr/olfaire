# Screens

Full screen inventory. All routes follow Expo Router file-based convention.

---

## Auth + Onboarding (first-run only)

| Route                     | Screen            | Notes                                               |
| ------------------------- | ----------------- | --------------------------------------------------- |
| `/auth/splash`            | Splash            | Lumi mark, wordmark, Begin CTA, Sign in link        |
| `/auth/sign-in`           | Sign In           | Apple Sign In, Google OAuth                         |
| `/onboarding/meet-lumi`   | Meet Lumi         | Lumi intro in chat bubble format                    |
| `/onboarding/lifestyle`   | Lifestyle Setup   | Occupation tiles, skin type selector. Progress 1/3. |
| `/onboarding/preferences` | Scent Preferences | Family chips, live DNA preview. Progress 2/3.       |
| `/onboarding/add-perfume` | Add First Perfume | Search + auto-fill, confirm bottle. Progress 3/3.   |
| `/onboarding/ready`       | Ready             | Collection summary, Lumi's first suggestion preview |

Onboarding skipped if `profiles.onboarding_completed = true`. Redirects to `/today`.

---

## Tab 1 — Today

| Route            | Screen              | Key elements                                                                  |
| ---------------- | ------------------- | ----------------------------------------------------------------------------- |
| `/today` (index) | Morning Check-in    | Lumi opening line, 5 mood cards, weather + calendar context pills             |
| `/today/pick`    | Daily Pick          | Dark suggestion card, notes pyramid, Wear / Suggest another CTAs              |
| `/today/wearing` | Confirmed · Wearing | Application tip, layering teaser, micro-rating (loved / neutral / disliked)   |
| `/today/week`    | Week View           | 7-day list, past wears marked, planned days faded, Friday intentionally empty |

**Navigation logic on notification tap:**

```
todayLog exists + worn_fragrance_id → /today/wearing
todayLog exists + mood only         → /today/pick
no todayLog or no mood              → /today (check-in)
```

---

## Tab 2 — Layer

| Route                | Screen             | Key elements                                                                                        |
| -------------------- | ------------------ | --------------------------------------------------------------------------------------------------- |
| `/layer` (index)     | Pick Bottles       | Select 2–3 from collection, Lumi nudge, Analyse CTA                                                 |
| `/layer/analysis`    | Chemistry Analysis | Dark screen, compatibility score, note interactions (anchor/amplify/contrast/neutral), Lumi summary |
| `/layer/application` | Application Guide  | Body map with amber placement dots, step-by-step, ratio bar                                         |
| `/layer/conflict`    | Conflict Warning   | Red accent, clash explanation, Lumi alternative suggestion                                          |
| `/layer/signature`   | Save Signature     | Name input, tag chips, card preview, Save + Share buttons                                           |

**Free tier gate:** Check `get_daily_layering_count()` RPC before opening `/layer/analysis`. If ≥ 3 and not premium → route to `/modals/premium-gate`.

---

## Tab 3 — Collection

| Route                   | Screen          | Key elements                                                                    |
| ----------------------- | --------------- | ------------------------------------------------------------------------------- |
| `/collection` (index)   | Overview        | Stats row (bottles, families, low stock), filter chips, bottle list             |
| `/collection/[id]`      | Bottle Detail   | Dark hero card, notes pyramid, wear stats, quick actions (Wear / Layer / Share) |
| `/collection/add`       | Add Perfume     | Search + auto-fill, results list, manual entry fallback                         |
| `/collection/dna`       | Fragrance DNA   | Radar chart, family breakdown bars, Lumi insight sentence                       |
| `/collection/low-stock` | Low Stock Alert | Running low list, stock bars, Lumi reassurance, where to buy CTA                |
| `/collection/wishlist`  | Wishlist        | Lumi gap insight, gap tags, wishlist items, Add manually                        |

---

## Tab 4 — Profile

| Route                 | Screen        | Key elements                                                                                                    |
| --------------------- | ------------- | --------------------------------------------------------------------------------------------------------------- |
| `/profile` (index)    | My Profile    | Avatar, display name, DNA compact card, saved signatures                                                        |
| `/profile/signatures` | My Signatures | All saved combos, share, delete                                                                                 |
| `/profile/settings`   | Settings      | Account block, preferences (notifications, skin type, lifestyle, theme), subscription, sign out, delete account |

**Profile states:**

- Returning user → DNA card + signatures
- New user (< 3 bottles) → Getting-started checklist, empty DNA with CTA, Phase 2 nudge

---

## Modals (global, presented over any tab)

| Route                      | Modal                | Trigger                                                        |
| -------------------------- | -------------------- | -------------------------------------------------------------- |
| `/modals/bottle-quick-add` | Quick Add Bottle     | Bottom sheet — triggered from layering or daily wearing screen |
| `/modals/signature-share`  | Share Signature Card | Card preview, native share sheet                               |
| `/modals/stock-update`     | Update Stock Level   | Full / Medium / Low / Empty selector                           |
| `/modals/premium-gate`     | Premium Paywall      | Free user hits 3-use layering limit or any premium feature     |

All modals use Gorhom Bottom Sheet.

---

## Phase 2 Screens (structure now, activate later)

| Route                   | Screen                     |
| ----------------------- | -------------------------- |
| `/today/week-rotation`  | AI Weekly Rotation Planner |
| `/profile/[username]`   | Public Profile             |
| `/profile/following`    | Following Feed             |
| `/profile/discover`     | Discover · Next Buy        |
| `/profile/explore`      | Community Explore          |
| `/modals/calendar-sync` | Calendar Sync Setup        |
| `/modals/barcode-scan`  | Barcode Scanner            |

---

## Screen Count

| Group               | Count  |
| ------------------- | ------ |
| Auth + Onboarding   | 7      |
| Phase 1 tab screens | 18     |
| Phase 2 screens     | 7      |
| **Total**           | **32** |
