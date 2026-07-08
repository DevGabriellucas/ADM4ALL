export function formatAcademicPeriod(
  date: string | Date | null | undefined,
): string {
  if (!date) return "-";

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "-";

  const year = parsedDate.getFullYear();
  const month = parsedDate.getMonth() + 1;
  const semester = month <= 6 ? 1 : 2;

  return `${year}.${semester}`;
}
