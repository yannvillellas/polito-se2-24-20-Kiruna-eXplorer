import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState } from "react";
import { Routes, Route, Outlet, Navigate, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Form, Modal, Offcanvas } from "react-bootstrap";
import AddDocument from "../addDocument/AddDocument";
import Carousel from 'react-bootstrap/Carousel';
import Link from "../link/Link"
import DocumentAPI from "../../api/documentAPI";



function UnifiedForms(props) {

    const [index, setIndex] = useState(0);

    const [showModalAdd, setShowModalAdd] = useState(false);

    const [newDocument, setNewDocument] = useState({
        id: null,
        title: "",
        stakeholders: "",
        scale: "",
        issuanceDate: "",
        type: "",
        connections: "",
        language: "",
        pages: 0,
        description: "",
        lat: null,
        lng: null,
    });

    const onBtnSelectAdd = () => setShowModalAdd(true);
    const handleClose = () =>{
        setNewDocument({
            id: null,
            title: "",
            stakeholders: "",
            scale: "",
            issuanceDate: "",
            type: "",
            connections: "",
            language: "",
            pages: 0,
            description: "",
            lat: null,
            lng: null,
        });
        setIndex(0)
        setShowModalAdd(false);
    } 

    const handleNext = () => {
        setIndex((prevIndex) => (prevIndex + 1) % 3);
    };

    const handlePrev = async() => {
        setIndex((prevIndex) => (prevIndex - 1 + 3) % 3);
        console.log("elimino: ",newDocument.id)
        await DocumentAPI.deleteDocument(newDocument.id);
        props.handleBackActionForm(newDocument.id); /////////controllare
        //console.log(newDocument)
    };

    const handleSelect = (selectedIndex) => {
        setIndex(selectedIndex);
    };

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
            <Modal show={showModalAdd} onHide={handleClose} size="xl">
                <Modal.Header closeButton>
                    <Modal.Title>{index==0? "Insert new document":"Insert link"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Carousel activeIndex={index} onSelect={handleSelect} controls={false} indicators={false} interval={null}>
                        <Carousel.Item>
                            <AddDocument handleAddDocument={props.handleAddDocument} handleNext={handleNext} newDocument={newDocument} setNewDocument={setNewDocument} />
                        </Carousel.Item>
                        <Carousel.Item>
                            <Link documents={props.documents} handlePrev={handlePrev} handleClose={handleClose} docId={newDocument.id} title={newDocument.title}></Link>
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
        </>
    )

}

export default UnifiedForms