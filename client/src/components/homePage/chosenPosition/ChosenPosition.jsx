import "bootstrap/dist/css/bootstrap.min.css";
import "./chosenPosition.css";
import React, { useState } from "react";
import { Container, Row, Col, Button, Form, Modal, Offcanvas } from "react-bootstrap";

import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, CircleMarker, Polygon, GeoJSON, useMapEvents } from 'react-leaflet';


import geojsonData from "./KirunaMunicipality.json"

import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});



function ChosenPosition(props) {
    const [selectedOption, setSelectedOption] = useState('');

    // for point to point
    const [position, setPosition] = useState({ lat: null, lng: null }); // Coordinate di default
    const [positionAlreadyChosen, setPositionAlreadyChosen] = useState(false);

    // for manual insertion
    const [showLatLongForm, setShowLatLongForm] = useState(false);
    const [manualLat, setManualLat] = useState(null);
    const [manualLong, setManualLong] = useState(null);

    const handleOptionChange = (e) => {
        setSelectedOption(e.target.value); // Aggiorna lo stato con il valore selezionato
        if (e.target.value === 'allMunicipalities') {

            // I'm not setting the position based on the cetroid of teh area because will be srtange to have a marker in the middle of the map
            // So i'm leaving it on (67.8558, 20.2253) that is in the middle of the city
            props.handleAddLatLongToDocumentModal(67.8558, 20.2253);
            setManualLat(null);
            setManualLong(null);
        } else if (e.target.value === 'pointToPoint') {
            setPositionAlreadyChosen(false); // when the radio button is clicked the position is not yet chosen (otherwise the map will not be shown)
            setManualLat(null);
            setManualLong(null);
        } else if (e.target.value === 'manualInsertion') {
            setShowLatLongForm(true);
        }
    };

    const handleLatLongFormSubmit = () => {
        if (manualLat === null || manualLong === null) {
            alert("Latitude and longitude must be filled and should be numbers");
            return;
        } else if (manualLat < -90 || manualLat > 90 || manualLong < -180 || manualLong > 180) {
            alert("Latitude must be between -90 and 90, longitude must be between -180 and 180");
            return;
        }
        props.handleSetPostition(manualLat, manualLong);
        setShowLatLongForm(false);
    };



    // Does not reset the old value of the manualLat and manualLong (happens when you try to change the lat long after you have already inserted them)
    const handleResetLatLong = async () => {
        setManualLat(null);
        setManualLong(null);
        setShowLatLongForm(true)
    };


    function LocationMarker() {
        useMapEvents({
            click(e) {
                setPosition(e.latlng);
                props.handleAddLatLongToDocumentModal(e.latlng.lat, e.latlng.lng);
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

                    <Form.Check
                        type="radio"
                        label="Choose Area"
                        name="choosed" // all the radio button must have the same name to be able to select only one
                        value="chooseArea" // value for this specific choice
                        checked={selectedOption === 'chooseArea'} // if the selectedOption is equal to this value then the radio button will be checked
                        onChange={handleOptionChange} // when the radio button is clicked the handleOptionChange function will be called     
                    />

                    <Form.Check
                        type="radio"
                        label="Choose prexisting Area"
                        name="choosed" // all the radio button must have the same name to be able to select only one
                        value="choosePrexistingArea" // value for this specific choice
                        checked={selectedOption === 'chooseArea'} // if the selectedOption is equal to this value then the radio button will be checked
                        onChange={handleOptionChange} // when the radio button is clicked the handleOptionChange function will be called     
                    />

                </Form.Group>

                <div className="show">
                    {/**Here i put the map for alla municipality */}
                    {selectedOption === 'allMunicipalities' &&
                        <MapContainer center={[67.8558, 20.2253]} zoom={13} style={{ height: "100%", width: "100%" }}>
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
                    {selectedOption === 'pointToPoint' && !positionAlreadyChosen &&
                        <>
                            <MapContainer center={[67.8558, 20.2253]} zoom={13} style={{ height: "30vh", width: "100%" }}>
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <LocationMarker />
                            </MapContainer>

                            {/*( // sostituito con props.handleAddLatLongToDocumentModal
                            <Button variant="primary" onClick={() => {
                                props.handleSetPostition(position.lat, position.lng)
                                setPositionAlreadyChosen(true)
                            }}>
                                Set
                            </Button>
                            */}
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
                                        onChange={(e) => setPosition({ lat: position.lng, lng: parseFloat(e.target.value) })}
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


export default ChosenPosition;