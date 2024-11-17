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
    setSelectedDoc(docs[0]);
    setShowDocumentModal(true);
  };

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
            </Marker>
          );
        })}
      </MapContainer>

      <Modal show={showDocumentModal} onHide={closeDocumentModal} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedDoc ? (
              groupedDocuments[`${selectedDoc.lat},${selectedDoc.lng}`]?.length > 1 ? (
                <Select
                  options={groupedDocuments[`${selectedDoc.lat},${selectedDoc.lng}`]?.map((doc) => ({
                    value: doc.id,
                    label: doc.title,
                  }))}
                  styles={{ menu: (provided) => ({ ...provided, width: "max-content" }) }}
                  isClearable
                  defaultValue={{
                    value: selectedDoc.id,
                    label: selectedDoc.title,
                  }}
                  required={true}
                  onChange={(selected) => {
                    const relatedDocs = groupedDocuments[`${selectedDoc.lat},${selectedDoc.lng}`];
                    setSelectedDoc(relatedDocs.find((doc) => doc.id === selected.value));
                  }}
                />
              ) : (
                <span>{selectedDoc.title}</span>
              )
            ) : (
              <p>Seleziona un marker per visualizzare i dettagli.</p>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedDoc ? (
            <>
              {Object.entries(selectedDoc).filter(([key]) => key != "id" && key != "connections" && key != "title" && key != "lat" && key != "lng").map(([key, value]) => (
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