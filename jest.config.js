/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\.tsx?$": ["ts-jest",{}],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!pdf-to-png-converter)/', // Adjust as needed
    '/node_modules/(?!scribe.js-ocr)/'
  ],
  rootDir: "./",
  testMatch: ["<rootDir>/src/**/*.test.ts"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};