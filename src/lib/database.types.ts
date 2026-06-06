export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      daily_log: {
        Row: {
          calendar_event: string | null
          created_at: string
          id: string
          log_date: string
          lumi_suggestion_text: string | null
          mood: string | null
          occasion: string | null
          reasoning_tags: string[] | null
          suggested_fragrance_id: number | null
          user_id: string
          wear_rating: string | null
          weather_condition: string | null
          weather_humidity: number | null
          weather_temp_c: number | null
          worn_fragrance_id: number | null
        }
        Insert: {
          calendar_event?: string | null
          created_at?: string
          id?: string
          log_date: string
          lumi_suggestion_text?: string | null
          mood?: string | null
          occasion?: string | null
          reasoning_tags?: string[] | null
          suggested_fragrance_id?: number | null
          user_id: string
          wear_rating?: string | null
          weather_condition?: string | null
          weather_humidity?: number | null
          weather_temp_c?: number | null
          worn_fragrance_id?: number | null
        }
        Update: {
          calendar_event?: string | null
          created_at?: string
          id?: string
          log_date?: string
          lumi_suggestion_text?: string | null
          mood?: string | null
          occasion?: string | null
          reasoning_tags?: string[] | null
          suggested_fragrance_id?: number | null
          user_id?: string
          wear_rating?: string | null
          weather_condition?: string | null
          weather_humidity?: number | null
          weather_temp_c?: number | null
          worn_fragrance_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_log_suggested_fragrance_id_fkey"
            columns: ["suggested_fragrance_id"]
            isOneToOne: false
            referencedRelation: "fragrances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_log_worn_fragrance_id_fkey"
            columns: ["worn_fragrance_id"]
            isOneToOne: false
            referencedRelation: "fragrances"
            referencedColumns: ["id"]
          },
        ]
      }
      discovery_suggestions: {
        Row: {
          expires_at: string
          fragrance_id: number
          gap_type: string
          gap_value: string
          generated_at: string
          id: string
          is_dismissed: boolean
          is_wishlisted: boolean
          lumi_reasoning: string
          priority: number
          user_id: string
        }
        Insert: {
          expires_at?: string
          fragrance_id: number
          gap_type: string
          gap_value: string
          generated_at?: string
          id?: string
          is_dismissed?: boolean
          is_wishlisted?: boolean
          lumi_reasoning: string
          priority?: number
          user_id: string
        }
        Update: {
          expires_at?: string
          fragrance_id?: number
          gap_type?: string
          gap_value?: string
          generated_at?: string
          id?: string
          is_dismissed?: boolean
          is_wishlisted?: boolean
          lumi_reasoning?: string
          priority?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discovery_suggestions_fragrance_id_fkey"
            columns: ["fragrance_id"]
            isOneToOne: false
            referencedRelation: "fragrances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discovery_suggestions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dna_profiles: {
        Row: {
          dominant_family: string | null
          families: Json
          lumi_insight: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          dominant_family?: string | null
          families?: Json
          lumi_insight?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          dominant_family?: string | null
          families?: Json
          lumi_insight?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dna_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_request_votes: {
        Row: {
          request_id: string
          user_id: string
          vote: number
        }
        Insert: {
          request_id: string
          user_id: string
          vote: number
        }
        Update: {
          request_id?: string
          user_id?: string
          vote?: number
        }
        Relationships: [
          {
            foreignKeyName: "feature_request_votes_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "feature_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_requests: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          downvotes: number | null
          id: string
          title: string
          upvotes: number | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          downvotes?: number | null
          id?: string
          title: string
          upvotes?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          downvotes?: number | null
          id?: string
          title?: string
          upvotes?: number | null
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fragrance_contributions: {
        Row: {
          created_at: string
          house: string
          id: string
          merged_into: number | null
          name: string
          raw_data: Json | null
          status: string
          submitted_by: string
        }
        Insert: {
          created_at?: string
          house: string
          id?: string
          merged_into?: number | null
          name: string
          raw_data?: Json | null
          status?: string
          submitted_by: string
        }
        Update: {
          created_at?: string
          house?: string
          id?: string
          merged_into?: number | null
          name?: string
          raw_data?: Json | null
          status?: string
          submitted_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "fragrance_contributions_merged_into_fkey"
            columns: ["merged_into"]
            isOneToOne: false
            referencedRelation: "fragrances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fragrance_contributions_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fragrances: {
        Row: {
          concentration: string | null
          created_at: string | null
          family: string | null
          gender: string | null
          house: string | null
          id: number
          image_url: string | null
          is_user_contributed: boolean | null
          is_verified: boolean | null
          longevity: number | null
          name: string | null
          notes_base: string[] | null
          notes_heart: string[] | null
          notes_top: string[] | null
          occasion_tags: string[] | null
          search_vector: unknown
          season_tags: string[] | null
          sillage: number | null
          subfamily: string | null
          year: number | null
        }
        Insert: {
          concentration?: string | null
          created_at?: string | null
          family?: string | null
          gender?: string | null
          house?: string | null
          id?: number
          image_url?: string | null
          is_user_contributed?: boolean | null
          is_verified?: boolean | null
          longevity?: number | null
          name?: string | null
          notes_base?: string[] | null
          notes_heart?: string[] | null
          notes_top?: string[] | null
          occasion_tags?: string[] | null
          search_vector?: unknown
          season_tags?: string[] | null
          sillage?: number | null
          subfamily?: string | null
          year?: number | null
        }
        Update: {
          concentration?: string | null
          created_at?: string | null
          family?: string | null
          gender?: string | null
          house?: string | null
          id?: number
          image_url?: string | null
          is_user_contributed?: boolean | null
          is_verified?: boolean | null
          longevity?: number | null
          name?: string | null
          notes_base?: string[] | null
          notes_heart?: string[] | null
          notes_top?: string[] | null
          occasion_tags?: string[] | null
          search_vector?: unknown
          season_tags?: string[] | null
          sillage?: number | null
          subfamily?: string | null
          year?: number | null
        }
        Relationships: []
      }
      layering_cache: {
        Row: {
          analysis_json: Json
          compatibility_score: number
          conflicts: boolean
          created_at: string
          fragrance_a_id: number
          fragrance_b_id: number
          id: string
          overall_character: string | null
          severity: string | null
        }
        Insert: {
          analysis_json: Json
          compatibility_score: number
          conflicts?: boolean
          created_at?: string
          fragrance_a_id: number
          fragrance_b_id: number
          id?: string
          overall_character?: string | null
          severity?: string | null
        }
        Update: {
          analysis_json?: Json
          compatibility_score?: number
          conflicts?: boolean
          created_at?: string
          fragrance_a_id?: number
          fragrance_b_id?: number
          id?: string
          overall_character?: string | null
          severity?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "layering_cache_fragrance_a_id_fkey"
            columns: ["fragrance_a_id"]
            isOneToOne: false
            referencedRelation: "fragrances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "layering_cache_fragrance_b_id_fkey"
            columns: ["fragrance_b_id"]
            isOneToOne: false
            referencedRelation: "fragrances"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          collection_public: boolean
          created_at: string
          display_name: string
          id: string
          is_premium: boolean
          lifestyle: string | null
          notification_enabled: boolean
          notification_time: string
          onboarding_completed: boolean
          preferred_families: string[]
          premium_expires_at: string | null
          skin_type: string | null
          theme: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          collection_public?: boolean
          created_at?: string
          display_name?: string
          id: string
          is_premium?: boolean
          lifestyle?: string | null
          notification_enabled?: boolean
          notification_time?: string
          onboarding_completed?: boolean
          preferred_families?: string[]
          premium_expires_at?: string | null
          skin_type?: string | null
          theme?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          collection_public?: boolean
          created_at?: string
          display_name?: string
          id?: string
          is_premium?: boolean
          lifestyle?: string | null
          notification_enabled?: boolean
          notification_time?: string
          onboarding_completed?: boolean
          preferred_families?: string[]
          premium_expires_at?: string | null
          skin_type?: string | null
          theme?: string
          updated_at?: string
        }
        Relationships: []
      }
      signature_reactions: {
        Row: {
          created_at: string
          reaction: string
          signature_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          reaction: string
          signature_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          reaction?: string
          signature_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "signature_reactions_signature_id_fkey"
            columns: ["signature_id"]
            isOneToOne: false
            referencedRelation: "signatures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signature_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      signatures: {
        Row: {
          card_image_url: string | null
          created_at: string
          id: string
          is_public: boolean
          layering_cache_id: string
          name: string
          share_count: number
          tags: string[]
          user_id: string
        }
        Insert: {
          card_image_url?: string | null
          created_at?: string
          id?: string
          is_public?: boolean
          layering_cache_id: string
          name: string
          share_count?: number
          tags?: string[]
          user_id: string
        }
        Update: {
          card_image_url?: string | null
          created_at?: string
          id?: string
          is_public?: boolean
          layering_cache_id?: string
          name?: string
          share_count?: number
          tags?: string[]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "signatures_layering_cache_id_fkey"
            columns: ["layering_cache_id"]
            isOneToOne: false
            referencedRelation: "layering_cache"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signatures_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_collection: {
        Row: {
          added_at: string
          custom_image_url: string | null
          fragrance_id: number
          id: string
          is_wishlist: boolean
          last_worn_at: string | null
          notes: string | null
          personal_rating: number | null
          size_ml: number | null
          stock_level: string
          user_id: string
          wear_count: number
        }
        Insert: {
          added_at?: string
          custom_image_url?: string | null
          fragrance_id: number
          id?: string
          is_wishlist?: boolean
          last_worn_at?: string | null
          notes?: string | null
          personal_rating?: number | null
          size_ml?: number | null
          stock_level?: string
          user_id?: string
          wear_count?: number
        }
        Update: {
          added_at?: string
          custom_image_url?: string | null
          fragrance_id?: number
          id?: string
          is_wishlist?: boolean
          last_worn_at?: string | null
          notes?: string | null
          personal_rating?: number | null
          size_ml?: number | null
          stock_level?: string
          user_id?: string
          wear_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_collection_fragrance_id_fkey"
            columns: ["fragrance_id"]
            isOneToOne: false
            referencedRelation: "fragrances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_collection_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_config: {
        Row: {
          key: string
          value: string
        }
        Insert: {
          key: string
          value: string
        }
        Update: {
          key?: string
          value?: string
        }
        Relationships: []
      }
      weekly_rotation: {
        Row: {
          created_at: string
          id: string
          rotation_json: Json
          user_id: string
          week_start: string
        }
        Insert: {
          created_at?: string
          id?: string
          rotation_json: Json
          user_id: string
          week_start: string
        }
        Update: {
          created_at?: string
          id?: string
          rotation_json?: Json
          user_id?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_rotation_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_daily_layering_count: { Args: { p_user_id: string }; Returns: number }
      get_daily_mood_count: { Args: { p_user_id: string }; Returns: number }
      increment_wear_count: {
        Args: { p_fragrance_id: number }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
