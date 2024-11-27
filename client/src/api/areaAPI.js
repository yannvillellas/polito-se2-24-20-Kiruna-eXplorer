const SERVER_URL = 'http://localhost:3001';

const listAreas = async () => {
    try {
        const response = await fetch(`${SERVER_URL}/api/areas`, {
            method: 'GET',
            credentials: 'include'
        });
        if (response.ok) {
            const areas = await response.json();
            return areas;
        } else {
            throw new Error('Error loading areas');
        }
    } catch (err) {
        console.log(err);
    }
}

const addArea = async (docId, area) => {
    try {
        const response = await fetch(`${SERVER_URL}/api/${docId}/areas`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(area),
        });
        if (!response.ok) {
            throw new Error('Failed to add area');
        }
        return response.json();
    } catch (e) {
        console.error("Error adding an area:", e);
    }
}

const listAreaAssociations = async () => {
    try {
        const response = await fetch(`${SERVER_URL}/api/areaAssociations`, {
            method: 'GET',
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error('Failed to fetch area associations');

        }
        return response.json();
    } catch (err) {
        console.log(err);
    }
}




const areaAPI = {
    listAreas,
    addArea,
    listAreaAssociations
};

export default areaAPI;

