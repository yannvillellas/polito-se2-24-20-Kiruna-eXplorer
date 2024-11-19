import "./map.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import { Container, Modal, Button, Form} from "react-bootstrap";
import Select from "react-select";

import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import ChosenPosition from "../chosenPosition/ChosenPosition";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});


function Map(props) {
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [documents, setDocuments] = useState([]);

  const [isPositionToModify, setIsPositionToModify] = useState(false);
  const [manualLat, setManualLat] = useState(null);
  const [manualLong, setManualLong] = useState(null);

  // So that sync with the parent component
  useEffect(() => {
    if (props.documents) {
      console.log("Sono in Map.jsx, ho ricevuto dal db i documenti: ", props.documents);
      setDocuments(props.documents);
    }
  }, [props.documents]);


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


  const handleModifyPosition = async (newLan, newLng) => {
    
    if(newLan === null || newLng === null){
      alert("Latitude and longitude must be filled and should be numbers");
      return;
    } else if(newLan < -90 || newLan > 90 || newLng < -180 || newLng > 180){
        alert("Latitude must be between -90 and 90, longitude must be between -180 and 180");
        return;
    }
    console.log("Modify position to ", newLan, newLng);
    await props.handleModifyPosition(selectedDoc.docId, newLan, newLng);
    setIsPositionToModify(false);
  };


  return (
    
    <Container fluid>
      <MapContainer center={[67.8558, 20.2253]} zoom={12} style={{ height: '80vh', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        {Object.keys(groupedDocuments).map((key, index) => {
          const [lat, lng] = key.split(',').map(Number);
          if (isNaN(lat) || isNaN(lng)) {
            // console.error(`Invalid coordinates for key ${key}: (${lat}, ${lng})`);
            return null;
          }
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
                    value: doc.docId,
                    label: doc.title,
                  }))}
                  styles={{ menu: (provided) => ({ ...provided, width: "max-content" }) }}
                  defaultValue={{
                    value: selectedDoc.id,
                    label: selectedDoc.title,
                  }}
                  required={true}
                  onChange={(selected) => {
                    const relatedDocs = groupedDocuments[`${selectedDoc.lat},${selectedDoc.lng}`];
                    setSelectedDoc(relatedDocs.find((doc) => doc.docId === selected.value));
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
              {Object.entries(selectedDoc).filter(([key]) => key != "docId" && key != "connections" && key != "title" && key != "lat" && key != "lng").map(([key, value]) => (
                <p key={key}>
                  <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value}
                </p>
              ))}
              <div key={"position"}>
                <p>
                  <strong>Position:</strong>{(selectedDoc.lat == 67.8558 && selectedDoc.lng == 20.2253) ? " All municipalities" : `(${selectedDoc.lat.toFixed(4)}, ${selectedDoc.lng.toFixed(4)})`}
                </p>
                  <Button variant="primary" onClick={() => setIsPositionToModify(true)}>
                    Modify position
                  </Button>
                  {isPositionToModify && <ChosenPosition handleSetPostition={handleModifyPosition} />}
                  {/* isPositionToModify && 
                    <Form.Group>
                      <Form.Group className="mb-3">
                          <Form.Label>Latitude</Form.Label>
                          <Form.Control 
                              type="number" 
                              placeholder="Enter latitude" 
                              step="0.000001" 
                              required={true}
                              onChange={(e) => setManualLat(parseFloat(e.target.value))}
                          />
                      </Form.Group>

                      <Form.Group className="mb-3">
                          <Form.Label>Longitude</Form.Label>
                          <Form.Control 
                              type="number" 
                              placeholder="Enter longitude" 
                              step="0.000001" 
                              required={true}
                              onChange={(e) => setManualLong(parseFloat(e.target.value))}
                          />
                      </Form.Group>

                      <Button variant="primary" onClick={handleModifyPosition} >
                          Submit
                      </Button>
                      <Button variant="primary" onClick={() => setIsPositionToModify(false)}> 
                        Cancel
                      </Button>
                    </Form.Group>
                  
                  */}
              </div>
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