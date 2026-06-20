import { body, param, query, validationResult } from 'express-validator';

export const validate = (req, _res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(errors.array().map((e) => e.msg).join(', '));
    error.statusCode = 400;
    return next(error);
  }
  next();
};

export const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 }).withMessage('Name too long'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

export const loginRules = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

export const verifyEmailRules = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits').isNumeric().withMessage('OTP must be numeric'),
];

export const resendOtpRules = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
];

export const updateProfileRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 }).withMessage('Name too long'),
];

export const updatePasswordRules = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
];

export const updateSettingsRules = [
  body('currency').isIn(['USD', 'EUR', 'GBP', 'INR', 'BDT', 'JPY', 'CAD', 'AUD']).withMessage('Invalid currency'),
];

export const budgetRules = [
  body('month').matches(/^\d{4}-\d{2}$/).withMessage('Month must be in YYYY-MM format'),
  body('categories')
    .isObject().withMessage('Categories must be an object')
    .custom((val) => Object.values(val).every((v) => typeof v === 'number' && v >= 0))
    .withMessage('All category values must be non-negative numbers'),
];

export const expenseRules = [
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('category').notEmpty().withMessage('Category is required').isString().toLowerCase(),
  body('date').isISO8601().withMessage('Valid date is required').toDate(),
  body('note').optional().isLength({ max: 200 }).withMessage('Note too long'),
  body('isRecurring').optional().isBoolean().withMessage('isRecurring must be boolean'),
  body('accountId').optional({ nullable: true }).isMongoId().withMessage('Invalid account ID'),
];

export const categoryRules = [
  body('name').trim().notEmpty().withMessage('Category name is required').isLength({ max: 40 }),
  body('icon').optional().isString().isLength({ max: 8 }),
  body('color').optional().matches(/^#[0-9a-fA-F]{6}$/).withMessage('Color must be a valid hex code'),
  body('order').optional().isInt({ min: 0 }),
];

export const accountRules = [
  body('name').trim().notEmpty().withMessage('Account name is required').isLength({ max: 60 }),
  body('bankName').optional().isLength({ max: 80 }),
  body('accountType').optional().isIn(['savings', 'checking', 'credit', 'cash']),
  body('balance').optional().isFloat(),
  body('currency').optional().isLength({ min: 3, max: 3 }).toUpperCase(),
  body('color').optional().matches(/^#[0-9a-fA-F]{6}$/).withMessage('Color must be a valid hex code'),
  body('icon').optional().isString().isLength({ max: 8 }),
  body('isDefault').optional().isBoolean(),
];

export const monthParamRules = [
  param('month').matches(/^\d{4}-\d{2}$/).withMessage('Month must be in YYYY-MM format'),
];

export const monthQueryRules = [
  query('month').optional().matches(/^\d{4}-\d{2}$/).withMessage('Month must be in YYYY-MM format'),
  query('category').optional().isString(),
];
