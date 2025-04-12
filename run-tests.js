/**
 * Test Runner Script
 * 
 * This script runs the unit tests for the 5 main methods/components
 * and displays the results in a formatted way for demonstration purposes.
 */

const { execSync } = require('child_process');
const fs = require('fs');

// ANSI color codes for formatting
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

console.log(`${colors.bright}${colors.blue}=======================================${colors.reset}`);
console.log(`${colors.bright}${colors.blue}  LOST AND FOUND APP - UNIT TESTS     ${colors.reset}`);
console.log(`${colors.bright}${colors.blue}=======================================${colors.reset}`);
console.log();

// List of test files to run
const testFiles = [
  {
    name: 'User Role Utilities',
    file: 'src/utils/roles.test.js',
    description: 'Tests for role-based access control functions',
    config: 'jest.config.js'
  },
  {
    name: 'Security Utilities',
    file: 'src/utils/security.test.js',
    description: 'Tests for input sanitization and validation functions',
    config: 'jest.config.js'
  },
  {
    name: 'Item Service',
    file: 'src/services/firebase/items.test.js',
    description: 'Tests for item data retrieval and management',
    config: 'jest.config.js'
  },
  {
    name: 'Authentication Service',
    file: 'src/services/firebase/auth.test.js',
    description: 'Tests for user authentication and registration',
    config: 'jest.config.js'
  },
  {
    name: 'Notification Service',
    file: 'src/services/firebase/notifications.test.js',
    description: 'Tests for user notification system',
    config: 'jest.config.js'
  },
  // React component test removed as it's not needed for the assignment requirement
];

// Run each test file and display results
testFiles.forEach((test, index) => {
  console.log(`${colors.bright}${colors.cyan}Test ${index + 1}: ${test.name}${colors.reset}`);
  console.log(`${colors.yellow}${test.description}${colors.reset}`);
  console.log(`${colors.bright}File: ${test.file}${colors.reset}`);
  console.log();
  
  try {
    // Run the test using Jest with the appropriate config
    const output = execSync(`npx jest ${test.file} --verbose --config=${test.config}`, { encoding: 'utf8' });
    
    // Extract and display the test results
    const lines = output.split('\n');
    const resultLines = lines.filter(line => 
      line.includes('PASS') || 
      line.includes('FAIL') || 
      line.includes('✓') || 
      line.includes('✕') ||
      line.includes('Tests:')
    );
    
    resultLines.forEach(line => {
      if (line.includes('PASS')) {
        console.log(`${colors.green}${line}${colors.reset}`);
      } else if (line.includes('FAIL')) {
        console.log(`${colors.red}${line}${colors.reset}`);
      } else if (line.includes('✓')) {
        console.log(`${colors.green}${line}${colors.reset}`);
      } else if (line.includes('✕')) {
        console.log(`${colors.red}${line}${colors.reset}`);
      } else if (line.includes('Tests:')) {
        if (line.includes('failed')) {
          console.log(`${colors.red}${line}${colors.reset}`);
        } else {
          console.log(`${colors.green}${line}${colors.reset}`);
        }
      }
    });
    
    console.log();
  } catch (error) {
    console.log(`${colors.red}Error running tests: ${error.message}${colors.reset}`);
    console.log();
  }
});

console.log(`${colors.bright}${colors.blue}=======================================${colors.reset}`);
console.log(`${colors.bright}${colors.blue}  TEST DEMONSTRATION COMPLETE         ${colors.reset}`);
console.log(`${colors.bright}${colors.blue}=======================================${colors.reset}`);