// ✅ FIXED: Centralized date utilities with timezone handling

/**
 * Get today's date in YYYY-MM-DD format (local timezone)
 */
export const getTodayDate = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  /**
   * Format date to YYYY-MM-DD
   */
  export const formatDate = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  /**
   * Format time to HH:mm
   */
  export const formatTime = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };
  
  /**
   * Combine date and time strings into ISO string
   */
  export const combineDateAndTime = (date: string, time: string): string => {
    return `${date}T${time}:00.000Z`;
  };
  
  /**
   * Check if date is in the past
   */
  export const isPastDate = (date: string): boolean => {
    const today = getTodayDate();
    return date < today;
  };
  
  /**
   * Check if date is today
   */
  export const isToday = (date: string): boolean => {
    return date === getTodayDate();
  };
  
  /**
   * Get date N days from now/ago
   */
  export const addDays = (days: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return formatDate(date);
  };
  
  /**
   * Get relative date string (Today, Yesterday, Tomorrow, or date)
   */
  export const getRelativeDateString = (date: string): string => {
    const today = getTodayDate();
    const yesterday = addDays(-1);
    const tomorrow = addDays(1);
  
    if (date === today) return "Today";
    if (date === yesterday) return "Yesterday";
    if (date === tomorrow) return "Tomorrow";
  
    const d = new Date(date);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };
  
  /**
   * Parse date from various formats
   */
  export const parseDate = (dateString: string): Date => {
    // Handle ISO format
    if (dateString.includes('T')) {
      return new Date(dateString);
    }
    
    // Handle YYYY-MM-DD format
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };