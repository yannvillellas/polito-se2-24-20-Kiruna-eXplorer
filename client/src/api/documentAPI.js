const SERVER_URL = 'http://localhost:3001/api/documents/'

const listDocuments = async () => {
    try {
        const documents = await fetch(SERVER_URL, {
            method: 'GET',
            credentials: 'include'
        })
        .then(response => response.json())

        return documents;
    } catch (err) {
        console.log(err);
    }
}

// First Sprint: the first story want just to add documents, and the third wants to add (lan,lng) => no update function
const addDocument = async (document) => {
    const response = await fetch(`${SERVER_URL}`, {

      method: 'POST',
      headers: {'Content-Type': 'application/json'}, 

      body: JSON.stringify({
        
        title: document.title, stakeholders: document.stakeholders, 
        scale: document.scale, issuanceDate: document.issuanceDate, type: document.type, 
        connections: document.connections, language: document.language, pages: `${document.pages}`, 
        description: document.description,
      }),

      credentials: 'include'
    });
    if(!response.ok) {
      const errMessage = await response.json();
      throw errMessage;
    } else {
        const documentId = await response.json();
        return documentId;
    }

    return null;
}

const deleteDocument = async (docId) => {
    try {
        const response = await fetch(SERVER_URL, {
            method: 'DELETE',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ docId: docId }),
        });
        if (!response.ok) throw new Error('Failed to fetch link types');
        return
        //return await response.json();
    }catch(e){
        console.error("Error removing a document:", e);
        throw e;
    }

}

const addFiles = async(docId, files) =>{
    try{
        const response= await fetch(`${SERVER_URL}${docId}/files`,{
            method:'POST',
            credentials: 'include',
            body: files,
        })
        if (!response.ok) throw new Error('Failed to upload files');
        return
    }catch(e){
        console.error("Error uploading one or more files:", e);
        throw e;
    }
}

const getFiles = async(docId) =>{
    try {
        const response = await fetch(`${SERVER_URL}${docId}/files`, {
            method: 'GET',
            //credentials: 'include'
        })
        if(response.ok){
            const filesJson = await response.json();
            return filesJson;
        }else{
            throw new Error('Error loading files');
        }
    } catch (err) {
        console.log(err);
    }
}

const addField = async(value, type) =>{
    try{
        const response= await fetch(`${SERVER_URL}/fields/${type}`,{
            method:'POST',
            credentials: 'include',
            body: {value:value},
        })
        if (!response.ok) throw new Error('Failed to add new stakeholder');
        return
    }catch(e){
        console.log(e)
        throw e
    }
}
/*
const downloadFile = async(docId, fileName)=>{
    try {
        const response = await fetch(`http://localhost:3001/api/download/${docId}/${file.name}`, {
            method: 'GET',
            //credentials: 'include'
        })
        if(response.ok){
            const filesJson = await response.json();
            return filesJson;
        }else{
            throw new Error('Error loading files');
        }
    } catch (err) {
        console.log(err);
    }
}*/





const DocumentAPI = {
    listDocuments,
    addDocument,
    deleteDocument,
    addFiles,
    getFiles
}

export default DocumentAPI;