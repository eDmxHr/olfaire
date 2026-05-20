# Stores

4 Zustand stores. TypeScript throughout. No uiStore — theme lives in `authStore`, modals stay local, toasts use `sonner-native`.

**Install:**
```bash
npm install zustand
npm install @react-native-async-storage/async-storage
```

---

## Architecture

| Store | Persisted | Domain |
|---|---|---|
| `authStore` | Yes — AsyncStorage | Session, profile, theme, premium |
| `collectionStore` | Yes — AsyncStorage | Bottles, wishlist, DNA, search |
| `todayStore` | No — session only | Daily log, mood, suggestion, weather |
| `layeringStore` | No — session only | Selection, analysis, signatures |

`authStore` and `collectionStore` persist so users stay logged in and see their collection offline. `todayStore` and `layeringStore` re-fetch from Supabase on app start — no point caching today's suggestion or an active layering selection.

---

## authStore

```typescript
// src/stores/authStore.ts
type Theme = 'light' | 'dark' | 'system'
type SkinType = 'dry' | 'normal' | 'oily'
type Lifestyle = 'office' | 'outdoor' | 'creative' | 'home'

interface Profile {
  id: string
  display_name: string
  avatar_url: string | null
  skin_type: SkinType
  lifestyle: Lifestyle
  city: string | null
  theme: Theme
  notification_enabled: boolean
  notification_time: string       // "08:00"
  is_premium: boolean
  premium_expires_at: string | null
  onboarding_completed: boolean
}

// State
session: any | null
profile: Profile | null
isLoading: boolean

// Actions
setSession(session)
fetchProfile()                    // → Supabase profiles
updateProfile(updates)            // optimistic update first
setTheme(theme)                   // updates profile + persists
signOut()                         // clears all stores
clearAll()
```

**Persisted fields:** `session`, `profile` (includes theme)

---

## collectionStore

```typescript
// src/stores/collectionStore.ts
interface CollectionItem {
  id: string
  fragrance_id: string
  fragrance: Fragrance            // joined from fragrances table
  size_ml: number | null
  stock_level: 'full' | 'medium' | 'low' | 'empty'
  personal_rating: number | null
  wear_count: number
  last_worn_at: string | null
  notes: string | null
  is_wishlist: boolean
  custom_image_url: string | null
  added_at: string
}

// State
items: CollectionItem[]           // owned (is_wishlist = false)
wishlist: CollectionItem[]        // wishlist (is_wishlist = true)
dna: DNAProfile | null
searchResults: Fragrance[]
isLoading: boolean
isSyncing: boolean

// Computed selectors
lowStockItems()                   // items where stock_level = 'low' | 'empty'
getById(id)                       // find item by id

// Actions
fetchCollection()                 // joins fragrance data in one query
addBottle(fragranceId, isWishlist?)
removeBottle(collectionId)
updateStock(collectionId, level)  // optimistic update
updateRating(collectionId, rating)
uploadImage(collectionId, uri)    // → Supabase Storage
moveToCollection(collectionId)    // wishlist → owned
searchFragrances(query)           // uses GIN full-text index
clearSearch()
fetchDNA()
```

**Persisted fields:** `items`, `wishlist`, `dna`

**Key query:**
```typescript
supabase
  .from('user_collection')
  .select('*, fragrance:fragrances(*)')   // join in one query
  .order('added_at', { ascending: false })
```

---

## todayStore

```typescript
// src/stores/todayStore.ts
type Mood = 'soft' | 'bold' | 'cosy' | 'sharp' | 'mysterious'
type WearRating = 'loved' | 'neutral' | 'disliked'

// State
todayLog: DailyLog | null
weekLogs: DailyLog[]
suggestion: Suggestion | null     // { fragrance_id, lumi_line, reasoning_tags }
weather: WeatherContext | null
lumiOpening: string | null        // morning greeting line
isLoadingSuggestion: boolean

// Computed
isWearing()                       // !! todayLog?.worn_fragrance_id
hasMoodToday()                    // !! todayLog?.mood

// Actions
fetchTodayLog()
fetchWeekLogs()
fetchWeather(city)
fetchLumiOpening()
selectMood(mood)                  // upserts daily_log, then fetchSuggestion()
fetchSuggestion()                 // calls Claude API
confirmWearing(fragranceId)       // updates log + increments wear_count via RPC
submitRating(rating)
requestAnother()                  // re-calls Claude with different seed
```

