import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState } from "react";
import { Routes, Route, Outlet, Navigate, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Form, Modal, Offcanvas } from "react-bootstrap";

import Map from '../map/Map';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

import DocumentAPI from "../../api/documentAPI";
import PositionAPI from "../../api/positionAPI";
import UnifiedForms from "../UnifiedForms/UnifiedForms";


/** BUGS:
 *  isLogin is not working properly always is undefined (i fixed it with a default value = true)
 *  Line 49: To be managed: docId: document.id, because the doc id will be given by the db after the insertion (Matteo suggestion)
 * 
 */



function HomePage(props) {

    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(props.isLoggedIn ? true : true); // da modificare
    const [isUrbanPlanner, setIsUrbanPlanner] = useState(props.role === 'urbanPlanner' ? true : false);

    const [documents, setDocuments] = useState([]); // if is here will be easier for tehe shenzen diagram; position is different for the map and for shenzen diagram so will be managed in their componetns
    
    
    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const documents = await DocumentAPI.listDocuments();
                console.log("Sono in HomePage.jsx, ho ricevuto dal db i documenti: ",documents);

                
                const positions = await PositionAPI.listPositions();
                console.log("Sono in HomePage.jsx, ho ricevuto dal db le posizioni: ",positions);
                
                documents.forEach(document => {
                    const position = positions.find(position => position.docId === document.docId);
                    if (position) {
                        document.lat = position.latitude;
                        document.lng = position.longitude;
                    }
                    // for each get the files from the db---------------------------------------------------------------------------------------------------- <-----HERE
                    // document.files = await DocumentAPI.getFiles(document.docId)
                });


                console.log("Sono in HomePage.jsx, i documenti con le posizioni sono: ",documents[0].lat, documents[0].lng);
                setDocuments(documents);
                
                
            } catch (error) {
                console.error("Error fetching documents:", error);
            }
        }
        fetchDocuments();
    }, []);
    
    /* Here is the function: */
    const handleUpload = async (docId, selectedFiles) => {
        const formData = new FormData();
        Array.from(selectedFiles).forEach((file) => {
          formData.append("files", file);
        });
    
        try {
          await DocumentAPI.addFiles(docId, formData)
        } catch (error) {
          console.error("Error:", error);
          alert("Error during the file upload.");
        }
      };


    const handleAddDocument = async (document) => {

        try {
            console.log("Sono in HomePage.jsx, sto mandando il documento al db:", document);
            const docId = await DocumentAPI.addDocument(document);
            console.log("Sono in HomePage.jsx, ho aggiunto il documento al db, mi è tornato id:", docId);
            
            const position = {
                docId: docId,
                lat: document.lat,
                lng: document.lng,
            };
            console.log("Sono in HomePage.jsx, sto mandando la posizione del documento al db:", position);
            await PositionAPI.addPosition(position);

            // Here i check if there are files to upload (and so i not create folders if there are no files)
            if(document.files && document.files.length > 0){
                // await handleUpload(docId, document.files);
                console.log("HomePage.jsx, i uploaded the document.files: (now handleUpload is comemnted)", document.files);
            }
            
            const stateDocument={
                docId: docId,
                title: document.title,
                stakeholders: document.stakeholders,
                scale: document.scale,
                issuanceDate: document.issuanceDate,
                type: document.type,
                connections:document.connections,
                language: document.language,
                pages: document.pages,
                description: document.description,
                lat: document.lat,
                lng: document.lng,
                files: document.files,
            }
            console.log("Sono in HomePage.jsx, sto mandando il documento allo stato:", stateDocument);
            setDocuments([...documents, stateDocument]);
            
            console.log("Sono in HomePage.jsx, restituisco a Link.jsx, il docId: ", docId);
            return docId;

          } catch (error) {

            console.error("Error adding document:", error);
        }

    }




    return (
        <Container fluid>
            <Row>
                <Col className="d-flex justify-content-between align-items-center">

                    <h1 className="text-dark">Welcome to Kiruna</h1>
                    <div className="d-flex">
                        {isUrbanPlanner && <UnifiedForms handleAddDocument={handleAddDocument} documents={documents} />}
                        {!isLoggedIn && <Button variant="primary" onClick={() => navigate('/login')}>Login</Button>}
                        {isLoggedIn && <Button variant="primary" onClick={props.handleLogout}>Logout</Button>}
                    </div>

                </Col>
            </Row>

            <Row>
                <Col>
                    <Map documents={documents} />
                </Col>
            </Row>

            <Row>
                <Col>
                    <h1 className="text-light">Shenzen diagram</h1>
                </Col>
            </Row>

        </Container>
    );
}


export default HomePage;