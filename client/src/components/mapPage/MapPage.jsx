import "bootstrap/dist/css/bootstrap.min.css";
import "./mapPage.css";
import { useEffect, useState } from "react";
import { Container, Row, Col, Toast, ToastContainer } from "react-bootstrap";
import PropTypes from 'prop-types';

import { useNavigate, useParams } from "react-router-dom";

import Map from './map/Map.jsx';
import DocumentAPI from "../../api/documentAPI.js";
import PositionAPI from "../../api/positionAPI.js";
import UnifiedForms from "./UnifiedForms/UnifiedForms.jsx";
import areaAPI from "../../api/areaAPI.js";
import documentTypeAPI from "../../api/documentTypeAPI.js";
import scaleAPI from "../../api/scaleAPI.js";
import stakeholderAPI from "../../api/stakeholderAPI.js";
import { map } from "leaflet";

function HomePage(props) {
    const { docId } = useParams();
    const navigate = useNavigate();
    const [isDocId, setIsDocId] = useState(false);
    const [mapCenter, setMapCenter] = useState({ lat: 41.89193, lng: 12.51133 });


    const [isUrbanPlanner] = useState(props.role === 'urbanPlanner');
    const [errorMsg, setErrorMsg] = useState([]);

    const handleCloseError = (error) => {
        setErrorMsg((prevErrors) => prevErrors.filter((e) => e !== error));
    };

    const handleChangeMapViewBasedOnDocId = (docId) => {
        const doc = props.documents.find((doc) => doc.docId === Number(docId));
        // This solution is due to the fact that for some reasons the map result as not-rendered so i cannot use the property og the map onCreate() to set the center of the map
        if (doc) {
            navigate('/mapPage'); // Naviga a /mapPage (refresh)
            console.log("Sono in HomePage, navigo a /mapPage");
            setTimeout(() => {
                setMapCenter([doc.lat, doc.lng]);
                setIsDocId(true);
                navigate(`/mapPage/${docId}`); // Dopo un breve ritardo, naviga a /mapPAge/:docId
                console.log("Sono in HomePage, navigo a /mapPage/:docId");
            }, 100); // Usa un piccolo ritardo per garantire il re-render
        }
    };


    useEffect(() => {
        if (!docId)
            setIsDocId(false); // this permits that if a person press on the header: MAP the view will be reset to the center of kiruna
        else {
            const doc = props.documents.find((doc) => doc.docId === Number(docId));
            if (doc) {
                setMapCenter([doc.lat, doc.lng]);
                setIsDocId(true);
                console.log("Sono in HomePage, docId: ", docId, doc.lat, doc.lng);
            }
        }
    }, [docId]);


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
            <Row style={{ height: "100%" }}>
                <Col style={{ position: "relative" }}>
                    {!isDocId && <Map
                        openMarkerId={docId} // docId as a promp
                        handleChangeMapViewBasedOnDocId={handleChangeMapViewBasedOnDocId}
                        mapCenter={[67.8558, 20.2253]}
                        zoom={14}
                        isUrbanPlanner={isUrbanPlanner}

                        documents={props.documents}
                        linksType={props.linksType}

                        areas={props.areas}
                        areaAssociations={props.areaAssociations}

                        handleModifyPosition={props.handleModifyPosition}
                    />}

                    {isDocId && <Map
                        openMarkerId={docId} // docId as a promp
                        handleChangeMapViewBasedOnDocId={handleChangeMapViewBasedOnDocId}
                        mapCenter={mapCenter}
                        zoom={16}
                        isUrbanPlanner={isUrbanPlanner}

                        documents={props.documents}
                        linksType={props.linksType}

                        areas={props.areas}
                        areaAssociations={props.areaAssociations}

                        handleModifyPosition={props.handleModifyPosition}
                    />}



                    {isUrbanPlanner && (
                        <div className="add-document-container">
                            <UnifiedForms
                                documents={props.documents}

                                stakeholdersOptions={props.stakeholdersOptions}
                                scaleOptions={props.scaleOptions}
                                typeOptions={props.typeOptions}

                                setErrorMsg={setErrorMsg}

                                handleAddDocument={props.handleAddDocument}
                            />
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
