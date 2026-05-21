// ── Lumi · Claude API calls ───────────────────────────────────────
// All Anthropic API calls go through this file.
// Models: Haiku for simple calls, Sonnet for layering/conflict.

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_KEY;

// ── Models ────────────────────────────────────────────────────────
const HAIKU = 'claude-haiku-4-5-20251001';
const SONNET = 'claude-sonnet-4-20250514';

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

WHAT YOU NEVER DO
- Never recommend perfumes the user doesn't own unless explicitly in a discovery context.
- Never invent note data — if uncertain, say so simply.
- Never be alarming about conflicts — firm but constructive.
- Never write more than the task requires.
- Never use bullet points unless the task explicitly requires structured output.
- Never start a response with "I".
- Never signal hierarchy between affordable and luxury fragrance.
- Never affirm the user's input with words like "Perfect", "Great", "Good to know".
- Do not narrate your thinking process. Respond only with your spoken output.`;

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
  if (!API_KEY) throw new Error('Missing EXPO_PUBLIC_ANTHROPIC_KEY in .env');

  const res = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
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
    throw new Error(`Claude API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const text = data.content?.[0]?.text?.trim();
  if (!text) throw new Error('Empty response from Claude API');
  return text;
}

// ── Helper: safe JSON parse ───────────────────────────────────────
function parseJSON<T>(text: string): T {
  // Strip any accidental markdown backticks
  const clean = text
    .replace(/^```(?:json)?\n?/, '')
    .replace(/\n?```$/, '')
    .trim();
  return JSON.parse(clean) as T;
}

// ─────────────────────────────────────────────────────────────────
// Task 1 — Morning Opening Line
// Model: Haiku · Never cached
// ─────────────────────────────────────────────────────────────────
interface OpeningLineParams {
  weekday: string;
  condition: string;
  tempC: number;
}

export async function fetchLumiOpeningLine(params: OpeningLineParams): Promise<string> {
  const { weekday, condition, tempC } = params;

  const text = await callClaude({
    model: HAIKU,
    system: LUMI_SYSTEM,
    maxTokens: 60,
    userMessage: `Write Lumi's morning greeting — the single line the user sees before selecting their mood.
One sentence. Maximum 15 words. No greeting words like "Good morning", "Hello", "Hi".
Start with the day, the weather, or something sensory.

Examples:
- "Rain is coming by noon. How are you feeling?"
- "Thursday. The kind of cold that asks for something warm."
- "Clear sky, office ahead. What are you reaching for today?"

TODAY: ${weekday} | Weather: ${condition}, ${tempC}°C

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
  collectionLines: string; // pre-formatted collection context
}

export async function fetchDailySuggestion(
  params: DailySuggestionParams
): Promise<DailySuggestionResult> {
  const { weekday, mood, condition, tempC, humidity, collectionLines } = params;

  const text = await callClaude({
    model: HAIKU,
    system: LUMI_SYSTEM,
    maxTokens: 200,
    userMessage: `From the collection below, suggest exactly one perfume for today.

TODAY: ${weekday} | Weather: ${condition}, ${tempC}°C, humidity ${humidity}% | Mood: ${mood}

COLLECTION:
${collectionLines}

Respond with exactly this JSON:
{
  "fragrance_id": <number>,
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
    maxTokens: 1000,
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
// Task 4 — Signature Naming
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
