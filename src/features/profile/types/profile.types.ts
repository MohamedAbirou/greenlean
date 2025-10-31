export interface Profile {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
    username: string | null;
    age: number | null;
    date_of_birth: string | null;
    gender: string | null;
    country: string | null;
    height_cm: number | null;
    weight_kg: number | null;
    occupation_activity: string | null;
    unit_system: 'metric' | 'imperial';
    onboarding_completed: boolean;
    plan_id: string;
    plan_renewal_date: string | null;
    ai_gen_quiz_count: number;
    stripe_customer_id: string | null;
    admin_users: {
      role: "admin" | "super_admin";
    };
  }
  
  export interface ProfileUpdateData {
    full_name?: string;
    username?: string;
    avatar_url?: string | null;
    age?: number;
    date_of_birth?: string;
    gender?: string;
    country?: string;
    height_cm?: number;
    weight_kg?: number;
    occupation_activity?: string;
    unit_system?: 'metric' | 'imperial';
  }
  
  export interface SubscriptionInfo {
    subscription_id: string;
    status: string;
    current_period_end: number;
    cancel_at_period_end: boolean;
    plan_id: string;
    plan_name: string;
  }
  
  export interface Invoice {
    id: string;
    amount_due: number;
    amount_paid: number;
    created: number;
    currency: string;
    hosted_invoice_url: string;
    invoice_pdf: string;
    status: string;
    period_start: number;
    period_end: number;
  }
  
  export interface PlanInfo {
    planId: string;
    planName: string;
    aiGenQuizCount: number;
    allowed: number;
    renewal: string;
  }