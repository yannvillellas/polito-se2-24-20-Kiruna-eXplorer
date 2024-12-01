const SERVER_URL = 'http://localhost:3001/api/documents/scales'

const getScales = async () => {
    try {
        const scales = await fetch(SERVER_URL, {
            method: 'GET',
        })
        if (!scales.ok) throw new Error('Failed to fetch scales');
        return await scales.json();
    } catch (error) {
        console.error("Error fetching scales:", error);
        throw error;
    }
}

const addScale = async (name) => {
    try {
        const scaleId = await fetch(SERVER_URL, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name })
        })
        if (!scaleId.ok) throw new Error('Failed to add new scale');
        return await scaleId.json();
    } catch (error) {
        console.error("Error adding new scale:", error);
        throw error;
    }
}

const scaleAPI={
    getScales,
    addScale
}

export default scaleAPI