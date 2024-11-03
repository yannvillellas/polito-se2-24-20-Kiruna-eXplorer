const SERVER_URL = 'http://localhost:3001/api/associations';

/**
 * Create a new association between two documents.
 * @param {Object} association - The association data.
 * @param {string} association.doc1 - ID of the first document.
 * @param {string} association.link - Type of link between documents.
 * @param {string} association.doc2 - ID of the second document.
 */
export const createAssociation = async (association) => {
  try {
    const response = await fetch(SERVER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(association),
    });
    if (!response.ok) throw new Error('Failed to create association');
    return await response.json(); // Return the created association data
  } catch (error) {
    console.error("Error creating association:", error);
    throw error;
  }
};

/**
 * Fetch all associations from the server.
 * @returns {Array} List of all associations.
 */
export const getAllAssociations = async () => {
  try {
    const response = await fetch(SERVER_URL, { method: 'GET' });
    if (!response.ok) throw new Error('Failed to fetch associations');
    return await response.json();
  } catch (error) {
    console.error("Error fetching associations:", error);
    throw error;
  }
};

/**
 * Fetch available link types for associations.
 * @returns {Array} List of link types.
 */
export const getLinkTypes = async () => {
  try {
    const response = await fetch(`${SERVER_URL}/types`, { method: 'GET' });
    if (!response.ok) throw new Error('Failed to fetch link types');
    return await response.json();
  } catch (error) {
    console.error("Error fetching link types:", error);
    throw error;
  }
};

export default { createAssociation, getAllAssociations, getLinkTypes };
