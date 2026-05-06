// === DTOs ===

export interface NotificationDto {
  id: number;
  title: string;
  content: string;
  createdByUserId: number | null;
  createdAtUtc: string;
  modifiedAtUtc: string | null;
}

export interface CreateNotificationDto {
  title: string;
  content: string;
}

export interface UpdateNotificationDto {
  title: string;
  content: string;
}
