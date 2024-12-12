import "./map.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import PropTypes from 'prop-types';
import { Container, Modal, Button, Tooltip, OverlayTrigger } from "react-bootstrap";
import DocumentAPI from "../../../api/documentAPI";
import ChosenPositionMap from "./ChosenPositionMap";
import 'leaflet/dist/leaflet.css';
import { GiGreekTemple } from "react-icons/gi";


import { MapContainer, TileLayer, Marker, LayersControl, Polygon, GeoJSON, Popup } from 'react-leaflet';

import MarkerClusterGroup from 'react-leaflet-cluster';


import associationAPI from "../../../api/associationAPI";
import geojsonData from "../../../data/KirunaMunicipality.json";
import { Icon, DivIcon } from 'leaflet';


const validDocTypes = [
  "Design document",
  "Informative document",
  "Material effect",
  "Prescriptive document",
  "Technical document"
];

const validStakeholders = [
  "LKAB",
  "Municipality",
  "Regional authority",
  "Architecture firms",
  "Citizens"
];

const getIcon = (docType, stakeholders) => {
  const formattedDocType = validDocTypes.includes(docType)
    ? docType.toLowerCase().replace(' ', '-')
    : "other-document";

  const formattedStakeholder = validStakeholders.includes(stakeholders)
    ? stakeholders.toLowerCase().replace(' ', '-')
    : "others";

  const iconUrl = `/icons/${formattedDocType}_${formattedStakeholder}.png`;

  return new Icon({
    iconUrl,
    iconSize: [32, 32],
  });
};

