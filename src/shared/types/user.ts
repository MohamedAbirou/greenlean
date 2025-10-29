export type User = {
  id: string;
  full_name: string;
  email: string;
  username: string;
  is_admin: boolean;
  role?: "super_admin" | "admin";
  created_at: string;
};