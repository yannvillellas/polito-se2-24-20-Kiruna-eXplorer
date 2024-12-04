import "bootstrap/dist/css/bootstrap.min.css";
import "./homePage.css";
import { useEffect, useState } from "react";
import { Container, Row, Col, Toast, ToastContainer } from "react-bootstrap";
import PropTypes from 'prop-types';

import Map from './map/Map.jsx'
import "leaflet/dist/leaflet.css";

import DocumentAPI from "../../api/documentAPI";
import PositionAPI from "../../api/positionAPI";
import UnifiedForms from "./UnifiedForms/UnifiedForms";
import areaAPI from "../../api/areaAPI";
import documentTypeAPI from "../../api/documentTypeAPI.js";
import scaleAPI from "../../api/scaleAPI.js";
import stakeholderAPI from "../../api/stakeholderAPI.js";
/** BUGS:
 *  
 *
 *
 */


function HomePage(props) {
    const [isUrbanPlanner] = useState(props.role === 'urbanPlanner');
    const [documents, setDocuments] = useState([]); // if is here will be easier for tehe shenzen diagram; position is different for the map and for shenzen diagram so will be managed in their componetns
    const [errorMsg, setErrorMsg] = useState([]);

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const documents = await DocumentAPI.listDocuments();
                const positions = await PositionAPI.listPositions();
                const updatedDocuments = updateDocumentsWithPositions(documents, positions);
                setDocuments(updatedDocuments);
            } catch (error) {
                console.error("Error fetching documents:", error);
            }
        }
        fetchDocuments();
    }, []);

    const updateDocumentsWithPositions = (documents, positions) => {
        return documents.map(document => {
            const position = positions.find(position => position.docId === document.docId);
            if (position) {
                document.lat = position.latitude;
                document.lng = position.longitude;
            }
            return document;
        });
    };


    const handleUpload = async (document) => {
        const formData = new FormData();
        Array.from(document.files).forEach((file) => {
            formData.append("files", file);
        });

        try {
            await DocumentAPI.addFiles(document.docId, formData)
        } catch (error) {
            console.error("Error:", error);
            alert("Error uploading file.");
        }
    };

    const handleAddArea = async (document) => {
        try {
            console.log("Sono in Homepage.jsx, handleAddArea, sto spedendo alle API:", document.docId, document.area);
            const areaId = await areaAPI.addArea(document.docId, document.area);
            console.log("Sono in Homepage.jsx, handleAddArea, ho ricevuto dalle API areaId:", areaId);

            return areaId;
        } catch (error) {
            console.error("Error adding area:", error);
        }
    }


    const handleAddDocument = async (document) => {

        try {
            console.log("sono in handleAddDocument")
            const docId = await DocumentAPI.addDocument(document);

            const position = {
                docId: docId,
                lat: document.lat,
                lng: document.lng,
            };
            console.log("sono in handleAddDocument2")
            await PositionAPI.addPosition(position);
            console.log("sono in handleAddDocument3")

            let areaId = null;
            if (document.area) {
                areaId = await handleAddArea({ ...document, docId: docId });
            }

            const shs=await stakeholderAPI.getStakeholders()
            const scales=await scaleAPI.getScales()
            const types=await documentTypeAPI.getDocumentTypes()

            const stateDocument = {
                docId: docId,
                title: document.title,
                description: document.description,
                //stakeholders: document.stakeholders,
                stakeholders: shs.filter(sh=>document.stakeholders.split(', ').map(s=>parseInt(s,10)).includes(sh.shId)).map(sh=>sh.name).join(', '),
                //scale: document.scale,
                scale: scales.find(s=>s.scaleId==document.scale).name,
                ASvalue: document.ASvalue,
                issuanceDate: document.issuanceDate,
                //type: document.type,
                type: types.find(t=>t.dtId==document.type).type,
                connections: document.connections,
                language: document.language,
                pages: document.pages,
                lat: document.lat,
                lng: document.lng,
                // files:document.files
                areaId: areaId,

            }
            setDocuments([...documents, stateDocument]);
            
            // adding files to the document
            if (document.files.length > 0) {
                console.log("file ",document.files)
                handleUpload({ ...document, docId: docId });
            }


            return docId;
        } catch (error) {
            console.error("Error adding document:", error);
        }
    }

    const handleCloseError = (error) => {
        setErrorMsg((prevErrors) => prevErrors.filter((e) => e !== error));
    };

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
        <Container fluid>
            {/*toastCOntainer used to visualize errors messages*/}
            <ToastContainer className="p-3" position="top-end">
                {errorMsg.map((error) => (
                    <Toast
                        key={errorMsg.indexOf(error)}
                        onClose={() => handleCloseError(error)}
                    >
                        <Toast.Header closeButton>
                            <strong className="me-auto">Errore</strong>
                        </Toast.Header>
                        <Toast.Body>{error}</Toast.Body>
                    </Toast>
                ))}
            </ToastContainer>
            <Row style={{height: "100%"}}>
                <Col style={{ position: "relative" }}>
                    <Map documents={documents} handleModifyPosition={handleModifyPosition} isUrbanPlanner={isUrbanPlanner} />
                    {isUrbanPlanner && (
                        <div className="add-document-container">
                            <UnifiedForms handleAddDocument={handleAddDocument} documents={documents} setErrorMsg={setErrorMsg} />
                        </div>
                    )}
                </Col>

            </Row>


        </Container>
    );
}
HomePage.propTypes = {
    role: PropTypes.string.isRequired
};

export default HomePage;
