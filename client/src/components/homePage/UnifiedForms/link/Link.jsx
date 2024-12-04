import React, { useState, useEffect } from "react";
import associationAPI from "../../../../api/associationAPI";
import { Modal, Row, Col, Form, Button } from "react-bootstrap";
import "./Link.css";
import Select from "react-select";

function Link(props) {
  const [linkTypes, setLinkTypes] = useState([]); // State for link types
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [doc2, setDoc2] = useState([]);
  const [doc1, setDoc1] = useState([]);
  const [showCheckboxes, setShowCheckboxes] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false); // Stato per il modal di conferma

  // Funzione per gestire il cambiamento della checkbox
  const handleCheckboxChange = (linkType) => {
    setSelectedTypes((prevSelected) => {
      const isSelected = prevSelected.includes(linkType);
      if (isSelected) {
        return prevSelected.filter((type) => type !== linkType);
      } else {
        return [...prevSelected, linkType];
      }
    });

  };

  const handleChangeDoc1 = (selectedOptions) => {
    setDoc1(selectedOptions || []);
  };

  const handleChangeDoc2 = (selectedOptions) => {
    setDoc2(selectedOptions || []);
  };

  useEffect(() => {
    const fetchLinkTypes = async () => {
      try {
        const types = await associationAPI.getLinkTypes();
        setLinkTypes(types);
      } catch (error) {
        console.error("Failed to fetch link types:", error);
      }
    };
    fetchLinkTypes();
  }, []);

  // Handle form submission
  const handleSubmit = async () => {
    try {
      let errors = [];
      if (!props.alone) {
        const docId = await props.handleAddDocument(props.newDocument); // this sends to HomePage.jsx the new document
        for (let link of selectedTypes) {
          for (let dId2 of doc2) {
            let association = {
              doc1: docId,
              type: link,
              doc2: parseInt(dId2.value, 10),
            };
            const response = await associationAPI.createAssociation(association);
            if (response.msg) {
              const doc1Title = props.documents.find(
                (doc) => doc.docId === association.doc1
              );
              const doc2Title = props.documents.find(
                (doc) => doc.docId === association.doc2
              );
              errors.push(
                <>
                  The link of type <strong>{link}</strong> between documents{" "}
                  <strong>{doc1Title.title}</strong> and{" "}
                  <strong>{doc2Title.title}</strong> already exists
                </>
              );
            }
          }
        }
        props.setErrorMsg(errors);
        props.handleClose(); // Close modal after submission
      } else {
        for (let link of selectedTypes) {
          for (let dId1 of doc1) {
            for (let dId2 of doc2) {
              let association = {
                doc1: dId1.value, //doc1
                type: link,
                doc2: dId2.value,
              };
              const response = await associationAPI.createAssociation(
                association
              );
              if (response.msg) {
                const doc1Title = props.documents.find(
                  (doc) => doc.docId === association.doc1
                );
                const doc2Title = props.documents.find(
                  (doc) => doc.docId === association.doc2
                );
                errors.push(
                  <>
                    The link of type <strong>{link}</strong> between documents{" "}
                    <strong>{doc1Title.title}</strong> and{" "}
                    <strong>{doc2Title.title}</strong> already exists
                  </>
                );
              }
            }
          }
        }
        props.setErrorMsg(errors);
        setDoc1([]);
        props.setOnlyLinkForm(false);
      }
      // Reset form fields after successful submission
      setLinkTypes([]);
      setDoc2([]);
    } catch (error) {
      console.error("Failed to create association:", error);
    }
  };

  return (
    <Row className="add-link-form">
      <Col>
        <Form>
          <Form.Group as={Row} className="rows">
            <Form.Label column sm="2" className="name-label">
              Source Document
            </Form.Label>
            <Col sm="8">
              {props.alone ? (
                <Select
                  options={props.documents
                    .filter((d) => !doc2.some((doc) => doc.value === d.docId))
                    .map((d) => {
                      return { value: d.docId, label: d.title };
                    })}
                  isClearable
                  placeholder="Select document"
                  required={true}
                  onChange={handleChangeDoc1}
                  isMulti
                  value={doc1}
                  menuPlacement="auto"
                  menuPosition="fixed"
                  styles={{
                    menu: (base) => ({
                      ...base,
                      zIndex: 9999,
                    }),
                    menuList: (base) => ({
                      ...base,
                      maxHeight: "200px",
                      overflowY: "auto",
                    }),
                  }}
                />
              ) : (
                <Form.Label  style={{border:"2px solid", width: "100%", padding:"8px 5px"}}>{props.title}</Form.Label>
              )}
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="rows">
            <Form.Label column sm="2" className="name-label">
              Link Type
            </Form.Label>
            <Col sm="8" className="col-link">
              <button
                className="custom-dropdown-trigger"
                onClick={() => setShowCheckboxes(!showCheckboxes)}
              >
                {selectedTypes.length > 0 ? (
                  `Selected: ${selectedTypes.join(", ")}`
                ) : (
                  <span className="hint">Select type(s)</span>
                )}
                <span className="arrow">&#9662;</span>
              </button>

              {showCheckboxes && (
                <div className="checkbox-container">
                  {linkTypes.map((linkType) => (
                    <Form.Check
                      key={linkType}
                      type="checkbox"
                      id={`checkbox-${linkType}`}
                      label={linkType}
                      checked={selectedTypes.includes(linkType)}
                      onChange={() => handleCheckboxChange(linkType)}
                      className="custom-checkbox"
                    />
                  ))}
                </div>
              )}
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="rows">
            <Form.Label column sm="2" className="name-label">
              Target Document
            </Form.Label>
            <Col sm="8">
              <Select
                options={props.documents
                  .filter((d) => !doc1.some((doc) => doc.value === d.docId))
                  .map((d) => {
                    return { value: d.docId, label: d.title };
                  })}
                isClearable
                placeholder="Select document"
                required={true}
                isMulti
                value={doc2}
                onChange={handleChangeDoc2}
                menuPlacement="auto"
                menuPosition="fixed"
                styles={{
                  menu: (base) => ({
                    ...base,
                    zIndex: 9999,
                  }),
                  menuList: (base) => ({
                    ...base,
                    maxHeight: "200px",
                    overflowY: "auto",
                  }),
                }}
              />
            </Col>
          </Form.Group>

          <Form.Group className="btn-modal d-flex justify-content-end">
            {props.alone ? (
              <Button
                onClick={() => props.setOnlyLinkForm(false)}
                style={{ backgroundColor: "white", color: "black", border:"2px solid", fontWeight: "bolder"}}
              >
                Close
              </Button>
            ) : (
              <Button 
                onClick={() => props.handlePrev()}
                style={{ backgroundColor: "white", color: "black", border:"2px solid", fontWeight: "bolder"}} 
              >
                ← Back
              </Button>
            )}

            {(doc1 !== "" || !props.alone) &&
              selectedTypes.length > 0 &&
              doc2 !== "" && (
                <Button
                  style={{ backgroundColor: "#075293", fontWeight: "bolder"}}
                  type="button"
                  onClick={() => setShowConfirmation(true)}
                >
                  Submit
                </Button>
              )}
          </Form.Group>
        </Form>
      </Col>

      {/* Modal di Conferma */}
      <Modal
        show={showConfirmation}
        onHide={() => setShowConfirmation(false)}
        centered
        className="modal-confirm"
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Submission</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to submit this link association?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmation(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              handleSubmit();
              setShowConfirmation(false);
            }}
          >
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </Row>
  );
}

export default Link;
