// === DTOs ===

export interface CourseCategoryDto {
  id: number;
  name: string;
  description: string | null;
  isEnabled: boolean;
  createdAtUtc: string;
  modifiedAtUtc: string | null;
}

export interface CreateCourseCategoryDto {
  name: string;
  description?: string | null;
  isEnabled?: boolean;
}

export interface UpdateCourseCategoryDto {
  name: string;
  description?: string | null;
  isEnabled?: boolean;
}
