import { addDays, getDay, format } from 'date-fns';

export function getNextWorkingWeekDate(dateString = new Date()) {
  let nextWeek = addDays(new Date(dateString), 7);
  const day = getDay(nextWeek);
  
  if (day === 6) { // Saturday
    nextWeek = addDays(nextWeek, 2);
  } else if (day === 0) { // Sunday
    nextWeek = addDays(nextWeek, 1);
  }
  
  return format(nextWeek, 'yyyy-MM-dd');
}
