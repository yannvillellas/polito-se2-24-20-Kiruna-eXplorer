import "bootstrap/dist/css/bootstrap.min.css";
import "./unifiedForms.css";
import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Form, Modal, Offcanvas, Alert } from "react-bootstrap";
import Carousel from 'react-bootstrap/Carousel';
import Link from "./link/Link"
import DocumentAPI from "../../../api/documentAPI";
import AddDocument from "./addDocument/AddDocument";
import { TiDocumentAdd } from "react-icons/ti"
import link from "../../../asset/link.svg"
import ChosenPosition from "./chosenPosition/ChosenPosition";
import AddOriginalSource from "./addDocument/addOriginalSource/AddOriginalSource";
import { Tooltip, OverlayTrigger } from "react-bootstrap"; // Importa Tooltip e OverlayTrigger


function UnifiedForms(props) {

    const [index, setIndex] = useState(0);

    const [showModalAdd, setShowModalAdd] = useState(false);
    const [newDocument, setNewDocument] = useState({
        docId: null,
        title: "",
        stakeholders: "",
        scale: "",
        ASvalue: null,
        issuanceDate: "",
        type: "",
        connections: 0,
        language: "",
        pages: "",
        description: "",
        lat: null,
        lng: null,
        files: [],
        area: null,
    });

    const [closeConfirmation, setCloseConfirmation] = useState(false)
    const [onlyLinkForm, setOnlyLinkForm] = useState(false)

    const onBtnSelectAdd = () => setShowModalAdd(true);

    // Controllato: è corretto
    const handleClose = () => {
        setNewDocument({
            docId: null,
            title: "",
            stakeholders: "",
            scale: "",
            issuanceDate: "",
            type: "",
            connections: 0,
            language: "",
            pages: "",
            description: "",
            lat: null,
            lng: null,
            files: [],
            area: null,
        });
        setIndex(0)
        setShowModalAdd(false);
        setCloseConfirmation(false);

    }

    const handleAddDocumentToModal = (document) => {
        setNewDocument((prevDocument) => ({
            ...prevDocument, // Prendi tutti i campi del documento precedente
            ...document, // Se document ha i campi che coincidono con quelli di prevDocument, sovrascrivi ( mi viene utile per AddDocument, ChosenPosition/ChosenArea e AddOriginalSource)
        }));
    };

    const handleAddLatLongToDocumentModal = (lat, lng) => {
        console.log("Sono in Unified Form, handleAddLatLongToDocumentModal, ho ricevuto:", lat, lng);
        setNewDocument((prevDocument) => ({
            ...prevDocument,
            lat: lat,
            lng: lng,
        }));

    };

    const handleSetArea = (area) => {
        console.log("Sono in UnifiedForms, handleSetArea, ho ricevuto:", area);
        setNewDocument((prevDocument) => ({
            ...prevDocument,
            area: area,
        }));
    };

    const renderTooltip = (message) => (props) => (
        <Tooltip id="button-tooltip" {...props}>
            {message}
        </Tooltip>
    );


    useEffect(() => {
        console.log("Sono in UnifiedForms, props.errorMsg:", props.errorMsg);
    }, [props.errorMsg]);


    const handleNext = () => {
        setIndex((prevIndex) => (prevIndex + 1) % 3);
    };

    const handlePrev = async () => {
        setIndex((prevIndex) => (prevIndex - 1 + 3) % 3);

    };

    const handleSelect = (selectedIndex) => {
        setIndex(selectedIndex);
    }

    const confirmClose = () => {
        if (index == 1) {
            setCloseConfirmation(true);

        } else {
            handleClose();
        }
    }

    return (
        <>
            <div className="btn-unified-forms">
                <OverlayTrigger
                    placement="top" // Posizione del tooltip rispetto al bottone
                    delay={{ show: 500, hide: 0 }} // Ritardo di 500ms prima di mostrare il tooltip
                    overlay={renderTooltip("Add new Document")}
                >
                    <Button
                        className=" rounded-circle d-flex align-items-center justify-content-center btn-add-document"
                        variant="none"
                        style={{ width: "50px", height: "50px", backgroundColor: "#ffff", }}
                        onClick={onBtnSelectAdd}
                    >
                        <i className="bi bi-plus" style={{ fontSize: "2.5rem" }}></i>
                    </Button>
                </OverlayTrigger>

            </div>

            <Modal show={showModalAdd} onHide={confirmClose} size="xl">
                <Modal.Header closeButton>
                    <Modal.Title className="modal-title">
                        {index === 2 ? <><img src={link} alt="" /> Add Link </> : <><TiDocumentAdd className="modal-icon" /> Add Document</>}
                    </Modal.Title>
                    <div style={{ position: 'absolute', top: '30px', right: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px' }}>
                        {[0, 1, 2].map((slideIndex) => (
                            <div
                                key={slideIndex}
                                style={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    backgroundColor: index === slideIndex ? 'blue' : 'gray',
                                    pointerEvents: 'none',
                                }}
                            />
                        ))}
                    </div>
                    <br /><br />
                </Modal.Header>
                <Modal.Body>
                    <Carousel activeIndex={index} onSelect={handleSelect} controls={false} indicators={false} interval={null}>
                        <Carousel.Item>
                            <AddDocument

                                /* Not used:
                                stakeholdersOptions={props.stakeholdersOptions}
                                scaleOptions={props.scaleOptions}
                                typeOptions={props.typeOptions}
                                */

                                handleAddDocumentToModal={handleAddDocumentToModal}
                                handleNext={handleNext}
                                newDocument={newDocument}
                                handleClose={handleClose}
                                index={index}
                            />
                        </Carousel.Item>

                        <Carousel.Item>
                            <Form className="add-document-form">
                                <Row>
                                    <Col >
                                        <ChosenPosition
                                            handleAddLatLongToDocumentModal={handleAddLatLongToDocumentModal}
                                            handleSetArea={handleSetArea}
                                        />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <AddOriginalSource
                                            handleAddedFiles={(files) => setNewDocument({ ...newDocument, files })}
                                        />
                                    </Col>
                                </Row>
                                <Row className="btn-modal justify-content-between align-items-end">
                                    <Col className="d-flex justify-content-start">
                                        <Button variant="secondary" className="btn-modal-close" onClick={handlePrev}>
                                            ← Back
                                        </Button>
                                    </Col>
                                    <Col className="d-flex justify-content-end">
                                        <Button
                                            variant="primary"
                                            type="button"
                                            className="btn-modal-save"
                                            onClick={async () => {
                                                if (newDocument.lng !== null && newDocument.lng !== '' && newDocument.lat !== null && newDocument.lat !== '') {
                                                    console.log("sto aggiungendo il doc: ", newDocument)
                                                    await props.handleAddDocument(newDocument);
                                                    console.log("ho finito: ")
                                                    //handleNext();
                                                    handleClose()
                                                } else {
                                                    alert("Please select a position")
                                                }
                                            }}
                                        >
                                            Save & Close
                                        </Button>
                                    </Col>
                                    <Col className="d-flex justify-content-end">
                                        <Button
                                            variant="primary"
                                            type="button"
                                            className="btn-modal-link"
                                            onClick={async () => {
                                                if (newDocument.lng !== null && newDocument.lng !== '' && newDocument.lat !== null && newDocument.lat !== '') {
                                                    console.log("sto aggiungendo il doc: ", newDocument)
                                                    console.log("ho finito: ")
                                                    handleNext();
                                                } else {
                                                    alert("Please select a position")
                                                }
                                            }}
                                        >
                                            Add connections
                                        </Button>
                                    </Col>
                                </Row>
                            </Form>
                        </Carousel.Item>

                        <Carousel.Item>

                            <Modal.Body>
                                {/**This is the Matteos-component non the react-library-component  */}
                                <Link
                                    documents={props.documents} handlePrev={handlePrev} handleClose={handleClose}
                                    newDocument={newDocument} docId={newDocument.docId} title={newDocument.title}
                                    confirmClose={confirmClose} handleAddDocument={props.handleAddDocument} alone={false}
                                    setErrorMsg={props.setErrorMsg}
                                    allAssociations={props.allAssociations}
                                    setAllAssociations={props.setAllAssociations}
                                ></Link>
                            </Modal.Body>
                        </Carousel.Item>
                    </Carousel>
                </Modal.Body>
                <Modal.Footer>
                    <p>All fields marked with * are mandatory.</p>
                </Modal.Footer>
            </Modal>


            {/* Modal di conferma */}
            <Modal className="modal-close" show={closeConfirmation} onHide={() => setCloseConfirmation(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm exit</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure to exit without creating the document?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setCloseConfirmation(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={() => {
                        handleClose();
                    }}>
                        Yes, close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )

}

export default UnifiedForms