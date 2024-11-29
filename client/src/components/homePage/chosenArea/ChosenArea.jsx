import { Form, Container } from "react-bootstrap";
import { MapContainer, TileLayer, FeatureGroup, CircleMarker, Polygon, GeoJSON } from "react-leaflet";
import { useState, useEffect } from "react";
import { EditControl } from "react-leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";
import L from "leaflet";

import areaAPI from "../../../api/areaAPI";
import geojsonData from "./KirunaMunicipality.json"
import { booleanContains, centroid, polygon } from "@turf/turf";

// Configura le icone per Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});


function ChosenArea(props) {
    const [selectedOption, setSelectedOption] = useState(''); // Stato per il valore selezionato
    const [areas, setAreas] = useState([]);
    const [selectedArea, setSelectedArea] = useState(null); // Here there is the selected areaId



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
        if (e.target.value === 'addNewArea') {
            // props.handleSetArea(null); 
        } else if (e.target.value === 'selectExistingArea') {
            // props.handleSetArea(null);
        }
    };

    const handleSetPreExistingArea = (area) => {
        console.log("Sono in ChosenArea.jsx, Area selected: ", area);
        props.handleSetArea(area);

        // Calcolo il centro dell'area con la media aritmetica delle coordinate (tengo questo)
        const latlngs = JSON.parse(area.coordinates)[0];
        const center = calculateCenterOfPolygon(latlngs);
        console.log("Centro calcolato come media delle coordinate:", center);
        // Passa il centro come lat, lng
        props.handleSetPostition(center[0], center[1]);

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

        /*
        else if (layerType === "circle") {
            shape = {
                id: Date.now(),
                type: layerType,
                center: JSON.stringify(layer.getLatLng()),
                radius: JSON.stringify(layer.getRadius()),
            };
        } else if (layerType === "circlemarker") {
            shape = {
                id: Date.now(),
                type: layerType,
                center: JSON.stringify(layer.getLatLng()),
            };
           
        }  */

        else {
            console.warn(`Tipo di layer non gestito: ${layerType}`);
            return;
        }

        const areaToGeoJson = layer.toGeoJSON();
        console.log("Sono in ChosenArea.jsx, ho convertito Area to GeoJson: ", areaToGeoJson);


        if (isAreaContained(areaToGeoJson, geojsonData)) {
            console.log("Sono in choseArea.jsx, l'area è contenuta nel municipio!");
            props.handleSetArea(shape);

            /** Calcolo il centro dell'area TURF (ha problemi con centroide del triangolo) (passo quello come coordinate (lat, lng)*/
            /*
            const latlngs = JSON.parse(shape.latlngs)[0];
            console.log("Sono in ChosenArea.jsx, latlngs dell'area appena disegnata: (JSON.parse) ", latlngs);
            const polygonGeoJSON = {
                type: "Feature",
                geometry: {
                    type: "Polygon",
                    coordinates: [latlngs.map(latlng => [latlng.lng, latlng.lat])] // Inverti in [lon, lat]
                }
            };

            console.log("Sono in ChosenArea.jsx, polygonGeoJSON, ricavato: ", polygonGeoJSON);

            
            let centroid = turf.centroid(polygonGeoJSON);
            console.log("AddDocument.jsx, centroide calcolato con turf (e' un po' strano)", centroid, centroid.geometry.coordinates); // [lon, lat]
            props.handleSetPostition(centroid.geometry.coordinates[1], centroid.geometry.coordinates[0]); // Inverto in [lat, lon]
            */


            // Calcolo il centro dell'area con la media aritmetica delle coordinate (tengo questo)
            const latlngs = JSON.parse(shape.latlngs)[0];
            const center = calculateCenterOfPolygon(latlngs);
            console.log("Centro calcolato come media delle coordinate:", center);
            // Passa il centro come lat, lng
            props.handleSetPostition(center[0], center[1]);


        } else {
            alert("The area is not inside the municipality");
        }
    };





    return (
        <>
            <Container fluid>
                <Form.Group>
                    <Form.Check
                        type="radio"
                        label="Add new area"
                        name="choosed"
                        value="addNewArea"
                        checked={selectedOption === 'addNewArea'}
                        onChange={handleOptionChange}
                    />

                    <Form.Check
                        type="radio"
                        label="Select from existing areas"
                        name="choosed"
                        value="selectExistingArea"
                        checked={selectedOption === 'selectExistingArea'}
                        onChange={handleOptionChange}
                    />
                </Form.Group>

                {selectedOption === 'addNewArea' &&
                    <>
                        <MapContainer center={[67.8558, 20.2253]} zoom={13} style={{ height: "30vh", width: "100%" }}>
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
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

                        </MapContainer>
                    </>
                }

                {selectedOption === 'selectExistingArea' &&
                    <>
                        <MapContainer center={[67.8558, 20.2253]} zoom={13} style={{ height: "30vh", width: "100%" }}>
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <FeatureGroup>
                                <EditControl
                                    position="topright"
                                    onCreated={onCreated}
                                    draw={{
                                        rectangle: false,
                                        polygon: false,
                                        circle: false,
                                        circleMarker: false,
                                        polyline: false,
                                        marker: false,
                                    }}
                                />
                            </FeatureGroup>

                            {/**Show all the areas by document: */}
                            {areas.length > 0 && areas.map((area, index) => {
                                if (area.areaType === "polygon") {
                                    try {
                                        const positions = JSON.parse(area.coordinates)[0]; // Parsing delle coordinate
                                        return (
                                            <Polygon
                                                key={index}
                                                positions={positions}
                                                pathOptions={{ color: 'blue', fillOpacity: 0.5 }}
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
            </Container>
        </>
    );
}



export default ChosenArea;