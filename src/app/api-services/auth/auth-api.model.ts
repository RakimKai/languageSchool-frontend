// === COMMANDS (WRITE) ===

/**
 * Command for POST /Auth/login
 * Corresponds to: LoginCommand.cs
 */
export interface LoginCommand {
  email: string;
  password: string;
  fingerprint?: string | null;
  recaptchaToken?: string | null;
}

/**
 * Response for POST /Auth/login
 * Corresponds to: LoginCommandDto.cs
 */
export interface LoginCommandDto {
  accessToken: string;
  refreshToken: string;
  /**
   * ISO string (UTC) returned by backend
   * Example: "2025-12-02T23:59:59Z"
   */
  expiresAtUtc: string;
}

/**
 * Command for POST /Auth/refresh
 * Corresponds to: RefreshTokenCommand.cs
 */
export interface RefreshTokenCommand {
  refreshToken: string;
  fingerprint?: string | null;
}

/**
 * Response for POST /Auth/refresh
 * Corresponds to: RefreshTokenCommandDto.cs
 */
export interface RefreshTokenCommandDto {
  accessToken: string;
  refreshToken: string;
  /**
   * ISO string (UTC) when access token expires
   */
  accessTokenExpiresAtUtc: string;
  /**
   * ISO string (UTC) when refresh token expires
   */
  refreshTokenExpiresAtUtc: string;
}

/**
 * Command for POST /Auth/logout
 * Corresponds to: LogoutCommand.cs
 */
export interface LogoutCommand {
  refreshToken: string;
}

/**
 * Command for POST /Auth/register
 * Corresponds to: RegisterCommand.cs
 */
export interface RegisterCommand {
  email: string;
  password: string;
  firstname: string;
  lastname: string;
  username?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  fingerprint?: string | null;
}

/**
 * Response for POST /Auth/register
 * Corresponds to: RegisterCommandDto.cs
 */
export interface RegisterCommandDto {
  accessToken: string;
  refreshToken: string;
  expiresAtUtc: string;
}
