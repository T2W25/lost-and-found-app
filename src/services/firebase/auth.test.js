// Mock Firebase modules before requiring the module under test
jest.mock('./config', () => ({
  auth: {
    currentUser: {
      uid: 'test-user-id',
      email: 'test@example.com'
    }
  },
  db: {}
}));

jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  updateProfile: jest.fn(),
  updateEmail: jest.fn(),
  updatePassword: jest.fn(),
  reauthenticateWithCredential: jest.fn(),
  EmailAuthProvider: {
    credential: jest.fn()
  }
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
  serverTimestamp: jest.fn()
}));

// Require modules after mocking
const {
  registerUser,
  signInUser,
  signOutUser,
  resetPassword,
  updateEmail
} = require('./auth');
const {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  reauthenticateWithCredential,
  EmailAuthProvider
} = require('firebase/auth');
const { doc, setDoc, getDoc, updateDoc, serverTimestamp } = require('firebase/firestore');
const { DEFAULT_ROLE } = require('../../utils/roles');

// Mock Firebase modules
jest.mock('./config', () => ({
  auth: {
    currentUser: {
      uid: 'test-user-id',
      email: 'test@example.com'
    }
  },
  db: {}
}));

jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  updateProfile: jest.fn(),
  updateEmail: jest.fn(),
  updatePassword: jest.fn(),
  reauthenticateWithCredential: jest.fn(),
  EmailAuthProvider: {
    credential: jest.fn()
  }
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
  serverTimestamp: jest.fn()
}));

describe('registerUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('successfully registers a new user', async () => {
    // Mock data
    const email = 'newuser@example.com';
    const password = 'password123';
    const displayName = 'New User';
    const uid = 'new-user-id';

    // Mock implementations
    createUserWithEmailAndPassword.mockResolvedValue({
      user: { uid, email }
    });
    doc.mockReturnValue('userDocRef');
    setDoc.mockResolvedValue(undefined);

    // Call the function
    const result = await registerUser(email, password, displayName);

    // Assertions
    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(), 
      email, 
      password
    );
    expect(doc).toHaveBeenCalledWith(expect.anything(), 'users', uid);
    expect(setDoc).toHaveBeenCalledWith('userDocRef', expect.objectContaining({
      email,
      displayName,
      role: DEFAULT_ROLE
    }));
    expect(result).toEqual({
      uid,
      email,
      displayName
    });
  });

  test('throws error when registration fails', async () => {
    // Mock implementation to throw error
    const error = new Error('Registration failed');
    createUserWithEmailAndPassword.mockRejectedValue(error);

    // Call the function and expect it to throw
    await expect(registerUser('bad@example.com', 'password', 'Bad User'))
      .rejects.toThrow('Registration failed');
  });
});

describe('signInUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('successfully signs in a user with role from Firestore', async () => {
    // Mock data
    const email = 'user@example.com';
    const password = 'password123';
    const uid = 'user-id';
    const displayName = 'Test User';
    const role = 'admin';

    // Mock implementations
    signInWithEmailAndPassword.mockResolvedValue({
      user: { uid, email, displayName }
    });
    doc.mockReturnValue('userDocRef');
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ role })
    });

    // Call the function
    const result = await signInUser(email, password);

    // Assertions
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(), 
      email, 
      password
    );
    expect(doc).toHaveBeenCalledWith(expect.anything(), 'users', uid);
    expect(getDoc).toHaveBeenCalledWith('userDocRef');
    expect(result).toEqual({
      uid,
      email,
      displayName,
      role
    });
  });
});