const SERVER_URL = 'http://localhost:3001/api/diagram/nodes';

const getTraslatedNodes = async () => {
    try {
        const response = await fetch(SERVER_URL, { method: 'GET' });
        if (!response.ok) throw new Error('Failed to fetch y scale');
        return await response.json();
    } catch (error) {
        console.error("Error fetching x scale:", error);
        throw error;
    }
}

const addNodeTraslation = async (position) => {
    try {
            await fetch(SERVER_URL, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(position),
        });
    } catch (error) {
        console.error("Error saving node positions:", error);
        throw error;
    }
};

const updateNodeTraslation = async (position) => {
    try {
        await fetch(SERVER_URL, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(position),
        });
    } catch (error) {
        console.error("Error creating association:", error);
        throw error;
    }
}


const diagramAPI = { /*getNodesPosition, saveNodesPositions, updateNodePositions,getXValues,getYValues,
    addNewY, addNewX,clearAllPositions,getDimensions,addDimensions, updateHeight, updateWidth,*/ getTraslatedNodes, addNodeTraslation, updateNodeTraslation};

export default diagramAPI;