module.exports = {
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true // Enable JSX parsing
    }
  },
  "settings": {
    "react": {
      "version": "detect" // Automatically detect the React version
    }
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended", // Uses the recommended rules from @typescript-eslint/eslint-plugin
    "plugin:react/recommended", // Uses the recommended rules from eslint-plugin-react
    "plugin:jest/recommended" // Uses the recommended rules from eslint-plugin-jest
  ],
  "plugins": [
    "@typescript-eslint",
    "react",
    "jest"
  ],
  "env": {
    "es6": true,
    "node": true,
    "browser": true,
    "jest/globals": true // Add Jest global variables
  },
  "rules": {
    // Add any project-specific rules here
    // e.g. "react/prop-types": "off" if not using prop-types with TypeScript
  }
};
