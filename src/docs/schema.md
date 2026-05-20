# Schema

Supabase PostgreSQL. RLS enabled on all user-owned tables.

---

## Tables

### `profiles`
Extends `auth.users`. One row per user. Persisted: RLS.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | References `auth.users` |
| `display_name` | text | First name — "Good morning, Sofia" |
| `avatar_url` | text? | Storage URL or OAuth avatar |
| `skin_type` | text | dry \| normal \| oily |
| `lifestyle` | text | office \| outdoor \| creative \| home |
| `city` | text? | City-level only — weather API |
| `theme` | text | light \| dark \| system · default 'light' |
| `notification_enabled` | boolean | default false |
| `notification_time` | time | default '08:00' |
| `is_premium` | boolean | Managed by RevenueCat webhook |
| `premium_expires_at` | timestamptz? | null if free |
| `collection_public` | boolean | Phase 2 — default false |
| `onboarding_completed` | boolean | Gates daily suggestion |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | Auto-updated via trigger |

---

### `fragrances`
Shared public catalogue. Seeded from Fragrantica. Public read, admin write.

**No `image_url` column — intentional.** Images come from user uploads only (`user_collection.custom_image_url`) or generated placeholders.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `house` | text | e.g. "Chloé", "Le Labo" |
| `name` | text | e.g. "Eau de Parfum" |
| `concentration` | text | EDP \| EDT \| EDC \| Parfum \| EDP Intense |
| `family` | text | Primary family |
| `subfamily` | text? | e.g. "Floral Oriental" |
| `notes_top` | text[] | |
| `notes_heart` | text[] | |
| `notes_base` | text[] | |
| `gender` | text | unisex \| feminine \| masculine |
| `year` | integer? | Launch year |
| `season_tags` | text[] | spring \| summer \| autumn \| winter |
| `occasion_tags` | text[] | office \| evening \| casual \| outdoor \| special |
| `longevity` | integer? | 1–5 from dataset |
| `sillage` | integer? | 1–5 from dataset |
| `is_user_contributed` | boolean | default false |
| `is_verified` | boolean | default true |
| `search_vector` | tsvector | GIN indexed — powers auto-fill search |
| `created_at` | timestamptz | |

---

### `user_collection`
One row per bottle per user. RLS.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid FK → profiles | |
| `fragrance_id` | uuid FK → fragrances | |
| `size_ml` | integer? | |
| `stock_level` | text | full \| medium \| low \| empty |
| `personal_rating` | integer? | 1–5 |
| `wear_count` | integer | default 0 |
| `last_worn_at` | timestamptz? | |
| `notes` | text? | User's personal notes |
| `is_wishlist` | boolean | true = wishlist, false = owned |
| `custom_image_url` | text? | User-uploaded photo · Supabase Storage |
| `added_at` | timestamptz | |

---

### `daily_log`
One row per user per day. RLS.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid FK → profiles | |
| `log_date` | date | Unique with user_id |
| `suggested_fragrance_id` | uuid? FK → fragrances | What Lumi suggested |
| `worn_fragrance_id` | uuid? FK → fragrances | What user actually wore |
| `mood` | text? | soft \| bold \| cosy \| sharp \| mysterious |
| `occasion` | text? | |
| `weather_condition` | text? | Snapshot at suggestion time |
| `weather_temp_c` | numeric(4,1)? | |
| `weather_humidity` | integer? | |
| `lumi_suggestion_text` | text? | Lumi's reasoning — cached from API |
| `wear_rating` | text? | loved \| neutral \| disliked |
| `calendar_event` | text? | Phase 2 |
| `created_at` | timestamptz | |

---

### `layering_cache`
Shared across all users — chemistry never changes. Public read.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `fragrance_a_id` | uuid FK → fragrances | Always LEAST UUID |
| `fragrance_b_id` | uuid FK → fragrances | Always GREATEST UUID |
| `compatibility_score` | integer | 0–100 |
| `conflicts` | boolean | |
| `severity` | text? | mild \| moderate \| strong |
| `analysis_json` | jsonb | Full Claude API response |
| `overall_character` | text? | 4–6 words |
| `created_at` | timestamptz | Cached forever |

---

### `signatures`
Named layering combos saved by users. RLS.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid FK → profiles | |
| `layering_cache_id` | uuid FK → layering_cache | |
| `name` | text | User-chosen — "The Dark Contrast" |
| `tags` | text[] | office \| bold \| autumn etc. |
| `card_image_url` | text? | Supabase Storage URL |
| `is_public` | boolean | Phase 2 — default false |
| `share_count` | integer | default 0 |
| `created_at` | timestamptz | |

---

### `dna_profiles`
Computed per user. One row per user. RLS.

