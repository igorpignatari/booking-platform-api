import type { UserRole } from "./UserRole";

export type AuthUserRow = {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  created_at: string;
  updated_at: string;
  role: UserRole;
};
