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
import AddDocument from "../AddDocument/AddDocument";
import FakeLink from "../fakeLink/FakeLink";


/** BUGS:
 *  isLogin is not working properly always is undefined (i fixed it with a default value = true)
 *  Line 49: To be managed: docId: document.id, because the doc id will be given by the db after the insertion (Matteo suggestion)
 * 
 */



function HomePage(props){

    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(props.isLoggedIn ? true : true); // da modificare
    const [isUrbanPlanner, setIsUrbanPlanner] = useState(props.role === 'urbanPlanner' ? true : false);

    const [documents, setDocuments] = useState([]); // if is here will be easier for tehe shenzen diagram; position is different for the map and for shenzen diagram so will be managed in their componetns
    const [isJustBeenAddedADocument, setIsJustBeenAddedADocument] = useState(false); // to be able to manage add link after a document has been added
    const handleAddDocument = async (document) => {
        setDocuments([...documents, document]);
        console.log("Sono in HomePage.jsx, ho aggiunto un documento: ",document);
        setIsJustBeenAddedADocument(true);

        try {
            console.log("Sono in HomePage.jsx, sto mandando il documento al db:", document);
            document.id = documents.length + 3; // to be managed
            await DocumentAPI.addDocument(document);
            /*
            const position = {
              docId: document.id,
              lat: document.lat,
              lng: document.lng,
            };
            await PositionAPI.addPosition(position);
            */
          } catch (error) {
            console.error("Error adding document:", error);
          }

    }
    const handleAddLink = () => {
        console.log("Sono in HomePage.jsx, ho cliccato su add link");
        setIsJustBeenAddedADocument(false);
    }



    return(
        <Container fluid>
            <Row>
                <Col className="d-flex justify-content-between align-items-center">

                    <h1 className="text-dark">Welcome to Kiruna</h1>
                    <div className="d-flex">
                        {isUrbanPlanner &&  !isJustBeenAddedADocument && <AddDocument handleAddDocument={handleAddDocument}/>}
                        {isUrbanPlanner && isJustBeenAddedADocument && <FakeLink isJustBeenAddedADocument={isJustBeenAddedADocument} handleAddLink={handleAddLink}/>}
                        {!isLoggedIn && <Button variant="primary" onClick={()=> navigate('/login')}>Login</Button>}
                        {isLoggedIn && <Button variant="primary" onClick={props.handleLogout}>Logout</Button>}
                    </div>

                </Col>
            </Row>

            <Row>
                <Col>
                    <Map documents={documents}/>
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