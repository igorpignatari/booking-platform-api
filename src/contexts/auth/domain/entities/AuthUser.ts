import type { TAuthUser } from "../types/TAuthUser";

export class AuthUser {
  private constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly password: string,
    public readonly role: string,
  ) {}

  static create(authUser: TAuthUser): AuthUser {
    return new AuthUser(authUser.id, authUser.email, authUser.password, authUser.role);
  }
}
