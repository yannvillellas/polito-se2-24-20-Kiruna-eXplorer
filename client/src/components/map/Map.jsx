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

  const [documents, setDocuments] = useState(props.documents ? props.documents : []);

    
    useEffect(()=>{
      const fetchDocuments = async () => {
        try {
          const docs = await DocumentAPI.listDocuments();
          const positions = await PositionAPI.listPositions();
          console.log(docs);
          console.log(positions)
          const joined = docs.map((doc) => {
            const docPositions = positions.filter((pos) => pos.docId === doc.docId);
            return {
              ...doc,
              lat: docPositions[0].latitude,
              lng: docPositions[0].longitude
            };
          });
          setDocuments(joined);
        } catch (error) {
          console.error("Failed to fetch documents:", error);
        }
      };
      fetchDocuments();
      console.log("documenti join: ",documents);
    }, [documents])



  const handleClose = () => {
    setShowModalAdd(false);
    setShowModalLink(false);
  };

  const handleCloseOffcanvas = () => {
    setShowOffcanvas(false);
  };

  const handleMarkerClick = (doc) => {
    setSelectedDoc(doc);
    setShowOffcanvas(true); // Apri OffCanvas

  };



  return (
    <Container fluid>
      
      {documents.length > 1 &&
        <Link documents={documents} showModalLink={showModalLink} handleClose={handleClose} />
      }

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