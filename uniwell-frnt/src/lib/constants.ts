// ✅ CENTRALIZED CONSTANTS - Single source of truth

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE || "http://localhost:5050/api";
export const API_TIMEOUT = 30000; // 30 seconds

// ✅ Expense Categories (MUST match backend)
export const EXPENSE_CATEGORIES = [
  "Food",
  "Academic",
  "Lifestyle",
  "Transport",
  "Health",
  "Entertainment",
  "Others"
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];

// ✅ Category Colors
export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Food: "hsl(var(--category-food))",
  Academic: "hsl(var(--category-academic))",
  Lifestyle: "hsl(var(--category-lifestyle))",
  Transport: "hsl(var(--category-transport))",
  Health: "hsl(var(--wellness-pink))",
  Entertainment: "hsl(var(--wellness-lavender))",
  Others: "hsl(var(--category-others))",
};

// ✅ Upload Limits
export const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_RECEIPT_SIZE = 10 * 1024 * 1024; // 10MB

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp"
];

// ✅ Health Configuration
export const DEFAULT_WATER_GOAL = 2000; // ml
export const DEFAULT_SLEEP_GOAL = 8; // hours

export const MOOD_TYPES = ["excellent", "good", "neutral", "poor", "bad"] as const;
export type MoodType = typeof MOOD_TYPES[number];

// ✅ Task Configuration
export const TASK_PRIORITIES = ["low", "medium", "high"] as const;
export type TaskPriority = typeof TASK_PRIORITIES[number];

export const TASK_CATEGORIES = [
  "Academic",
  "Personal",
  "Work",
  "Health",
  "Social",
  "General"
] as const;

// ✅ Date/Time Formats
export const DATE_FORMAT = "YYYY-MM-DD";
export const TIME_FORMAT = "HH:mm";
export const DATETIME_FORMAT = "YYYY-MM-DDTHH:mm";

// ✅ LocalStorage Keys
export const STORAGE_KEYS = {
  TOKEN: "token",
  USER: "uniwell_user",
  THEME: "uniwell_theme"
} as const;