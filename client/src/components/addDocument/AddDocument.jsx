import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState } from "react";
import { Routes, Route, Outlet, Navigate, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Form, Modal, Offcanvas } from "react-bootstrap";
import Select from "react-select";

import ChosenPosition from "../chosenPosition/ChosenPosition";
/**BUGS: 
 *  
 *  Line 137: The date there are no restriction on only year (has to be fixed by Yann)
 *  Line 112: Architectural Scale Format (x:y) if I leave it empty and press save changes, it saves the old value in the document (you can see it in the console.log)."
 *  Should be displayed Connections as a field (added by counting how many connections for a specific document in the database)
 *  Line 173: The field "Pages" should be a number field, not a text field but oit could be like: 111, 2, -, 1-43 ; (you can see by checking "card" folder)
 *  Should be checked wich fields are mandatory and which are not
 *  
 * 
*/



function AddDocument(props){
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
    const handleSetPostition = (lat, lng) => {
        setNewDocument({...newDocument, lat: lat, lng: lng});
    };


    const stakeholdersOptions = [
        { value: "LKAB", label: "LKAB" },
        { value: "Kiruna kommun", label: "Kiruna kommun" },
        { value: "Kiruna kommun/White Arkitekter", label: "Kiruna kommun/White Arkitekter" },
        { value: "Kiruna kommun/Residents", label: "Kiruna kommun/Residents" },
    ];

    const scaleOptions = [
        { value: "Architectural Scale", label: "Architectural Scale" },
        { value: "Blueprints/Effects", label: "Blueprints/Effects" },
    ];

    const typeOptions = [
        { value: "Informative document", label: "Informative document" },
        { value: "Prescriptive document", label: "Prescriptive document" },
        { value: "Design document", label: "Design document" },
        { value: "Technical document", label: "Technical document" },
        { value: "Material effect", label: "Material effect" },
    ];

    const languageOptions = [
        { value: "Swedish", label: "Swedish" },
        { value: "English", label: "English" },
    ];



    const [isArchitecturalScale, setIsArchitecturalScale] = useState(false);
    const [isArchitecturalScaleFormat, setIsArchitecturalScaleFormat] = useState(false);

    const [issuanceDate, setIssuanceDate] = useState("");
    const [isIssuanceDateValid, setIsIssuanceDateValid] = useState(true);

    const handleDateChange = (e) => {
        const value = e.target.value;
        const regex = /^[1-9][0-9]{3}(\/(0[1-9]|1[0-2])(\/(0[1-9]|[1-2][0-9]|3[0-1]))?)?$/;
        if (regex.test(value)) {
            setIsIssuanceDateValid(true);
            setNewDocument({ ...newDocument, issuanceDate: value });
        } else {
            setIsIssuanceDateValid(false);
        }
        setIssuanceDate(value);
    };

    const [showModalAdd, setShowModalAdd] = useState(false);

    const onBtnSelectAdd = () => setShowModalAdd(true);
    const handleClose = () => setShowModalAdd(false);

    const handleSaveDocument = (e) => {
        e.preventDefault();
        if(newDocument.lat === null || newDocument.lng === null){
            alert("Please select a position on the map");
            return;
        }

        if (!isIssuanceDateValid) {
            alert("Please enter a valid issuance date.");
            return;
        }

        if (isArchitecturalScale && !isArchitecturalScaleFormat) {
            alert("Please enter a valid architectural scale format.");
            return;
        }

        console.log("Sono in AddDocument.jsx, ho appna creato il documento: ", newDocument);
        props.handleAddDocument(newDocument);

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

    };


    return(
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
                <Modal.Title>Insert New Document</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSaveDocument}>
                    <Row>
                        <Col md={5}>
                            <Form.Group className="mb-3">
                                <Form.Label>Title*</Form.Label>
                                
                                <Form.Control 
                                    type="text" 
                                    placeholder="Enter document name" 
                                    required={true}
                                    value={newDocument.title} // per avere infup controlalto
                                    
                                    onChange={(e) => setNewDocument({...newDocument, title: e.target.value})}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Stakeholders*</Form.Label>
                                <Select
                                    options={stakeholdersOptions} // Opzioni definite
                                    isClearable // Aggiunge una "x" per cancellare la selezione
                                    placeholder="Select Stakeholders"
                                    required={true}
                                    onChange={(selectedOption) => 
                                        setNewDocument({
                                            ...newDocument, 
                                            stakeholders: selectedOption ? selectedOption.value : ""
                                        })
                                    }
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Scale*</Form.Label>

                                <Select
                                    options={scaleOptions} // Opzioni definite
                                    isClearable // Aggiunge una "x" per cancellare la selezione
                                    placeholder="Select Scale"
                                    required={true}
                                    onChange={(selectedOption) => {
                                
                                            setNewDocument({...newDocument, 
                                                scale: selectedOption ? selectedOption.value : ""
                                            })
                            
                                            if(selectedOption){
                                                if(selectedOption.value === "Architectural Scale"){
                                                    setIsArchitecturalScale(true);
                                                } else{
                                                    // In this way i have always guaranteed that Architectural Scale Format form disappear
                                                    setIsArchitecturalScale(false);
                                                }
                                            } else{
                                                // In this way i have always guaranteed that Architectural Scale Format form disappear (case of Selected Option null)
                                                setIsArchitecturalScale(false);
                                            }
                                        }
                                    }
                                />

                            </Form.Group>
                                                {/**There is the bug: if i write a random number and click save cahnges will be saved the last correct value*/}       
                            {isArchitecturalScale && 
                                <Form.Group className="mb-3">
                                    <Form.Label>Architectural Scale Format (x:y)*</Form.Label> 
                                    <Form.Control
                                        type="text"
                                        required={true}
                                        placeholder="Enter scale in x:y format"
                                        onChange={(e) => {
                                            const regex = /^\d+:\d+$/;
                                            if(regex.test(e.target.value)){
                                                setIsArchitecturalScaleFormat(true);
                                                setNewDocument({...newDocument, scale: e.target.value})
                                            } else{
                                                setIsArchitecturalScaleFormat(false);
                                            }
                                        }}
                                        isInvalid={!isArchitecturalScaleFormat} // Mostra l'errore visivamente
                                    />
                                    <Form.Control.Feedback type="invalid">
                                            Please enter the scale in "x:y" format (e.g., 1:100).
                                    </Form.Control.Feedback>
                                </Form.Group>
                            }
                            <Form.Group className="mb-3">
                                <Form.Label>Issuance Date*</Form.Label>
                                <Form.Control
                                    type="text"
                                    required={true}
                                    placeholder="Enter date in yyyy/mm/dd format"
                                    value={issuanceDate}
                                    onChange={handleDateChange}
                                    isInvalid={!isIssuanceDateValid}
                                />
                                <Form.Control.Feedback type="invalid">
                                        Please enter the date in "yyyy/mm/dd" format. Year is mandatory, month and day are optional.
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Type*</Form.Label> {/* sono fixed*/}
                                <Select
                                    options={typeOptions}
                                    isClearable
                                    placeholder="Select Type"
                                    required={true}
                                    onChange={(selectedOption) => 
                                        setNewDocument({...newDocument, type: selectedOption ? selectedOption.value : ""})
                                    }
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Language</Form.Label>
                                <Select
                                    options={languageOptions}
                                    isClearable
                                    placeholder="Select Language"
                                    onChange={(selectedOption) => 
                                        setNewDocument({...newDocument, language: selectedOption ? selectedOption.value : ""})
                                    }
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Pages</Form.Label>
                                <Form.Control
                                    type="text"
                                    onChange={(e) => setNewDocument({...newDocument, pages: e.target.value})}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Description*</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={10}
                                    required={true}
                                    onChange={(e) => setNewDocument({...newDocument, description: e.target.value})}
                                />
                            </Form.Group>
                            
                            <ChosenPosition
                                handleSetPostition={handleSetPostition}
                            />

                        </Col>

                    </Row>
                    <Row>
                        <Col>
                            <Button variant="secondary" onClick={handleClose}> Close</Button>
                            <Button variant="primary" type='submit'> Save Changes, go to links </Button>
                        </Col>
                    </Row>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <p>All the fields contrassigned by * are mandatory. </p>
            </Modal.Footer>
        </Modal>



        </>
    )
}

export default AddDocument;