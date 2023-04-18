const dateOne = new Date();
const dateTwo = new Date();
const dateThree = new Date();
export const USER_DOB_MIN = dateOne.setFullYear(dateOne.getFullYear() - 120); // 120 years ago
export const USER_DOB_MAX = dateTwo.setFullYear(dateTwo.getFullYear() - 18); // 18 years ago
export const FUTURE_DATE_MIN = Date.now();
export const FUTURE_DATE_MAX = dateThree.setFullYear(
  dateThree.getFullYear() + 2
); // 2 years in the future
export const VALID_DATE_FORMAT = 'MM/DD/YYYY';
export const DATE_FNS_FORMAT = 'MM/dd/yyyy';

export const TEXTAREA_MAX_LENGTH = 10000;
export const TEXT_INPUT_MAX_LENGTH = 128;
export const EMAIL_CHARACTER_MAXIMUM = 256;
export const POSTAL_CODE_DIGIT_MINIMUM = 5;
export const POSTAL_CODE_DIGIT_MAXIMUM = 5;
export const PASSWORD_CHARACTER_MINIMUM = 8;

export const DIGITS_ONLY_REGEX = /^[0-9]+$/;

// This matches our Basilisk name validation regex in proper_user_name_validator.rb. Inspired by: https://stackoverflow.com/a/2630746
export const VALID_NAME_REGEX = /^[^0-9`!@#\$%\^&*+_=<>{}()\[\]]+$/;

// Baseline Email Validation found from community patter at https://regexr.com/
export const VALID_EMAIL_REGEX =
  /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

export const VALID_PHONE_REGEX =
  /^\W?\d*?\W*?(?<area>\d{3})\W*?(?<group1>\d{3})\W*?(?<group2>\d{4})\W*?$/;

// Regex's for common seen email errors
export const BAD_GMAIL_REGEX = /@gmail\.co$/;
export const BAD_HOTMAIL_REGEX = /@hotmail\.co$/;
export const BAD_COM_REGEX = /.com[a-zA-Z]$/;
export const BAD_CON_REGEX = /.con$/;
