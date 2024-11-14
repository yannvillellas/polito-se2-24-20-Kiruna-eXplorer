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

function AddDocument(props) {

    
    const handleSetPostition = (lat, lng) => {
        props.setNewDocument({ ...props.newDocument, lat: lat, lng: lng });
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

    const [showModalAdd, setShowModalAdd] = useState(false);


    const handleClose = () => setShowModalAdd(false);

    const handleSaveDocument = (e) => {
        e.preventDefault();
        if (props.newDocument.lat === null || props.newDocument.lng === null) {
            alert("Please select a position on the map");
            return;
        }


        console.log("Sono in AddDocument.jsx, ho appna creato il documento: ", props.newDocument);
        props.handleAddDocument(props.newDocument);
        /*
        props.setNewDocument({
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
        });*/
        props.handleNext();

    };


    return (
        <>
            <Form onSubmit={handleSaveDocument}>
                <Row>
                    <Col md={5}>
                        <Form.Group className="mb-3">
                            <Form.Label>Title*</Form.Label>

                            <Form.Control
                                type="text"
                                placeholder="Enter document name"
                                required={true}
                                value={props.newDocument.title} // per avere infup controlalto

                                onChange={(e) => props.setNewDocument({ ...props.newDocument, title: e.target.value })}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Stakeholders*</Form.Label>
                            <Select
                                options={stakeholdersOptions} // Opzioni definite
                                isClearable // Aggiunge una "x" per cancellare la selezione
                                placeholder="Select Stakeholders"
                                required={true}
                                value={stakeholdersOptions.find(opt => opt.value === props.newDocument.stakeholders)}
                                onChange={(selectedOption) =>
                                    props.setNewDocument({
                                        ...props.newDocument,
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

                                    props.setNewDocument({
                                        ...props.newDocument,
                                        scale: selectedOption ? selectedOption.value : ""
                                    })

                                    if (selectedOption) {
                                        if (selectedOption.value === "Architectural Scale") {
                                            setIsArchitecturalScale(true);
                                        } else {
                                            // In this way i have always guaranteed that Architectural Scale Format form disappear
                                            setIsArchitecturalScale(false);
                                        }
                                    } else {
                                        // In this way i have always guaranteed that Architectural Scale Format form disappear (case of Selected Option null)
                                        setIsArchitecturalScale(false);
                                    }
                                }
                                }
                                value={scaleOptions.find(opt => opt.value === props.newDocument.scale)}
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
                                        if (regex.test(e.target.value)) {
                                            setIsArchitecturalScaleFormat(true);
                                            props.setNewDocument({ ...props.newDocument, scale: e.target.value })
                                        } else {
                                            setIsArchitecturalScaleFormat(false);
                                        }
                                    }}
                                    isInvalid={!isArchitecturalScaleFormat} // Mostra l'errore visivamente
                                    value={scaleOptions.find(opt => opt.value === props.newDocument.scale)} /////////////////////////////////////////////  DA VERIFICARE /////////////////////////////////////////////
                                />
                                <Form.Text className="text-muted">
                                    Please enter the scale in "x:y" format (e.g., 1:100).
                                </Form.Text>
                            </Form.Group>
                        }

                        <Form.Group className="mb-3">
                            <Form.Label>Issuance Date*</Form.Label>
                            <Form.Control
                                type="date"
                                required={true}
                                onChange={(e) => props.setNewDocument({ ...props.newDocument, issuanceDate: e.target.value })}
                                value={props.newDocument.issuanceDate}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Type*</Form.Label> {/* sono fixed*/}
                            <Select
                                options={typeOptions}
                                isClearable
                                placeholder="Select Type"
                                required={true}
                                onChange={(selectedOption) =>
                                    props.setNewDocument({ ...props.newDocument, type: selectedOption ? selectedOption.value : "" })
                                }
                                value={typeOptions.find(opt => opt.value === props.newDocument.type)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Language</Form.Label>
                            <Select
                                options={languageOptions}
                                isClearable
                                placeholder="Select Language"
                                onChange={(selectedOption) =>
                                    props.setNewDocument({ ...props.newDocument, language: selectedOption ? selectedOption.value : "" })
                                }
                                value={languageOptions.find(opt => opt.value === props.newDocument.language)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Pages</Form.Label>
                            <Form.Control
                                type="text"
                                onChange={(e) => props.setNewDocument({ ...props.newDocument, pages: e.target.value })}
                                value={props.newDocument.pages}
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
                                onChange={(e) => props.setNewDocument({ ...props.newDocument, description: e.target.value })}
                                value={props.newDocument.description}
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
        </>
    )
}

export default AddDocument;