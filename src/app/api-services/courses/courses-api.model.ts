// === DTOs ===

export interface CourseDto {
  id: number;
  name: string;
  description: string | null;
  courseDate: string;
  courseType: string | null;
  numberOfClasses: number | null;
  durationInHours: number | null;
  professorName: string | null;
  professorId: number | null;
  maxStudents: number | null;
  price: number | null;
  categoryId: number | null;
  categoryName: string | null;
  createdAtUtc: string;
  modifiedAtUtc: string | null;
}

export interface CoursesPagedQuery {
  page: number;
  pageSize: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  categoryId?: number;
  searchTerm?: string;
}

export interface CreateCourseDto {
  name: string;
  description?: string | null;
  courseDate: string;
  courseType?: string | null;
  numberOfClasses?: number | null;
  durationInHours?: number | null;
  professorName?: string | null;
  maxStudents?: number | null;
  price?: number | null;
  categoryId: number;
}

export interface UpdateCourseDto {
  id: number;
  name: string;
  description?: string | null;
  courseDate: string;
  courseType?: string | null;
  numberOfClasses?: number | null;
  durationInHours?: number | null;
  professorName?: string | null;
  maxStudents?: number | null;
  price?: number | null;
  categoryId: number;
}
