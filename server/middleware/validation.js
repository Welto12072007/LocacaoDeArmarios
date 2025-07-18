import { body, validationResult } from 'express-validator';

// Middleware to handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: errors.array()
    });
  }
  next();
};

// Validation rules for user registration
export const validateRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Senha deve ter pelo menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número'),
  
  body('role')
    .optional()
    .isIn(['admin', 'user'])
    .withMessage('Perfil deve ser admin ou user'),
  
  handleValidationErrors
];

// Validation rules for user login
export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  
  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória'),
  
  handleValidationErrors
];

// Validation rules for password reset request
export const validateForgotPassword = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  
  handleValidationErrors
];

// Validation rules for password reset
export const validateResetPassword = [
  body('token')
    .notEmpty()
    .withMessage('Token é obrigatório'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Senha deve ter pelo menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número'),
  
  handleValidationErrors
];

// Validation rules for student creation
export const validateStudent = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  
  body('studentId')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Matrícula é obrigatória'),
  
  body('course')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Curso deve ter entre 2 e 100 caracteres'),
  
  body('semester')
    .isInt({ min: 1, max: 20 })
    .withMessage('Semestre deve ser um número entre 1 e 20'),
  
  body('phone')
    .optional()
    .isMobilePhone('pt-BR')
    .withMessage('Telefone inválido'),
  
  handleValidationErrors
];

// Validation rules for locker creation
export const validateLocker = [
  body('number')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Número do armário é obrigatório'),
  
  body('location')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Localização deve ter entre 2 e 255 caracteres'),
  
  body('size')
    .isIn(['small', 'medium', 'large'])
    .withMessage('Tamanho deve ser small, medium ou large'),
  
  body('monthlyPrice')
    .isFloat({ min: 0 })
    .withMessage('Preço mensal deve ser um valor positivo'),
  
  body('status')
    .optional()
    .isIn(['available', 'rented', 'maintenance', 'reserved'])
    .withMessage('Status inválido'),
  
  handleValidationErrors
];

// Validation rules for rental creation
export const validateRental = [
  body('lockerId')
    .isInt({ min: 1 })
    .withMessage('ID do armário é obrigatório'),
  
  body('studentId')
    .isInt({ min: 1 })
    .withMessage('ID do aluno é obrigatório'),
  
  body('startDate')
    .isISO8601()
    .withMessage('Data de início inválida'),
  
  body('endDate')
    .isISO8601()
    .withMessage('Data de fim inválida')
    .custom((endDate, { req }) => {
      if (new Date(endDate) <= new Date(req.body.startDate)) {
        throw new Error('Data de fim deve ser posterior à data de início');
      }
      return true;
    }),
  
  body('monthlyPrice')
    .isFloat({ min: 0 })
    .withMessage('Preço mensal deve ser um valor positivo'),
  
  body('totalAmount')
    .isFloat({ min: 0 })
    .withMessage('Valor total deve ser um valor positivo'),
  
  handleValidationErrors
];