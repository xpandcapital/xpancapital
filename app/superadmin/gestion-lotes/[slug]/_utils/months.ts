import { MONTH_NAMES } from './constants';

export function generateMonthList(start: string, end: string, exclusiveEnd: boolean = false): string[] {
  const months: string[] = [];
  if (!start || !end) return months;
  const [sYear, sMonth] = start.split('-').map(Number);
  const [eYear, eMonth] = end.split('-').map(Number);

  let currYear = sYear;
  let currMonth = sMonth;
  let safety = 0;

  while ((currYear < eYear || (currYear === eYear && currMonth <= eMonth)) && safety < 240) {
    safety++;
    if (exclusiveEnd && currYear === eYear && currMonth === eMonth) break;
    months.push(`${MONTH_NAMES[currMonth - 1]} ${currYear}`);
    currMonth++;
    if (currMonth > 12) {
      currMonth = 1;
      currYear++;
    }
  }
  return months;
}

export function getMonthsDifference(start: string, end: string): number {
  if (!start || !end) return 0;
  const [sYear, sMonth] = start.split('-').map(Number);
  const [eYear, eMonth] = end.split('-').map(Number);
  return (eYear * 12 + eMonth) - (sYear * 12 + sMonth);
}

export function formatMonthYear(yyyy_mm: string): string {
  if (!yyyy_mm) return '';
  const [y, m] = yyyy_mm.split('-');
  return `${MONTH_NAMES[parseInt(m) - 1]} ${y}`;
}
