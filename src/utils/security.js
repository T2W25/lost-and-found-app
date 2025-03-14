// Sanitize string input
export const sanitizeInput = (input) => {
    if (!input) return "";
  
    // Convert to string if not already
    const str = String(input);
  
    // Replace potentially dangerous characters
    return str
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };
  
  // Check password strength
  export const checkPasswordStrength = (password) => {
    if (!password) return { score: 0, feedback: "Password is required" };
  
    // Initialize score
    let score = 0;
  
    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
  
    // Complexity checks
    if (/[A-Z]/.test(password)) score += 1; // Has uppercase
    if (/[a-z]/.test(password)) score += 1; // Has lowercase
    if (/[0-9]/.test(password)) score += 1; // Has number
    if (/[^A-Za-z0-9]/.test(password)) score += 1; // Has special char
  
    // Feedback based on score
    let feedback = "";
    if (score < 3) {
      feedback =
        "Weak password. Consider adding uppercase, lowercase, numbers, and special characters.";
    } else if (score < 5) {
      feedback = "Moderate password. Consider making it longer or more complex.";
    } else {
      feedback = "Strong password!";
    }
  
    return { score, feedback };
  };
  
  // Generate CSRF token
  export const generateCsrfToken = () => {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  };