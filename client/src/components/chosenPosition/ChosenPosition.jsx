import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState } from "react";
import { Routes, Route, Outlet, Navigate, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Form, Modal, Offcanvas } from "react-bootstrap";

import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
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
    const [position, setPosition] = useState(null);
    const [positionAlreadyChosen, setPositionAlreadyChosen] = useState(false);

    // for manual insertion
    const [showLatLongForm, setShowLatLongForm] = useState(false);
    const [manualLat, setManualLat] = useState(null);
    const [manualLong, setManualLong] = useState(null);

    const handleOptionChange = (e) => {
        setSelectedOption(e.target.value); // Aggiorna lo stato con il valore selezionato
        if(e.target.value === 'allMunicipalities'){
            console.log('allMunicipalities');
            props.handleSetPostition(67.8558, 20.2253); 
            // fixes the problem that after manual insertion you came back from the map and the position was still the one you manually inserted
            setManualLat(null);
            setManualLong(null);   
        } else if(e.target.value === 'pointToPoint'){
            console.log('pointToPoint');
            setPositionAlreadyChosen(false); // when the radio button is clicked the position is not yet chosen (otherwise the map will not be shown)
            // fixes the problem that after manual insertion you came back from the map and the position was still the one you manually inserted
            setManualLat(null);
            setManualLong(null);
        } else if(e.target.value === 'manualInsertion'){
            console.log('manualInsertion');
            setShowLatLongForm(true);
        }
    };

    const handleLatLongFormSubmit = () => {
        console.log("Sono in ChosenPosition.jsx, ho cliccato su submit per la latitudine: ",manualLat," e longitudine: ",manualLong);
        if(manualLat === null || manualLong === null){
            alert("Latitude and longitude must be filled and should be numbers");
            return;
        } else if(manualLat < -90 || manualLat > 90 || manualLong < -180 || manualLong > 180){
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
        console.log("Sono in ChosenPosition.jsx, ho cliccato su change lat long i valori attuali sono (se vedi valori in realtà sono null, null): ", manualLat, manualLong);
    };


    function LocationMarker() {
        useMapEvents({
          click(e) {
            setPosition(e.latlng);
          },
        });
    
        console.log("Sono in Chosen Position.jsx, ho ricavato dal click la posizione: ",position);

        return position ? <Marker position={position}></Marker> : null;
    }

    return (
        <>
        <Container fluid>
                    {/**here i put the checkbox/radio */}
                    <Form.Group>
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

                    {/**here i put the map */}
                    {selectedOption === 'pointToPoint' && !positionAlreadyChosen &&
                        <>
                            <MapContainer center={[67.8558, 20.2253]} zoom={13} style={{ height: "30vh", width: "100%" }}>
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <LocationMarker />
                            </MapContainer>

                            <Button variant="primary" onClick={() => {
                                props.handleSetPostition(position.lat, position.lng)
                                setPositionAlreadyChosen(true)
                                }}>
                                Set 
                            </Button>
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
                                        onChange={(e) => setManualLat(parseFloat(e.target.value))}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Longitude</Form.Label>
                                    <Form.Control 
                                        type="number" 
                                        placeholder="Enter longitude" 
                                        step="0.000001" 
                                        required={true}
                                        onChange={(e) => setManualLong(parseFloat(e.target.value))}
                                    />
                                </Form.Group>

                                <Button variant="primary" onClick={handleLatLongFormSubmit}>
                                    Save
                                </Button>
                            </Form.Group>
                        </>
                    }


                    {/**If i choose the (lat, long) i want to see them */}
                    {selectedOption === 'manualInsertion' && !showLatLongForm && manualLat && manualLong &&
                        <>
                            <h3 className="mt-5">Latitude: {manualLat}, Longitude: {manualLong}</h3>
                            <Button variant="primary" onClick={handleResetLatLong}> Change Latitude and longitude</Button>
                        </>
                    }

        </Container>

        </>
    );
}


export default ChosenPosition;