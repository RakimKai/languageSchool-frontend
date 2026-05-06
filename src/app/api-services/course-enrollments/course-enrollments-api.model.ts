// === DTOs ===

export interface CourseEnrollmentDto {
  id: number;
  enrollmentDate: string;
  isPaid: boolean;
  paymentDate: string | null;
  studentId: number;
  studentName: string | null;
  studentEmail: string | null;
  courseId: number;
  courseName: string | null;
  courseDate: string | null;
  createdAtUtc: string;
  modifiedAtUtc: string | null;
}

export interface CreateCourseEnrollmentDto {
  studentId: number;
  courseId: number;
  enrollmentDate: string;
}

export interface UpdatePaymentStatusDto {
  isPaid: boolean;
}