const getCustomIcon = (docType, stakeholders, isHighlighted) => {
  const iconUrl = getIcon(docType, stakeholders).options.iconUrl;
  const borderColor = isHighlighted ? 'red' : 'rgba(255, 255, 255, 0.9)';
  return new DivIcon({
    html: `
      <div style="position: relative; width: 32px; height: 32px;">
        <div style="position: absolute; top: -2.5px; left: -2.5px; width: 37px; height: 37px; border-radius: 50%; background-color: ${borderColor};"></div>
        <img src="${iconUrl}" style="position: absolute; top: 0; left: 0; width: 32px; height: 32px;" />
      </div>
    `,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

function CustomMap(props) {
  const [documentShown, setDocumentShown] = useState([]); // This componet state
  const [filterOn, setFilterOn] = useState(false); // This componet state

  const [isPositionToModify, setIsPositionToModify] = useState(false); // This componet state

  const [showDocumentModal, setShowDocumentModal] = useState(false); // This componet state
  const [selectedDoc, setSelectedDoc] = useState(null);   // This componet state
  const [visibleArea, setVisibleArea] = useState(null); // This componet state

  const [files, setFiles] = useState(); // Got called here when a user press on the document (is bettere if is here? I think yes bc otherwise every time you have add/modify a new document in APP.jsx )
  // Manage connectionsList of the document with DOC_ID
  const [linkedDocuments, setLinkedDocuments] = useState([]); // Call API (getAssociationBy_DOC_ID), but here is easier (same concept of files) where each element will have structure: {aId: 1, title: "title", type: "type", doc1: doc1Id, doc2: doc2Id}

  // Gestisco la modifica della posizione
  const [newLan, setNewLan] = useState(null);
  const [newLng, setNewLng] = useState(null);


  // managing the evidence of the document
  const [highlightedDocId, setHighlightedDocId] = useState(null);

  // Se ho il parametro in /mapPage/:docId mi prendo il documento e mi apro direttamtne il modal:
  useEffect(() => {
    if (props.highlightedDocId) {

      // handleConnectionClick(Number(props.openMarkerId)); // This will open the modal with the document and all the linked document
      // For teh evidence of the document
      setHighlightedDocId(Number(props.highlightedDocId));
    }
  }, [props.highlightedDocId, props.documents]);



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
    fillOpacity: 0,
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




  const closeDocumentModal = () => {
    setShowDocumentModal(false);
    setIsPositionToModify(false);
    setVisibleArea(null); // Nascondi l'area alla chiusura del modal
  };

  // Funzione mdocificata (restituiva errore)
  const handleGetFiles = async (docId) => {
    try {
      const files = await DocumentAPI.getFiles(docId); // Risolvi la Promise
      console.log("Ecco i files: ", files);
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



  const handleMarkerClick = async (doc) => { // Passo l'intero documento
    setSelectedDoc(doc);
    setShowDocumentModal(true);

    console.log("Sono in handleMarkerClick, ecco il doc: ", doc);


    try {
      await handleShowTitleAllLinkedDocument(doc.docId);
      console.log("Sono in handleMarkerClick, sono tornato da handleShowTitleAllLinkedDocument");
    } catch (error) {
      console.error("Error fetching linked documents:", error);
    }

    // Questo codice con i files è problematico: quando non ci sono files
    try {
      await handleGetFiles(doc.docId);
      console.log("Sono in handleMarkerClick, sono tornato da handleGetFiles");
    } catch (error) {
      console.error("Error fetching files:", error);
    }

  };

  const handleConnectionClick = async (docId) => {
    props.handleChangeMapViewBasedOnDocId(docId);
    console.log("Sono in handleConnectionClick, ecco il docId: ", docId);
    // prendo l'intero documento:
    // const doc = props.documents.filter(doc => doc.docId === docId)[0];
    // chiamo handleMarkerClick passando l'intero documento:
    // handleMarkerClick(doc);
  };




  // da fixare tenendo conto di areeAssociation
  const handleMouseOver = (docId) => {
    console.log(`Mouseover on docId: ${docId}`);
    const areaAssociation = props.areaAssociations.find((a) => a.docId === docId);
    if (areaAssociation?.areaId) {
      setVisibleArea(areaAssociation.areaId); // Imposta l'area visibile
    }

    /* FOR the evidence of the document
    if (docId === highlightedDocId) {
      setHighlightedDocId(null); // Rimuovi l'evidenziazione quando il mouse ci passa
    }
      */

  };

  const handleMouseOut = () => {
    setVisibleArea(null); // Rimuove l'area visibile

    /* FOR the evidence of the document
    if (docId === highlightedDocId) {
      setHighlightedDocId(null); // Rimuovi l'evidenziazione quando il mouse esce
    }
    */

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
    await DocumentAPI.updateDocumentPosition(selectedDoc.docId, newLan, newLng);
    closeDocumentModal();
  };

  const handleSavePosition = async (newLan, newLng) => {
    setNewLan(newLan);
    setNewLng(newLng);
  };


  const handleShowOnlyAllMunicipalityDocument = () => {
    setFilterOn(true);
    setDocumentShown(props.documents.filter(doc => doc.lat === 67.8558 && doc.lng === 20.2253)); // <----------------------------------------------------------------------------------------------------------- Is define here how ALL MUNICIPALITY document is defined 
  }


  const handleShowAllLinkedDocument = async (docId) => {
    if (!docId) { // Se non è stato selezionato nessun documento
      setFilterOn(false);
      return;
    }

    setFilterOn(true);
    let associationToShow = await associationAPI.getAssociationsByDocId(docId);
    let docIdToShow = [];
    for (let association of associationToShow) {
      if (association.doc1 === docId) {
        docIdToShow.push(association.doc2);
      } else {
        docIdToShow.push(association.doc1);
      }
    }
    const docToShow = props.documents.filter(doc => docIdToShow.includes(doc.docId));
    setDocumentShown(docToShow);
  }

  const handleShowTitleAllLinkedDocument = async (docId) => {

    if (!docId) { // Se non è stato selezionato nessun documento
      console.log("Sono in handleShowTitleAllLinkedDocument, non c'è nessun docId");
      setLinkedDocuments([]);
      return;
    }
    console.log("Sono in handleShowTitleAllLinkedDocument, ecco il docId: ", docId);
    let assciationToShow = await associationAPI.getAssociationsByDocId(docId);
    console.log("Sono in MAP.jsx ecco le associationToSHow che ho rievuto: ", assciationToShow);
    console.log("Ecco i linksType passsati come props: ", props.linksType);
    let titleList = [];
    let title = "";
    for (let association of assciationToShow) {
      if (association.doc1 === docId) {
        // se il titolo non è già presente in titleList aggiuggilo
        title = props.documents.filter(doc => doc.docId === association.doc2)[0].title;
        if (!titleList.some(item => item.docTitle === title)) {
          titleList.push({ docTitle: title, otherDocumentId: association.doc2 });
        }
      } else {
        title = props.documents.filter(doc => doc.docId === association.doc1)[0].title;
        if (!titleList.some(item => item.docTitle === title)) {
          titleList.push({ docTitle: title, otherDocumentId: association.doc1 });
        }
      }
    }
    console.log("Ecco i documenti associati: ", titleList);
    setLinkedDocuments(titleList);
  }

  useEffect(() => {
    console.log("Sono in useEffect di MAP.jsx, ho settato i linked document: ", linkedDocuments);
  }, [linkedDocuments]);

  const bounds = [[67.3062, 17.8498], [69.1099, 23.3367]];

  const renderMarkers = (documents) => {
    return documents.map((doc) => (
        <Marker
            key={doc.docId}
            position={[doc.lat, doc.lng]}
            icon={getCustomIcon(doc.type, doc.stakeholders, doc.docId === highlightedDocId)}
            eventHandlers={{
                click: () => handleMarkerClick(doc),
                mouseover: () => handleMouseOver(doc.docId),
                mouseout: () => handleMouseOut(),
            }}
            ref={(markerRef) => {
                if (markerRef) {
                    markerRef.on('mouseover', () => markerRef.openPopup());
                    markerRef.on('mouseout', () => markerRef.closePopup());
                }
            }}
        >
            <Popup>
                <strong>{doc.title}</strong>
            </Popup>
        </Marker>
    ));
};

  return (

    <Container fluid className="map-container">
      <MapContainer 
        center={props.mapCenter} 
        zoom={props.zoom} 
        maxBounds={bounds} 
        minZoom={7}
      >
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
          {renderMarkers(filterOn ? documentShown : props.documents)}
        </MarkerClusterGroup>

        {/**Show all the areas by document: */}

        {props.areas.length > 0 && props.areas.map((area) => {
          if (area.areaId === visibleArea && area.areaType === "polygon") {
            try {
              const positions = JSON.parse(area.coordinates)[0];
              return (
                <Polygon
                  key={area.areaId}
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


      {/*} // Filter on the top that permit you to see only link
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
      */}


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
              {Object.entries(selectedDoc)
                .filter(([key, value]) =>
                  key !== "docId" &&
                  key !== "connections" &&
                  key !== "title" &&
                  key !== "lat" &&
                  key !== "lng" &&
                  value !== null &&
                  value !== undefined &&
                  value !== "" // esclude stringhe vuote
                )
                .map(([key, value]) => (
                  <p key={key}>
                    <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value}
                  </p>
                ))}

              <div key={"connections"}>
                <p>
                  <strong>Connections:</strong>
                </p>
                {linkedDocuments.length > 0 ? linkedDocuments.map((connection) => (
                  <p
                    key={connection.docTitle}
                    style={{
                      marginBottom: '8px',  // Spazio tra i paragrafi
                    }}
                  >
                    <span
                      onClick={() => handleConnectionClick(connection.otherDocumentId)}
                      style={{
                        color: 'blue',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                      }}
                    >
                      {connection.docTitle}
                    </span>
                  </p>
                )) : "This file has no connections"}
              </div>


              <div key={"position"}>
                <p>
                  <strong>Position:</strong>{(selectedDoc.lat == 67.8558 && selectedDoc.lng == 20.2253) ? " All municipalities" : `(${selectedDoc.lat.toFixed(4)}, ${selectedDoc.lng.toFixed(4)})`}
                </p>
                {props.isUrbanPlanner && !isPositionToModify && <Button variant="primary" onClick={() => setIsPositionToModify(true)}>
                  Modify Position
                </Button>}

                {props.isUrbanPlanner && <Button variant="primary">
                  Modify
                </Button>}

                {props.isUrbanPlanner && <Button variant="primary" onClick={() => {
                  handleShowAllLinkedDocument(selectedDoc.docId)
                  closeDocumentModal();
                }}>
                  See all related document on the map
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
                {(files && files.length > 0) ? files.map((f, index) => (
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

CustomMap.propTypes = {
  highlightedDocId: PropTypes.number,
  documents: PropTypes.array.isRequired,
  mapCenter: PropTypes.array.isRequired,
  zoom: PropTypes.number.isRequired,
  areaAssociations: PropTypes.array.isRequired,
  areas: PropTypes.array.isRequired,
  handleChangeMapViewBasedOnDocId: PropTypes.func.isRequired,
  isUrbanPlanner: PropTypes.bool.isRequired,
  linksType: PropTypes.array.isRequired,
};

export default CustomMap;