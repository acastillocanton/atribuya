export type Role = "admin" | "sales" | "reviews_manager";

export type ProfileStatus = "invited" | "active" | "paused";

export type MatchState = "counted" | "pending" | "unmatched";

export type OauthStatus = "disconnected" | "connected" | "error";

export type ShareSource = "whatsapp" | "email" | "sms" | "qr" | "direct";

export type OrgStatus = "trial" | "active" | "suspended" | "churned";

export type SupportCategory =
  | "general"
  | "review_question"
  | "technical"
  | "billing";

export type SupportStatus = "open" | "closed";

/**
 * Hand-rolled Database types. Replace with `supabase gen types typescript` output
 * once the project is linked to a Supabase project.
 */
export type Database = {
  public: {
    Tables: {
      locations: {
        Row: {
          id: string;
          name: string;
          google_place_id: string | null;
          google_account_id: string | null;
          google_location_resource: string | null;
          google_account_email: string | null;
          oauth_status: OauthStatus;
          oauth_last_sync_at: string | null;
          oauth_last_sync_error: string | null;
          created_at: string;
          org_id: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          google_place_id?: string | null;
          google_account_id?: string | null;
          google_location_resource?: string | null;
          google_account_email?: string | null;
          oauth_status?: OauthStatus;
          oauth_last_sync_at?: string | null;
          oauth_last_sync_error?: string | null;
          created_at?: string;
          org_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["locations"]["Insert"]>;
        Relationships: [];
      };
      location_secrets: {
        Row: {
          location_id: string;
          oauth_refresh_token: string | null;
          oauth_access_token: string | null;
          expires_at: string | null;
          updated_at: string;
        };
        Insert: {
          location_id: string;
          oauth_refresh_token?: string | null;
          oauth_access_token?: string | null;
          expires_at?: string | null;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["location_secrets"]["Insert"]>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          full_name: string;
          role: Role;
          location_id: string | null;
          slug: string;
          email: string | null;
          phone: string | null;
          monthly_goal: number;
          status: ProfileStatus;
          avatar_url: string | null;
          joined_at: string;
          org_id: string | null;
          message_templates: Record<string, string> | null;
        };
        Insert: {
          id: string;
          full_name: string;
          role: Role;
          location_id?: string | null;
          slug: string;
          email?: string | null;
          phone?: string | null;
          monthly_goal?: number;
          status?: ProfileStatus;
          avatar_url?: string | null;
          joined_at?: string;
          org_id?: string | null;
          message_templates?: Record<string, string> | null;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      clients: {
        Row: {
          id: string;
          sales_id: string;
          full_name: string;
          slug: string;
          email: string | null;
          phone: string | null;
          created_at: string;
          org_id: string | null;
        };
        Insert: {
          id?: string;
          sales_id: string;
          full_name: string;
          slug: string;
          email?: string | null;
          phone?: string | null;
          created_at?: string;
          org_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["clients"]["Insert"]>;
        Relationships: [];
      };
      share_links: {
        Row: {
          id: string;
          sales_id: string;
          client_id: string | null;
          location_id: string;
          link_token: string;
          opened_at: string;
          source: ShareSource;
          user_agent: string | null;
          org_id: string | null;
        };
        Insert: {
          id?: string;
          sales_id: string;
          client_id?: string | null;
          location_id: string;
          link_token: string;
          opened_at?: string;
          source?: ShareSource;
          user_agent?: string | null;
          org_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["share_links"]["Insert"]>;
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          location_id: string;
          google_review_id: string;
          author_name: string;
          rating: number;
          text: string | null;
          google_created_at: string;
          fetched_at: string;
          sales_id: string | null;
          client_id: string | null;
          share_link_id: string | null;
          match_confidence: number;
          match_state: MatchState;
          match_evidence: Record<string, unknown> | null;
          org_id: string | null;
          is_duplicate: boolean;
          low_rating_alerted_at: string | null;
        };
        Insert: {
          id?: string;
          location_id: string;
          google_review_id: string;
          author_name: string;
          rating: number;
          text?: string | null;
          google_created_at: string;
          fetched_at?: string;
          sales_id?: string | null;
          client_id?: string | null;
          share_link_id?: string | null;
          match_confidence?: number;
          match_state?: MatchState;
          match_evidence?: Record<string, unknown> | null;
          org_id?: string | null;
          is_duplicate?: boolean;
          low_rating_alerted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["reviews"]["Insert"]>;
        Relationships: [];
      };
      audit_log: {
        Row: {
          id: string;
          entity_type: string;
          entity_id: string;
          action: string;
          payload: Record<string, unknown> | null;
          created_at: string;
          org_id: string | null;
        };
        Insert: {
          id?: string;
          entity_type: string;
          entity_id: string;
          action: string;
          payload?: Record<string, unknown> | null;
          created_at?: string;
          org_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["audit_log"]["Insert"]>;
        Relationships: [];
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          status: OrgStatus;
          plan: string;
          billing_email: string | null;
          contact_name: string | null;
          contact_phone: string | null;
          fiscal_data: Record<string, unknown>;
          trial_ends_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          status?: OrgStatus;
          plan?: string;
          billing_email?: string | null;
          contact_name?: string | null;
          contact_phone?: string | null;
          fiscal_data?: Record<string, unknown>;
          trial_ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["organizations"]["Insert"]>;
        Relationships: [];
      };
      super_admins: {
        Row: {
          user_id: string;
          added_by: string | null;
          added_at: string;
          notes: string | null;
        };
        Insert: {
          user_id: string;
          added_by?: string | null;
          added_at?: string;
          notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["super_admins"]["Insert"]>;
        Relationships: [];
      };
      leads: {
        Row: {
          id: string;
          name: string;
          email: string;
          company: string;
          phone: string | null;
          message: string | null;
          source: string;
          user_agent: string | null;
          ip: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          company: string;
          phone?: string | null;
          message?: string | null;
          source?: string;
          user_agent?: string | null;
          ip?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["leads"]["Insert"]>;
        Relationships: [];
      };
      support_conversations: {
        Row: {
          id: string;
          org_id: string;
          subject: string;
          category: SupportCategory;
          status: SupportStatus;
          opener_id: string;
          linked_review_id: string | null;
          linked_client_id: string | null;
          created_at: string;
          closed_at: string | null;
          last_message_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          subject: string;
          category?: SupportCategory;
          status?: SupportStatus;
          opener_id: string;
          linked_review_id?: string | null;
          linked_client_id?: string | null;
          created_at?: string;
          closed_at?: string | null;
          last_message_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["support_conversations"]["Insert"]>;
        Relationships: [];
      };
      support_messages: {
        Row: {
          id: string;
          org_id: string;
          conversation_id: string;
          author_id: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          conversation_id: string;
          author_id: string;
          body: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["support_messages"]["Insert"]>;
        Relationships: [];
      };
      support_read_receipts: {
        Row: {
          user_id: string;
          conversation_id: string;
          org_id: string;
          last_read_at: string;
        };
        Insert: {
          user_id: string;
          conversation_id: string;
          org_id: string;
          last_read_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["support_read_receipts"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      current_org_id: {
        Args: Record<string, never>;
        Returns: string | null;
      };
      is_super_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      current_role: {
        Args: Record<string, never>;
        Returns: Role | null;
      };
      support_unread_count: {
        Args: Record<string, never>;
        Returns: number;
      };
    };
    Enums: {
      role_enum: Role;
      profile_status_enum: ProfileStatus;
      match_state_enum: MatchState;
      oauth_status_enum: OauthStatus;
      share_source_enum: ShareSource;
      org_status_enum: OrgStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
