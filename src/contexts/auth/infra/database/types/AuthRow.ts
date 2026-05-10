export type AuthRow = {
  jti: string;
  user_id: string;
  created_at: string;
  expires_at: string;
  revoked_at: string | null;
};
