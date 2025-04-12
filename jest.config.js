module.exports = {
    // Use node environment instead of jsdom to avoid browser-specific issues
    testEnvironment: "node",
    // Transform files with babel-jest
    transform: {
      "^.+\\.(js|jsx)$": "babel-jest"
    },
    // Automatically clear mock calls and instances between every test
    clearMocks: true,
    // Collect coverage information
    collectCoverage: false,
    // Allow ES modules
    moduleFileExtensions: ["js", "jsx", "json", "node"],
    // Module name mapper for CSS and other non-JS modules
    moduleNameMapper: {
      "\\.(css|less|scss|sass)$": "<rootDir>/__mocks__/styleMock.js",
      "\\.(jpg|jpeg|png|gif|webp|svg)$": "<rootDir>/__mocks__/fileMock.js"
    }
  };