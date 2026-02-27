export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export const validateUsername = (username: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (username.length < 3) {
    errors.push('Username must be at least 3 characters long');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export const validatePhoneNumber = (phone: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Simple phone validation - adjust based on your needs
  if (!/^\+?[\d\s\-()]{10,}$/.test(phone.replace(/\s/g, ''))) {
    errors.push('Please enter a valid phone number');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export const generateOTP = (length: number = 6): string => {
  return Math.random()
    .toString()
    .slice(2, 2 + length);
};

export const isValidOTP = (otp: string, length: number = 6): boolean => {
  return /^\d+$/.test(otp) && otp.length === length;
};
