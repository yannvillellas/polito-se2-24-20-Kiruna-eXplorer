const SERVER_URL = 'http://localhost:3001/api/associations';

/**
 * Create a new association between two documents.
 * @param {Object} association - The association data.
 * @param {string} association.doc1 - ID of the first document.
 * @param {string} association.link - Type of link between documents.
 * @param {string} association.doc2 - ID of the second document.
 */
const createAssociation = async (association) => {
  try {
    const response = await fetch(SERVER_URL, {
      method: 'POST',
      credentials: 'include',
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
  console.log("Sono in associationAPI, ho ricevuto la richiwsra di getAllAssociations");
  try {
    const response = await fetch(SERVER_URL, { method: 'GET' });
    console.log("Sono in associationAPI, getAllAssociations, ho ricevuto la risposta di getAllAssociations", response);
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
const getLinkTypes = async () => {
  try {
    console.log("Sono in associationAPI, getLinkTypes, ho ricevuto la richiesta di getLinkTypes");  
    const response = await fetch(`http://localhost:3001/api/linkTypes`, { method: 'GET'});
    console.log("Sono in associationAPI, getLinkTypes, ho ricevuto la risposta di getLinkTypes", response);
    if (!response.ok) throw new Error('Failed to fetch link types');
    return await response.json();
  } catch (error) {
    console.error("Error fetching link types:", error);
    throw error;
  }
};

// Get Association by docId:
const getAssociationsByDocId = async (docId) => {
  try {
    console.log("Sono in associationAPI ho ricevuto docId:", docId);
    const response = await fetch(`${SERVER_URL}/${docId}`, { method: 'GET' });
    console.log("Sono in associationAPI, getAssociationsByDocId, ho ricevuto la risposta di getAssociationsByDocId", response);
    if (!response.ok) throw new Error('Failed to fetch associations');
    return await response.json();
  } catch (error) {
    console.error("Error fetching associations:", error);
    throw error;
  }
};



const associationAPI={ createAssociation, getAllAssociations, getLinkTypes, getAssociationsByDocId };

export default associationAPI;
