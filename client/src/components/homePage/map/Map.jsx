import "./map.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import { Container, Modal, Button, Form, Tooltip, OverlayTrigger } from "react-bootstrap";
import Select from "react-select";
import DocumentAPI from "../../../api/documentAPI";
import ChosenPositionMap from "./ChosenPositionMap";
import 'leaflet/dist/leaflet.css';
import { GiGreekTemple } from "react-icons/gi";


import { MapContainer, TileLayer, Marker, LayersControl, Polygon, GeoJSON } from 'react-leaflet';

import MarkerClusterGroup from 'react-leaflet-cluster';


import areaAPI from "../../../api/areaAPI";
import associationAPI from "../../../api/associationAPI";
import geojsonData from "../../../data/KirunaMunicipality.json";
import { Icon, DivIcon } from 'leaflet';



/** BUGS:
 *  - If i press on a marker and i close the area is still visible untill i pass over that marker again
 * - associationDAO: getAssociations non funziona (es se prendi 59 -> 57 ma 57 non ti ritorna 59, ritorna solo doc_0 che è metà dei colelgamenti) 
 */

const validDocTypes = [
  "Design document",
  "Informative document",
  "Material effects",
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

  const iconUrl = `icons/${formattedDocType}_${formattedStakeholder}.png`;

  return new Icon({
    iconUrl,
    iconSize: [32, 32],
  });
};

const getCustomIcon = (docType, stakeholders) => {
  const iconUrl = getIcon(docType, stakeholders).options.iconUrl;
  return new DivIcon({
    html: `
      <div style="position: relative; width: 32px; height: 32px;">
        <div style="position: absolute; top: -2.5px; left: -2.5px; width: 37px; height: 37px; border-radius: 50%; background-color: rgba(255, 255, 255, 0.9);"></div>
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

    await handleGetFiles(doc.docId);
    await handleShowTitleAllLinkedDocument(doc.docId);

  };

  const handleConnectionClick = async (docId) => {
    console.log("Sono in handleConnectionClick, ecco il docId: ", docId);
    // prendo l'intero documento:
    const doc = props.documents.filter(doc => doc.docId === docId)[0];
    // chiamo handleMarkerClick passando l'intero documento:
    handleMarkerClick(doc);
  };




  // da fixare tenendo conto di areeAssociation
  const handleMouseOver = (docId) => {
    console.log(`Mouseover on docId: ${docId}`);
    const areaAssociation = props.areaAssociations.find((a) => a.docId === docId);
    if (areaAssociation?.areaId) {
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
    let assciationToShow = await associationAPI.getAssociationsByDocId(docId);
    console.log("Ecco le associazioni: ", assciationToShow);
    let docIdToShow = [];
    for (let association of assciationToShow) {
      if (association.doc1 === docId) {
        docIdToShow.push(association.doc2)
      } else {
        docIdToShow.push(association.doc1)
      }
    }
    const docToShow = props.documents.filter(doc => docIdToShow.includes(doc.docId));
    setDocumentShown(docToShow);
  }

  const handleShowTitleAllLinkedDocument = async (docId) => {

    if (!docId) { // Se non è stato selezionato nessun documento
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
          {!filterOn && props.documents.map((doc) => (
            <Marker
              key={doc.docId}
              position={[doc.lat, doc.lng]}
              icon={getCustomIcon(doc.type, doc.stakeholders)}
              eventHandlers={{
                click: () => handleMarkerClick(doc),
                mouseover: () => handleMouseOver(doc.docId),
                mouseout: () => handleMouseOut(doc.docId),
              }}
            />
          ))}

          {filterOn && documentShown.map((doc) => (
            <Marker
              key={doc.docId}
              position={[doc.lat, doc.lng]}
              icon={getCustomIcon(doc.type, doc.stakeholders)}
              eventHandlers={{
                click: () => handleMarkerClick(doc), // passo intero documento:
                mouseover: () => handleMouseOver(doc.docId),
                mouseout: () => handleMouseOut(doc.docId),
              }}
            />
          ))}

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
              {Object.entries(selectedDoc).filter(([key]) => key != "docId" && key != "connections" && key != "title" && key != "lat" && key != "lng").map(([key, value]) => (
                key != "ASvalue" || value != null ? <p key={key}>
                  <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value}
                </p>
                  :
                  ""
              ))}

              <div key={"connections"}>
                <p>
                  <strong>Connections:</strong>
                </p>
                {selectedDoc.connections != 0 ? linkedDocuments.map((connection) => (
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
                )) : ""}
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

export default CustomMap;