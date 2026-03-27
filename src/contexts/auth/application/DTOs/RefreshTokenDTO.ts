import type { AuthResponse } from "./AuthResponseDTO";

export type RefreshTokenRequest = Omit<AuthResponse, "accessToken">;
