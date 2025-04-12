import { db } from './config';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit as firestoreLimit, 
  startAfter, 
  getDocs
} from 'firebase/firestore';
import { applyFilters } from '../../utils/filterUtils';

/**
 * Search for items with filters
 * @param {Object} filters - The filters to apply
 * @param {string} filters.category - Item category
 * @param {string} filters.dateRange - Date range (today, week, month, etc.)
 * @param {string} filters.location - Location search term
 * @param {string} filters.color - Item color
 * @param {string} filters.keywords - Keywords to search for
 * @param {Object} pagination - Pagination options
 * @param {number} pagination.page - Page number (1-based)
 * @param {number} pagination.pageSize - Number of items per page
 * @param {Object} pagination.lastVisible - Last document from previous page
 * @returns {Promise<Object>} Search results with pagination info
 */

export const searchItems = async (filters = {}, pagination = { page: 1, pageSize: 10 }) => {
  try {
    console.log("Searching items with filters:", JSON.stringify(filters, null, 2));
    console.log("Pagination:", JSON.stringify(pagination, null, 2));
    
    // Start with a base query
    let itemsRef = collection(db, 'items');
    let constraints = [];
    // Apply status filter if specified
    if (filters.status && filters.status !== 'all') {
      constraints.push(where('status', '==', filters.status));
    }
    
    // Apply ordering (important for index creation)
    constraints.push(orderBy('reportedAt', 'desc'));
    
    // Create the query with all constraints
    let q = query(itemsRef, ...constraints);
    console.log("Query created with constraints:", constraints.length);
    
    // Add pagination
    if (pagination.lastVisible && pagination.page > 1) {
      q = query(q, startAfter(pagination.lastVisible), firestoreLimit(pagination.pageSize));
      console.log("Added pagination with lastVisible and limit:", pagination.pageSize);
    } else {
      q = query(q, firestoreLimit(pagination.pageSize));
      console.log("Added pagination with limit:", pagination.pageSize);
    }
    
    // Execute the query
    console.log("Executing query...");
    const querySnapshot = await getDocs(q);
    console.log("Query returned", querySnapshot.size, "items");
    
    // Process results
    const items = [];
    let lastVisible = null;
    
    querySnapshot.forEach((doc) => {
      // Set the last visible document for pagination
      lastVisible = doc;
      
      const data = doc.data();
      console.log("Item found:", doc.id, "status:", data.status);
      
      // Add the document to our results
      items.push({
        id: doc.id,
        ...data,
        reportedAt: data.reportedAt?.toDate().toISOString() || new Date().toISOString(),
        date: data.date?.toDate().toISOString() || data.reportedAt?.toDate().toISOString() || new Date().toISOString(),
        location: data.location?.locationDescription || (data.location?._lat ? `${data.location._lat}, ${data.location._long}` : 'Unknown')
      });
    });
    
    console.log("Total items before filtering:", items.length);
    
    // Apply client-side filtering for all filters
    const filteredItems = applyFilters(items, {
      category: filters.category,
      dateRange: filters.dateRange,
      startDate: filters.startDate,
      endDate: filters.endDate,
      location: filters.location,
      color: filters.color,
      keywords: filters.keywords
    });
    
    console.log("Total items after filtering:", filteredItems.length);
    
    // Calculate pagination info
    const paginationInfo = {
      currentPage: pagination.page,
      pageSize: pagination.pageSize,
      lastVisible,
      hasMore: querySnapshot.size === pagination.pageSize,
      totalItems: null, // Firestore doesn't provide total count easily
      startItem: (pagination.page - 1) * pagination.pageSize + 1,
      endItem: (pagination.page - 1) * pagination.pageSize + filteredItems.length
    };
    
    return {
      items: filteredItems,
      pagination: paginationInfo
    };
  } catch (error) {
    console.error("Error searching items:", error);
    // Return empty results instead of throwing error
    return {
      items: [],
      pagination: {
        currentPage: pagination.page,
        pageSize: pagination.pageSize,
        lastVisible: null,
        hasMore: false,
        totalItems: 0,
        startItem: 0,
        endItem: 0
      }
    };
  }
};

/**
 * Get featured or recent items
 * @param {number} count - Number of items to retrieve
 * @returns {Promise<Array>} Array of items
 */
export const getFeaturedItems = async (count = 6) => {
  try {
    console.log("Getting featured items, count:", count);
    
    const itemsRef = collection(db, 'items');
    
    // Use a simpler query to avoid index issues
    const q = query(
      itemsRef,
      orderBy('reportedAt', 'desc'),
      firestoreLimit(count * 2) // Fetch more items to account for filtering
    );
    
    console.log("Executing featured items query...");
    const querySnapshot = await getDocs(q);
    console.log("Query returned", querySnapshot.size, "items");
    
    const items = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log("Featured item found:", doc.id, "status:", data.status);
      
      // Only include found items client-side
      if (data.status === 'found') {
        items.push({
          id: doc.id,
          ...data,
          reportedAt: data.reportedAt?.toDate().toISOString() || new Date().toISOString(),
          date: data.date?.toDate().toISOString() || data.reportedAt?.toDate().toISOString() || new Date().toISOString(),
          location: data.location?.locationDescription || (data.location?._lat ? `${data.location._lat}, ${data.location._long}` : 'Unknown')
        });
      }
    });
    
    console.log("Returning", items.length, "featured items");
    return items.slice(0, count);
  } catch (error) {
    console.error("Error getting featured items:", error);
    // Return empty array instead of throwing error
    return [];
  }
};