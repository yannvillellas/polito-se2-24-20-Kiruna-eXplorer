import "./map.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState, useNavigate } from "react";
import { Container, Modal, Button, Form } from "react-bootstrap";
import Select from "react-select";
import DocumentAPI from "../../../api/documentAPI";
import ChosenPosition from "../chosenPosition/ChosenPosition";
import 'leaflet/dist/leaflet.css';

import { MapContainer, TileLayer, Marker, Popup, LayersControl, CircleMarker, Polygon, GeoJSON } from 'react-leaflet';

import MarkerClusterGroup from 'react-leaflet-cluster';
import kirunaGeoJson from "../../../data/KirunaMunicipality.json";

import areaAPI from "../../../api/areaAPI";
import associationAPI from "../../../api/associationAPI";
import geojsonData from "./KirunaMunicipality.json"
import { area } from "@turf/turf";
import { Icon } from 'leaflet';



/** BUGS:
 *  - If i press on a marker and i close the area is still visible untill i pass over that marker again
 * - associationDAO: getAssociations non funziona (es se prendi 59 -> 57 ma 57 non ti ritorna 59, ritorna solo doc_0 che è metà dei colelgamenti) 
 */


const designIcon = new Icon({
  iconUrl: "icons/design.png",
  iconSize: [25, 25],
});

const informativeIcon = new Icon({
  iconUrl: "icons/informative.png",
  iconSize: [25, 25],
});

const prescriptiveIcon = new Icon({
  iconUrl: "icons/prescriptive.png",
  iconSize: [25, 25],
});

const technicalIcon = new Icon({
  iconUrl: "icons/technical.png",
  iconSize: [25, 25],
});

const otherIcon = new Icon({
  iconUrl: "icons/other.png",
});


const getIconByDocType = (docType) => {
  switch (docType) {
    case 'Design document':
      return designIcon;
    case 'Informative Document':
      return informativeIcon;
    case 'Prescriptive document':
      return prescriptiveIcon;
    case 'Technical document':
      return technicalIcon;
    default:
      return otherIcon;
  }
};

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
  const [visibleAreas, setVisibleAreas] = useState([]);
  const [areaAssociations, setAreaAssociations] = useState([]);

  const onFeatureClick = (e) => {
    // Ottieni il layer (poligono, multipoligono, ecc.)
    const layer = e.target;

    // Estrai l'ID o altre informazioni dalla feature
    const areaId = layer.feature.properties.stat_id; // O usa il campo che ti interessa, ad esempio stat_id o un altro campo
    console.log("Clicked area ID:", areaId);
  };

  const geojsonStyle = {
    color: "white",
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
    console.log(`Mouseover on docId: ${docId}`);  // Aggiungi un log per monitorare
    // Imposto la visibilità dell'area tramite areaAssociations
    const areaAssociation = areaAssociations.find((a) => a.docId === docId);
    if (!areaAssociation) {
      return;
    }

    const areaId = areaAssociation.areaId;
    if (areaId) {
      setVisibleAreas((prevState) => {
        if (prevState.includes(areaId)) {
          return prevState;
        } else {
          return [...prevState, areaId];
        }
      });
    }

  };

  const handleMouseOut = (docId) => {
    console.log(`Mouseout on docId: ${docId}`);  // Aggiungi un log per monitorare
    // rimuovo areaId da visibleAreas
    const areaAssociation = areaAssociations.find((a) => a.docId === docId);
    if (!areaAssociation) {
      return;
    }

    const areaId = areaAssociation.areaId;
    if (areaId) {
      setVisibleAreas((prevState) => {
        return prevState.filter((a) => a !== areaId);
      });
    }
  };

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

  const handleShowOnlyAllMunicipalityDocument = () => {
    setFilterOn(true);
    setDocumentShown(documents.filter(doc => doc.lat === 67.8558 && doc.lng === 20.2253)); // <----------------------------------------------------------------------------------------------------------- Is define here how ALL MUNICIPALITY document is defined 

  }

  const handleShowAllLinkedDocument = async (docId) => {

    if(!docId) { // Se non è stato selezionato nessun documento
      setFilterOn(false);
      return;
    }

    setFilterOn(true);
    console.log("Sono in MAP.jsx, ecco il docId che mi è stato passato:", docId.value);
    let assciationToShow = await associationAPI.getAssociationsByDocId(docId);
    console.log("Sono in MAP.jsx, ecco le associazioni che dovrei vedere:", assciationToShow);
    let docToShow = [];
    for (let association of assciationToShow) {
      if (association.doc1 === docId) {
        docToShow.push(documents.find(doc => doc.docId === association.doc2));
      }
    }
    console.log("Sono in MAP.jsx, ecco i documenti che dovresti vedere associati al documentId:", docId, docToShow);
    docToShow = documents.filter(doc => docToShow.includes(doc));
    console.log("Sono in MAP.jsx, ecco i documenti che dovresti vedere (ppresi da documents.filter) associati al documentId:", docId, docToShow);
    setDocumentShown(docToShow);
  }



  return (

    <Container fluid className="map-container">
      <MapContainer center={[67.8558, 20.2253]} zoom={12} style={{ height: '80vh', width: '100%' }}>
        <LayersControl position="topright">
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

        <GeoJSON data={kirunaGeoJson} style={{
          color: 'red',
          weight: 2,
          opacity: 1,
          fillOpacity: 0
        }}
        />

        <MarkerClusterGroup
          showCoverageOnHover={false}
        >
          {!filterOn && documents.map((doc, index) => (
            <Marker
              key={index}
              position={[doc.lat, doc.lng]}
              icon={getIconByDocType(doc.type)}
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
              icon={getIconByDocType(doc.type)}
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
          if (visibleAreas.includes(area.areaId) && area.areaType === "polygon") {
            try {
              const positions = JSON.parse(area.coordinates)[0]; // Parsing delle coordinate
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

      {!filterOn &&
        <Button variant="primary" onClick={handleShowOnlyAllMunicipalityDocument}>Show all municipality documents</Button>
      }

      {filterOn &&
        <Button variant="primary" onClick={() => setFilterOn(false)}>Show all documents</Button>
      }

      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Choose a document so all linked-document will be shown</Form.Label>
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