import { format } from 'date-fns';

export const formatTimestamp = (dateString) => {
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) 
      ? "Unknown date" 
      : format(date, "MMM d, yyyy");
  } catch (error) {
    return "Invalid date";
  }
};