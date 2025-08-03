export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      episodes: {
        Row: {
          audio_languages: string[] | null
          created_at: string | null
          description: string | null
          duration: number | null
          episode_number: number
          id: string
          like_count: number | null
          metadata: Json | null
          rating: number | null
          release_date: string | null
          season_number: number
          series_id: string
          subtitle_languages: string[] | null
          subtitle_url: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          video_url: string | null
          view_count: number | null
        }
        Insert: {
          audio_languages?: string[] | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          episode_number: number
          id?: string
          like_count?: number | null
          metadata?: Json | null
          rating?: number | null
          release_date?: string | null
          season_number: number
          series_id: string
          subtitle_languages?: string[] | null
          subtitle_url?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          video_url?: string | null
          view_count?: number | null
        }
        Update: {
          audio_languages?: string[] | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          episode_number?: number
          id?: string
          like_count?: number | null
          metadata?: Json | null
          rating?: number | null
          release_date?: string | null
          season_number?: number
          series_id?: string
          subtitle_languages?: string[] | null
          subtitle_url?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "episodes_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          payment_method: string | null
          profile_id: string
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          status: string
          subscription_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          payment_method?: string | null
          profile_id: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          status?: string
          subscription_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          payment_method?: string | null
          profile_id?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          status?: string
          subscription_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          id: string
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          id: string
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          id?: string
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      series: {
        Row: {
          audio_languages: string[] | null
          banner_url: string | null
          bookmark_count: number | null
          cast_members: string[] | null
          content_type: string | null
          country: string | null
          created_at: string | null
          creator_name: string | null
          description: string
          director_name: string | null
          duration: string | null
          genres: string[] | null
          id: string
          is_featured: boolean | null
          is_trending: boolean | null
          language: string | null
          like_count: number | null
          long_description: string | null
          maturity_rating: string | null
          metadata: Json | null
          poster_url: string | null
          production_company: string | null
          rating: number | null
          release_date: string | null
          slug: string
          status: string | null
          subtitles_available: string[] | null
          tags_list: string[] | null
          thumbnail_url: string | null
          title: string
          total_episodes: number | null
          total_seasons: number | null
          trailer_url: string | null
          updated_at: string | null
          view_count: number | null
          writers_list: string[] | null
          year: number | null
        }
        Insert: {
          audio_languages?: string[] | null
          banner_url?: string | null
          bookmark_count?: number | null
          cast_members?: string[] | null
          content_type?: string | null
          country?: string | null
          created_at?: string | null
          creator_name?: string | null
          description: string
          director_name?: string | null
          duration?: string | null
          genres?: string[] | null
          id?: string
          is_featured?: boolean | null
          is_trending?: boolean | null
          language?: string | null
          like_count?: number | null
          long_description?: string | null
          maturity_rating?: string | null
          metadata?: Json | null
          poster_url?: string | null
          production_company?: string | null
          rating?: number | null
          release_date?: string | null
          slug: string
          status?: string | null
          subtitles_available?: string[] | null
          tags_list?: string[] | null
          thumbnail_url?: string | null
          title: string
          total_episodes?: number | null
          total_seasons?: number | null
          trailer_url?: string | null
          updated_at?: string | null
          view_count?: number | null
          writers_list?: string[] | null
          year?: number | null
        }
        Update: {
          audio_languages?: string[] | null
          banner_url?: string | null
          bookmark_count?: number | null
          cast_members?: string[] | null
          content_type?: string | null
          country?: string | null
          created_at?: string | null
          creator_name?: string | null
          description?: string
          director_name?: string | null
          duration?: string | null
          genres?: string[] | null
          id?: string
          is_featured?: boolean | null
          is_trending?: boolean | null
          language?: string | null
          like_count?: number | null
          long_description?: string | null
          maturity_rating?: string | null
          metadata?: Json | null
          poster_url?: string | null
          production_company?: string | null
          rating?: number | null
          release_date?: string | null
          slug?: string
          status?: string | null
          subtitles_available?: string[] | null
          tags_list?: string[] | null
          thumbnail_url?: string | null
          title?: string
          total_episodes?: number | null
          total_seasons?: number | null
          trailer_url?: string | null
          updated_at?: string | null
          view_count?: number | null
          writers_list?: string[] | null
          year?: number | null
        }
        Relationships: []
      }
      streaming_content: {
        Row: {
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          genre: string[] | null
          id: string
          poster_url: string | null
          rating: number | null
          release_date: string | null
          subscription_required: string | null
          title: string
          trailer_url: string | null
          type: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          genre?: string[] | null
          id?: string
          poster_url?: string | null
          rating?: number | null
          release_date?: string | null
          subscription_required?: string | null
          title: string
          trailer_url?: string | null
          type: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          genre?: string[] | null
          id?: string
          poster_url?: string | null
          rating?: number | null
          release_date?: string | null
          subscription_required?: string | null
          title?: string
          trailer_url?: string | null
          type?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      streaming_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          favorites: Json | null
          full_name: string | null
          id: string
          last_login: string | null
          preferences: Json | null
          subscription_expiry: string | null
          subscription_tier: string | null
          updated_at: string | null
          username: string
          watch_history: Json | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          favorites?: Json | null
          full_name?: string | null
          id: string
          last_login?: string | null
          preferences?: Json | null
          subscription_expiry?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
          username: string
          watch_history?: Json | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          favorites?: Json | null
          full_name?: string | null
          id?: string
          last_login?: string | null
          preferences?: Json | null
          subscription_expiry?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
          username?: string
          watch_history?: Json | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string | null
          currency: string | null
          description: string | null
          features: Json | null
          has_ads: boolean | null
          id: string
          is_active: boolean | null
          max_devices: number | null
          max_quality: string | null
          name: string
          price_monthly: number | null
          price_yearly: number | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          features?: Json | null
          has_ads?: boolean | null
          id?: string
          is_active?: boolean | null
          max_devices?: number | null
          max_quality?: string | null
          name: string
          price_monthly?: number | null
          price_yearly?: number | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          features?: Json | null
          has_ads?: boolean | null
          id?: string
          is_active?: boolean | null
          max_devices?: number | null
          max_quality?: string | null
          name?: string
          price_monthly?: number | null
          price_yearly?: number | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan: string
          profile_id: string
          razorpay_subscription_id: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan: string
          profile_id: string
          razorpay_subscription_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: string
          profile_id?: string
          razorpay_subscription_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorites: {
        Row: {
          created_at: string | null
          id: string
          profile_id: string
          video_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          profile_id: string
          video_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          profile_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_favorites_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string
          favorite_genres: string[] | null
          full_name: string | null
          id: string
          join_date: string | null
          phone: string | null
          preferences: Json | null
          profile_visibility: string | null
          subscription_end_date: string | null
          subscription_status: string | null
          subscription_tier: string | null
          total_watch_time: number | null
          updated_at: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email: string
          favorite_genres?: string[] | null
          full_name?: string | null
          id: string
          join_date?: string | null
          phone?: string | null
          preferences?: Json | null
          profile_visibility?: string | null
          subscription_end_date?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          total_watch_time?: number | null
          updated_at?: string | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string
          favorite_genres?: string[] | null
          full_name?: string | null
          id?: string
          join_date?: string | null
          phone?: string | null
          preferences?: Json | null
          profile_visibility?: string | null
          subscription_end_date?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          total_watch_time?: number | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          auto_renew: boolean | null
          created_at: string | null
          end_date: string | null
          id: string
          plan_id: string | null
          start_date: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          auto_renew?: boolean | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          plan_id?: string | null
          start_date?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          auto_renew?: boolean | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          plan_id?: string | null
          start_date?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      user_watch_history: {
        Row: {
          completed: boolean | null
          created_at: string | null
          id: string
          last_watched_at: string | null
          profile_id: string
          video_id: string
          watch_time: number | null
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          last_watched_at?: string | null
          profile_id: string
          video_id: string
          watch_time?: number | null
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          last_watched_at?: string | null
          profile_id?: string
          video_id?: string
          watch_time?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_watch_history_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_watch_history_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          created_at: string | null
          description: string | null
          duration: number | null
          file_path: string
          file_size: number | null
          id: string
          slug: string
          thumbnail_path: string | null
          title: string
          updated_at: string | null
          uploader_id: string
          visibility: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration?: number | null
          file_path: string
          file_size?: number | null
          id?: string
          slug: string
          thumbnail_path?: string | null
          title: string
          updated_at?: string | null
          uploader_id: string
          visibility?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration?: number | null
          file_path?: string
          file_size?: number | null
          id?: string
          slug?: string
          thumbnail_path?: string | null
          title?: string
          updated_at?: string | null
          uploader_id?: string
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "videos_uploader_id_fkey"
            columns: ["uploader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      watch_history: {
        Row: {
          completion_status: string | null
          episode_id: string
          id: string
          last_watched_position: number | null
          total_duration: number | null
          updated_at: string | null
          user_id: string
          watch_date: string | null
          watch_percentage: number | null
          watched_duration: number | null
        }
        Insert: {
          completion_status?: string | null
          episode_id: string
          id?: string
          last_watched_position?: number | null
          total_duration?: number | null
          updated_at?: string | null
          user_id: string
          watch_date?: string | null
          watch_percentage?: number | null
          watched_duration?: number | null
        }
        Update: {
          completion_status?: string | null
          episode_id?: string
          id?: string
          last_watched_position?: number | null
          total_duration?: number | null
          updated_at?: string | null
          user_id?: string
          watch_date?: string | null
          watch_percentage?: number | null
          watched_duration?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "watch_history_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
