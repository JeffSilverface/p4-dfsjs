export interface CreateSession {
  name: string;
  date: string;
  description: string;
  teacherId: number;
}

export interface UpdateSession {
  name?: string;
  date?: Date;
  description?: string;
  teacherId?: number;
}
