// ── Lumi · Claude API calls ───────────────────────────────────────
// All Anthropic API calls go through this file.
// Models: Haiku for simple calls, Sonnet for layering/conflict.
// The Anthropic key lives server-side in the `lumi` edge function — never in the client bundle.

import { supabase } from '@/lib/supabase';

const LUMI_FUNCTION_URL = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/lumi`;

// ── Models ────────────────────────────────────────────────────────
const HAIKU = 'claude-haiku-4-5-20251001';
const SONNET = 'claude-sonnet-4-6';

// ── System prompt ─────────────────────────────────────────────────
const LUMI_SYSTEM = `You are Lumi, the fragrance intelligence behind Olfaire —
a personal scent guide for people who take perfume seriously.

YOUR CHARACTER
You are knowledgeable without being academic. Warm without being effusive.
You speak like a trusted friend who happens to know more about fragrance
than anyone else in the room. You never say "Great choice!" or "Certainly!"
or begin with affirmations. You never use generic AI phrasing. You never
start a response with "I".

YOUR VOICE
- Literary and sensory. You describe scent the way a good writer describes light.
- Concise. One precise sentence is worth more than three vague ones.
- Grounded in chemistry but never clinical.
- You frame all layering advice as informed suggestion, never absolute fact.
- Avoid hedging phrases like "That can work" or "It could be interesting".
  Lead with the observation, not the permission.

WHAT YOU KNOW
- Fragrance families — all major and niche families including: Floral, Woody,
  Oriental, Fresh, Gourmand, Musky, Citrus, Aquatic, Amber, Fruity, Spicy,
  Green, Powdery, Leather, Aromatic, Chypre, Fougère, Vanilla, Smoky, Earthy,
  Herbal, Resinous, Sweet, Marine, Aldehydic, Oud, Balsamic, Metallic, Tobacco,
  Animalic
- Note pyramid structure: top, heart, base and how each layer behaves on skin
  over time
- Note interactions: which combinations anchor, amplify, contrast, or clash and
  the chemistry behind why
- Application: where on the body, in what order, how long to wait between
  layers, ratios
- Seasonality, humidity, heat and how weather affects projection, sillage, and
  longevity
- Skin type: dry skin amplifies base notes and pulls them forward quickly, oily
  skin extends longevity and deepens base notes, warm skin accelerates top note
  fade
- Lifestyle context: what different occasions and settings demand from a
  fragrance — office discretion, date night presence, beach lightness, nightlife
  projection, gym freshness, formal gravitas, streetwear edge, travel
  versatility, winter warmth, summer freshness, romantic intimacy

WHAT YOU NEVER DO
- Never recommend perfumes the user doesn't own unless explicitly in a
  discovery context.
- Never invent note data — if uncertain, say so simply.
- Never be alarming about conflicts — firm but constructive.
- Never write more than the task requires.
- Never use bullet points unless the task explicitly requires structured output.
- Never start a response with "I".
- Never comment on the quality or size of the user's collection — when they
  list their bottles, move immediately to the next question.
- Never signal hierarchy between affordable and luxury fragrance. A $30 bottle
  gets the same analytical depth as a $300 bottle.
- Never affirm the user's input with words like "Perfect", "Great", "Good to
  know" before moving to the next question. Acknowledge and move.
- Never add commentary between data collection questions — save insights for
  the suggestion itself.
- Do not narrate your thinking process. Respond only with your spoken output.

LAYERING CONVERSATIONS
When asked to explore a layering combination, always ask the user which two
bottles they want to combine before analysing. Never choose the pair without
asking first.

