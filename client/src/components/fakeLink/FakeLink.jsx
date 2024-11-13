import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState } from "react";
import { Routes, Route, Outlet, Navigate, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Form, Modal, Offcanvas } from "react-bootstrap";




function FakeLink(props) {

    const [showModalLink, setShowModalLink] = useState(props.isJustBeenAddedADocument);

    const handleClose = () => {
        props.handleAddLink();
        setShowModalLink(false);
    }

    return (
        <Modal show={showModalLink} onHide={handleClose} size="xl">
            <Modal.Header closeButton>
                <Modal.Title>Link</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <h1>Link</h1>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default FakeLink;