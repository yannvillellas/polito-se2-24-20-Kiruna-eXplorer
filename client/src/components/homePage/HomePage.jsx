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
import Link from "../link/Link";
import AddDocument from "../addDocument/AddDocument";
import FakeLink from "../fakeLink/FakeLink";
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
                    const position = positions.find(position => position.docId === document.id);
                    if (position) {
                        document.lat = position.latitude;
                        document.lng = position.longitude;
                    }
                });

                console.log("Sono in HomePage.jsx, i documenti con le posizioni sono: ",documents);
                setDocuments(documents);
                
            } catch (error) {
                console.error("Error fetching documents:", error);
            }
        }
        fetchDocuments();
    }, []);
    


    const [isJustBeenAddedADocument, setIsJustBeenAddedADocument] = useState(false); // to be able to manage add link after a document has been added

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const docs = await DocumentAPI.listDocuments();
                const positions = await PositionAPI.listPositions();
                console.log(docs);
                console.log(positions)
                const joined = docs.map((doc) => {
                    const docPositions = positions.filter((pos) => pos.docId === doc.docId);
                    return {
                        ...doc,
                        lat: docPositions[0].latitude,
                        lng: docPositions[0].longitude
                    };
                });
                setDocuments(joined);
            } catch (error) {
                console.error("Failed to fetch documents:", error);
            }
        };
        fetchDocuments();
        console.log("documenti join: ", documents);
    }, [])


    const handleAddDocument = async (document) => {
        /*setDocuments([...documents, document]);
        console.log("Sono in HomePage.jsx, ho aggiunto un documento: ", document);*/
        setIsJustBeenAddedADocument(true);

        try {
            console.log("Sono in HomePage.jsx, sto mandando il documento al db:", document);
            //let stateDocument={...document};
            //document.id = documents.length + 3; // to be managed
            //stateDocument.docId= documents.length + 3; // to be managed
            
            
            const docId=await DocumentAPI.addDocument(document);
            document.id =docId
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
            }
            console.log("Sono in HomePage.jsx, sto mandando il documento allo stato:", stateDocument);
            console.log("Sono in HomePage.jsx, ho aggiunto un documento: ", document);
            setDocuments([...documents, stateDocument]);

            const position = {
                docId: document.id,
                lat: document.lat,
                lng: document.lng,
            };
            await PositionAPI.addPosition(position);
            console.log("Sono in HomePage.jsx, ho aggiunto la posizione al db:", position);
          } catch (error) {

            console.error("Error adding document:", error);
        }



    }

    const handleAddLink = () => {
        console.log("Sono in HomePage.jsx, ho cliccato su add link");
        setIsJustBeenAddedADocument(false);
    }

    const handleBackActionForm = (docId)=>{
        const docs= documents.filter((d)=>d.docId!=docId)
        setDocuments(docs)
    }



    return (
        <Container fluid>
            <Row>
                <Col className="d-flex justify-content-between align-items-center">

                    <h1 className="text-dark">Welcome to Kiruna</h1>
                    <div className="d-flex">
                        {/*{isUrbanPlanner &&  !isJustBeenAddedADocument && <AddDocument handleAddDocument={handleAddDocument}/>}
                        {isUrbanPlanner && isJustBeenAddedADocument && <FakeLink isJustBeenAddedADocument={isJustBeenAddedADocument} handleAddLink={handleAddLink}/>}*/}
                        {isUrbanPlanner && <UnifiedForms handleAddDocument={handleAddDocument} documents={documents} handleBackActionForm={handleBackActionForm}/>}
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