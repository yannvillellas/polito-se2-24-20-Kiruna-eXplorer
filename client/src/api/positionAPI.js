import Position from '../models/position.mjs'
const SERVER_URL = 'http://localhost:3001/api/positions'

const listPositions = async () => {
    try{
        const positions = await fetch(SERVER_URL, {
            method: 'GET',
            credentials: 'include'
        })
        .then(response => response.json())
        return positions;
    }catch(err){
        console.log(err);
    }
}

const addPosition = async (position) => {
    const response = await fetch(`${SERVER_URL}`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'}, 

      body: JSON.stringify({
        docId: position.docId, lat: position.lat, lng: position.lng
      }),

      credentials: 'include'
    });
    if(!response.ok) {
      const errMessage = await response.json();
      throw errMessage;
    }
    else return null;
}

const modifyPosition = async (docId, lat, lng) => {
    const response = await fetch(`${SERVER_URL}/${docId}`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'}, 

      body: JSON.stringify({
        lat: lat, lng: lng
      }),

      credentials: 'include'
    });
    if(!response.ok) {
      const errMessage = await response.json();
      throw errMessage;
    }
    else return null;
}


const PositionAPI = {
    listPositions,
    addPosition,
    modifyPosition
}

export default PositionAPI;