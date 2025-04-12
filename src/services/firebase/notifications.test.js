const { 
  createNotification, 
  getUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  getUnreadNotificationCount 
} = require('./notifications');
const { db } = require('./config');
const { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  doc, 
  updateDoc, 
  serverTimestamp,
  limit
} = require('firebase/firestore');
const { shouldNotifyUser } = require('./notificationPreferences');

// Mock Firebase modules
jest.mock('./config', () => ({
  db: {}
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  getDocs: jest.fn(),
  doc: jest.fn(),
  updateDoc: jest.fn(),
  serverTimestamp: jest.fn(),
  limit: jest.fn()
}));

jest.mock('./notificationPreferences', () => ({
  shouldNotifyUser: jest.fn()
}));

describe('createNotification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('successfully creates a notification when user preferences allow it', async () => {
    // Mock data
    const userId = 'user123';
    const relatedItemId = 'item123';
    const message = 'Test notification message';
    const type = 'item_update';
    const notificationId = 'notification123';

    // Mock implementations
    shouldNotifyUser.mockResolvedValueOnce(true);
    collection.mockReturnValueOnce('notificationsCollectionRef');
    serverTimestamp.mockReturnValueOnce('serverTimestamp');
    addDoc.mockResolvedValueOnce({ id: notificationId });

    // Call the function
    const result = await createNotification(userId, relatedItemId, message, type);

    // Assertions
    expect(shouldNotifyUser).toHaveBeenCalledWith(userId, type);
    expect(collection).toHaveBeenCalledWith(expect.anything(), 'notifications');
    expect(addDoc).toHaveBeenCalledWith('notificationsCollectionRef', {
      userId,
      message,
      type,
      relatedItemId,
      isRead: false,
      createdAt: 'serverTimestamp'
    });
    expect(result).toBe(notificationId);
  });

  test('does not create a notification when user preferences disallow it', async () => {
    // Mock data
    const userId = 'user123';
    const relatedItemId = 'item123';
    const message = 'Test notification message';
    const type = 'item_update';

    // Mock implementations
    shouldNotifyUser.mockResolvedValueOnce(false);

    // Call the function
    const result = await createNotification(userId, relatedItemId, message, type);

    // Assertions
    expect(shouldNotifyUser).toHaveBeenCalledWith(userId, type);
    expect(collection).not.toHaveBeenCalled();
    expect(addDoc).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  test('handles errors gracefully', async () => {
    // Mock data
    const userId = 'user123';
    const relatedItemId = 'item123';
    const message = 'Test notification message';
    const type = 'item_update';

    // Mock implementations to throw error
    shouldNotifyUser.mockResolvedValueOnce(true);
    collection.mockReturnValueOnce('notificationsCollectionRef');
    addDoc.mockRejectedValueOnce(new Error('Database error'));

    // Call the function
    const result = await createNotification(userId, relatedItemId, message, type);

    // Assertions
    expect(shouldNotifyUser).toHaveBeenCalledWith(userId, type);
    expect(collection).toHaveBeenCalledWith(expect.anything(), 'notifications');
    expect(addDoc).toHaveBeenCalled();
    expect(result).toBeNull();
  });
});

describe('getUserNotifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('successfully retrieves user notifications', async () => {
    // Mock data
    const userId = 'user123';
    const mockNotifications = [
      {
        id: 'notification1',
        data: () => ({
          message: 'Notification 1',
          type: 'item_update',
          createdAt: { toDate: () => new Date('2023-01-01') }
        })
      },
      {
        id: 'notification2',
        data: () => ({
          message: 'Notification 2',
          type: 'claim_update',
          createdAt: { toDate: () => new Date('2023-01-02') }
        })
      }
    ];

    // Mock implementations
    collection.mockReturnValueOnce('notificationsCollectionRef');
    where.mockReturnValueOnce('whereClause');
    query.mockReturnValueOnce('queryObj');
    getDocs.mockResolvedValueOnce({
      forEach: (callback) => mockNotifications.forEach(callback),
      size: mockNotifications.length
    });

    // Call the function
    const result = await getUserNotifications(userId);

    // Assertions
    expect(collection).toHaveBeenCalledWith(expect.anything(), 'notifications');
    expect(where).toHaveBeenCalledWith('userId', '==', userId);
    expect(query).toHaveBeenCalledWith('notificationsCollectionRef', 'whereClause');
    expect(getDocs).toHaveBeenCalledWith('queryObj');
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('notification2'); // Should be sorted by date descending
    expect(result[1].id).toBe('notification1');
  });

  test('returns empty array when there are no notifications', async () => {
    // Mock data
    const userId = 'user123';

    // Mock implementations
    collection.mockReturnValueOnce('notificationsCollectionRef');
    where.mockReturnValueOnce('whereClause');
    query.mockReturnValueOnce('queryObj');
    getDocs.mockResolvedValueOnce({
      forEach: jest.fn(),
      size: 0
    });

    // Call the function
    const result = await getUserNotifications(userId);

    // Assertions
    expect(result).toEqual([]);
  });

  test('handles errors gracefully', async () => {
    // Mock data
    const userId = 'user123';

    // Mock implementations to throw error
    collection.mockReturnValueOnce('notificationsCollectionRef');
    where.mockReturnValueOnce('whereClause');
    query.mockReturnValueOnce('queryObj');
    getDocs.mockRejectedValueOnce(new Error('Database error'));

    // Call the function
    const result = await getUserNotifications(userId);

    // Assertions
    expect(result).toEqual([]);
  });
});

describe('markNotificationAsRead', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('successfully marks a notification as read', async () => {
    // Mock data
    const notificationId = 'notification123';

    // Mock implementations
    doc.mockReturnValueOnce('notificationDocRef');
    updateDoc.mockResolvedValueOnce(undefined);
    serverTimestamp.mockReturnValueOnce('serverTimestamp');

    // Call the function
    const result = await markNotificationAsRead(notificationId);

    // Assertions
    expect(doc).toHaveBeenCalledWith(expect.anything(), 'notifications', notificationId);
    expect(updateDoc).toHaveBeenCalledWith('notificationDocRef', {
      isRead: true,
      readAt: 'serverTimestamp'
    });
    expect(result).toBe(true);
  });

  test('handles errors gracefully', async () => {
    // Mock data
    const notificationId = 'notification123';

    // Mock implementations to throw error
    doc.mockReturnValueOnce('notificationDocRef');
    updateDoc.mockRejectedValueOnce(new Error('Database error'));

    // Call the function
    const result = await markNotificationAsRead(notificationId);

    // Assertions
    expect(result).toBe(false);
  });
});