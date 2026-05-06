export interface CurrentUserDto {
  userId: number;
  email: string;
  firstname: string;
  lastname: string;
  isAdmin: boolean;
  isManager: boolean;
  isEmployee: boolean;
  tokenVersion: number;
}