**Session only — no persistence.**

**Upsert pattern:**
```typescript
supabase
  .from('daily_log')
  .upsert({ log_date: today, mood }, { onConflict: 'user_id,log_date' })
```

---

## layeringStore

```typescript
// src/stores/layeringStore.ts

// State
selectedIds: string[]             // collection item IDs, max 3
analysis: LayeringAnalysis | null
signatures: Signature[]
isAnalysing: boolean
isSaving: boolean

// Computed
canAnalyse()                      // selectedIds.length >= 2
hasConflict()                     // !! analysis?.conflicts

// Actions
selectBottle(collectionId)        // max 3, no duplicates, clears analysis
deselectBottle(collectionId)
clearSelection()
analyse()                         // cache-first → Claude on miss
saveSignature(name, tags)
generateCard(signatureId)         // returns image URI → uploads to Storage
fetchSignatures()
deleteSignature(id)
```

**Session only — no persistence.**

**Cache-first analysis flow** (implemented in `~/lib/layeringService.ts`):
```typescript
// 1. Build pair key
const key = [a_id, b_id].sort().join('_')

// 2. Check layering_cache
const cached = await supabase
  .from('layering_cache')
  .select('analysis_json')
  .eq('fragrance_a_id', LEAST(a_id, b_id))
  .eq('fragrance_b_id', GREATEST(a_id, b_id))
  .single()

// 3. Cache hit → return immediately
if (cached.data) return cached.data.analysis_json

// 4. Cache miss → call Claude API
const result = await callClaude(layeringPrompt)

// 5. Write to cache
await supabase.from('layering_cache').insert({ ...result, fragrance_a_id, fragrance_b_id })

return result
```

---

## Usage Patterns

```typescript
// Granular subscriptions — only re-renders when these values change
const profile     = useAuthStore(s => s.profile)
const isPremium   = useAuthStore(s => s.profile?.is_premium)
const items       = useCollectionStore(s => s.items)
const lowStock    = useCollectionStore(s => s.lowStockItems())
const todayLog    = useTodayStore(s => s.todayLog)
const isWearing   = useTodayStore(s => s.isWearing())
const analysis    = useLayeringStore(s => s.analysis)
const hasConflict = useLayeringStore(s => s.hasConflict())

// Actions — access directly, don't subscribe to them
const selectMood   = useTodayStore(s => s.selectMood)
const updateStock  = useCollectionStore(s => s.updateStock)

// Premium gate check
const checkLayeringLimit = async () => {
  if (isPremium) return true
  const { data } = await supabase
    .rpc('get_daily_layering_count', { p_user_id: profile!.id })
  if (data >= 3) {
    router.push('/modals/premium-gate')
    return false
  }
  return true
}

// Theme — resolve system preference
const theme = useAuthStore(s => s.profile?.theme ?? 'light')
const isDark = theme === 'dark' ||
  (theme === 'system' && Appearance.getColorScheme() === 'dark')

// On app start — in _layout.tsx
useEffect(() => {
  if (session) {
    fetchProfile()
    fetchCollection()
    fetchTodayLog()
    fetchWeather(profile?.city ?? 'auto')
  }
}, [session])
```

---

## File Structure

```
src/
├── stores/
│   ├── authStore.ts
│   ├── collectionStore.ts
│   ├── todayStore.ts
│   └── layeringStore.ts
│
├── lib/
│   ├── supabase.ts          ← Supabase client init
│   ├── claudeApi.ts         ← Lumi API calls
│   ├── layeringService.ts   ← cache-first layering logic
│   └── placeholderImage.ts  ← family color + house initial generator
│
└── theme/
    └── tokens.ts            ← colors, typography, spacing, radii
```
