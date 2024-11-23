const SERVER_URL = 'http://localhost:3001/api/documents/stakeholders'

const getStakeholders = async () => {
    try {
        const stakeholders = await fetch(SERVER_URL, {
            method: 'GET',
        })
        if (!stakeholders.ok) throw new Error('Failed to fetch stakeholders');
        return await stakeholders.json();
    } catch (error) {
        console.error("Error fetching stakeholders:", error);
        throw error;
    }
}

const addStakeholder = async (name) => {
    try {
        const stakeholderId = await fetch(SERVER_URL, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: { name: name }
        })
        if (!stakeholderId.ok) throw new Error('Failed to add new stakeholders');
        return await stakeholderId.json();
    } catch (error) {
        console.error("Error adding new stakeholder:", error);
        throw error;
    }
}

const stakeholderAPI={
    getStakeholders,
    addStakeholder
}

export default stakeholderAPI