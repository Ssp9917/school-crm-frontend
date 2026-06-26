/* Country-wise phone number validation rules + a reusable antd validator. */

export interface PhoneRule {
  pattern: RegExp;
  message: string;
}

export const PHONE_RULES: Record<string, PhoneRule> = {
  IN: { pattern: /^[6-9]\d{9}$/,      message: 'Valid 10-digit Indian mobile required (starts with 6-9)' },
  US: { pattern: /^\d{10}$/,          message: 'Valid 10-digit US phone number required' },
  CA: { pattern: /^\d{10}$/,          message: 'Valid 10-digit Canadian phone number required' },
  GB: { pattern: /^\d{10,11}$/,       message: 'Valid UK phone number required (10-11 digits)' },
  AE: { pattern: /^[05]\d{8}$/,       message: 'Valid 9-digit UAE number required (starts with 0 or 5)' },
  SA: { pattern: /^[05]\d{8}$/,       message: 'Valid 9-digit Saudi number required (starts with 0 or 5)' },
  PK: { pattern: /^0?3\d{9}$/,        message: 'Valid Pakistani mobile required (e.g. 03001234567)' },
  BD: { pattern: /^0?1[3-9]\d{8}$/,   message: 'Valid Bangladeshi mobile required (e.g. 01712345678)' },
  SG: { pattern: /^[6-9]\d{7}$/,      message: 'Valid 8-digit Singapore phone number required' },
  AU: { pattern: /^0?[2-578]\d{8}$/,  message: 'Valid Australian phone number required (9-10 digits)' },
  NZ: { pattern: /^0?[2-9]\d{7,9}$/,  message: 'Valid New Zealand phone number required' },
  ZA: { pattern: /^0?\d{9}$/,         message: 'Valid South African phone number required (9-10 digits)' },
  NG: { pattern: /^0?[789]\d{9}$/,    message: 'Valid Nigerian phone number required (10-11 digits)' },
  DE: { pattern: /^0?\d{5,14}$/,      message: 'Valid German phone number required' },
  FR: { pattern: /^0?[1-9]\d{8}$/,    message: 'Valid 10-digit French phone number required' },
  JP: { pattern: /^0?\d{9,10}$/,      message: 'Valid Japanese phone number required (10-11 digits)' },
  CN: { pattern: /^1[3-9]\d{9}$/,     message: 'Valid 11-digit Chinese mobile required (starts with 1)' },
  MY: { pattern: /^0?[1-9]\d{7,9}$/,  message: 'Valid Malaysian phone number required' },
  ID: { pattern: /^0?[2-9]\d{7,10}$/, message: 'Valid Indonesian phone number required' },
  PH: { pattern: /^0?[89]\d{9}$/,     message: 'Valid Philippine phone number required (10-11 digits)' },
  TH: { pattern: /^0?[2-9]\d{7,8}$/,  message: 'Valid Thai phone number required (9-10 digits)' },
  LK: { pattern: /^0?[1-9]\d{8}$/,    message: 'Valid Sri Lankan phone number required (9-10 digits)' },
  NP: { pattern: /^0?[9]\d{9}$/,      message: 'Valid Nepali mobile required (starts with 9, 10 digits)' },
  QA: { pattern: /^[3-7]\d{7}$/,      message: 'Valid 8-digit Qatar phone number required' },
  KW: { pattern: /^[569]\d{7}$/,      message: 'Valid 8-digit Kuwait phone number required' },
  BH: { pattern: /^[136]\d{7}$/,      message: 'Valid 8-digit Bahrain phone number required' },
  OM: { pattern: /^[279]\d{7}$/,      message: 'Valid 8-digit Oman phone number required' },
};

export const getPhoneValidator = (countryCode: string) => (_: unknown, value: string) => {
  if (!value) return Promise.resolve();
  const digits = value.replace(/[\s\-().+]/g, '');
  const rule = PHONE_RULES[countryCode];
  if (rule) {
    return rule.pattern.test(digits)
      ? Promise.resolve()
      : Promise.reject(new Error(rule.message));
  }
  return /^\d{6,15}$/.test(digits)
    ? Promise.resolve()
    : Promise.reject(new Error('Enter a valid phone number (6–15 digits)'));
};
