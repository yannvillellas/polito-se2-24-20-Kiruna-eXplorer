import "bootstrap/dist/css/bootstrap.min.css";
import "./chosenPosition.css";
import { useState, useEffect } from "react";
import { Container, Button, Form } from "react-bootstrap";

import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, FeatureGroup, Marker, LayersControl, Polygon, GeoJSON, useMapEvents } from 'react-leaflet';
import { EditControl } from "react-leaflet-draw";

import "leaflet-draw/dist/leaflet.draw.css";

import geojsonData from "../../../../data/KirunaMunicipality.json";
import areaAPI from "../../../../api/areaAPI";

import IconaAllMunicipality from "../../../assets/iconaAllMunicipality.png";
import IconaChooseOnTheMap from "../../../assets/iconaChooseOnTheMap.png";
import IconaManualInsertion from "../../../assets/iconaManualInsertion.png";
import IconaAddNewArea from "../../../assets/iconaAddNewArea.png";
import IconaChoosePrexistingArea from "../../../assets/iconaChoosePrexistingArea.png";

function ChosenPosition(props) {
    const [selectedOption, setSelectedOption] = useState('');

    // for point to point
    const [position, setPosition] = useState({ lat: null, lng: null }); // Coordinate di default

    // for manual insertion
    const [showLatLongForm, setShowLatLongForm] = useState(false);

    // for area selection:
    const [areas, setAreas] = useState([]);
    const [selectedAreaId, setSelectedAreaId] = useState(null);  // So taht if the user press teh area it will change color

    // Fetch all areas from the database (at the construction of the component)
    useEffect(() => {
        const fetchAreas = async () => {
            try {
                const areas = await areaAPI.listAreas();
                console.log("Sono in ChosenArea.jsx, ecco tutte le aree che mi sono arrivate dal DB:", areas);
                setAreas(areas);
            } catch (error) {
                console.error("Error fetching areas:", error);
            }
        };
        fetchAreas();
    }, []);



    const handleOptionChange = (e) => {
        setSelectedOption(e.target.value); // Aggiorna lo stato con il valore selezionato
        setPosition({ lat: null, lng: null });
        props.handleAddLatLongToDocumentModal(null, null); // otherwise if you change and go back it will be saved as the previous value
        props.handleSetArea(null); // Resetta l'area selezionata
        if (e.target.value === 'allMunicipalities') {
            // I'm not setting the position based on the cetroid of teh area because will be srtange to have a marker in the middle of the map
            // So i'm leaving it on (67.8558, 20.2253) that is in the middle of the city
            props.handleAddLatLongToDocumentModal(67.8558, 20.2253);
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
        props.handleAddLatLongToDocumentModal(position.lat, position.lng);
        setShowLatLongForm(false);
    };



    // Does not reset the old value of the manualLat and manualLong (happens when you try to change the lat long after you have already inserted them)
    const handleResetLatLong = async () => {
        props.handleAddLatLongToDocumentModal(null, null); // so that the even if you cahnge the lat, long if you don't press "save" (under the lat,lng form) the value will not be saved 
        // If the user want to change the lat, lng he is not forced to write from zero again
        setPosition({ lat: position.lat, lng: position.lng });
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



    function isAreaContained(area1, area2) {
        // area1: GeoJSON della potenziale area "contenente"
        // area2: json(per il problema della mano destrorsa) dell'area da verificare, ricorda che geojsonData è di "type":"FeatureCollection"
        try {
            if (area2.type === "FeatureCollection" && area2.features.length > 0) {
                for (let feature of area2.features) {
                    // Se l'area1 non è contetnuta in anceh solo un'area di area2, ritorna false
                    // Se area1 è contenuta in una delle features di area2, ritorna true
                    if (turf.booleanContains(feature, area1)) {
                        console.log("Area1 è contenuta in una delle features di area2");
                        return true;
                    }
                }
            }
            return false; // se area1 è interamente contenuta
        } catch (error) {
            console.error('Errore durante il controllo delle aree:', error);
            return false;
        }
    }

    // Per calcolare centro con la media aritmetica delle coordinate (TURF ha problemi con il centroide del triangolo)
    function calculateCenterOfPolygon(latlngs) {
        let latSum = 0;
        let lngSum = 0;
        const numPoints = latlngs.length;

        // Somma le coordinate
        latlngs.forEach(latlng => {
            latSum += latlng.lat;
            lngSum += latlng.lng;
        });

        // Calcola la media delle coordinate
        const centerLat = latSum / numPoints;
        const centerLng = lngSum / numPoints;

        return [centerLat, centerLng];
    }


    const onCreated = (e) => {
        const { layerType, layer } = e;
        let shape;

        if (layerType === "polygon") {
            shape = {
                id: Date.now(),
                type: layerType,
                latlngs: JSON.stringify(layer.getLatLngs()),
            };
        }

        else {
            console.warn(`Tipo di layer non gestito: ${layerType}`);
            return;
        }

        const areaToGeoJson = layer.toGeoJSON();
        console.log("Sono in ChosenPosition.jsx, ho convertito Area to GeoJson: ", areaToGeoJson);


        if (isAreaContained(areaToGeoJson, geojsonData)) {
            console.log("Sono in ChosenPosition.jsx, l'area è contenuta nel municipio!");
            props.handleSetArea(shape);

            // Calcolo il centro dell'area con la media aritmetica delle coordinate (tengo questo)
            const latlngs = JSON.parse(shape.latlngs)[0];
            const center = calculateCenterOfPolygon(latlngs);
            console.log("Centro calcolato come media delle coordinate:", center);
            // Passa il centro come lat, lng
            props.handleAddLatLongToDocumentModal(center[0], center[1]);
            setPosition({ lat: center[0], lng: center[1] });

        } else {
            alert("The area is not inside the municipality");
            layer.remove();
        }
    };

    const handleSetPreExistingArea = (area) => {

        console.log("Sono in ChosenPosition.jsx, Area selected: ", area);
        setSelectedAreaId((prevId) => (prevId === area.areaId ? null : area.areaId)); // Cambia colore solo all'area cliccata

        const shape = {
            id: area.areaId,
            type: area.areaType,
            latlngs: area.coordinates,
        }
        console.log("Sono in ChosenPosition.jsx, Area selected: ", shape);
        props.handleSetArea(shape);

        // Calcolo il centro dell'area con la media aritmetica delle coordinate (tengo questo)
        const latlngs = JSON.parse(area.coordinates)[0];
        const center = calculateCenterOfPolygon(latlngs);
        console.log("Centro calcolato come media delle coordinate:", center);
        // Passa il centro come lat, lng
        props.handleAddLatLongToDocumentModal(center[0], center[1]);
        setPosition({ lat: center[0], lng: center[1] });

    };


    return (
        <>
            <Container fluid className="cp-container" style={{ width: '90%', height: '45vh' }}>
                {/**here i put the checkbox/radio */}
                <Form.Group className="radio-group" style={{ marginTop: '-0px' }}>
                    <Form.Check
                        type="radio"
                        label={(
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '23px' }}>
                                All municipality
                                <img
                                    src={IconaAllMunicipality}
                                    alt="icon"
                                    style={{ width: '80px', height: '80px', marginLeft: '180px' }}
                                />
                            </span>
                        )}
                        name="choosed" // all the radio button must have the same name to be able to select only one
                        value="allMunicipalities" // value for this specific choice
                        checked={selectedOption === 'allMunicipalities'} // if the selectedOption is equal to this value then the radio button will be checked
                        onChange={handleOptionChange} // when the radio button is clicked the handleOptionChange function will be called
                    />




                    <Form.Check
                        type="radio"
                        label={(
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '23px' }}>
                                Choose on map
                                <img
                                    src={IconaChooseOnTheMap}
                                    alt="icon"
                                    style={{ width: '80px', height: '80px', marginLeft: '170px' }}
                                />
                            </span>
                        )}
                        name="choosed" // all the radio button must have the same name to be able to select only one
                        value="pointToPoint" // value for this specific choice
                        checked={selectedOption === 'pointToPoint'} // if the selectedOption is equal to this value then the radio button will be checked
                        onChange={handleOptionChange} // when the radio button is clicked the handleOptionChange function will be called
                    />

                    <Form.Check
                        type="radio"
                        label={(
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '23px' }}>
                                Manual insertion
                                <img
                                    src={IconaManualInsertion}
                                    alt="icon"
                                    style={{ width: '100px', height: '80px', marginLeft: '140px' }}
                                />
                            </span>
                        )}
                        name="choosed" // all the radio button must have the same name to be able to select only one
                        value="manualInsertion" // value for this specific choice
                        checked={selectedOption === 'manualInsertion'} // if the selectedOption is equal to this value then the radio button will be checked
                        onChange={handleOptionChange} // when the radio button is clicked the handleOptionChange function will be called     
                    />

                    <Form.Check
                        type="radio"
                        label={(
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '23px' }}>
                                Add new area
                                <img
                                    src={IconaAddNewArea}
                                    alt="icon"
                                    style={{ width: '80px', height: '80px', marginLeft: '190px' }}
                                />
                            </span>
                        )}
                        name="choosed" // all the radio button must have the same name to be able to select only one
                        value="addNewArea" // value for this specific choice
                        checked={selectedOption === 'addNewArea'} // if the selectedOption is equal to this value then the radio button will be checked
                        onChange={handleOptionChange} // when the radio button is clicked the handleOptionChange function will be called     
                    />

                    <Form.Check
                        type="radio"
                        label={(
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '23px' }}>
                                Choose pre-existing area
                                <img
                                    src={IconaChoosePrexistingArea}
                                    alt="icon"
                                    style={{ width: '80px', height: '80px', marginLeft: '75px' }}
                                />
                            </span>
                        )}
                        name="choosed" // all the radio button must have the same name to be able to select only one
                        value="selectExistingArea" // value for this specific choice
                        checked={selectedOption === 'selectExistingArea'} // if the selectedOption is equal to this value then the radio button will be checked
                        onChange={handleOptionChange} // when the radio button is clicked the handleOptionChange function will be called     
                    />

                </Form.Group>

                <div className="show">
                    {/**Here i put the map for alla municipality */}
                    {selectedOption === 'allMunicipalities' &&
                        <MapContainer center={[68.2558, 20.1240]} zoom={6} style={{ height: "100%", width: "100%" }}>
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

                            <GeoJSON
                                data={geojsonData}
                                style={geojsonStyle}
                            />

                        </MapContainer>
                    }


                    {/**here i put the map */}
                    {selectedOption === 'pointToPoint' &&
                        <>
                            <MapContainer center={[67.8558, 20.2253]} zoom={13} style={{ height: "100%", width: "100%" }}>
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
                    {selectedOption === 'manualInsertion' &&
                        <>
                            <div style={{ position: "relative", height: "100%", width: "100%" }}>
                                <MapContainer center={[67.8558, 20.2253]} zoom={13} style={{ height: "100%", width: "100%" }}>
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

                                    {position.lat && position.lng &&
                                        <Marker position={position}></Marker>
                                    }

                                </MapContainer>




                                <Form.Group style={{
                                    position: "absolute",
                                    top: "20px",
                                    left: "20px",
                                    zIndex: 1000,
                                    backgroundColor: "rgba(255, 255, 255, 0.2)", // Sfondo semitrasparente per il riquadro
                                    padding: "20px",
                                    borderRadius: "8px",
                                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                                    backdropFilter: "blur(20px)", // Aggiunge l'effetto di sfocatura allo sfondo
                                    border: "2px solid white", // Bordo bianco
                                }}>


                                    <Form.Group className="mb-3">
                                        <Form.Control
                                            type="number"
                                            placeholder="Enter latitude"
                                            step="0.000001"
                                            required={true}
                                            value={position.lat || ''}
                                            onChange={(e) => setPosition({ lat: parseFloat(e.target.value), lng: position.lng })}
                                            size="sm"
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Control
                                            type="number"
                                            placeholder="Enter longitude"
                                            step="0.000001"
                                            required={true}
                                            value={position.lng || ''}
                                            onChange={(e) => setPosition({ lat: position.lat, lng: parseFloat(e.target.value) })}
                                            size="sm"
                                        />
                                    </Form.Group>


                                    <Button
                                        variant="primary"
                                        onClick={handleLatLongFormSubmit}
                                        size="sm"
                                        className="bi bi-floppy"
                                        style={{
                                            top: "20px",
                                            left: "20px",
                                            zIndex: 1000,
                                            backgroundColor: "rgba(255, 255, 255, 0.2)", // Sfondo semitrasparente per il bottone
                                            borderRadius: "8px", // Angoli arrotondati
                                            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)", // Aggiungi una leggera ombra
                                            backdropFilter: "blur(20px)", // Aggiunge l'effetto di sfocatura allo sfondo
                                            border: "2px solid white", // Bordo bianco
                                            color: "white", // Colore del testo del bottone
                                            fontSize: "14px", // Imposta la dimensione del testo
                                        }}
                                    />


                                </Form.Group>


                            </div>
                        </>
                    }


                    {selectedOption === 'addNewArea' &&
                        <>
                            <MapContainer center={[67.8558, 20.2253]} zoom={13} style={{ height: "100%", width: "100%" }}>
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

                                <FeatureGroup>
                                    <EditControl
                                        position="topright"
                                        onCreated={onCreated}
                                        draw={{
                                            rectangle: false,
                                            polygon: true,
                                            circle: false,
                                            circleMarker: false,
                                            polyline: false,
                                            marker: false,
                                        }}
                                    />
                                </FeatureGroup>


                                <GeoJSON
                                    data={geojsonData}
                                    style={geojsonStyle}
                                />

                            </MapContainer>
                        </>
                    }

                    {selectedOption === 'selectExistingArea' &&
                        <>
                            <MapContainer center={[67.8558, 20.2253]} zoom={13} style={{ height: "100%", width: "100%" }}>
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


                                {/**Show all the areas by document: */}
                                {areas.length > 0 && areas.map((area, index) => {
                                    if (area.areaType === "polygon") {
                                        try {
                                            const positions = JSON.parse(area.coordinates)[0]; // Parsing delle coordinate
                                            const isSelected = selectedAreaId === area.areaId; // Verifica se l'area è selezionata
                                            const color = isSelected ? '#ce661f' : '#5a83b5'; // Colore dinamico in base alla selezione
                                            return (
                                                <Polygon
                                                    key={index}
                                                    positions={positions}
                                                    pathOptions={{ color, fillOpacity: 0.5 }}
                                                    eventHandlers={{
                                                        click: () => {
                                                            console.log(`Clicked polygon ID: ${area.areaId}`)
                                                            handleSetPreExistingArea(area);
                                                        },
                                                    }}
                                                />
                                            );
                                        } catch (error) {
                                            console.error(`Error parsing coordinates for area ID: ${area.areaId}`, error);
                                            return null;
                                        }
                                    }
                                    return null;
                                })}

                            </MapContainer>
                        </>
                    }


                </div>


            </Container>

        </>
    );
}


export default ChosenPosition;