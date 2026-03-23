import type { AuthUser } from "@contexts/auth/domain/entities/AuthUser";
import type { Result } from "@core/result/Result";

export interface AuthUserRepository {
  findByEmailForAuth(email: string): Promise<Result<AuthUser | null>>;
}
