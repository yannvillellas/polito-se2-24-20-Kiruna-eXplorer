const SERVER_URL = 'http://localhost:3001/api/documents/types'

const getDocumentTypes = async () => {
    try {
        const documentTypes = await fetch(SERVER_URL, {
            method: 'GET',
        })
        if (!documentTypes.ok) throw new Error('Failed to fetch document types');
        return await documentTypes.json();
    } catch (error) {
        console.error("Error fetching document types:", error);
        throw error;
    }
}

const addDocumentType = async (type) => {
    try {
        const documentTypeId = await fetch(SERVER_URL, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: type })
        })
        if (!documentTypeId.ok) throw new Error('Failed to add new document type');
        return await documentTypeId.json();
    } catch (error) {
        console.error("Error adding new document type:", error);
        throw error;
    }
}

const documentTypeAPI = {
    getDocumentTypes,
    addDocumentType
}

export default documentTypeAPI