import type { UserRow } from "../types/UserRow";

export interface IUserDAO {
  insert(user: UserRow): Promise<void>;
  findByEmail(email: string): Promise<UserRow | null>;
}
