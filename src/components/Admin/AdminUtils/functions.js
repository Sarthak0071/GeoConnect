import { format } from 'date-fns';

export const formatTimestamp = (dateString) => {
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) 
      ? "Unknown time" 
      : `${format(date, "MMM d, yyyy")} at ${format(date, "h:mm a")}`;
  } catch (error) {
    return "Invalid date";
  }
};