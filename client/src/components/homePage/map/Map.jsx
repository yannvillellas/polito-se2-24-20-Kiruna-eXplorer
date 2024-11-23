import "./map.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState, useNavigate } from "react";
import { Container, Modal, Button, Form } from "react-bootstrap";
import Select from "react-select";
import DocumentAPI from "../../../api/documentAPI";
import ChosenPosition from "../chosenPosition/ChosenPosition";
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
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);



  const [documents, setDocuments] = useState([]);

  const [files, setFiles] = useState();
  const [isPositionToModify, setIsPositionToModify] = useState(false);
  const [manualLat, setManualLat] = useState(null);
  const [manualLong, setManualLong] = useState(null);


  // So that sync with the parent component
  useEffect(() => {
    if (props.documents) {
      setDocuments(props.documents);
    }
  }, [props.documents]);


  const closeDocumentModal = () => {
    setShowDocumentModal(false);
    setIsPositionToModify(false);
  };


  /*const handleMarkerClick = async (doc) => {
    setSelectedDoc(doc);
    setShowOffcanvas(true); // Apri OffCanvas

    await handleGetFiles(doc.docId)

  };*/

  const handleGetFiles = async (docId) => {
    const files = await DocumentAPI.getFiles(docId);
    if (files) {
      setFiles(Array.from(files))
    } else {
      setFiles()
    }

  }

  const handleDownload = (file) => {
    const URL = `http://localhost:3001/${file.path.slice(1)}`

    const aTag = document.createElement("a");
    aTag.href = URL
    aTag.setAttribute("download", file.name)
    document.body.appendChild(aTag)
    aTag.click();
    aTag.remove();
  }

  const handleMarkerClick = async (docs) => {
    setSelectedDoc(docs[0]);
    setShowDocumentModal(true);

    await handleGetFiles(docs[0].docId)
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

    if (newLan === null || newLng === null) {
      alert("Latitude and longitude must be filled and should be numbers");
      return;
    } else if (newLan < -90 || newLan > 90 || newLng < -180 || newLng > 180) {
      alert("Latitude must be between -90 and 90, longitude must be between -180 and 180");
      return;
    }
    await props.handleModifyPosition(selectedDoc.docId, newLan, newLng);
    closeDocumentModal();
  };



  return (

    <Container fluid className="map-container">
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
                    handleGetFiles(selected.value)
                  }}
                />
              ) : (
                <span>{selectedDoc.title}</span>
              )
            ) : (
              <p>Select a marker for visualize the details.</p>
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
                {props.isUrbanPlanner && <Button variant="primary" onClick={() => setIsPositionToModify(true)}>
                  Reposition
                </Button>}
                {isPositionToModify && <ChosenPosition handleSetPostition={handleModifyPosition} />}
              </div>
              <div className="download-buttons-container">
                {files ? files.map((f, index) => (
                  <div key={f.name || index} className="download-btns">
                    <Button onClick={() => handleDownload(f)} className="files">
                      <i className="bi bi-file-earmark-text-fill"></i>
                    </Button>
                    <p className="file-name">{f.name}</p>
                  </div>
                )) : ""}
              </div>
            </>
          ) : (
            <p>Select a marker for visualize the details.</p>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default Map;