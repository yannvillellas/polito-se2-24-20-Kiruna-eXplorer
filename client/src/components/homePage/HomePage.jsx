import "bootstrap/dist/css/bootstrap.min.css";
import "./homePage.css";
import { useEffect, useState } from "react";
import { Container, Row, Col, Toast, ToastContainer } from "react-bootstrap";
import PropTypes from 'prop-types';

import Map from './map/Map.jsx';
import DocumentAPI from "../../api/documentAPI";
import PositionAPI from "../../api/positionAPI";
import UnifiedForms from "./UnifiedForms/UnifiedForms";
import areaAPI from "../../api/areaAPI";
import documentTypeAPI from "../../api/documentTypeAPI.js";
import scaleAPI from "../../api/scaleAPI.js";
import stakeholderAPI from "../../api/stakeholderAPI.js";


function HomePage(props) {
    const [isUrbanPlanner] = useState(props.role === 'urbanPlanner');
    const [errorMsg, setErrorMsg] = useState([]);

    const handleCloseError = (error) => {
        setErrorMsg((prevErrors) => prevErrors.filter((e) => e !== error));
    };


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
                    <Map
                        isUrbanPlanner={isUrbanPlanner}

                        documents={props.documents}
                        linksType={props.linksType}

                        areas={props.areas}
                        areaAssociations={props.areaAssociations}

                        handleModifyPosition={props.handleModifyPosition}
                    />
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
