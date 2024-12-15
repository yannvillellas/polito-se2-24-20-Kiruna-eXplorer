const SERVER_URL = 'http://localhost:3001/api/diagram/nodes';

const getNodesPosition = async () => {
    try {
        const response = await fetch(SERVER_URL, { method: 'GET' });
        if (!response.ok) throw new Error('Failed to fetch node positions');
        return await response.json();
    } catch (error) {
        console.error("Error fetching node positions:", error);
        throw error;
    }
}

const saveNodesPositions = async (positions) => {
    console.log("passo", positions)
    try {
        const response = await fetch(SERVER_URL, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(positions),
        });
        if (!response.ok) throw new Error('Failed to create node positions');
        return await response.json(); // Return the created association data
    } catch (error) {
        console.error("Error creating association:", error);
        throw error;
    }
}

const updateNodePositions = async (position) => {
    try {
        await fetch(SERVER_URL, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(position),
        });
        return
    } catch (error) {
        console.error("Error creating association:", error);
        throw error;
    }
}

const clearAllPositions = async () =>{
    try {
        await fetch(SERVER_URL, {
            method: 'DELETE',
        });
        return
    } catch (error) {
        console.error("Error creating association:", error);
        throw error;
    }
}

const getXValues = async () => {
    try {
        const response = await fetch('http://localhost:3001/api/diagram/xScale', { method: 'GET' });
        if (!response.ok) throw new Error('Failed to fetch x scale');
        return await response.json();
    } catch (error) {
        console.error("Error fetching x scale:", error);
        throw error;
    }
}

const getYValues = async () => {
    try {
        const response = await fetch('http://localhost:3001/api/diagram/yScale', { method: 'GET' });
        if (!response.ok) throw new Error('Failed to fetch y scale');
        return await response.json();
    } catch (error) {
        console.error("Error fetching x scale:", error);
        throw error;
    }
}

const addNewX = async (xToAdd) => {
    try {
        const response = await fetch('http://localhost:3001/api/diagram/xScale/add', {
            method: 'POST',
            //credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(xToAdd),
        });
        if (!response.ok) throw new Error('Failed to create node positions');
        return await response.json(); // Return the created association data
    } catch (error) {
        console.error("Error creating association:", error);
        throw error;
    }
}

const addNewY = async (yToAdd) => {
    try {
        console.log("chiamo api")
        const response = await fetch('http://localhost:3001/api/diagram/yScale/add', {
            method: 'POST',
            //credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(yToAdd),
        });
        if (!response.ok) throw new Error('Failed to create node positions');
        return await response.json(); // Return the created association data
    } catch (error) {
        console.error("Error creating association:", error);
        throw error;
    }
}


const diagramAPI = { getNodesPosition, saveNodesPositions, updateNodePositions,getXValues,getYValues, addNewY, addNewX,clearAllPositions };

export default diagramAPI;