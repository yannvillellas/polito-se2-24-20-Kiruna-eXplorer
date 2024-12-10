import "bootstrap/dist/css/bootstrap.min.css";
import { useState} from "react";
import { Container, Button, Form } from "react-bootstrap";

import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, LayersControl, GeoJSON, useMapEvents } from 'react-leaflet';

import "leaflet-draw/dist/leaflet.draw.css";
import geojsonData from "../../../data/KirunaMunicipality.json";



function ChosenPositionMap(props) {

    const [selectedOption, setSelectedOption] = useState('');

    // for point to point
    const [position, setPosition] = useState({ lat: null, lng: null }); // Coordinate di default

    // for manual insertion
    const [showLatLongForm, setShowLatLongForm] = useState(false);


    const handleOptionChange = (e) => {
        setSelectedOption(e.target.value); // Aggiorna lo stato con il valore selezionato
        setPosition({ lat: null, lng: null });
        props.handleSavePosition(null, null); // otherwise if you change and go back it will be saved as the previous value

        if (e.target.value === 'allMunicipalities') {
            // I'm not setting the position based on the cetroid of teh area because will be srtange to have a marker in the middle of the map
            // So i'm leaving it on (67.8558, 20.2253) that is in the middle of the city
            props.handleSavePosition(67.8558, 20.2253);
        } else if (e.target.value === 'manualInsertion') {
            setShowLatLongForm(true);
        }
    };

    const handleLatLongFormSubmit = () => {
        // Extra control:
        if (!position) {
            alert("Please set a position!");
            return;
        }

        if (position.lat === null || position.lng === null) {
            alert("Latitude and longitude must be filled and should be numbers");
            return;
        } else if (position.lat < -90 || position.lat > 90 || position.lng < -180 || position.lng > 180) {
            alert("Latitude must be between -90 and 90, longitude must be between -180 and 180");
            return;
        }
        props.handleSavePosition(position.lat, position.lng);
        setShowLatLongForm(false);
    };



    // Does not reset the old value of the manualLat and manualLong (happens when you try to change the lat long after you have already inserted them)
    const handleResetLatLong = async () => {
        props.handleSavePosition(null, null); // so that the even if you cahnge the lat, long if you don't press "save" (under the lat,lng form) the value will not be saved 
        // If the user want to change the lat, lng he is not forced to write from zero again
        setPosition({ lat: position.lat, lng: position.lng });
        setShowLatLongForm(true)
    };


    function LocationMarker() {
        useMapEvents({
            click(e) {
                setPosition(e.latlng);

                console.log("e.latlng: ", e.latlng);
                props.handleSavePosition(e.latlng.lat, e.latlng.lng);
               
            },
        });

        return position ? <Marker position={position}></Marker> : null;
    }


    const geojsonStyle = {
        color: "red",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.1
    };



    return (
        <>
            <Container fluid className="cp-container">
                {/**here i put the checkbox/radio */}
                <Form.Group className="radio-group">
                    <Form.Check
                        type="radio"
                        label="All municipalities"
                        name="choosed" // all the radio button must have the same name to be able to select only one
                        value="allMunicipalities" // value for this specific choice
                        checked={selectedOption === 'allMunicipalities'} // if the selectedOption is equal to this value then the radio button will be checked
                        onChange={handleOptionChange} // when the radio button is clicked the handleOptionChange function will be called
                    />

                    <Form.Check
                        type="radio"
                        label="Choose on the map"
                        name="choosed" // all the radio button must have the same name to be able to select only one
                        value="pointToPoint" // value for this specific choice
                        checked={selectedOption === 'pointToPoint'} // if the selectedOption is equal to this value then the radio button will be checked
                        onChange={handleOptionChange} // when the radio button is clicked the handleOptionChange function will be called
                    />

                    <Form.Check
                        type="radio"
                        label="Manual insertion"
                        name="choosed" // all the radio button must have the same name to be able to select only one
                        value="manualInsertion" // value for this specific choice
                        checked={selectedOption === 'manualInsertion'} // if the selectedOption is equal to this value then the radio button will be checked
                        onChange={handleOptionChange} // when the radio button is clicked the handleOptionChange function will be called     
                    />


                </Form.Group>

                <div className="show">
                    {/**Here i put the map for alla municipality */}
                    {selectedOption === 'allMunicipalities' &&
                        <MapContainer center={[68.2558, 20.1240]} zoom={6} style={{ height: "100%", width: "100%" }}>
                            <LayersControl position="topright">
                                <LayersControl.BaseLayer checked name="Google Satellite">
                                    <TileLayer
                                        url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                                        attribution='&copy; <a href="https://maps.google.com">Google</a>'
                                    />
                                </LayersControl.BaseLayer>
                                <LayersControl.BaseLayer name="OpenStreetMap">
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                                    />
                                </LayersControl.BaseLayer>
                            </LayersControl>

                            <GeoJSON
                                data={geojsonData}
                                style={geojsonStyle}
                            />

                        </MapContainer>
                    }


                    {/**here i put the map */}
                    {selectedOption === 'pointToPoint' &&
                        <>
                            <MapContainer center={[67.8558, 20.2253]} zoom={13} style={{ height: "30vh", width: "100%" }}>
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />

                                <LayersControl position="bottomleft">
                                    <LayersControl.BaseLayer checked name="Google Satellite">
                                        <TileLayer
                                            url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                                            attribution='&copy; <a href="https://maps.google.com">Google</a>'
                                        />
                                    </LayersControl.BaseLayer>
                                    <LayersControl.BaseLayer name="OpenStreetMap">
                                        <TileLayer
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                                        />
                                    </LayersControl.BaseLayer>
                                </LayersControl>


                                <LocationMarker />
                            </MapContainer>
                        </>
                    }

                    {/**here i put the form */}
                    {selectedOption === 'manualInsertion' && showLatLongForm &&
                        <>
                            <Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Latitude</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="Enter latitude"
                                        step="0.000001"
                                        required={true}
                                        value={position.lat || ''}
                                        onChange={(e) => setPosition({ lat: parseFloat(e.target.value), lng: position.lng })}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Longitude</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="Enter longitude"
                                        step="0.000001"
                                        required={true}
                                        value={position.lng || ''}
                                        onChange={(e) => setPosition({ lat: position.lat, lng: parseFloat(e.target.value) })}
                                    />
                                </Form.Group>

                                <Button variant="primary" onClick={handleLatLongFormSubmit}>
                                    Save
                                </Button>
                            </Form.Group>
                        </>
                    }


                    {/**If i choose the (lat, long) i want to see them */}
                    {selectedOption === 'manualInsertion' && !showLatLongForm &&
                        <>
                            {/* <h3 className="mt-5">Latitude: {manualLat}, Longitude: {manualLong}</h3>
                            <Button variant="primary" onClick={handleResetLatLong}> Change Latitude and longitude</Button> */
                                console.log("position: ", position)}

                            <div className="showLatLng">
                                <div className="showLat">
                                    <p>latitude</p>
                                    <div className="lat">
                                        {position.lat}
                                    </div>
                                </div>
                                <div className="showLong">
                                    <p>longitude</p>
                                    <div className="long">
                                        {position.lng}
                                    </div>
                                </div>

                                <Button variant="primary" onClick={handleResetLatLong}> Change Latitude and longitude</Button>
                            </div>

                        </>
                    }

                </div>


            </Container>

        </>
    );
}

export default ChosenPositionMap;