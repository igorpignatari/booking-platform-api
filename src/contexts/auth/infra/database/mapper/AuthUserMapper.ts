import { AuthUser } from "@contexts/auth/domain/entities/AuthUser";
import type { UserRow } from "@contexts/users/infra/database/dao/type/UserRow";

export class AuthUserMapper {
  static toDomain(row: UserRow): AuthUser {
    return AuthUser.create({
      id: row.id,
      email: row.email,
      password: row.password,
      role: row.role,
    });
  }
}
