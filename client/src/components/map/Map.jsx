import "./map.css";
import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState} from "react";
import { Routes, Route, Outlet, Navigate, useNavigate  } from 'react-router-dom';
import { Container, Row, Col, Button, Form, Modal, Offcanvas } from "react-bootstrap";

import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

import DocumentAPI from "../../api/documentAPI";
import PositionAPI from "../../api/positionAPI";
import Link from "../link/Link";

function Map(props) {
  const [showModalAdd, setShowModalAdd] = useState(false);
  const [showModalLink, setShowModalLink] = useState(false);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const [isAllMunicipality, setIsAllMunicipality] = useState(false);
  const [isUrbanPlanner, setIsUrbanPlanner] = useState(props.role === "urbanPlanner" ? true : false);
  const navigate = useNavigate();

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
    pages: 0,
    description: "",
    lat: 0,
    lng: 0,
  });

/*
  useEffect(()=>{
    const fetchDocuments = async () => {
      try {
        const docs = await DocumentAPI.listDocuments();
        setDocuments(docs);
      } catch (error) {
        console.error("Failed to fetch documents:", error);
      }
    };
    fetchDocuments();
    console.log(documents)
  }, [])*/

  const handleMunicipalitiesChange = (e) => {
      const isChecked = e.target.checked;

      setIsAllMunicipality(isChecked);

      if(isChecked) {
        setSelectedDocument({
          ...selectedDocument,
          lat: 67.856348 ,
          lng: 20.225785
        });
      } else {
        setSelectedDocument({
          ...selectedDocument,
          lat: 0,
          lng: 0
        });
      }

  } 
  const handleSaveDocument = async (event) => {
    event.preventDefault();
    const newDocument = {
      ...selectedDocument,
      id: documents.length,
    };

    setDocuments([...documents, newDocument]);
    setShowModalAdd(false);
    setShowModalLink(false);
    

    setSelectedDocument({
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
      lat: 0,
      lng: 0,
    });

    setIsAllMunicipality(false);

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

  const handleClose = () => {
    setShowModalAdd(false);
    setShowModalLink(false);
  };
  const onBtnSelectAdd = () => setShowModalAdd(true);
  const onBtnSelectLink = () => setShowModalLink(true);

  const handleCloseOffcanvas = () => {
    setShowOffcanvas(false);
  };

  const handleMarkerClick = (doc) => {
    setSelectedDoc(doc);
    setShowOffcanvas(true); // Apri OffCanvas

  };

  

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col className="d-flex justify-content-between align-items-center">
          <h1 className="text-primary">Welcome to Kiruna</h1>
          <div className="d-flex">

          
          {isUrbanPlanner &&
          <>
            { documents.length > 1 &&
              <Button
                onClick={onBtnSelectLink}
                className="btn-lg rounded-circle d-flex align-items-center justify-content-center"
                variant="warning"
                style={{ width: "50px", height: "50px" }}
                >
                <i className="bi bi-link-45deg" style={{ fontSize: "1.5rem" }}></i>
              </Button>
            }
            <Button
              onClick={onBtnSelectAdd}
              className="btn-lg rounded-circle d-flex align-items-center justify-content-center"
              variant="primary"
              style={{ width: "50px", height: "50px" }}
              >
              <i className="bi bi-plus" style={{ fontSize: "1.5rem" }}></i>
            </Button>

            <Button onClick={props.handleLogout}> Logout</Button>

          </>
          }
          
          </div>
          
        </Col>
      </Row>
    { documents.length > 1 &&
      <Link documents={documents} showModalLink={showModalLink} handleClose={handleClose}/> 
    }
      <Modal show={showModalAdd} onHide={handleClose} size="xl">
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
                      min={0}
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
                    Page:
                  </Form.Label>
                  <Col sm="8">
                    <Form.Control
                      type="number"
                      required
                      onChange={(e) =>
                        setSelectedDocument({
                          ...selectedDocument,
                          pages: e.target.value,
                        })
                      }
                    />
                  </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm="4">
                    All municipalities:
                  </Form.Label>
                  <Col sm="8">
                    <Form.Check
                      type="checkbox"
                      label="Select for all municipalities"
                      onChange={handleMunicipalitiesChange}
                    />
                  </Col>
                </Form.Group>

                {!isAllMunicipality && 
                  <>
                    <Form.Group
                            as={Row}
                            className="mb-3">
                            <Form.Label column sm="4">
                              Latitude:
                            </Form.Label>
                            <Col sm="8">
                              <Form.Control
                                type="text"
                                onChange={(e) =>
                                  setSelectedDocument({
                                    ...selectedDocument,
                                    lat: parseFloat(e.target.value),
                                  })
                                }
                              />
                            </Col>
                    </Form.Group>

                    <Form.Group
                            as={Row}
                            className="mb-3"
                    >
                            <Form.Label column sm="4">
                              Longitude:
                            </Form.Label>
                            <Col sm="8">
                              <Form.Control
                                type="text"
                                onChange={(e) =>
                                  setSelectedDocument({
                                    ...selectedDocument,
                                    lng: parseFloat(e.target.value),
                                  })
                                }
                              />
                            </Col>
                    </Form.Group>
                    </>
                  } 

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
              <MapContainer center={[67.8558, 20.2253]} zoom={12} style={{ height: "850px", width: "100%" }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
              />

                {documents && documents.length > 0 && (
                      documents.map((doc) => (
                        <Marker 
                          key={doc.id} 
                          position={[doc.lat, doc.lng]} 
                          eventHandlers={{
                            click: () => handleMarkerClick(doc)
                          }}
                        />
                      ))
                    )}

              </MapContainer>
        </Col>
      </Row>

      <Row>
        <Col>

            <Offcanvas show={showOffcanvas} onHide={handleCloseOffcanvas}>
                
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Offcanvas</Offcanvas.Title>
                </Offcanvas.Header>

                <Offcanvas.Body>
                  {selectedDoc ? (
                    <>
                      {Object.entries(selectedDoc).map(([key, value]) => (
                        <p key={key}>
                          <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value}
                        </p>
                      ))}
                    </>
                  ) : (
                    <p>Seleziona un marker per visualizzare i dettagli.</p>
                  )}
                </Offcanvas.Body>
            
            </Offcanvas>
        </Col>
      </Row>



    </Container>
  );
}

export default Map;