WHEN THE USER LISTS THEIR COLLECTION UNPROMPTED
If the user shares their collection without being asked, and the collection
contains recognisable bottles, briefly demonstrate you know what they are —
then ask what they want to explore. Do not collect skin type, weather, or mood
unless they ask for a daily suggestion specifically.`;

// ── Base fetch ────────────────────────────────────────────────────
async function callClaude({
  model,
  system,
  userMessage,
  maxTokens = 1000,
}: {
  model: string;
  system?: string;
  userMessage: string;
  maxTokens?: number;
}): Promise<string> {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  if (!session) throw new Error('Not authenticated');

  const res = await fetch(LUMI_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      ...(system && { system }),
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Lumi API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const text = data.content?.[0]?.text?.trim();
  if (!text) throw new Error('Empty response from Lumi');
  return text;
}

// ── Helper: safe JSON parse ───────────────────────────────────────
function parseJSON<T>(text: string): T {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`No JSON object found in response: ${text.slice(0, 200)}`);
  try {
    return JSON.parse(match[0]) as T;
  } catch (e) {
    throw e;
  }
}

// ─────────────────────────────────────────────────────────────────
// Task 1 — Opening Line
// Model: Haiku · Never cached
// ─────────────────────────────────────────────────────────────────
interface OpeningLineParams {
  weekday: string;
  condition: string;
  tempC: number;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
}

export async function fetchLumiOpeningLine(params: OpeningLineParams): Promise<string> {
  const { weekday, condition, tempC, timeOfDay } = params;

  const text = await callClaude({
    model: HAIKU,
    system: LUMI_SYSTEM,
    maxTokens: 60,
    userMessage: `Write Lumi's ${timeOfDay} greeting — the single line the user sees before selecting their mood.
One sentence. Maximum 15 words. No greeting words like "Good morning", "Hello", "Hi".
Start with the day, the weather, or something sensory.

Examples:
- "Rain is coming by noon. How are you feeling?"
- "Thursday. The kind of cold that asks for something warm."
- "Clear sky, office ahead. What are you reaching for today?"

TODAY: ${weekday}, ${timeOfDay} | Weather: ${condition}, ${tempC}°C

Return plain text only. No JSON. No punctuation beyond the sentence.`,
  });

  return text;
}

// ─────────────────────────────────────────────────────────────────
// Task 2 — Daily Suggestion
// Model: Haiku · Cached per (user_id, date, mood, weather)
// ─────────────────────────────────────────────────────────────────
export interface DailySuggestionResult {
  fragrance_id: number;
  fragrance_house: string;
  fragrance_name: string;
  lumi_line: string;
  reasoning_tags: string[];
}

interface DailySuggestionParams {
  weekday: string;
  mood: string;
  condition: string;
  tempC: number;
  humidity: number;
  collectionLines: string;
  skinType: string;
  lifestyle: string;
  preferredFamilies: string[];
  computedDNA?: string | null; // top 3 from dna_profiles.families — omit if collection < 3
  calendarEvent?: string | null;
}

export async function fetchDailySuggestion(
  params: DailySuggestionParams
): Promise<DailySuggestionResult> {
  const {
    weekday,
    mood,
    condition,
    tempC,
    humidity,
    collectionLines,
    skinType,
    lifestyle,
    preferredFamilies,
    computedDNA,
    calendarEvent,
  } = params;

  const profileLines = [
    `Skin type: ${skinType}`,
    `Lifestyle: ${lifestyle}`,
    `Preferred families: ${preferredFamilies.join(', ')}`,
    ...(computedDNA ? [`Computed DNA: ${computedDNA}`] : []),
  ].join('\n');

  const calendar = calendarEvent ?? 'clear day';

  const text = await callClaude({
    model: HAIKU,
    system: LUMI_SYSTEM,
    maxTokens: 200,
    userMessage: `From the collection below, suggest exactly one perfume for today.

USER PROFILE
${profileLines}

TODAY
${weekday} | Weather: ${condition}, ${tempC}°C, humidity ${humidity}% | Calendar: ${calendar}
Mood: ${mood}

COLLECTION
${collectionLines}

Respond with exactly this JSON:
{
  "fragrance_id": <the numeric ID from [ID:X] in the collection list>,
  "fragrance_house": "<house>",
  "fragrance_name": "<name>",
  "lumi_line": "<one sentence max 20 words in your voice>",
  "reasoning_tags": ["<tag1>", "<tag2>"]
}

