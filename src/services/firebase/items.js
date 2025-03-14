import { collection, addDoc, doc, getDoc, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './config';

// Report a lost item
export const reportLostItem = async (itemData, image, userId) => {
  try {
    // Extract image from itemData to avoid storing it in Firestore
    const { image: imageFile, ...dataWithoutImage } = itemData;
    
    // Upload image if provided
    let imageUrl = null;
    if (imageFile) {
      const storageRef = ref(storage, `items/${userId}/${Date.now()}_${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      imageUrl = await getDownloadURL(storageRef);
    }
    
    // Convert JavaScript Date to Firestore Timestamp
    const formattedData = {
      ...dataWithoutImage,
      lostDate: itemData.lostDate instanceof Date ? Timestamp.fromDate(itemData.lostDate) : itemData.lostDate,
    };
    
    // Add item to Firestore
    const itemRef = await addDoc(collection(db, 'items'), {
      ...formattedData,
      imageUrl,
      reportedBy: userId,
      status: 'lost',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    return itemRef.id;
  } catch (error) {
    console.error('Error in reportLostItem:', error);
    throw error;
  }
};

// Get all lost items
export const getLostItems = async () => {
  try {
    const q = query(
      collection(db, 'items'),
      where('status', '==', 'lost'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    throw error;
  }
};

// Get a single item by ID
export const getItemById = async (itemId) => {
  try {
    const docRef = doc(db, 'items', itemId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      throw new Error('Item not found');
    }
  } catch (error) {
    throw error;
  }
};

// Get user items
export const getUserItems = async (userId) => {
  try {
    const q = query(
      collection(db, 'items'),
      where('reportedBy', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    throw error;
  }
};