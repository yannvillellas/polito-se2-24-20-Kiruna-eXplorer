import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import PropTypes from 'prop-types';
import { Container, Modal, Button, Tooltip, OverlayTrigger, Offcanvas  } from "react-bootstrap";
import DocumentAPI from "../../../api/documentAPI";
import ChosenPositionMap from "../map/ChosenPositionMap";
import 'leaflet/dist/leaflet.css';
import { GiGreekTemple } from "react-icons/gi";


import { MapContainer, TileLayer, Marker, LayersControl, Polygon, GeoJSON, Popup } from 'react-leaflet';

import MarkerClusterGroup from 'react-leaflet-cluster';


import associationAPI from "../../../api/associationAPI";
import geojsonData from "../../../data/KirunaMunicipality.json";
import { Icon, DivIcon } from 'leaflet';

function OffcanvasMarker(props) {

    const [showDocumentModal, setShowDocumentModal] = useState(false); // This componet state
    // Manage connectionsList of the document with DOC_ID
    const [linkedDocuments, setLinkedDocuments] = useState([]); // Call API (getAssociationBy_DOC_ID), but here is easier (same concept of files) where each element will have structure: {aId: 1, title: "title", type: "type", doc1: doc1Id, doc2: doc2Id}
    const [files, setFiles] = useState(); // Got called here when a user press on the document (is bettere if is here? I think yes bc otherwise every time you have add/modify a new document in APP.jsx )


    useEffect(() => {
        setShowDocumentModal(props.selectedDoc ? true : false);
    }, [props.selectedDoc]);

    useEffect(() => {

        const fetchConnectionsAndFiles = async () => {
            if (props.selectedDoc) {
                try {
                    await handleShowTitleAllLinkedDocument(props.selectedDoc.docId);
                    console.log("Sono in handleMarkerClick, sono tornato da handleShowTitleAllLinkedDocument");
                } catch (error) {
                    console.error("Error fetching linked documents:", error);
                }

                // Questo codice con i files è problematico: quando non ci sono files
                try {
                    await handleGetFiles(props.selectedDoc.docId);
                    console.log("Sono in handleMarkerClick, sono tornato da handleGetFiles");
                } catch (error) {
                    console.error("Error fetching files:", error);
                }
            }
        }

        fetchConnectionsAndFiles();
    }, [props.selectedDoc]);


    // Funzione mdocificata (restituiva errore)
    const handleGetFiles = async (docId) => {
        try {
            const files = await DocumentAPI.getFiles(docId); // Risolvi la Promise
            console.log("Ecco i files: ", files);
            if (files) {
                setFiles(Array.from(files));
            } else {
                setFiles([]); // Inizializza con array vuoto se non ci sono file
            }
        } catch (error) {
            console.error("Error fetching files:", error);
            setFiles([]); // Fallback in caso di errore
        }
    };

    const handleDownload = (file) => {
        const URL = `http://localhost:3001/${file.path.slice(1)}`

        const aTag = document.createElement("a");
        aTag.href = URL
        aTag.setAttribute("download", file.name)
        document.body.appendChild(aTag)
        aTag.click();
        aTag.remove();
    }


    const handleShowTitleAllLinkedDocument = async (docId) => {

        if (!docId) { // Se non è stato selezionato nessun documento
            console.log("Sono in handleShowTitleAllLinkedDocument, non c'è nessun docId");
            setLinkedDocuments([]);
            return;
        }
        console.log("Sono in handleShowTitleAllLinkedDocument, ecco il docId: ", docId);
        let assciationToShow = await associationAPI.getAssociationsByDocId(docId);
        console.log("Sono in MAP.jsx ecco le associationToSHow che ho rievuto: ", assciationToShow);
        console.log("Ecco i linksType passsati come props: ", props.linksType);
        let titleList = [];
        let title = "";
        for (let association of assciationToShow) {
            if (association.doc1 === docId) {
                // se il titolo non è già presente in titleList aggiuggilo
                title = props.documents.filter(doc => doc.docId === association.doc2)[0].title;
                if (!titleList.some(item => item.docTitle === title)) {
                    titleList.push({ docTitle: title, otherDocumentId: association.doc2 });
                }
            } else {
                title = props.documents.filter(doc => doc.docId === association.doc1)[0].title;
                if (!titleList.some(item => item.docTitle === title)) {
                    titleList.push({ docTitle: title, otherDocumentId: association.doc1 });
                }
            }
        }
        console.log("Ecco i documenti associati: ", titleList);
        setLinkedDocuments(titleList);
    }

    const handleConnectionClick = async (docId) => {
        props.handleChangeMapViewBasedOnDocId(docId);
        console.log("Sono in handleConnectionClick, ecco il docId: ", docId);
        // prendo l'intero documento:
        // const doc = props.documents.filter(doc => doc.docId === docId)[0];
        // chiamo handleMarkerClick passando l'intero documento:
        // handleMarkerClick(doc);
    };





    return (
        <>
            <Offcanvas 
                show={showDocumentModal} 
                onHide={props.closeDocumentModal} 
                placement="end"
                style={{ width: '500px' }} 
                >
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>
                        {props.selectedDoc ? (
                            props.selectedDoc.title
                        ) : (
                            <p>Select a marker for visualize the details.</p>
                        )}
                    </Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    {props.selectedDoc ? (
                        <>
                            {Object.entries(props.selectedDoc)
                                .filter(([key, value]) =>
                                    key !== "docId" &&
                                    key !== "connections" &&
                                    key !== "title" &&
                                    key !== "lat" &&
                                    key !== "lng" &&
                                    value !== null &&
                                    value !== undefined &&
                                    value !== "" // esclude stringhe vuote
                                )
                                .map(([key, value]) => (
                                    <p key={key}>
                                        <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value}
                                    </p>
                                ))}

                            <div key={"connections"}>
                                <p>
                                    <strong>Connections:</strong>
                                </p>
                                {linkedDocuments.length > 0 ? linkedDocuments.map((connection) => (
                                    <p
                                        key={connection.docTitle}
                                        style={{
                                            marginBottom: '8px',  // Spazio tra i paragrafi
                                        }}
                                    >
                                        <span
                                            onClick={() => handleConnectionClick(connection.otherDocumentId)}
                                            style={{
                                                color: 'blue',
                                                textDecoration: 'underline',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            {connection.docTitle}
                                        </span>
                                    </p>
                                )) : "This file has no connections"}
                            </div>


                            <div key={"position"}>
                                <p>
                                    <strong>Position:</strong>{(props.selectedDoc.lat == 67.8558 && props.selectedDoc.lng == 20.2253) ? " All municipalities" : `(${props.selectedDoc.lat.toFixed(4)}, ${props.selectedDoc.lng.toFixed(4)})`}
                                </p>

                                {/*
                                {props.isUrbanPlanner && !isPositionToModify && <Button variant="primary" onClick={() => setIsPositionToModify(true)}>
                                    Modify Position
                                </Button>}

                                {props.isUrbanPlanner && <Button variant="primary">
                                    Modify
                                </Button>}
                                */}
                                {<Button variant="primary" onClick={() => {
                                    props.handleShowAllLinkedDocument(props.selectedDoc.docId)
                                    props.closeDocumentModal();
                                }}>
                                    See all related document on the map
                                </Button>}
                                {/*
                                {props.isUrbanPlanner && isPositionToModify && <Button variant="primary" onClick={() => {
                                    handleModifyPosition(newLan, newLng);
                                    setIsPositionToModify(false)
                                }}>
                                    Save position
                                </Button>}
                                {props.isUrbanPlanner && isPositionToModify && <Button variant="primary" onClick={() => {
                                    setNewLan(null);
                                    setNewLng(null);
                                    setIsPositionToModify(false);
                                }}>
                                    Cancel
                                </Button>}

                                {props.isUrbanPlanner && isPositionToModify && <ChosenPositionMap handleSavePosition={handleSavePosition} />}
                            
                            */}

                            </div>
                            <div className="download-buttons-container">
                                {(files && files.length > 0) ? files.map((f, index) => (
                                    <div key={f.name || index} className="download-btns">
                                        <Button onClick={() => handleDownload(f)} className="files">
                                            <i className="bi bi-file-earmark-text-fill"></i>
                                        </Button>
                                        <p className="file-name">{f.name}</p>
                                    </div>
                                )) : ""}
                            </div>
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