Never suggest a low stock bottle unless it is the only suitable option.
Return JSON only. No preamble. No markdown backticks.`,
  });

  return parseJSON<DailySuggestionResult>(text);
}

// ─────────────────────────────────────────────────────────────────
// Task 3 — Layering Chemistry Analysis + Conflict Detection
// Model: Sonnet · Cached forever in layering_cache
// ─────────────────────────────────────────────────────────────────
export interface LayeringResult {
  compatibility_score: number;
  lumi_summary: string;
  conflicts: boolean;
  severity: string | null;
  lumi_warning: string | null;
  reasons: string[];
  interactions: {
    note_a: string;
    note_b: string;
    type: 'anchor' | 'amplify' | 'contrast' | 'neutral';
    explanation: string;
  }[];
  application: {
    first: string;
    wait_seconds: number;
    second: string;
    ratio: string;
    placement_first: string;
    placement_second: string;
  };
  overall_character: string;
  alternative_suggestion: {
    swap_bottle: string;
    suggested_name: string;
    suggested_house: string;
    reason: string;
  } | null;
}

interface LayeringParams {
  bottleA: {
    house: string;
    name: string;
    concentration: string;
    family: string;
    notes_top: string[];
    notes_heart: string[];
    notes_base: string[];
  };
  bottleB: {
    house: string;
    name: string;
    concentration: string;
    family: string;
    notes_top: string[];
    notes_heart: string[];
    notes_base: string[];
  };
}

export async function fetchLayeringAnalysis(params: LayeringParams): Promise<LayeringResult> {
  const { bottleA, bottleB } = params;

  const text = await callClaude({
    model: SONNET,
    system: LUMI_SYSTEM,
    maxTokens: 2000,
    userMessage: `Analyse the chemistry of layering these two perfumes and detect any conflicts.

BOTTLE A: ${bottleA.house} ${bottleA.name}
  Top: ${bottleA.notes_top.join(', ')}
  Heart: ${bottleA.notes_heart.join(', ')}
  Base: ${bottleA.notes_base.join(', ')}
  Concentration: ${bottleA.concentration} | Family: ${bottleA.family}

BOTTLE B: ${bottleB.house} ${bottleB.name}
  Top: ${bottleB.notes_top.join(', ')}
  Heart: ${bottleB.notes_heart.join(', ')}
  Base: ${bottleB.notes_base.join(', ')}
  Concentration: ${bottleB.concentration} | Family: ${bottleB.family}

Include 2–4 interactions only — the most meaningful pairings. Keep explanations to one short sentence each.

Respond with exactly this JSON:
{
  "compatibility_score": <0-100>,
  "lumi_summary": "<1-2 sentences in your voice>",
  "conflicts": <true|false>,
  "severity": <"mild"|"moderate"|"strong"|null>,
  "lumi_warning": "<one sentence if conflicts, else null>",
  "reasons": ["<conflict reason>"],
  "interactions": [
    {
      "note_a": "<note>",
      "note_b": "<note>",
      "type": "<anchor|amplify|contrast|neutral>",
      "explanation": "<one sentence>"
    }
  ],
  "application": {
    "first": "<bottle name>",
    "wait_seconds": <30-120>,
    "second": "<bottle name>",
    "ratio": "<e.g. 2 sprays A, 1 spray B>",
    "placement_first": "<body placement>",
    "placement_second": "<body placement>"
  },
  "overall_character": "<4-6 words>",
  "alternative_suggestion": null
}

Return JSON only. No preamble. No markdown backticks.`,
  });

  return parseJSON<LayeringResult>(text);
}

// ─────────────────────────────────────────────────────────────────
// Task 4 — DNA Insight
// Model: Haiku · Generated once when DNA is computed, cached in DB
// ─────────────────────────────────────────────────────────────────
export async function fetchDNAInsight(params: {
  dominantFamily: string;
  topFamilies: string[];
  bottleCount: number;
}): Promise<string> {
  const { dominantFamily, topFamilies, bottleCount } = params;

  const text = await callClaude({
    model: HAIKU,
    system: LUMI_SYSTEM,
    maxTokens: 60,
    userMessage: `Write one short sentence (max 18 words) that describes this user's fragrance DNA.
It should feel like a portrait, not a summary.

Dominant family: ${dominantFamily}
Top families: ${topFamilies.join(', ')}
Collection size: ${bottleCount} bottles

Examples:
- "You reach for the dark, the warm, and the ones that leave a room remembering you."
- "Fresh and precise — you prefer clarity over complexity."
- "Your collection suggests someone who dresses for a room before entering it."

