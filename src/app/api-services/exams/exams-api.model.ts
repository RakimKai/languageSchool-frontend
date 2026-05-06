// === DTOs ===

export interface ExamDto {
  id: number;
  name: string;
  examDate: string;
  price: number | null;
  courseId: number;
  courseName: string | null;
  createdAtUtc: string;
  modifiedAtUtc: string | null;
}

export interface CreateExamDto {
  name: string;
  examDate: string;
  price?: number | null;
  courseId: number;
}

export interface UpdateExamDto {
  id: number;
  name: string;
  examDate: string;
  price?: number | null;
  courseId: number;
}
