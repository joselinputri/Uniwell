// ✅ FIXED: Comprehensive form validation utilities

import { 
    EXPENSE_CATEGORIES, 
    MAX_AVATAR_SIZE, 
    MAX_RECEIPT_SIZE, 
    ALLOWED_IMAGE_TYPES,
    TASK_PRIORITIES,
    MOOD_TYPES
  } from "@/lib/constants";
  import type { ExpenseCategory, TaskPriority, MoodType } from "@/lib/constants";
  
  export interface ValidationResult {
    valid: boolean;
    message?: string;
  }
  
  /**
   * Validate email format
   */
  export const validateEmail = (email: string): ValidationResult => {
    if (!email) {
      return { valid: false, message: "Email is required" };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, message: "Invalid email format" };
    }
    
    return { valid: true };
  };
  
  /**
   * Validate password strength
   */
  export const validatePassword = (password: string): ValidationResult => {
    if (!password) {
      return { valid: false, message: "Password is required" };
    }
    
    if (password.length < 6) {
      return { valid: false, message: "Password must be at least 6 characters" };
    }
    
    if (password.length > 50) {
      return { valid: false, message: "Password is too long" };
    }
    
    return { valid: true };
  };
  
  /**
   * Validate name
   */
  export const validateName = (name: string): ValidationResult => {
    if (!name || !name.trim()) {
      return { valid: false, message: "Name is required" };
    }
    
    if (name.trim().length < 2) {
      return { valid: false, message: "Name must be at least 2 characters" };
    }
    
    if (name.length > 100) {
      return { valid: false, message: "Name is too long" };
    }
    
    return { valid: true };
  };
  
  /**
   * Validate expense amount
   */
  export const validateAmount = (amount: number | string): ValidationResult => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (isNaN(num)) {
      return { valid: false, message: "Amount must be a number" };
    }
    
    if (num <= 0) {
      return { valid: false, message: "Amount must be greater than 0" };
    }
    
    if (num > 100000000) {
      return { valid: false, message: "Amount is too large (max: 100,000,000)" };
    }
    
    return { valid: true };
  };
  
  /**
   * Validate expense category
   */
  export const validateCategory = (category: string): ValidationResult => {
    if (!EXPENSE_CATEGORIES.includes(category as ExpenseCategory)) {
      return { 
        valid: false, 
        message: `Invalid category. Must be one of: ${EXPENSE_CATEGORIES.join(", ")}` 
      };
    }
    
    return { valid: true };
  };
  
  /**
   * Validate task priority
   */
  export const validatePriority = (priority: string): ValidationResult => {
    if (!TASK_PRIORITIES.includes(priority as TaskPriority)) {
      return { 
        valid: false, 
        message: `Invalid priority. Must be: low, medium, or high` 
      };
    }
    
    return { valid: true };
  };
  
  /**
   * Validate mood type
   */
  export const validateMood = (mood: string): ValidationResult => {
    if (!MOOD_TYPES.includes(mood as MoodType)) {
      return { 
        valid: false, 
        message: `Invalid mood type` 
      };
    }
    
    return { valid: true };
  };
  
  /**
   * Validate file upload (image)
   */
  export const validateImageFile = (
    file: File,
    maxSize: number = MAX_AVATAR_SIZE
  ): ValidationResult => {
    if (!file) {
      return { valid: false, message: "No file selected" };
    }
    
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return { 
        valid: false, 
        message: "Invalid file type. Please upload JPG, PNG, GIF, or WEBP" 
      };
    }
    
    if (file.size > maxSize) {
      const maxMB = (maxSize / 1024 / 1024).toFixed(0);
      return { 
        valid: false, 
        message: `File is too large. Maximum size is ${maxMB}MB` 
      };
    }
    
    return { valid: true };
  };
  
  /**
   * Validate receipt file (image or PDF)
   */
  export const validateReceiptFile = (file: File): ValidationResult => {
    if (!file) {
      return { valid: false, message: "No file selected" };
    }
    
    const allowedTypes = [...ALLOWED_IMAGE_TYPES, "application/pdf"];
    
    if (!allowedTypes.includes(file.type)) {
      return { 
        valid: false, 
        message: "Invalid file type. Please upload an image or PDF" 
      };
    }
    
    if (file.size > MAX_RECEIPT_SIZE) {
      const maxMB = (MAX_RECEIPT_SIZE / 1024 / 1024).toFixed(0);
      return { 
        valid: false, 
        message: `File is too large. Maximum size is ${maxMB}MB` 
      };
    }
    
    return { valid: true };
  };
  
  /**
   * Validate number range
   */
  export const validateNumberRange = (
    value: number,
    min: number,
    max: number,
    fieldName: string = "Value"
  ): ValidationResult => {
    if (isNaN(value)) {
      return { valid: false, message: `${fieldName} must be a number` };
    }
    
    if (value < min) {
      return { valid: false, message: `${fieldName} must be at least ${min}` };
    }
    
    if (value > max) {
      return { valid: false, message: `${fieldName} must not exceed ${max}` };
    }
    
    return { valid: true };
  };
  
  /**
   * Validate required field
   */
  export const validateRequired = (value: any, fieldName: string = "Field"): ValidationResult => {
    if (value === null || value === undefined || value === '') {
      return { valid: false, message: `${fieldName} is required` };
    }
    
    if (typeof value === 'string' && !value.trim()) {
      return { valid: false, message: `${fieldName} is required` };
    }
    
    return { valid: true };
  };