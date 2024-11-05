import Document from '../models/document.mjs'
const SERVER_URL = 'http://localhost:3001/api/documents/'

const listDocuments = async () => {
    try{
        const documents = await fetch(SERVER_URL,{
            method: 'GET',
            credentials: 'include'
        })
        .then(response => response.json())
        .then(mapDocuments);

        return documents;
    }catch(err){
        console.log(err);
    }
}

function mapDocuments(documents){
    return documents.map(document => {
        new Document (
            document.id,
            document.title,
            document.description,
            document.stackeholders,
            document.scale,
            document.issuanceDate,
            document.type,
            document.connections,
            document.language,
            document.pages
        )        
    })
}

// First Sprint: the first story want just to add documents, and the third wants to add (lan,lng) => no update function
const addDocument = async (document) => {
    console.log("sono in documentAPI.js: sto aggiungendo:", document);
    const response = await fetch(`${SERVER_URL}`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'}, 

      body: JSON.stringify({
        
        id: document.id, title: document.title, stakeholders: document.stakeholders, 
        scale: document.scale, issuanceDate: document.issuanceDate, type: document.type, 
        connections: document.connections, language: document.language, pages: document.pages, 
        description: document.description,
      }),

      credentials: 'include'
    });
    if(!response.ok) {
      const errMessage = await response.json();
      throw errMessage;
    }
    else return null;
}
  




const DocumentAPI = {
    listDocuments,
    addDocument
}

export default DocumentAPI;