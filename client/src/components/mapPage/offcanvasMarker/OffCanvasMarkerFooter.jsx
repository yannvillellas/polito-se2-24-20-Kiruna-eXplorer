import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import DocumentAPI from "../../../api/documentAPI";
import ChosenPositionMap from "../map/ChosenPositionMap";
import 'leaflet/dist/leaflet.css';
import { GiGreekTemple } from "react-icons/gi";
import { Link } from "react-router-dom";


import { MapContainer, TileLayer, Marker, LayersControl, Polygon, GeoJSON, Popup } from 'react-leaflet';

import MarkerClusterGroup from 'react-leaflet-cluster';


import associationAPI from "../../../api/associationAPI";
import geojsonData from "../../../data/KirunaMunicipality.json";
import { Icon, DivIcon } from 'leaflet';
import { use } from "react";



function OffCanvasMakerFooter(props) {
    const location = useLocation(); // Ottieni l'URL corrente


    useEffect(() => {
        console.log("location vale: ", location);
    }, [location, props.selectedDoc]);


    // Controlla se l'URL corrisponde a /mapPage o /mapPage/:docId
    const isMapPage = location.pathname === '/mapPage' || location.pathname.startsWith('/mapPage/');

    return (
        <>
            <div style={{ display: 'flex', gap: '20px' }}>
                <Button variant="primary" onClick={() => {
                    props.handleShowAllLinkedDocument(props.selectedDoc.docId);
                    props.closeDocumentModal();
                }}
                    style={{
                        backgroundColor: '#3e5168',
                        border: 'none',
                        marginTop: '4px',
                        fontSize: '18px' // Riduce la dimensione del testo
                    }}
                >
                    Related documents
                </Button>

                {isMapPage ?  // Mostra il pulsante solo se isMapPage è true
                    <Link to={`/diagram/${props.selectedDoc.docId}`} className="btn btn-primary" style={{
                        backgroundColor: '#3e5168',
                        border: 'none',
                        marginTop: '4px',
                        fontSize: '18px' // Riduce la dimensione del testo
                    }}>
                        Diagram
                    </Link>

                    :

                    <Link to={`/mapPage/${props.selectedDoc.docId}`} className="btn btn-primary" style={{
                        backgroundColor: '#3e5168',
                        border: 'none',
                        marginTop: '4px',
                        fontSize: '18px' // Riduce la dimensione del testo
                    }}>
                        Map
                    </Link>
                }
            </div>
        </>
    );
}




export default OffCanvasMakerFooter;