Return plain text only. No JSON. No quotes. No punctuation beyond the sentence.`,
  });

  return text.replace(/^["']|["']$/g, '');
}

// ─────────────────────────────────────────────────────────────────
// Task 6 — Fragrance Enrichment
// Model: Haiku · Called once when a user contributes a new fragrance
// ─────────────────────────────────────────────────────────────────
export interface FragranceEnrichmentResult {
  notes_top: string[];
  notes_heart: string[];
  notes_base: string[];
  family: string;
  subfamily: string | null;
  longevity: number | null; // 1–5
  sillage: number | null; // 1–5
  season_tags: string[];
  occasion_tags: string[];
  gender: string | null;
  year: number | null;
  confidence: 'high' | 'medium' | 'low';
}

export interface UserProvidedFragranceData {
  year?: number;
  concentration?: string;
  notesTop?: string[];
  notesHeart?: string[];
  notesBase?: string[];
  family?: string;
  gender?: string;
}

export async function enrichFragrance(
  house: string,
  name: string,
  userProvided: UserProvidedFragranceData = {}
): Promise<FragranceEnrichmentResult> {
  const { year, concentration, notesTop, notesHeart, notesBase, family, gender } = userProvided;

  const confirmed: string[] = [];
  if (year) confirmed.push(`- Release year: ${year}`);
  if (concentration) confirmed.push(`- Concentration: ${concentration}`);
  if (notesTop?.length) confirmed.push(`- Top notes: ${notesTop.join(', ')}`);
  if (notesHeart?.length) confirmed.push(`- Heart notes: ${notesHeart.join(', ')}`);
  if (notesBase?.length) confirmed.push(`- Base notes: ${notesBase.join(', ')}`);
  if (family) confirmed.push(`- Family: ${family}`);
  if (gender) confirmed.push(`- Gender: ${gender}`);

  const confirmedSection =
    confirmed.length > 0
      ? `The user has confirmed the following — treat these as ground truth and echo them verbatim in your response, do not override:\n${confirmed.join('\n')}\n\n`
      : '';

  const text = await callClaude({
    model: SONNET,
    maxTokens: 1200,
    system: `You are a fragrance expert with encyclopedic knowledge of perfumes — mainstream and niche, Western and Middle Eastern, vintage and contemporary. You recall note pyramids, olfactory families, longevity, sillage, and release years accurately from your training data.`,
    userMessage: `Fragrance: ${house} — ${name}${concentration ? ` (${concentration})` : ''}

${confirmedSection}First, briefly recall everything you know about this specific fragrance from your training data: its note pyramid, olfactory family, longevity, sillage, typical seasonality, and release year.

Then output exactly this JSON using your recalled knowledge. For fields you have no reliable knowledge of, use null. Set confidence to "high" if you know this fragrance precisely, "medium" if partially, "low" if you are largely uncertain.

{
  "notes_top":     ["<note>"],
  "notes_heart":   ["<note>"],
  "notes_base":    ["<note>"],
  "family":        "<primary family>",
  "subfamily":     "<subfamily or null>",
  "longevity":     <1-5 or null>,
  "sillage":       <1-5 or null>,
  "season_tags":   ["spring|summer|fall|winter"],
  "occasion_tags": ["day|night"],
  "gender":        "<men|women|unisex or null>",
  "year":          <4-digit release year or null>,
  "confidence":    "<high|medium|low>"
}`,
  });

  return parseJSON<FragranceEnrichmentResult>(text);
}

// ─────────────────────────────────────────────────────────────────
// Task 5 — Signature Naming
// Model: Haiku · Never cached
// ─────────────────────────────────────────────────────────────────
export interface SignatureNamesResult {
  suggestions: [string, string, string];
}

interface SignatureNamingParams {
  bottleAName: string;
  bottleANotes: string[];
  bottleBName: string;
  bottleBNotes: string[];
  overallCharacter: string;
}

export async function fetchSignatureNames(
  params: SignatureNamingParams
): Promise<SignatureNamesResult> {
  const { bottleAName, bottleANotes, bottleBName, bottleBNotes, overallCharacter } = params;

  const text = await callClaude({
    model: HAIKU,
    system: LUMI_SYSTEM,
    maxTokens: 100,
    userMessage: `Suggest 3 possible signature names for this layering combination.

COMBO
Bottle A: ${bottleAName} · Key notes: ${bottleANotes.slice(0, 3).join(', ')}
Bottle B: ${bottleBName} · Key notes: ${bottleBNotes.slice(0, 3).join(', ')}
Overall character: ${overallCharacter}

Rules:
- 2–4 words each
- Evocative, not descriptive. "The Dark Contrast" not "Vetiver and Rose"
- Could be a mood, a place, a time, a feeling
- Each should feel like something worth owning

Return JSON:
{ "suggestions": ["<name1>", "<name2>", "<name3>"] }
Return JSON only. No preamble. No markdown backticks.`,
  });

  return parseJSON<SignatureNamesResult>(text);
}
