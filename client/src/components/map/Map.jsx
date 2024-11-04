import { useEffect, useState } from 'react';
import './map.css';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import PositionAPI from '../../api/positionAPI';

function Map({role}){
    const [positions, setPositions] = useState([]);

    useEffect(() => {
        const fetchPositions = async () => {
            try {
                const data = await PositionAPI.listPositions();
                setPositions(data);
            } catch (error) {
                console.error('Error fetching positions:', error);
            }
        };

        fetchPositions();
    }, []);

    return(
        <span>
            <MapContainer center={[67.8558, 20.2253]} zoom={12} style={{ height: "100vh" }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {positions.map((position, index) => (
                    <Marker key={position.posId || index} position={[position.latitude, position.longitude]}>
                        <Popup>
                            Document ID: {position.docId}
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </span>
    )
}

export default Map