import { AuthUser } from "@contexts/auth/domain/entities/AuthUser";
import type { AuthUserRow } from "../types/AuthUserRow";

export class AuthUserMapper {
  static toDomain(row: AuthUserRow): AuthUser {
    return AuthUser.create({
      id: row.id,
      email: row.email,
      password: row.password,
      role: row.role,
    });
  }
}
