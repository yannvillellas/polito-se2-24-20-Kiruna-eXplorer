import "bootstrap/dist/css/bootstrap.min.css";
import "./unifiedForms.css";
import React, {useState} from "react";
import { Container, Row, Col, Button, Form, Modal, Offcanvas, Alert } from "react-bootstrap";
import Carousel from 'react-bootstrap/Carousel';
import Link from "./link/Link"
import DocumentAPI from "../../../api/documentAPI";
import AddDocument from "./addDocument/AddDocument";
import {TiDocumentAdd} from "react-icons/ti"
import link from "../../../asset/link.svg"
import ChosenPosition from "../chosenPosition/ChosenPosition";
import AddOriginalSource from "./addDocument/addOriginalSource/AddOriginalSource";



function UnifiedForms(props) {

    const [index, setIndex] = useState(0);
    
    const [showModalAdd, setShowModalAdd] = useState(false);
    const [newDocument, setNewDocument] = useState({
        docId: null,
        title: "",
        stakeholders: "",
        scale: "",
        issuanceDate: "",
        type: "",
        connections: 0,
        language: "",
        pages: 0,
        description: "",
        lat: null,
        lng: null,
        files: [],
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
            pages: 0,
            description: "",
            lat: null,
            lng: null,
            files: [],
        });
        setIndex(0)
        setShowModalAdd(false);
        setCloseConfirmation(false);

    }

    const handleAddDocumentToModal = (document) => {
        setNewDocument(document);
    }

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
            <Button
                onClick={onBtnSelectAdd}
                className="btn-lg rounded-circle d-flex align-items-center justify-content-center"
                variant="primary"
                style={{ width: "50px", height: "50px" }}
            >
                <i className="bi bi-plus" style={{ fontSize: "1.5rem" }}></i>
            </Button>
            <Button
                className="btn-lg rounded-circle d-flex align-items-center justify-content-center"
                variant="primary"
                style={{ width: "50px", height: "50px" }}
                onClick={() => setOnlyLinkForm(true)}
            >
                <i className="bi bi-link-45deg"></i>
            </Button>

            {/*Modal only for link documents*/}
            <Modal show={onlyLinkForm} onHide={() => setOnlyLinkForm(false)} size="xl">
                <Modal.Header closeButton>
                    <Modal.Title className="modal-title"> <img src={link} alt="" /> Insert link</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Link 
                        documents={props.documents} 
                        alone={true} 
                        setOnlyLinkForm={setOnlyLinkForm} 
                        setErrorMsg={props.setErrorMsg}>
                    </Link>
                </Modal.Body>
            </Modal>
            {/************************************/}

            <Modal show={showModalAdd} onHide={confirmClose} size="xl">
                <Modal.Header closeButton>
                    <Modal.Title className="modal-title"> 
                        {index === 2 ? <><img src={link} alt=""/> Add Link </> : <><TiDocumentAdd className="modal-icon"/> Add Document</>}
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
                                            handleSetPostition={(lat, lng) => setNewDocument({ ...newDocument, lat, lng })}
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
                                            onClick={async() => {
                                                if(newDocument.lng !== null && newDocument.lng !== '' && newDocument.lat !== null && newDocument.lat !== ''){
                                                    console.log("sto aggiungendo il doc: ", newDocument)
                                                    await props.handleAddDocument(newDocument);
                                                    console.log("ho finito: ")
                                                    handleNext();
                                                }else{
                                                    alert("Please select a position")
                                                }
                                            }}
                                        >
                                            Save →
                                        </Button>
                                    </Col>
                                    <Col className="d-flex justify-content-end">
                                        <Button
                                            variant="primary"
                                            type="button"
                                            className="btn-modal-save"
                                            onClick={async() => {
                                                if(newDocument.lng !== null && newDocument.lng !== '' && newDocument.lat !== null && newDocument.lat !== ''){
                                                    console.log("sto aggiungendo il doc: ", newDocument)
                                                    await props.handleAddDocument(newDocument);
                                                    console.log("ho finito: ")
                                                    handleNext();
                                                }else{
                                                    alert("Please select a position")
                                                }
                                            }}
                                        >
                                            Add link
                                        </Button>
                                    </Col>
                                </Row>
                            </Form>
                        </Carousel.Item>

                        <Carousel.Item>

                            <Modal.Body>
                                <Link 
                                     documents={props.documents} handlePrev={handlePrev} handleClose={handleClose} 
                                     newDocument={newDocument} docId={newDocument.docId} title={newDocument.title} 
                                     confirmClose={confirmClose} handleAddDocument={props.handleAddDocument} alone={false} 
                                     setErrorMsg={props.setErrorMsg}
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
            <Modal show={closeConfirmation} onHide={() => setCloseConfirmation(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm exit</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure to exit without adding a link?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setCloseConfirmation(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={() => {
                        handleClose()
                        props.handleAddDocument(newDocument)
                    }}>
                        Yes, close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )

}

export default UnifiedForms