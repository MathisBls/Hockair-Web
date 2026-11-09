export const AuthField = Object.freeze({
  USERNAME: 'username',
  EMAIL: 'email',
  PASSWORD: 'password',
  CONFIRM_PASSWORD: 'confirmPassword',
});

export const AuthErrorKey = Object.freeze({
  EMAIL_REQUIRED: 'emailRequired',
  EMAIL_INVALID: 'emailInvalid',
  PASSWORD_REQUIRED: 'passwordRequired',
  USERNAME_REQUIRED: 'usernameRequired',
  USERNAME_INVALID: 'usernameInvalid',
  PASSWORD_WEAK: 'passwordWeak',
  PASSWORD_MISMATCH: 'passwordMismatch',
  INVALID_CREDENTIALS: 'invalidCredentials',
  EMAIL_TAKEN: 'emailTaken',
  SERVER: 'server',
  GENERIC: 'generic',
});

export const PasswordRule = Object.freeze({
  MIN_LENGTH: 'minLength',
  LOWERCASE: 'lowercase',
  UPPERCASE: 'uppercase',
  DIGIT: 'digit',
  SPECIAL: 'special',
});

export const PasswordStrength = Object.freeze({
  WEAK: 'weak',
  FAIR: 'fair',
  GOOD: 'good',
  STRONG: 'strong',
});

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN = /^[A-Za-z0-9_-]{3,20}$/;
const PASSWORD_MIN_LENGTH = 8;

const PASSWORD_RULE_CHECKS = Object.freeze({
  [PasswordRule.MIN_LENGTH]: (password) =>
    password.length >= PASSWORD_MIN_LENGTH,
  [PasswordRule.LOWERCASE]: (password) => /[a-z]/.test(password),
  [PasswordRule.UPPERCASE]: (password) => /[A-Z]/.test(password),
  [PasswordRule.DIGIT]: (password) => /\d/.test(password),
  [PasswordRule.SPECIAL]: (password) => /[^A-Za-z0-9\s]/.test(password),
});

const PASSWORD_STRENGTH_BY_SATISFIED_RULES = Object.freeze([
  PasswordStrength.WEAK,
  PasswordStrength.WEAK,
  PasswordStrength.WEAK,
  PasswordStrength.FAIR,
  PasswordStrength.GOOD,
  PasswordStrength.STRONG,
]);

export const PASSWORD_STRENGTH_LEVELS = Object.values(PasswordStrength);

export const buildPasswordChecklist = (password) =>
  Object.entries(PASSWORD_RULE_CHECKS).map(([rule, check]) => ({
    rule,
    isSatisfied: check(password),
  }));

export const getPasswordStrength = (password) => {
  const satisfiedRuleCount = buildPasswordChecklist(password).filter(
    (ruleStatus) => ruleStatus.isSatisfied
  ).length;

  return PASSWORD_STRENGTH_BY_SATISFIED_RULES[satisfiedRuleCount];
};

const isPasswordValid = (password) =>
  buildPasswordChecklist(password).every(
    (ruleStatus) => ruleStatus.isSatisfied
  );

const getEmailErrorKey = (email) => {
  if (!email.trim()) {
    return AuthErrorKey.EMAIL_REQUIRED;
  }

  return EMAIL_PATTERN.test(email.trim()) ? null : AuthErrorKey.EMAIL_INVALID;
};

const getUsernameErrorKey = (username) => {
  if (!username.trim()) {
    return AuthErrorKey.USERNAME_REQUIRED;
  }

  return USERNAME_PATTERN.test(username.trim())
    ? null
    : AuthErrorKey.USERNAME_INVALID;
};

export const validateLoginForm = ({ email, password }) => ({
  [AuthField.EMAIL]: getEmailErrorKey(email),
  [AuthField.PASSWORD]: password ? null : AuthErrorKey.PASSWORD_REQUIRED,
});

export const validateRegisterForm = ({
  username,
  email,
  password,
  confirmPassword,
}) => ({
  [AuthField.USERNAME]: getUsernameErrorKey(username),
  [AuthField.EMAIL]: getEmailErrorKey(email),
  [AuthField.PASSWORD]: isPasswordValid(password)
    ? null
    : AuthErrorKey.PASSWORD_WEAK,
  [AuthField.CONFIRM_PASSWORD]:
    confirmPassword === password ? null : AuthErrorKey.PASSWORD_MISMATCH,
});

export const hasFieldErrors = (fieldErrorKeys) =>
  Object.values(fieldErrorKeys).some(Boolean);
