import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import PropTypes from 'prop-types';
import { Container, Modal, Button, Tooltip, OverlayTrigger, Offcanvas } from "react-bootstrap";
import DocumentAPI from "../../../api/documentAPI";
import ChosenPositionMap from "../map/ChosenPositionMap";
import 'leaflet/dist/leaflet.css';
import { GiGreekTemple } from "react-icons/gi";


import { MapContainer, TileLayer, Marker, LayersControl, Polygon, GeoJSON, Popup } from 'react-leaflet';

import MarkerClusterGroup from 'react-leaflet-cluster';


import associationAPI from "../../../api/associationAPI";
import geojsonData from "../../../data/KirunaMunicipality.json";
import { Icon, DivIcon } from 'leaflet';



// Import di offCanvasMarker
import OffCanvasMarkerSezione0 from "./OffCanvasMarkerSezione0";
import OffCanvasMarkerSezione1 from "./OffCanvasMarkerSezione1";
import OffCanvasMarkerSezione2 from "./OffCanvasMarkerSezione2";
import OffCanvasMarkerSezione3 from "./OffCanvasMarkerSezione3";
import OffCanvasMakerFooter from "./OffCanvasMarkerFooter";





function OffcanvasMarker(props) {

    const [showDocumentModal, setShowDocumentModal] = useState(false); // This componet state

    useEffect(() => {
        setShowDocumentModal(props.selectedDoc ? true : false);
    }, [props.selectedDoc]);



    return (
        <>
            <Offcanvas
                show={showDocumentModal}
                onHide={props.closeDocumentModal}
                placement="end"
                style={{ width: '600px' }}
            >
                <Offcanvas.Header
                    closeButton
                    style={{
                        backgroundColor: '#3e5168',
                        color: '#ffffff',
                    }}
                >

                </Offcanvas.Header>
                <Offcanvas.Body>
                    {props.selectedDoc ? (
                        <>
                            <OffCanvasMarkerSezione0
                                selectedDoc={props.selectedDoc}
                                isUrbanPlanner={props.isUrbanPlanner}
                                handleForceRefresh={props.handleForceRefresh} />
                            <br />
                            <OffCanvasMarkerSezione1
                                selectedDoc={props.selectedDoc}
                                isUrbanPlanner={props.isUrbanPlanner}
                                handleForceRefresh={props.handleForceRefresh} />
                            <br />
                            <OffCanvasMarkerSezione2
                                selectedDoc={props.selectedDoc}
                                isUrbanPlanner={props.isUrbanPlanner}
                                handleForceRefresh={props.handleForceRefresh} />
                            <br />
                            <OffCanvasMarkerSezione3
                                selectedDoc={props.selectedDoc}
                                isUrbanPlanner={props.isUrbanPlanner}
                                documents={props.documents}
                                handleChangeMapViewBasedOnDocId={props.handleChangeMapViewBasedOnDocId}
                                handleForceRefresh={props.handleForceRefresh}
                                setErrorMsg={props.setErrorMsg}
                                allAssociations={props.allAssociations}
                                setAllAssociations={props.setAllAssociations}
                            />
                            <br />
                            <OffCanvasMakerFooter
                                selectedDoc={props.selectedDoc}
                                handleShowAllLinkedDocument={props.handleShowAllLinkedDocument}
                                closeDocumentModal={props.closeDocumentModal}
                                handleForceRefresh={props.handleForceRefresh}
                            />
                        </>
                    ) : (
                        <p>Select a marker for visualize the details.</p>
                    )}
                </Offcanvas.Body>
            </Offcanvas>
        </>
    );
}


export default OffcanvasMarker;