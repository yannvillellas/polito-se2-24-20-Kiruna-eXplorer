const SERVER_URL = 'http://localhost:3001/api/diagram/nodes';

/*const getNodesPosition = async () => {
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
    try {
            await fetch(SERVER_URL, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(positions),
        });
    } catch (error) {
        console.error("Error saving node positions:", error);
        throw error;
    }
};

const updateNodePositions = async (position) => {
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
}*/

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
        const response =await fetch('http://localhost:3001/api/diagram/xScale/add', {
            method: 'POST',
            //credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(xToAdd),
        });
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        if (response.status === 204) { // No Content
            return null; // o qualche valore simbolico
        }
        return await response.json();
    } catch (error) {
        console.error("Error creating association:", error);
        throw error;
    }
}

const addNewY = async (yToAdd) => {
    try {
        const response =await fetch('http://localhost:3001/api/diagram/yScale/add', {
            method: 'POST',
            //credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(yToAdd),
        });
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        if (response.status === 204) { // No Content
            return null; // o qualche valore simbolico
        }
        return await response.json();
    } catch (error) {
        console.error("Error creating association:", error);
        throw error;
    }
}

const getDimensions = async () => {
    try {
        const response = await fetch('http://localhost:3001/api/diagram/dimensions', { method: 'GET' });
        if (!response.ok) throw new Error('Failed to fetch y scale');
        return await response.json();
    } catch (error) {
        console.error("Error fetching x scale:", error);
        throw error;
    }
}

const addDimensions = async (width,height)=>{
    try {
        const response =await fetch('http://localhost:3001/api/diagram/dimensions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({width:width, height:height}),
        });
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        if (response.status === 204) { // No Content
            return null; // o qualche valore simbolico
        }
        return await response.json();
    } catch (error) {
        console.error("Error creating association:", error);
        throw error;
    }
}

const updateWidth = async (width) => {
    console.log(width)
    try {
        await fetch('http://localhost:3001/api/diagram/width', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({width:width}),
        });
    } catch (error) {
        console.error("Error creating association:", error);
        throw error;
    }
}

const updateHeight = async (height) => {
    try {
        await fetch('http://localhost:3001/api/diagram/height', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({height:height}),
        });

    } catch (error) {
        console.error("Error creating association:", error);
        throw error;
    }
}

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


const diagramAPI = { /*getNodesPosition, saveNodesPositions, updateNodePositions,*/getXValues,getYValues,
    addNewY, addNewX,clearAllPositions,getDimensions,addDimensions, updateHeight, updateWidth, getTraslatedNodes, addNodeTraslation, updateNodeTraslation};

export default diagramAPI;