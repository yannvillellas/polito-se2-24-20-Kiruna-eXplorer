import "./map.css";
import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState } from "react";
import { Container, Row, Col, Button, Form, Modal } from "react-bootstrap";

import DocumentAPI from "../../api/documentAPI";
import PositionAPI from "../../api/positionAPI";

function Map(props) {
  const [showModal, setShowModal] = useState(false);

  const [documents, setDocuments] = useState([]);

  const [selectedDocument, setSelectedDocument] = useState({
    id: null,
    title: "",
    stakeholders: "",
    scale: "",
    issuanceDate: "",
    type: "",
    connections: "",
    language: "",
    pages: "",
    decription: "",
    lat: 0,
    lng: 0,
  });

  const handleSaveDocument = async (event) => {
    event.preventDefault();
    const newDocument = {
      ...selectedDocument,
      id: documents.length,
    };
    setDocuments([...documents, newDocument]);
    setShowModal(false);

    setSelectedDocument({
      id: null,
      title: "",
      stakeholders: "",
      scale: "",
      issuanceDate: "",
      type: "",
      connections: "",
      language: "",
      pages: "",
      description: "",
      lat: 0,
      lng: 0,
    });

    try {
      console.log("Adding document:", newDocument);
      await DocumentAPI.addDocument(newDocument);
      const position = {
        docId: newDocument.id,
        lat: newDocument.lat,
        lng: newDocument.lng,
      };
      await PositionAPI.addPosition(position);
    } catch (error) {
      console.error("Error adding document:", error);
    }
  };

  const handleClose = () => setShowModal(false);
  const onBtnSelect = () => setShowModal(true);

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col className="d-flex justify-content-between align-items-center">
          <h1 className="text-primary">Welcome to Kiruna</h1>
          <Button
            onClick={onBtnSelect}
            className="btn-lg rounded-circle d-flex align-items-center justify-content-center"
            variant="primary"
            style={{ width: "50px", height: "50px" }}
          >
            <i className="bi bi-plus" style={{ fontSize: "1.5rem" }}></i>
          </Button>
        </Col>
      </Row>

      <Modal show={showModal} onHide={handleClose} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Insert New Document</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form onSubmit={handleSaveDocument}>
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm="4">
                    Title:
                  </Form.Label>
                  <Col sm="8">
                    <Form.Control
                      type="text"
                      required
                      onChange={(e) =>
                        setSelectedDocument({
                          ...selectedDocument,
                          title: e.target.value,
                        })
                      }
                    />
                  </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm="4">
                    Stakeholders:
                  </Form.Label>
                  <Col sm="8">
                    <Form.Control
                      type="text"
                      required
                      onChange={(e) =>
                        setSelectedDocument({
                          ...selectedDocument,
                          stakeholders: e.target.value,
                        })
                      }
                    />
                  </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm="4">
                    Scale:
                  </Form.Label>
                  <Col sm="8">
                    <Form.Control
                      type="text"
                      required
                      onChange={(e) =>
                        setSelectedDocument({
                          ...selectedDocument,
                          scale: e.target.value,
                        })
                      }
                    />
                  </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm="4">
                    Issuance Date:
                  </Form.Label>
                  <Col sm="8">
                    <Form.Control
                      type="text"
                      required
                      onChange={(e) =>
                        setSelectedDocument({
                          ...selectedDocument,
                          issuanceDate: e.target.value,
                        })
                      }
                    />
                  </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm="4">
                    Type:
                  </Form.Label>
                  <Col sm="8">
                    <Form.Select
                      required
                      onChange={(e) =>
                        setSelectedDocument({
                          ...selectedDocument,
                          type: e.target.value,
                        })
                      }
                    >
                      <option value="">Select type</option>
                      <option value="Informative document">
                        Informative document
                      </option>
                      <option value="Prescriptive document">
                        Prescriptive document
                      </option>
                      <option value="Design document">Design document</option>
                      <option value="Technical document">
                        Technical document
                      </option>
                      <option value="Material effect">Material effect</option>
                    </Form.Select>
                  </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm="4">
                    Connections:
                  </Form.Label>
                  <Col sm="8">
                    <Form.Control
                      type="number"
                      required
                      onChange={(e) =>
                        setSelectedDocument({
                          ...selectedDocument,
                          connections: e.target.value,
                        })
                      }
                    />
                  </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm="4">
                    Language:
                  </Form.Label>
                  <Col sm="8">
                    <Form.Control
                      type="text"
                      required
                      onChange={(e) =>
                        setSelectedDocument({
                          ...selectedDocument,
                          language: e.target.value,
                        })
                      }
                    />
                  </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm="4">
                    Latitude:
                  </Form.Label>
                  <Col sm="8">
                    <Form.Control
                      type="text"
                      required
                      onChange={(e) =>
                        setSelectedDocument({
                          ...selectedDocument,
                          lat: e.target.value,
                        })
                      }
                    />
                  </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm="4">
                    Longitude:
                  </Form.Label>
                  <Col sm="8">
                    <Form.Control
                      type="text"
                      required
                      onChange={(e) =>
                        setSelectedDocument({
                          ...selectedDocument,
                          lng: e.target.value,
                        })
                      }
                    />
                  </Col>
                </Form.Group>
                <Button variant="primary" type="submit">
                  Submit
                </Button>
              </Form>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Description:</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={17}
                  placeholder="Enter description here..."
                  value={selectedDocument.description}
                  onChange={(e) =>
                    setSelectedDocument({
                      ...selectedDocument,
                      description: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
      </Modal>

      <Row>
        <Col>
          <div
            className="border border-2 rounded bg-light"
            style={{
              height: "500px",
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <span className="text-muted fs-4">Map Area</span>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default Map;
