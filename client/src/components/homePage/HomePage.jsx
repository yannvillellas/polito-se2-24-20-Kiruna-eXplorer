import "bootstrap/dist/css/bootstrap.min.css";
import "./homePage.css";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {Container, Row, Col} from "react-bootstrap";

import Map from './map/Map.jsx'
import "leaflet/dist/leaflet.css";
import L from "leaflet";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

import DocumentAPI from "../../api/documentAPI";
import PositionAPI from "../../api/positionAPI";
import UnifiedForms from "./UnifiedForms/UnifiedForms";

/** BUGS:
 *  
 *
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
                
                const positions = await PositionAPI.listPositions();                
                documents.forEach(document => {
                    const position = positions.find(position => position.docId === document.docId);
                    if (position) {
                        document.lat = position.latitude;
                        document.lng = position.longitude;
                    }
                });

                setDocuments(documents);
                
                
            } catch (error) {
                console.error("Error fetching documents:", error);
            }
        }
        fetchDocuments();
    }, []);
    

    const handleUpload = async (document) => {
        const formData = new FormData();
        Array.from(document.files).forEach((file) => {
          formData.append("files", file);
        });
    
        try {
          await DocumentAPI.addFiles(document.docId,formData)
        } catch (error) {
          console.error("Error:", error);
          alert("Error uploading file.");
        }
    };

    const handleAddDocument = async (document) => {

        try {
            const docId = await DocumentAPI.addDocument(document);
            
            const position = {
                docId: docId,
                lat: document.lat,
                lng: document.lng,
            };
            await PositionAPI.addPosition(position);

            // Here i check if there are files to upload (and so i not create folders if there are no files)
            /*if(document.files && document.files.length > 0){
                // await handleUpload(docId, document.files);
            }*/
            
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
                //files:document.files

            }
            setDocuments([...documents, stateDocument]);

            // adding files to the document
            if(document.files.length>0){
                handleUpload({...document, docId:docId});
            }
            
            return docId;
          } catch (error) {
            console.error("Error adding document:", error);
        }
    }

    const handleModifyPosition = async (docId, lat, lng) => {
        try {
            await PositionAPI.modifyPosition(docId, lat, lng);

            const updatedDocuments = documents.map(document => {
                if (document.docId === docId) {
                    return {
                        ...document,
                        lat: lat,
                        lng: lng,
                    };
                }
                return document;
            });
            setDocuments(updatedDocuments);

        } catch (error) {
            console.error("Error modifying position:", error);
        }
    }


    return (
        <Container fluid className="mt-5">
            <Row>
                <Col style={{ position: "relative" }}>
                    <Map documents={documents} handleModifyPosition={handleModifyPosition} isUrbanPlanner={isUrbanPlanner}/>
                    {isUrbanPlanner && (
                        <div className="add-document-container">
                            <UnifiedForms handleAddDocument={handleAddDocument} documents={documents} />
                        </div>
                    )}
                </Col>

            </Row>


        </Container>
    );
}

export default HomePage;
