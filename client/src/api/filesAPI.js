const SERVER_URL = 'http://localhost:3001/api/files/'



const getFiles = async(docId) =>{
    try {
        const response = await fetch(`${SERVER_URL}${docId}`, {
            method: 'GET',
            credentials: 'include'
        })
        if(response.ok){
            const filesJson = await response.json();
            return filesJson;
        }else{
            throw new Error('Failed to fetch files');
        }
    }catch(e){
        console.error("Error fetching files:", e);
        throw e;
    }
}


const addFiles = async(docId, files) =>{
    try{
        const response= await fetch(`${SERVER_URL}${docId}`,{
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

const FilesAPI = {
    getFiles,
    addFiles
}

export default FilesAPI;