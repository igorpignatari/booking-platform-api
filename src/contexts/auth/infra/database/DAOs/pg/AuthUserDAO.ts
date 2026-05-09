import type { Database } from "@shared/application/contracts/Database";
import type { AuthUserRow } from "../../types/AuthUserRow";
import type { IAuthUserDAO } from "../IAuthUserDAO";

export class AuthUserDAO implements IAuthUserDAO {
  constructor(private readonly db: Database) {}

  findByEmail(email: string): Promise<AuthUserRow | null> {
    return this.db.oneOrNone("SELECT * FROM users WHERE email = $1", [email]);
  }

  findByUserId(userId: string): Promise<AuthUserRow | null> {
    return this.db.oneOrNone("SELECT * FROM users WHERE userId = $1", [userId]);
  }
}
