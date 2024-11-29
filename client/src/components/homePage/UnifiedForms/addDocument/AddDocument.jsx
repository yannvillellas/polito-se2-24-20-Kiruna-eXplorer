import "bootstrap/dist/css/bootstrap.min.css";
import "./addDocument.css";
import React, { useState, useEffect } from "react";
import { Row, Col, Button, Form } from "react-bootstrap";
import Select from "react-select";
import ChosenPosition from "../../chosenPosition/ChosenPosition";
import ChosenArea from "../../chosenArea/ChosenArea";
import AddOriginalSource from "./addOriginalSource/AddOriginalSource";
import { booleanContains, polygon } from "@turf/turf";

/**BUGS:  
 *  Line 112: Architectural Scale Format (x:y) if I leave it empty and press save changes, it saves the old value in the document (you can see it in the console.log)."   
*/

function AddDocument(props) {
    const [newDocument, setNewDocument] = useState(props.newDocument ? props.newDocument : {
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
        area: null
    });
    const [selectedStakeholders, setSelectedStakeholders] = useState([]);
    const [showCheckboxes, setShowCheckboxes] = useState(false);

    const handleSetPostition = (lat, lng) => {
        console.log("AddDocument.jsx, ho ricevuto lat e lng (dall'area):", lat, lng);
        // Modo corretto per aggiornare un oggetto in React
        setNewDocument((prevDocument) => {
            const updatedDocument = { ...prevDocument, lat: lat, lng: lng };
            console.log("AddDocument.jsx, ho salvato lat e lng in newDocument:", updatedDocument.lat, updatedDocument.lng);
            return updatedDocument;
        });
    };

    useEffect(() => {
        console.log("AddDocument.jsx, stato di newDocument aggiornato:", newDocument);
    }, [newDocument]);


    const handleAddedFiles = (files) => {
        console.log("AddDocument.jsx, ho ricevuto i files:", files);
        setNewDocument((prevDocument) => {
            const updatedDocument = { ...prevDocument, files: files };
            console.log("AddDocument.jsx, ho salvato i files in newDocument:", updatedDocument.files);
            return updatedDocument;
        });
    };

    const handleSetArea = (area) => {
        console.log("AddDocument.jsx, sto salvando area:", area);
        // Chiamo qui handle set position perche' ho bisogno di calcolare il centroide dell'area:
        setNewDocument({ ...newDocument, area: area });
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
        { value: "Text", label: "Text" }
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

    const handleSaveDocument = (e) => {
        e.preventDefault();

        console.log('index: ', props.index)
        if (props.index === 0) {
            if (newDocument.title === "" || newDocument.stakeholders === "" || newDocument.scale === "" || newDocument.type === "" || newDocument.description === "") {
                alert("Please fill in all required fields.");
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

            console.log("AddDocument.jsx, hai premuto SAVE ecco tutte le info di newDocument: newDocument:", newDocument);


            if (newDocument.lat === null || newDocument.lng === null) {
                alert("Please select a position on the map");
                return;

            }
            if (props.index === 1) {
                if (newDocument.lat === null || newDocument.lng === null) {
                    alert("Please select a valid position on the map.");
                    return;
                }
            }


            if (newDocument.area === null) {
                alert("Please select an area on the map");
                return;
            }

            props.handleAddDocumentToModal(newDocument);
            props.handleNext();
        };
        
    }

    const handleCheckboxChange = (stakeholder) => {
        setSelectedStakeholders((prevSelected) => {
            const alreadySelected = prevSelected.some((s) => s.value === stakeholder.value);
            if (alreadySelected) {
                return prevSelected.filter((s) => s.value !== stakeholder.value);
            } else {
                return [...prevSelected, stakeholder];
            }
        });
    };
    

        return (
            <>
                <Form className="add-document-form" onSubmit={handleSaveDocument}>
                    <Row>
                        <Col md={5}>
                            <Form.Group className="mb-3">
                                <Form.Label>Title*</Form.Label>

                                <Form.Control
                                    type="text"
                                    placeholder="Enter document name"
                                    required={true}
                                    value={newDocument.title} // per avere infup controlalto

                                    onChange={(e) => setNewDocument({ ...newDocument, title: e.target.value })}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Stakeholders*</Form.Label>
                                {/* <Select
                                    options={stakeholdersOptions} // Opzioni definite
                                    isClearable // Aggiunge una "x" per cancellare la selezione
                                    placeholder="Select Stakeholders"
                                    required={true}
                                    value={stakeholdersOptions.find(opt => opt.value === newDocument.stakeholders)}
                                    onChange={(selectedOption) =>
                                        setNewDocument({
                                            ...newDocument,
                                            stakeholders: selectedOption ? selectedOption.value : ""
                                        })
                                    }
                                /> */}
                                <div
                                    className="custom-dropdown-trigger"
                                    onClick={() => setShowCheckboxes(!showCheckboxes)}
                                >
                                    {selectedStakeholders.length > 0 ? (
                                        `Selected: ${selectedStakeholders.map((s) => s.label).join(", ")}`
                                    ) : (
                                        <span className="hint">Select type(s)</span>
                                    )}

                                    <span className="arrow">&#9662;</span>
                                </div>

                                {showCheckboxes && (
                                    <div className="checkbox-container">
                                        {stakeholdersOptions.map((stakeholder) => (
                                            <Form.Check
                                                key={stakeholder.value}
                                                type="checkbox"
                                                id={`checkbox-${stakeholder.value}`}
                                                label={stakeholder.label} // Usa "label" per il testo visibile
                                                checked={selectedStakeholders.some((s) => s.value === stakeholder.value)}
                                                onChange={() => handleCheckboxChange(stakeholder)}
                                                className="custom-checkbox"
                                            />
                                        ))}
                                    </div>
                                )}
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Scale*</Form.Label>

                                <Select
                                    options={scaleOptions} // Opzioni definite
                                    isClearable // Aggiunge una "x" per cancellare la selezione
                                    placeholder="Select Scale"
                                    required={true}
                                    onChange={(selectedOption) => {
                                        const scaleValue = selectedOption ? selectedOption.value : "";

                                        setIsArchitecturalScale(scaleValue === "Architectural Scale");

                                        isArchitecturalScale ? setNewDocument({ ...newDocument, scale: "" }) : setNewDocument({ ...newDocument, scale: scaleValue })

                                        /*
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
                                            */

                                    }
                                    }
                                    value={isArchitecturalScale ? scaleOptions.find(opt => opt.value = "Architectural Scale") : scaleOptions.find(opt => opt.value === newDocument.scale)}
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
                                                setNewDocument({ ...newDocument, scale: e.target.value })
                                            } else {
                                                setIsArchitecturalScaleFormat(false);
                                            }
                                        }}
                                        isInvalid={!isArchitecturalScaleFormat} // Mostra l'errore visivamente

                                    />
                                    {/* I'm not setting the value, thevalue will be still tehre untill the comontent is not unmounted (refreshed the page). 
                                    isArchitecturalScale  is still true untill you unmount the component */}
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
                                        setNewDocument({ ...newDocument, type: selectedOption ? selectedOption.value : "" })
                                    }
                                    value={typeOptions.find(opt => opt.value === newDocument.type)}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Language</Form.Label>
                                <Select
                                    options={languageOptions}
                                    isClearable
                                    placeholder="Select Language"
                                    onChange={(selectedOption) =>
                                        setNewDocument({ ...newDocument, language: selectedOption ? selectedOption.value : "" })
                                    }
                                    value={languageOptions.find(opt => opt.value === newDocument.language)}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Pages</Form.Label>
                                <Form.Control
                                    type="text"
                                    onChange={(e) => setNewDocument({ ...newDocument, pages: e.target.value })}
                                    value={newDocument.pages}
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
                                    onChange={(e) => setNewDocument({ ...newDocument, description: e.target.value })}
                                    value={newDocument.description}
                                />


                            </Form.Group>
                            <Row className="btn-modal justify-content-between align-items-end">
                                <Col className="d-flex justify-content-start">
                                    <Button variant="secondary" className="btn-modal-close" onClick={() => { }}>
                                        New Stakeholder
                                    </Button>
                                </Col>
                                <Col className="d-flex justify-content-end">
                                    <Button
                                        variant="primary"
                                        type="submit"
                                        className="btn-modal-save"
                                        onClick={(e) => handleSaveDocument(e)}
                                    >
                                        Next →
                                    </Button>

                                </Col>
                            </Row>

                            {/*<ChosenPosition
                            handleSetPostition={handleSetPostition}
                        />*/}

                            {/* <ChosenArea handleSetArea={handleSetArea} handleSetPostition={handleSetPostition} />

                            <AddOriginalSource handleAddedFiles={handleAddedFiles} /> */}


                        </Col>

                    </Row>

                    {/*<Row>
                    <Col>
                        <Button variant="secondary" onClick={() => props.handleClose()}> Close</Button>
                        <Button variant="primary" type='submit'> Save </Button>
                    </Col>
                </Row>*/}

                </Form>
            </>
        )
    
}
export default AddDocument;