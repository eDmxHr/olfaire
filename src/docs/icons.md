# Icons

All UI icons use Tabler Icons. One global rule: `stroke={1}` everywhere, always.

**Install:** `npm install @tabler/icons-react-native`

---

## Global Rules

```tsx
// Always stroke={1} — never change for active states
<IconSparkles size={22} stroke={1} color={focused ? colors.amber : colors.ash} />

// Active state = change color only, never stroke
// Destructive = red only for trash and conflict warning
<IconTrash size={20} stroke={1} color="#C4503A" />
<IconAlertTriangle size={14} stroke={1} color="#C4503A" />

// Amber accent icons
<IconCrown size={20} stroke={1} color={colors.amber} />
```

**Size convention:**
- Bottom nav: 22
- Section/action icons: 20
- List row icons: 18–20
- Inside pills: 14

**Color rules:**
- Default: `colors.ash` (#8C8680)
- Active/selected: `colors.amber` (#B07D2A)
- Destructive only: `#C4503A`
- On dark background: `colors.parchment` at reduced opacity

---

## Bottom Navigation

| Tab | Icon Name | Import | Size |
|---|---|---|---|
| Today | `sparkles` | `IconSparkles` | 22 |
| Layer | `layers-intersect` | `IconLayersIntersect` | 22 |
| Collection | `bottle` | `IconBottle` | 22 |
| Profile | `user-circle` | `IconUserCircle` | 22 |

---

## Today Tab

| Element | Icon | Import | Size | Notes |
|---|---|---|---|---|
| Cloudy weather pill | `cloud` | `IconCloud` | 14 | Inside pill |
| Sunny weather pill | `sun` | `IconSun` | 14 | Amber stroke |
| Rainy weather pill | `cloud-rain` | `IconCloudRain` | 14 | |
| Calendar event pill | `calendar-event` | `IconCalendarEvent` | 14 | |
| Wearing confirmed | `check` | `IconCheck` | 16 | Amber, inside badge |
| Loved rating | `heart` | `IconHeart` | 18 | |
| Neutral rating | `mood-neutral` | `IconMoodNeutral` | 18 | |
| Disliked rating | `mood-sad` | `IconMoodSad` | 18 | |

---

## Layering Explorer

| Element | Icon | Import | Size | Notes |
|---|---|---|---|---|
| Add third layer slot | `plus` | `IconPlus` | 18 | Inside dashed card |
| Layer section header | `layers-intersect` | `IconLayersIntersect` | 20 | |
| Conflict detected | `alert-triangle` | `IconAlertTriangle` | 20 | Red stroke |
| Application guide | `spray` | `IconSpray` | 20 | Above body map |
| Save signature | `shield-check` | `IconShieldCheck` | 20 | Primary CTA |
| Share signature | `share` | `IconShare` | 20 | Secondary button |
| Wait timer step | `clock` | `IconClock` | 18 | Step icon |
| Remove bottle | `x` | `IconX` | 16 | Inside card |

---

## Collection Tab

| Element | Icon | Import | Size | Notes |
|---|---|---|---|---|
| Add to collection | `plus` | `IconPlus` | 20 | Ink bg circle |
| Search field | `search` | `IconSearch` | 16 | Inside input, ash |
| Low stock indicator | `alert-triangle` | `IconAlertTriangle` | 14 | Red, inline on card |
| Personal rating | `star` | `IconStar` | 16 | Amber when filled |
| Edit bottle | `pencil` | `IconPencil` | 18 | Top right detail |
| DNA profile section | `sparkles` | `IconSparkles` | 20 | DNA screen header |
| Add to wishlist | `heart` | `IconHeart` | 20 | Filled amber when wishlisted |
| Where to buy | `shopping-cart` | `IconShoppingCart` | 18 | Low stock screen |
| More options | `dots` | `IconDots` | 20 | Overflow menu |
| Wear today | `spray` | `IconSpray` | 18 | Quick action button |

---

## Profile & Settings

| Element | Icon | Import | Size | Notes |
|---|---|---|---|---|
| Settings entry | `settings` | `IconSettings` | 22 | Profile header |
| Account row | `user` | `IconUser` | 20 | Settings list |
| Notifications row | `bell` | `IconBell` | 20 | Settings list |
| Theme row | `palette` | `IconPalette` | 20 | Settings list |
| Skin type row | `user-circle` | `IconUserCircle` | 20 | Settings list |
| Lifestyle row | `briefcase` | `IconBriefcase` | 20 | Settings list |
| Subscription row | `crown` | `IconCrown` | 20 | Amber, settings list |
| Sign out | `logout` | `IconLogout` | 20 | Settings list |
| Delete account | `trash` | `IconTrash` | 20 | Red only |

---

## Global Navigation

| Element | Icon | Import | Size | Notes |
|---|---|---|---|---|
| Back | `chevron-left` | `IconChevronLeft` | 22 | All detail screens |
| Forward / list row | `chevron-right` | `IconChevronRight` | 18 | Ash color |
| Overflow menu | `dots` | `IconDots` | 20 | |
| Premium paywall hero | `crown` | `IconCrown` | 36 | Amber |
| Premium feature tick | `circle-check` | `IconCircleCheck` | 18 | Amber |
