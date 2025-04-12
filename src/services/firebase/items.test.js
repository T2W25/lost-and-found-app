// Mock Firebase modules before requiring the module under test
jest.mock('./config', () => ({
  db: {},
  storage: {}
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  collection: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  addDoc: jest.fn(),
  serverTimestamp: jest.fn(),
  Timestamp: {
    fromDate: jest.fn(date => ({ toDate: () => date }))
  }
}));

jest.mock('firebase/storage', () => ({
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
  deleteObject: jest.fn()
}));

// Require modules after mocking
const { getItemById, getUserItems, reportItem } = require('./items');
const { doc, getDoc, collection, getDocs, query, where, orderBy, addDoc, serverTimestamp } = require('firebase/firestore');
const { ref, uploadBytes, getDownloadURL } = require('firebase/storage');

// Mock Firebase modules
jest.mock('./config', () => ({
  db: {},
  storage: {}
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  collection: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  addDoc: jest.fn(),
  serverTimestamp: jest.fn(),
  Timestamp: {
    fromDate: jest.fn(date => ({ toDate: () => date }))
  }
}));

jest.mock('firebase/storage', () => ({
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
  deleteObject: jest.fn()
}));

describe('getItemById', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns item data when item exists', async () => {
    // Mock data
    const mockItemId = 'item123';
    const mockItemData = {
      name: 'Test Item',
      category: 'Electronics',
      description: 'A test item',
      reportedAt: { toDate: () => new Date('2023-01-01') },
      updatedAt: { toDate: () => new Date('2023-01-02') },
      date: { toDate: () => new Date('2023-01-01') },
      location: { locationDescription: 'Test Location' },
      status: 'found',
      reportedBy: 'user123'
    };

    // Mock implementation
    doc.mockReturnValue('itemRef');
    getDoc.mockResolvedValue({
      id: mockItemId,
      data: () => mockItemData,
      exists: () => true
    });

    // Call the function
    const result = await getItemById(mockItemId);

    // Assertions
    expect(doc).toHaveBeenCalledWith(expect.anything(), 'items', mockItemId);
    expect(getDoc).toHaveBeenCalledWith('itemRef');
    expect(result).toEqual({
      id: mockItemId,
      ...mockItemData,
      reportedAt: expect.any(String),
      updatedAt: expect.any(String),
      date: expect.any(String),
      location: 'Test Location'
    });
  });

  test('returns placeholder data when item does not exist', async () => {
    // Mock data
    const mockItemId = 'nonexistent';

    // Mock implementation
    doc.mockReturnValue('itemRef');
    getDoc.mockResolvedValue({
      exists: () => false
    });

    // Call the function
    const result = await getItemById(mockItemId);

    // Assertions
    expect(doc).toHaveBeenCalledWith(expect.anything(), 'items', mockItemId);
    expect(getDoc).toHaveBeenCalledWith('itemRef');
    expect(result).toEqual(expect.objectContaining({
      id: mockItemId,
      name: "Item Not Available",
      status: "deleted",
      isDeleted: true
    }));
  });

  test('handles errors gracefully', async () => {
    // Mock data
    const mockItemId = 'error-item';

    // Mock implementation to throw error
    doc.mockReturnValue('itemRef');
    getDoc.mockRejectedValue(new Error('Database error'));

    // Call the function
    const result = await getItemById(mockItemId);

    // Assertions
    expect(result).toEqual(expect.objectContaining({
      id: mockItemId,
      name: "Error Loading Item",
      status: "error",
      isError: true
    }));
  });
});