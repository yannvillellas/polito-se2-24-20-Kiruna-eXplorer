import "./map.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import { Routes, Route, Outlet, Navigate, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Modal} from "react-bootstrap";
import Select from "react-select";

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
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);

  const [isAllMunicipality, setIsAllMunicipality] = useState(false);
  const [isUrbanPlanner, setIsUrbanPlanner] = useState(props.role === "urbanPlanner" ? true : false);
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);

  // So that sync with the parent component
  useEffect(() => {
    if (props.documents) {
      setDocuments(props.documents);
    }
  }, [props.documents]);


  const handleClose = () => {
    setShowModalAdd(false);
    setShowModalLink(false);
  };

  const closeDocumentModal = () => {
    setShowDocumentModal(false);
  };

  const handleMarkerClick = (docs) => {
    if (docs.length == 1) {
      setSelectedDoc(docs[0]);
      setShowDocumentModal(true);
    }

  };

  const handleChoiceClick = (doc) => {
    setSelectedDoc(doc);
    setShowDocumentModal(true);
  }

  const groupedDocuments = documents.reduce((acc, doc) => {
    const key = `${doc.lat},${doc.lng}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(doc);
    return acc;
  }, {});

  return (
    <Container fluid>
      {documents.length > 1 &&
        <Link documents={documents} showModalLink={showModalLink} handleClose={handleClose} />
      }

      <MapContainer center={[67.8558, 20.2253]} zoom={12} style={{ height: '80vh', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        {Object.keys(groupedDocuments).map((key, index) => {
          const [lat, lng] = key.split(',').map(Number);
          const docs = groupedDocuments[key];
          return (
            <Marker
              key={index}
              position={[lat, lng]}
              eventHandlers={{
                click: () => handleMarkerClick(docs)
              }}
            >
              {docs.length > 1 && (
                <Popup>
                  <strong>Choose document to open at this location:</strong>
                  <Select
                    options={
                      docs.map((doc) => ({
                        value: doc.id,
                        label: doc.title,
                      }))
                    }
                    isClearable
                    defaultMenuIsOpen
                    defaultValue={{ value: docs[0].id, label: docs[0].title }}
                    required={true}
                    onChange={(selected) => {
                      setSelectedOption(selected);
                    }}
                  />
                  <Button variant="primary" onClick={() => handleChoiceClick(selectedOption)}>Submit</Button>
                </Popup>
              )}
            </Marker>
          );
        })}
      </MapContainer>

      <Modal show={showDocumentModal} onHide={closeDocumentModal} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>{selectedDoc ? <strong>{selectedDoc.title}</strong> : ""}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
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
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default Map;