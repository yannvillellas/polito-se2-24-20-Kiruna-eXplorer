const SERVER_URL = 'http://localhost:3001/api/associations';

export const createAssociation = async (association) => {
  const response = await fetch(SERVER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(association),
  });
  if (!response.ok) throw new Error('Failed to create association');
};

export const getAllAssociations = async () => {
  const response = await fetch(SERVER_URL, { method: 'GET' });
  if (!response.ok) throw new Error('Failed to fetch associations');
  return await response.json();
};

export const getLinkTypes = async () => {
  const response = await fetch(`${SERVER_URL}/types`, { method: 'GET' });
  if (!response.ok) throw new Error('Failed to fetch link types');
  return await response.json();
};

export default { createAssociation, getAllAssociations, getLinkTypes };
