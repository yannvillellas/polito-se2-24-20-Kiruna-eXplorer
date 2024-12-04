import "./map.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState, useNavigate } from "react";
import { Container, Modal, Button, Form } from "react-bootstrap";
import Select from "react-select";
import DocumentAPI from "../../../api/documentAPI";
import ChosenPositionMap from "./ChosenPositionMap";
import 'leaflet/dist/leaflet.css';
import { GiGreekTemple } from "react-icons/gi";
import { Tooltip, OverlayTrigger } from "react-bootstrap"; // Importa Tooltip e OverlayTrigger


import { MapContainer, TileLayer, Marker, Popup, LayersControl, CircleMarker, Polygon, GeoJSON } from 'react-leaflet';

import MarkerClusterGroup from 'react-leaflet-cluster';


import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});
import areaAPI from "../../../api/areaAPI";
import associationAPI from "../../../api/associationAPI";
import geojsonData from "./KirunaMunicipality.json"
import { area } from "@turf/turf";



/** BUGS:
 *  - If i press on a marker and i close the area is still visible untill i pass over that marker again
 * - associationDAO: getAssociations non funziona (es se prendi 59 -> 57 ma 57 non ti ritorna 59, ritorna solo doc_0 che è metà dei colelgamenti) 
 */

function Map(props) {
  const [documents, setDocuments] = useState([]);
  const [documentShown, setDocumentShown] = useState([]);
  const [filterOn, setFilterOn] = useState(false);
  const [isVisualizeAssociation, setIsVisualizeAssociation] = useState(false); // vedi sulla mappa solo i documenti associati ad uno specifico documento

  const [files, setFiles] = useState();
  const [isPositionToModify, setIsPositionToModify] = useState(false);

  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [areas, setAreas] = useState([]);
  const [visibleArea, setVisibleArea] = useState(null);
  const [areaAssociations, setAreaAssociations] = useState([]);


  // Gestisco la modifica della posizione
  const [newLan, setNewLan] = useState(null);
  const [newLng, setNewLng] = useState(null);




  const onFeatureClick = (e) => {
    // Ottieni il layer (poligono, multipoligono, ecc.)
    const layer = e.target;

    // Estrai l'ID o altre informazioni dalla feature
    const areaId = layer.feature.properties.stat_id; // O usa il campo che ti interessa, ad esempio stat_id o un altro campo
    console.log("Clicked area ID:", areaId);
  };

  const geojsonStyle = {
    color: "red",
    weight: 2,
    opacity: 1,
    fillOpacity: 0.1
  };

  const onEachFeature = (feature, layer) => {
    // Aggiungi l'evento di clic alla feature
    layer.on({
      click: onFeatureClick
    });
  };

  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      Show all municipality documents
    </Tooltip>
  );





  const geoJsonStyle = {
    color: 'red',
    weight: 2,
    opacity: 1,
    fillOpacity: 0 // No fill color
  };

  // So that sync with the parent component
  useEffect(() => {
    if (props.documents) {
      setDocuments(props.documents);

    }
  }, [props.documents]);

  /* Non mi si aggiorna in automatico le aree appena aggiunto documento, perciò temporaneamente opto per il polling */
  // Lascio anceh questa perchè così le aree mi vengono caricate subito all'apertura della pagina
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const areas = await areaAPI.listAreas();
        console.log("Sono in Map.jsx, ecco tutte le aree: ", areas);
        const areaAssociations = await areaAPI.listAreaAssociations();
        console.log("Sono in Map.jsx, ecco tutte le areeAssociation: ", areaAssociations);
        setAreas(areas);
        setAreaAssociations(areaAssociations);
      } catch (error) {
        console.error("Error fetching areas:", error);
      }
    }
    fetchAreas();
  }, []);


  // Polling per le aree ( e le areeAssociation)
  useEffect(() => {
    const interval = setInterval(() => {
      const fetchAreas = async () => {
        try {
          const areas = await areaAPI.listAreas();
          const areaAssociations = await areaAPI.listAreaAssociations();
          setAreas(areas);
          setAreaAssociations(areaAssociations);
        } catch (error) {
          console.error("Error fetching areas:", error);
        }
      }
      fetchAreas();
    }, 5000); // Ogni 5 secondi
    return () => clearInterval(interval);
  }, []);



  const closeDocumentModal = () => {
    setShowDocumentModal(false);
    setIsPositionToModify(false);
    setVisibleArea(null); // Nascondi l'area alla chiusura del modal
  };


  /*const handleMarkerClick = async (doc) => {
    setSelectedDoc(doc);
    setShowOffcanvas(true); // Apri OffCanvas

    await handleGetFiles(doc.docId)

  };*/

  // Funzione mdocificata (restituiva errore)
  const handleGetFiles = async (docId) => {
    try {
      const files = await DocumentAPI.getFiles(docId); // Risolvi la Promise
      if (files) {
        setFiles(Array.from(files));
      } else {
        setFiles([]); // Inizializza con array vuoto se non ci sono file
      }
    } catch (error) {
      console.error("Error fetching files:", error);
      setFiles([]); // Fallback in caso di errore
    }
  };


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

  // da fixare tenendo conto di areeAssociation
  const handleMouseOver = (docId) => {
    console.log(`Mouseover on docId: ${docId}`);
    const areaAssociation = areaAssociations.find((a) => a.docId === docId);
    if (areaAssociation && areaAssociation.areaId) {
      setVisibleArea(areaAssociation.areaId); // Imposta l'area visibile
    }
  };

  const handleMouseOut = (docId) => {
    console.log(`Mouseout on docId: ${docId}`);
    setVisibleArea(null); // Rimuove l'area visibile
  };

  const handleModifyPosition = async (newLan, newLng) => {
    console.log("Sono in handleModifyPosition, ecco i parametri:", newLan, newLng);
    if (newLan === null || newLng === null) {
      alert("Latitude and longitude must be filled and should be numbers");
      return;
    } else if (newLan < -90 || newLan > 90 || newLng < -180 || newLng > 180) {
      alert("Latitude must be between -90 and 90, longitude must be between -180 and 180");
      return;
    } 

    console.log("Sono in handleModifyPosition, ecco i parametri:", selectedDoc.docId, newLan, newLng);
    const res = await props.handleModifyPosition(selectedDoc.docId, newLan, newLng);
    closeDocumentModal();
  };

  const handleSavePosition = async (newLan, newLng) => {
    setNewLan(newLan);
    setNewLng(newLng);
  };







  const handleShowOnlyAllMunicipalityDocument = () => {
    setFilterOn(true);
    setDocumentShown(documents.filter(doc => doc.lat === 67.8558 && doc.lng === 20.2253)); // <----------------------------------------------------------------------------------------------------------- Is define here how ALL MUNICIPALITY document is defined 

  }

  const handleShowAllLinkedDocument = async (docId) => {

    if (!docId) { // Se non è stato selezionato nessun documento
      setFilterOn(false);
      return;
    }

    setFilterOn(true);
    //console.log("Sono in MAP.jsx, ecco il docId che mi è stato passato:", docId);
    let assciationToShow = await associationAPI.getAssociationsByDocId(docId);
    //console.log("Sono in MAP.jsx, ecco le associazioni che dovrei vedere:", assciationToShow);
    let docIdToShow = [];
    for (let association of assciationToShow) {
      if (association.doc1 === docId) {
        //docToShow.push(documents.find(doc => doc.docId === association.doc2));
        docIdToShow.push(association.doc2)
      } else {
        docIdToShow.push(association.doc1)
      }
    }
    //console.log("Sono in MAP.jsx, ecco i documenti che dovresti vedere associati al documentId:", docId, docIdToShow);
    const docToShow = documents.filter(doc => docIdToShow.includes(doc.docId));
    //console.log("Sono in MAP.jsx, ecco i documenti che dovresti vedere (ppresi da documents.filter) associati al documentId:", docId, docToShow);
    setDocumentShown(docToShow);
  }



  return (

    <Container fluid className="map-container">
      <MapContainer center={[67.8558, 20.2253]} zoom={12} >
        <LayersControl position="topleft">
          <LayersControl.BaseLayer checked name="Google Satellite">
            <TileLayer
              url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
              attribution='&copy; <a href="https://maps.google.com">Google</a>'
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="OpenStreetMap">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        <MarkerClusterGroup
          showCoverageOnHover={false}
          spiderfyDistanceMultiplier={1} // Opzione per regolare la distanza tra i marker
          zoomToBoundsOnClick={true}   // Abilito lo zoom automatico
        >
          {!filterOn && documents.map((doc, index) => (
            <Marker
              key={index}
              position={[doc.lat, doc.lng]}
              eventHandlers={{
                click: () => handleMarkerClick([doc]),
                mouseover: () => handleMouseOver(doc.docId),
                mouseout: () => handleMouseOut(doc.docId),
              }}
            >
            </Marker>
          ))}

          {filterOn && documentShown.map((doc, index) => (
            <Marker
              key={index}
              position={[doc.lat, doc.lng]}
              eventHandlers={{
                click: () => handleMarkerClick([doc]),
                mouseover: () => handleMouseOver(doc.docId),
                mouseout: () => handleMouseOut(doc.docId),
              }}
            >
            </Marker>
          ))}

        </MarkerClusterGroup>

        {/**Show all the areas by document: */}

        {areas.length > 0 && areas.map((area, index) => {
          if (area.areaId === visibleArea && area.areaType === "polygon") {
            try {
              const positions = JSON.parse(area.coordinates)[0];
              return (
                <Polygon
                  key={index}
                  positions={positions}
                  pathOptions={{ color: 'blue', fillOpacity: 0.5 }}
                  eventHandlers={{
                    click: () => console.log(`Clicked polygon ID: ${area.areaId}`),
                  }}
                />
              );
            } catch (error) {
              console.error(`Error parsing coordinates for area ID: ${area.areaId}`, error);
              return null;
            }
          }
          return null;
        })}


        <GeoJSON
          data={geojsonData}
          style={geojsonStyle}
          onEachFeature={onEachFeature} // Assegna l'evento di clic ad ogni feature
        />

      </MapContainer>

      {/* {
        !filterOn ? (
          <Button
            className="btn-municipality"
            variant="light"
            onClick={handleShowOnlyAllMunicipalityDocument}
            style={{
              backgroundColor: "white",
              border: "1px solid black",
              borderRadius: "50%", // Per fare il bottone circolare
              width: "50px",
              height: "50px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0",
            }}
          >
            <GiGreekTemple style={{ color: "black", fontSize: "24px" }} />
          </Button>
        ) : (
          <Button
            className="btn-municipality"
            variant="light"
            onClick={() => setFilterOn(false)}
            style={{
              backgroundColor: "white",
              border: "1px solid black",
              borderRadius: "50%",
              width: "50px",
              height: "50px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0",
            }}
          >
            <GiGreekTemple style={{ color: "black", fontSize: "24px" }} />
          </Button>
        )
      } */}

      {
        !filterOn ? (
          <OverlayTrigger
            placement="top" // Posizione del tooltip rispetto al bottone
            delay={{ show: 500, hide: 0 }} // Ritardo di 500ms prima di mostrare il tooltip
            overlay={renderTooltip}
          >
            <Button
              className="btn-municipality"
              variant="light"
              onClick={handleShowOnlyAllMunicipalityDocument}
              style={{
                backgroundColor: "white",
                border: "1px solid black",
                borderRadius: "50%",
                width: "50px",
                height: "50px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0",
              }}
            >
              <GiGreekTemple style={{ color: "black", fontSize: "24px" }} />
            </Button>
          </OverlayTrigger>
        ) : (
          <OverlayTrigger
            placement="top"
            delay={{ show: 500, hide: 0 }}
            overlay={renderTooltip}
          >
            <Button
              className="btn-municipality"
              variant="light"
              onClick={() => setFilterOn(false)}
              style={{
                backgroundColor: "white",
                border: "1px solid black",
                borderRadius: "50%",
                width: "50px",
                height: "50px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0",
              }}
            >
              <GiGreekTemple style={{ color: "black", fontSize: "24px" }} />
            </Button>
          </OverlayTrigger>
        )
      }



      <Form className="search-document">
        <Form.Group className="mb-3">
          <Form.Label style={{color: "white"}}>Choose a document so all linked-document will be shown</Form.Label>
          <Select
            options={documents.map((doc) => {
              return { value: doc.docId, label: doc.title }
            })}
            isClearable
            placeholder="Select document"
            required={true}
            onChange={(selectedOption) => handleShowAllLinkedDocument(selectedOption?.value || null)}
          />
        </Form.Group>
      </Form>


      <Modal show={showDocumentModal} onHide={closeDocumentModal} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedDoc ? (
              selectedDoc.title
            ) : (
              <p>Select a marker for visualize the details.</p>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedDoc ? (
            <>
              {Object.entries(selectedDoc).filter(([key]) => key != "docId" && key != "connections" && key != "title" && key != "lat" && key != "lng").map(([key, value]) => (
                key != "ASvalue" || value != null ? <p key={key}>
                  <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value}
                </p>
                  :
                  ""
              ))}
              <div key={"position"}>
                <p>
                  <strong>Position:</strong>{(selectedDoc.lat == 67.8558 && selectedDoc.lng == 20.2253) ? " All municipalities" : `(${selectedDoc.lat.toFixed(4)}, ${selectedDoc.lng.toFixed(4)})`}
                </p>
                {props.isUrbanPlanner && !isPositionToModify && <Button variant="primary" onClick={() => setIsPositionToModify(true)}>
                  Reposition
                </Button>}

                {props.isUrbanPlanner && isPositionToModify && <Button variant="primary" onClick={() => {
                  handleModifyPosition(newLan, newLng);
                  setIsPositionToModify(false)
                }}>
                  Save position
                </Button>}
                {props.isUrbanPlanner && isPositionToModify && <Button variant="primary" onClick={() => {
                  setNewLan(null);
                  setNewLng(null);
                  setIsPositionToModify(false);
                }}>
                  Cancel 
                </Button>}

                {props.isUrbanPlanner && isPositionToModify && <ChosenPositionMap handleSavePosition={handleSavePosition} />}





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