| Column | Type | Notes |
|---|---|---|
| `user_id` | uuid PK FK → profiles | |
| `floral` | numeric(5,2) | 0–100 |
| `woody` | numeric(5,2) | |
| `oriental` | numeric(5,2) | |
| `fresh` | numeric(5,2) | |
| `gourmand` | numeric(5,2) | |
| `musky` | numeric(5,2) | |
| `citrus` | numeric(5,2) | |
| `aquatic` | numeric(5,2) | |
| `dominant_family` | text? | |
| `lumi_insight` | text? | Cached from Claude |
| `updated_at` | timestamptz | Upserted on collection change |

---

### `fragrance_contributions`
User-submitted bottles not in catalogue.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `submitted_by` | uuid FK → profiles | |
| `house` | text | |
| `name` | text | |
| `raw_data` | jsonb? | User-provided note data |
| `status` | text | pending \| verified \| rejected |
| `merged_into` | uuid? FK → fragrances | Set when approved |
| `created_at` | timestamptz | |

---

### Phase 2 Tables (create now, leave empty)

**`follows`** — follower_id, following_id, created_at

**`signature_reactions`** — user_id, signature_id, reaction (love \| intrigued \| tried), created_at

**`weekly_rotation`** — id, user_id, week_start, rotation_json, created_at

**`discovery_suggestions`** — id, user_id, fragrance_id, gap_type (season \| occasion \| family), gap_value, lumi_reasoning, priority (1–3), is_dismissed, is_wishlisted, generated_at, expires_at (now() + 7 days)

---

## Key SQL

### Full-text search on fragrances
```sql
CREATE INDEX fragrances_search_idx ON fragrances USING gin(search_vector);

CREATE OR REPLACE FUNCTION fragrances_search_vector_trigger()
RETURNS trigger AS $$
BEGIN
  new.search_vector :=
    to_tsvector('english', coalesce(new.house, '') || ' ' || coalesce(new.name, ''));
  RETURN new;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER fragrances_search_vector_update
  BEFORE INSERT OR UPDATE ON fragrances
  FOR EACH ROW EXECUTE FUNCTION fragrances_search_vector_trigger();
```

### Prevent duplicate layering pairs
```sql
CREATE UNIQUE INDEX layering_cache_pair_idx
  ON layering_cache (
    LEAST(fragrance_a_id::text, fragrance_b_id::text),
    GREATEST(fragrance_a_id::text, fragrance_b_id::text)
  );
```

### RLS policies
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_profile" ON profiles FOR ALL USING (auth.uid() = id);

ALTER TABLE user_collection ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_collection" ON user_collection FOR ALL USING (auth.uid() = user_id);

ALTER TABLE daily_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_log" ON daily_log FOR ALL USING (auth.uid() = user_id);

ALTER TABLE signatures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_signatures" ON signatures FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "public_signatures_readable" ON signatures FOR SELECT USING (is_public = true);

ALTER TABLE fragrances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fragrances_public_read" ON fragrances FOR SELECT USING (true);

ALTER TABLE layering_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "layering_cache_public_read" ON layering_cache FOR SELECT USING (true);
```

### Prevent duplicate daily log entries
```sql
ALTER TABLE daily_log
  ADD CONSTRAINT daily_log_user_date_unique
  UNIQUE (user_id, log_date);
-- Use upsert in app: { onConflict: 'user_id,log_date' }
```

### Auto-create profile on sign up
```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Friend')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql security definer;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### Free tier layering gate
```sql
CREATE OR REPLACE FUNCTION get_daily_layering_count(p_user_id uuid)
RETURNS integer AS $$
  SELECT COUNT(*)::integer
  FROM signatures
  WHERE user_id = p_user_id
    AND created_at::date = CURRENT_DATE;
$$ LANGUAGE sql SECURITY DEFINER;

-- App usage:
-- const { data } = await supabase.rpc('get_daily_layering_count', { p_user_id: user.id })
-- if (!isPremium && data >= 3) router.push('/modals/premium-gate')
```

---

## Image Strategy

No scraping. No catalogue images. Two sources only:

1. **User upload** (`user_collection.custom_image_url`) — user photographs their actual bottle
2. **Generated placeholder** — family color + first letter of house name

Fallback chain in app code:
```
custom_image_url → generated placeholder (family color + house initial)
```

### Storage buckets
```
user-uploads/          ← private · RLS protected
  [user_id]/
    [collection_id].jpg

signature-cards/       ← private · public URL on share
  [user_id]/
    [signature_id].jpg
```

---

## Build Order

1. `fragrances` — seed from Fragrantica dataset first. Everything references this.
2. `profiles` + auth trigger — configure Apple + Google OAuth. Run `handle_new_user()`.
3. `user_collection` — enable RLS immediately, test with real auth session.
4. `daily_log` — add unique constraint on `(user_id, log_date)`.
5. `layering_cache` + `signatures` — run LEAST/GREATEST unique index immediately.
6. `dna_profiles` + `fragrance_contributions` — final Phase 1 tables.
7. `follows` + `signature_reactions` + `weekly_rotation` + `discovery_suggestions` — create now, leave empty until Phase 2.
