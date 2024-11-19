import "./map.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import { Container, Modal, Button, Form} from "react-bootstrap";
import Select from "react-select";

import DocumentAPI from "../../api/documentAPI";

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

  const [files, setFiles] = useState();
  const navigate = useNavigate();

  const [isPositionToModify, setIsPositionToModify] = useState(false);
  const [manualLat, setManualLat] = useState(null);
  const [manualLong, setManualLong] = useState(null);


  // So that sync with the parent component
  useEffect(() => {
    if (props.documents) {
      //console.log("Sono in Map.jsx, ho ricevuto dal db i documenti: ", props.documents);
      setDocuments(props.documents);
    }
  }, [props.documents]);


  const closeDocumentModal = () => {
    setShowDocumentModal(false);
  };


  /*const handleMarkerClick = async (doc) => {
    setSelectedDoc(doc);
    setShowOffcanvas(true); // Apri OffCanvas

    await handleGetFiles(doc.docId)

  };*/

  const handleGetFiles = async (docId) => {
    console.log("prendo i file di: ", docId)
    const files = await DocumentAPI.getFiles(docId);
    console.log("ricevo: ", files)
    if(files){
      setFiles(Array.from(files))
    }else{
      setFiles()
    }
    
  }

  const handleDownload = (file) => {
    const URL=`http://localhost:3001/${file.path.slice(1)}`
    console.log(URL)
    
    const aTag = document.createElement("a");
    aTag.href=URL
    aTag.setAttribute("download",file.name)
    document.body.appendChild(aTag)
    aTag.click();
    aTag.remove();
  }

  const handleMarkerClick = async (docs) => {
    setSelectedDoc(docs[0]);
    setShowDocumentModal(true);
    
    await handleGetFiles(doc.docId)
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

    <Container fluid className="map-container">

      {/*<Row>
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
                        click: async() => {await handleMarkerClick(doc)},
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
                  {Object.entries(selectedDoc).filter(([key, value]) => key != "docId" && key != "connections" && key != "title" && key != "lat" && key != "lng").map(([key, value]) => (
                    <p key={key}>
                      <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value}
                    </p>
                  ))}
                  <p key="position">
                    <strong>Position:</strong>{(selectedDoc.lat == 67.856348 && selectedDoc.lng == 20.225785) ? " All municipalities" : `(${selectedDoc.lat}, ${selectedDoc.lng})`}
                  </p>
                  {files ? files.map(f => {
                    return (<>
                      <Button onClick={()=>handleDownload(f)}><i className="bi bi-file-earmark-text-fill"></i></Button>
                      <p>{f.name}</p>
                    </>)
                  }) : ""}
                </>*/ }

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
              {files ? files.map(f => {
                    return (<>
                      <Button onClick={()=>handleDownload(f)}><i className="bi bi-file-earmark-text-fill"></i></Button>
                      <p>{f.name}</p>
                    </>)
               }) : ""}
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