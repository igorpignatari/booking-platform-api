import type { AuthUserRow } from "../types/AuthUserRow";

export interface IAuthUserDAO {
  findByEmail(email: string): Promise<AuthUserRow | null>;
  findByUserId(userId: string): Promise<AuthUserRow | null>;
}
