import "./map.css";
import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState } from "react";
import { Routes, Route, Outlet, Navigate, useNavigate } from 'react-router-dom';
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


function Map(props) {
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
 


  const [documents, setDocuments] = useState([]);


  // So that sync with the parent component
  useEffect(() => {
    if (props.documents) {
      console.log("Sono in Map.jsx, ho ricevuto dal db i documenti: ", props.documents);
      setDocuments(props.documents);
    }
  }, [props.documents]);


  const handleCloseOffcanvas = () => {
    setShowOffcanvas(false);
  };

  const handleMarkerClick = (doc) => {
    setSelectedDoc(doc);
    setShowOffcanvas(true); // Apri OffCanvas

  };



  return (
    
    <Container fluid>
      <Row>
        <Col>
          <MapContainer center={[67.8558, 20.2253]} zoom={12} style={{ height: "850px", width: "100%" }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
            />
              {props.documents && props.documents.length > 0 && (
                props.documents.map((doc) => {
                  // Controlla se le coordinate sono valide
                  if (doc.lat && doc.lng) {
                    return (
                      <Marker
                        key={doc.docId}
                        position={[doc.lat, doc.lng]}
                        eventHandlers={{
                          click: () => handleMarkerClick(doc),
                        }}
                      />
                    );
                  }
                  return null; // Non renderizzare il marker se lat o lng sono invalidi
                })
              )}

          </MapContainer>
        </Col>
      </Row>

      <Row>
        <Col>

          <Offcanvas show={showOffcanvas} onHide={handleCloseOffcanvas}>

            <Offcanvas.Header closeButton>
              <Offcanvas.Title>{selectedDoc ? <strong>{selectedDoc.title}</strong> : ""}</Offcanvas.Title>
            </Offcanvas.Header>

            <Offcanvas.Body>
              {selectedDoc ? (
                <>
                  {Object.entries(selectedDoc).filter(([key, value]) => key != "id" && key != "connections" && key != "title" && key != "lat" && key != "lng").map(([key, value]) => (
                    <p key={key}>
                      <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value}
                    </p>
                  ))}
                  <p key="position">
                    <strong>Position:</strong>{(selectedDoc.lat == 67.856348 && selectedDoc.lng == 20.225785) ? " All municipalities" : `(${selectedDoc.lat}, ${selectedDoc.lng})`}
                  </p>
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