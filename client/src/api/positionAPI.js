import Position from '../models/position.mjs'
const SERVER_URL = 'http://localhost:3001/api/positions'

const listPositions = async () => {
    try{
        const positions = await fetch(SERVER_URL, {
            method: 'GET',
            credentials: 'include'
        })
        .then(response => response.json())
        .then(mapPositions);

        return positions;
    }catch(err){
        console.log(err);
    }
}

function mapPositions(positions){
    return positions.map(position => {
        new Position (
            position.posId,
            position.docId,
            position.latitude,
            position.longitude
        )        
    })
}

const PositionAPI = {
    listPositions
}

export default PositionAPI;