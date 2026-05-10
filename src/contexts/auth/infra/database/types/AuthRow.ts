export type AuthRow = {
  jti: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
  revokedAt: string | null;
};
