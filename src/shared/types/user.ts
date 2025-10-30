export type User = {
  id: string;
  full_name: string;
  email: string;
  username: string;
  is_admin: boolean;
  role?: "super_admin" | "admin";
  created_at: string;

  plan_id: "free" | "pro";
  status: string;
  stripe_customer_id?: string;
  subscription_id?: string;
  latest_invoice_id?: string;
  joined?: string;
  canceled_at?: string | null;
};

