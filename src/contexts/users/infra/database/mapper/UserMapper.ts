import { User } from "@contexts/users/domain/entity/User";
import type { UserRow } from "../types/UserRow";

export class UserMapper {
  static toDomain(userRow: UserRow): User {
    return User.createFromPersisted({
      id: userRow.id,
      name: userRow.name,
      email: userRow.email,
      password: userRow.password,
      phone: userRow.phone,
      createdAt: new Date(userRow.created_at),
      updatedAt: new Date(userRow.updated_at),
      role: userRow.role,
    });
  }

  static toRow(user: User): UserRow {
    return {
      id: user.id,
      name: user.name,
      email: user.email.getValue(),
      password: user.password.getValue(),
      phone: user.phone,
      created_at: user.createdAt.toISOString(),
      updated_at: user.updatedAt.toISOString(),
      role: user.role.getValue(),
    };
  }
}
