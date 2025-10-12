/**
 * Timezone Utility Functions
 * Helpers for handling timezone conversions and formatting
 */

/**
 * Get the user's current timezone
 * @returns IANA timezone identifier (e.g., "Asia/Kolkata", "Europe/Berlin")
 */
export const getUserTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

/**
 * Format a datetime-local input value to ISO-8601 with timezone offset
 * Format: yyyy-MM-dd'T'HH:mm:ssXXX (e.g., "2025-12-25T14:30:00+05:30")
 * 
 * @param datetimeLocal - Datetime string from datetime-local input
 * @returns ISO-8601 formatted string with timezone offset
 */
export const formatDateTimeWithTimezone = (datetimeLocal: string): string => {
  const date = new Date(datetimeLocal);
  
  // Get timezone offset in minutes
  const timezoneOffset = -date.getTimezoneOffset();
  const offsetHours = Math.floor(Math.abs(timezoneOffset) / 60);
  const offsetMinutes = Math.abs(timezoneOffset) % 60;
  const offsetSign = timezoneOffset >= 0 ? '+' : '-';
  
  // Format date components
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const offsetHoursStr = String(offsetHours).padStart(2, '0');
  const offsetMinutesStr = String(offsetMinutes).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${offsetSign}${offsetHoursStr}:${offsetMinutesStr}`;
};

/**
 * Format a datetime string for display in the user's local timezone
 * 
 * @param datetimeString - ISO-8601 datetime string
 * @param options - Intl.DateTimeFormatOptions for formatting
 * @returns Formatted datetime string
 */
export const formatLocalDateTime = (
  datetimeString: string,
  options: Intl.DateTimeFormatOptions = {
    dateStyle: 'medium',
    timeStyle: 'short'
  }
): string => {
  const date = new Date(datetimeString);
  return date.toLocaleString('en-US', options);
};

/**
 * Format a datetime string in a specific timezone
 * 
 * @param datetimeString - ISO-8601 datetime string
 * @param timezone - IANA timezone identifier
 * @param options - Intl.DateTimeFormatOptions for formatting
 * @returns Formatted datetime string
 */
export const formatDateTimeInTimezone = (
  datetimeString: string,
  timezone: string,
  options: Intl.DateTimeFormatOptions = {
    dateStyle: 'medium',
    timeStyle: 'short'
  }
): string => {
  const date = new Date(datetimeString);
  return date.toLocaleString('en-US', {
    ...options,
    timeZone: timezone
  });
};

/**
 * Get timezone offset string (e.g., "+05:30", "-08:00")
 * 
 * @param date - Date object (defaults to now)
 * @returns Timezone offset string
 */
export const getTimezoneOffset = (date: Date = new Date()): string => {
  const offset = -date.getTimezoneOffset();
  const offsetHours = Math.floor(Math.abs(offset) / 60);
  const offsetMinutes = Math.abs(offset) % 60;
  const sign = offset >= 0 ? '+' : '-';
  
  return `${sign}${String(offsetHours).padStart(2, '0')}:${String(offsetMinutes).padStart(2, '0')}`;
};

/**
 * Get timezone abbreviation (e.g., "IST", "CET", "EST")
 * Note: This may not work in all browsers/environments
 * 
 * @param date - Date object (defaults to now)
 * @returns Timezone abbreviation
 */
export const getTimezoneAbbreviation = (date: Date = new Date()): string => {
  const dateString = date.toLocaleString('en-US', {
    timeZoneName: 'short'
  });
  
  // Extract timezone abbreviation from the end of the string
  const parts = dateString.split(' ');
  return parts[parts.length - 1];
};

/**
 * Check if a datetime is in the past
 * 
 * @param datetimeString - ISO-8601 datetime string
 * @returns true if the datetime is in the past
 */
export const isDateTimeInPast = (datetimeString: string): boolean => {
  const date = new Date(datetimeString);
  return date.getTime() < Date.now();
};

/**
 * Get minimum datetime for datetime-local input (now)
 * 
 * @returns Datetime string in format required by datetime-local input
 */
export const getMinDateTime = (): string => {
  return new Date().toISOString().slice(0, 16);
};

/**
 * Format trip time for display - shows both original and user's local time
 * 
 * @param tripDateTime - ISO-8601 datetime string from API
 * @param tripTimezone - IANA timezone of the trip
 * @returns Object with originalTime and localTime formatted strings
 */
export const formatTripTime = (
  tripDateTime: string,
  tripTimezone: string
): { originalTime: string; localTime: string; isDifferentTimezone: boolean } => {
  const date = new Date(tripDateTime);
  const userTimezone = getUserTimezone();
  
  // Original time (where trip actually happens)
  const originalTime = date.toLocaleString('en-US', {
    timeZone: tripTimezone,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // User's local time
  const localTime = date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return {
    originalTime,
    localTime,
    isDifferentTimezone: userTimezone !== tripTimezone
  };
};

/**
 * Common timezone identifiers by region
 */
export const COMMON_TIMEZONES = {
  // Asia
  INDIA: 'Asia/Kolkata',
  JAPAN: 'Asia/Tokyo',
  CHINA: 'Asia/Shanghai',
  DUBAI: 'Asia/Dubai',
  SINGAPORE: 'Asia/Singapore',
  
  // Europe
  UK: 'Europe/London',
  GERMANY: 'Europe/Berlin',
  FRANCE: 'Europe/Paris',
  SPAIN: 'Europe/Madrid',
  ITALY: 'Europe/Rome',
  
  // Americas
  US_EAST: 'America/New_York',
  US_CENTRAL: 'America/Chicago',
  US_MOUNTAIN: 'America/Denver',
  US_WEST: 'America/Los_Angeles',
  CANADA_EAST: 'America/Toronto',
  BRAZIL: 'America/Sao_Paulo',
  
  // Oceania
  AUSTRALIA_EAST: 'Australia/Sydney',
  NEW_ZEALAND: 'Pacific/Auckland',
  
  // UTC
  UTC: 'UTC'
} as const;
