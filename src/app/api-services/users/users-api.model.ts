// === DTOs ===

export interface UserDto {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  address: string | null;
  phoneNumber: string | null;
  profileImagePath: string | null;
  cityId: number | null;
  cityName: string | null;
  role: string;
  createdAtUtc: string;
  modifiedAtUtc: string | null;
}

export interface UpdateUserDto {
  id: number;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  address?: string | null;
  phoneNumber?: string | null;
  cityId?: number | null;
}

export interface ProfileImageUploadResponse {
  imageUrl: string;
}
