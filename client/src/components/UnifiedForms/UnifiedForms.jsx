import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState } from "react";
import { Routes, Route, Outlet, Navigate, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Form, Modal, Offcanvas } from "react-bootstrap";
import Carousel from 'react-bootstrap/Carousel';
import Link from "../link/Link"
import DocumentAPI from "../../api/documentAPI";
import AddDocument from "../addDocument/AddDocument"; // is glitched all the "A"must to be in cap locs



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

    const onBtnSelectAdd = () => setShowModalAdd(true);

    // Controllato: è corretto
    const handleClose = () => {
        console.log("sono in Unified Forms, ho premuto il pulsante Close di addDOcument (perciò devo chiudere il modal unifiedForms)");
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
        // L'aggiutna del documento al database la si può fare alla fine, quando si preme il pulsante "salva"
        console.log("Sono in UnifiedForms, ho aggiunto il documento al modal:", document);
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

    const confirmClose =  ()=>{
        if(index==1){
            setCloseConfirmation(true);
    
        }else{
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
            <Modal show={showModalAdd} onHide={confirmClose} size="xl">
                <Modal.Header closeButton>
                    <Modal.Title>{index == 0 ? "Insert new document" : "Insert link"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Carousel activeIndex={index} onSelect={handleSelect} controls={false} indicators={false} interval={null}>
                        <Carousel.Item> {/* passing newDocument is essential for abilitating the button previous (permits to save the state)*/}
                            <AddDocument handleAddDocumentToModal={handleAddDocumentToModal} handleNext={handleNext} newDocument={newDocument} handleClose={handleClose}/>
                        </Carousel.Item>
                        <Carousel.Item>
                            <Link documents={props.documents} handlePrev={handlePrev} handleClose={handleClose}  newDocument={newDocument} docId={newDocument.docId} title={newDocument.title} confirmClose={confirmClose} handleAddDocument={props.handleAddDocument}></Link>
                        </Carousel.Item>
                    </Carousel>

                    {/* Indicators personalizzati non cliccabili */}
                    <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px' }}>
                        {[0, 1].map((slideIndex) => (
                            <div
                                key={slideIndex}
                                style={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    backgroundColor: index === slideIndex ? 'blue' : 'gray',
                                    pointerEvents: 'none', // Disabilita i clic sugli indicators
                                }}
                            />
                        ))}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <p>All the fields contrassigned by * are mandatory. </p>
                </Modal.Footer>
            </Modal>

            {/* Modal di conferma */}
            <Modal show={closeConfirmation} onHide={()=>setCloseConfirmation(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Conferma uscita</Modal.Title>
                </Modal.Header>
                <Modal.Body>Sei sicuro di voler uscire senza aggiungere link al documento?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={()=>setCloseConfirmation(false)}>
                        Annulla
                    </Button>
                    <Button variant="primary" onClick={()=>{
                        handleClose()
                        props.handleAddDocument(newDocument)
                        }}>
                        Sì, chiudi
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )

}

export default UnifiedForms