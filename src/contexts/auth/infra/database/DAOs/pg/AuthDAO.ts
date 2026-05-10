import type { Database } from "@shared/application/contracts/Database";
import type { AuthRow } from "../../types/AuthRow";
import type { IAuthDAO } from "../IAuthDAO";

export class AuthDAO implements IAuthDAO {
  constructor(private readonly db: Database) {}

  async insert(row: AuthRow): Promise<void> {
    await this.db.none(
      "INSERT INTO auth (jti, user_id, created_at, expires_at, revoked_at) VALUES ($1, $2, $3, $4, $5)",
      [row.jti, row.user_id, row.created_at, row.expires_at, row.revoked_at],
    );
  }

  async findByJti(jti: string): Promise<AuthRow | null> {
    return this.db.oneOrNone("SELECT * FROM auth WHERE jti = $1", [jti]);
  }

  async update(row: AuthRow): Promise<void> {
    await this.db.none("UPDATE auth SET revoked_at = $1 WHERE jti = $2", [row.revoked_at, row.jti]);
  }

  async findAllByUserId(userId: string): Promise<AuthRow[]> {
    return this.db.manyOrNone("SELECT * FROM auth WHERE user_id = $1", [userId]);
  }

  async updateMany(rows: AuthRow[]): Promise<void> {
    if (rows.length === 0) return;

    await this.db.none("UPDATE auth SET revoked_at = NOW() WHERE jti = ANY($1::uuid[])", [
      rows.map((r) => r.jti),
    ]);
  }
}
