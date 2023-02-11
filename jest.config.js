/* eslint-env node */

module.exports = {
  testMatch: ['<rootDir>/tests/*.[jt]s'],
  transform: {
    '^.+\\.(t|j)s$': ['@swc/jest'],
  },
};
