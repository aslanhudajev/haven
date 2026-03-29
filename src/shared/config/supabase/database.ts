export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          onboarding_completed: boolean;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          onboarding_completed?: boolean;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          onboarding_completed?: boolean;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      families: {
        Row: {
          id: string;
          name: string;
          budget_cents: number | null;
          currency: string;
          owner_id: string;
          is_active: boolean;
          max_members: number;
          period_cadence: string;
          period_anchor_day: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          budget_cents?: number | null;
          currency?: string;
          owner_id: string;
          is_active?: boolean;
          max_members?: number;
          period_cadence?: string;
          period_anchor_day?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          budget_cents?: number | null;
          currency?: string;
          owner_id?: string;
          is_active?: boolean;
          max_members?: number;
          period_cadence?: string;
          period_anchor_day?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      family_members: {
        Row: {
          id: string;
          family_id: string;
          user_id: string;
          role: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          family_id: string;
          user_id: string;
          role?: string;
          joined_at?: string;
        };
        Update: {
          id?: string;
          family_id?: string;
          user_id?: string;
          role?: string;
          joined_at?: string;
        };
        Relationships: [];
      };
      family_invites: {
        Row: {
          id: string;
          family_id: string;
          code: string;
          created_by: string;
          expires_at: string;
          used_by: string | null;
          used_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          family_id: string;
          code?: string;
          created_by: string;
          expires_at?: string;
          used_by?: string | null;
          used_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          family_id?: string;
          code?: string;
          created_by?: string;
          expires_at?: string;
          used_by?: string | null;
          used_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      periods: {
        Row: {
          id: string;
          family_id: string;
          name: string;
          starts_at: string;
          ends_at: string;
          status: string;
          resolved_at: string | null;
          resolved_by: string | null;
          period_end_push_sent_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          family_id: string;
          name: string;
          starts_at: string;
          ends_at: string;
          status?: string;
          resolved_at?: string | null;
          resolved_by?: string | null;
          period_end_push_sent_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          family_id?: string;
          name?: string;
          starts_at?: string;
          ends_at?: string;
          status?: string;
          resolved_at?: string | null;
          resolved_by?: string | null;
          period_end_push_sent_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      push_tokens: {
        Row: {
          user_id: string;
          expo_push_token: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          expo_push_token: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          expo_push_token?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      purchases: {
        Row: {
          id: string;
          family_id: string;
          period_id: string;
          user_id: string;
          amount_cents: number;
          description: string;
          receipt_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          family_id: string;
          period_id: string;
          user_id: string;
          amount_cents: number;
          description: string;
          receipt_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          family_id?: string;
          period_id?: string;
          user_id?: string;
          amount_cents?: number;
          description?: string | null;
          receipt_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      redeem_family_invite: {
        Args: { p_code: string };
        Returns: string;
      };
      transfer_family_ownership: {
        Args: { p_new_owner_user_id: string };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

type DefaultSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  T extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views']),
> = (DefaultSchema['Tables'] & DefaultSchema['Views'])[T] extends { Row: infer R } ? R : never;
