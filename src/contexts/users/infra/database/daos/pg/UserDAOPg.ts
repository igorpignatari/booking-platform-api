import type { Database } from "@shared/application/contracts/Database";
import type { UserRow } from "../../types/UserRow";
import type { IUserDAO } from "../IUserDAO";

export class UserDAOPg implements IUserDAO {
  constructor(private readonly db: Database) {}

  async insert(user: UserRow): Promise<void> {
    await this.db.none(
      `INSERT INTO users (id, name, email, password, phone, created_at, updated_at, role)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        user.id,
        user.name,
        user.email,
        user.password,
        user.phone,
        user.created_at,
        user.updated_at,
        user.role,
      ],
    );
  }

  async findByEmail(email: string): Promise<UserRow | null> {
    return this.db.oneOrNone("SELECT * FROM users WHERE email = $1", [email]);
  }
}
