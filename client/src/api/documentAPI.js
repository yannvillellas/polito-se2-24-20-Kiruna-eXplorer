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
            document.docId,
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

const DocumentAPI = {
    listDocuments
}

export default DocumentAPI;