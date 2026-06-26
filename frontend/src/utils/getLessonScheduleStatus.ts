import type { Lesson, LessonScheduleStatus } from "@/types/coordinator";

const getUtcDay = (date: Date) => {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
};

export const getLessonScheduleStatus = (
  lesson: Lesson,
  referenceDate = new Date(),
): LessonScheduleStatus => {
  if (lesson.status === "realizada") {
    return "concluida";
  }

  if (lesson.status === "cancelada") {
    return "cancelada";
  }

  const lessonDay = new Date(`${lesson.data}T00:00:00Z`).getTime();

  return lessonDay >= getUtcDay(referenceDate) ? "proxima" : "pendente";
};
