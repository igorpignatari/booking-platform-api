import type { AuthRow } from "../types/AuthRow";

export interface IAuthDAO {
  insert(row: AuthRow): Promise<void>;
  findByJti(jti: string): Promise<AuthRow | null>;
  update(row: AuthRow): Promise<void>;
  findAllByUserId(userId: string): Promise<AuthRow[]>;
  updateMany(rows: AuthRow[]): Promise<void>;
}
