import "./map.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import PropTypes from 'prop-types';
import { Container, Modal, Button, Tooltip, OverlayTrigger, Form } from "react-bootstrap";
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Select from "react-select";

import DocumentAPI from "../../../api/documentAPI";
import ChosenPositionMap from "./ChosenPositionMap";
import 'leaflet/dist/leaflet.css';
import { GiGreekTemple } from "react-icons/gi";


import { MapContainer, TileLayer, Marker, LayersControl, Polygon, GeoJSON, Popup } from 'react-leaflet';

import MarkerClusterGroup from 'react-leaflet-cluster';


import associationAPI from "../../../api/associationAPI";
import geojsonData from "../../../data/KirunaMunicipality.json";
import { Icon, DivIcon } from 'leaflet';
import OffcanvasMarker from "../offcanvasMarker/OffcanvasMarker";
import FilteredSelection from "./filteredSelection/FilteredSelection";


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
  const borderColor = isHighlighted ? '#ce661f' : 'rgba(255, 255, 255, 0.9)';
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

  const [selectedDoc, setSelectedDoc] = useState(null);   // This componet state
  const [visibleArea, setVisibleArea] = useState(null); // This componet state

  // Modifica della stroia 11:
  const [visibleAreas, setVisibleAreas] = useState([]); // This componet state

  // Gestisco la modifica della posizione
  const [newLan, setNewLan] = useState(null);
  const [newLng, setNewLng] = useState(null);

  // managing the evidence of the document
  const [highlightedDocId, setHighlightedDocId] = useState(null);

  // Filtro 
  const [specificFilter, setSpecificFilter] = useState("");

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
    setIsPositionToModify(false);
    setVisibleArea(null); // Nascondi l'area alla chiusura del modal
    setSelectedDoc(null);
  };








  // E' il pulsante per vedere sulal mappa tutti i documenti assocuati a questo: <-------------------------------------------------------------------------------------
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






  const handleModifyPosition = async (newLan, newLng) => {
    if (newLan === null || newLng === null) {
      alert("Latitude and longitude must be filled and should be numbers");
      return;
    } else if (newLan < -90 || newLan > 90 || newLng < -180 || newLng > 180) {
      alert("Latitude must be between -90 and 90, longitude must be between -180 and 180");
      return;
    }

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

  const handleMarkerClick = async (doc) => { // Passo l'intero documento
    setSelectedDoc(doc);

    setVisibleAreas([]); // Rimuove tutte le aree visibili, così ci si concentra sulla singola

  };

  const handleMouseOver = (docId) => {
    console.log(`Mouseover on docId: ${docId}`);
    const areaAssociation = props.areaAssociations.find((a) => a.docId === docId);
    if (areaAssociation?.areaId) {
      setVisibleArea(areaAssociation.areaId); // Imposta l'area visibile
    }



  };

  const handleMouseOut = () => {
    setVisibleArea(null); // Rimuove l'area visibile
  };

  const handleRightClick = (event, docId) => {

    // Mi serve per gestire l'evento custom di leaflet del tasto destro
    const nativeEvent = event.originalEvent;
    nativeEvent.preventDefault(); // Per evitare il menu contestuale predefinito del browser


    const areaAssociation = props.areaAssociations.find((a) => a.docId === docId);
    if (areaAssociation?.areaId) {
      setVisibleAreas([...visibleAreas, areaAssociation.areaId]); // Imposta l'area visibile
    }


    console.log('Tasto destro su:', docId);
    // Aggiungi qui altre azioni (ad esempio, aprire un menu custom)
  };


  useEffect(() => {
    console.log("Visible areas:", visibleAreas);
  }, [visibleAreas]);


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
          contextmenu: (event) => handleRightClick(event, doc.docId)
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


  const handleShowFilteredDocuments = async (documents) => {
    
    // Per convenzione non ci sono documenti.
    if(documents.length === 0){
      setFilterOn(false);
    } else{
      setFilterOn(true);
      setDocumentShown(documents);
    }

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
                  pathOptions={{ color: '#5a83b5', fillOpacity: 0.5 }}
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

        {/**Show all the areas of all documented pressed by teh right clisck: */}
        {props.areas.length > 0 && props.areas.map((area) => {
          // if area.areaId is in visibleAreas then show the areas
          if (visibleAreas.includes(area.areaId) && area.areaType === "polygon") {
            try {
              const positions = JSON.parse(area.coordinates)[0];
              return (
                <Polygon
                  key={area.areaId}
                  positions={positions}
                  pathOptions={{ color: '#ce661f', fillOpacity: 0.5 }}
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

      {/* Bottone del filtro:  */}
      <Button className="filters-documents-map"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.2)", // Sfondo opaco
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)", // Ombra del bottone
          backdropFilter: "blur(20px)", // Effetto di sfocatura sullo sfondo
          border: "2px solid white", // Bordo bianco
          color: "white", // Colore del testo bianco
          display: "flex", // Usa Flexbox
          alignItems: "center", // Centra verticalmente
          justifyContent: "center", // Centra orizzontalmente
          padding: "1px 5px", // Padding del pulsante
        }}
      >
        <i className="bi bi-filter fs-4"></i> {/* Icona centrata */}
      </Button>

      <Dropdown className="filters-documents-map"> {/* Dropdown per il filtro ---------------------------------------------------------------------------------------*/}
        <Dropdown.Toggle variant="success" id="dropdown-basic"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.2)", // Sfondo opaco
            borderRadius: "8px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)", // Ombra del bottone
            backdropFilter: "blur(20px)", // Effetto di sfocatura sullo sfondo
            border: "2px solid white", // Bordo bianco
            color: "white", // Colore del testo bianco
            display: "flex", // Usa Flexbox
            alignItems: "center", // Centra verticalmente
            justifyContent: "center", // Centra orizzontalmente
            padding: "1px 5px", // Padding del pulsante
          }}
        >
          <i className="bi bi-filter fs-4"></i>
          Filter by
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <Dropdown.Item onClick={() => setSpecificFilter("Stakeholders")}>Stakeholders</Dropdown.Item>
          <Dropdown.Item onClick={() => setSpecificFilter("Type")}>Type</Dropdown.Item>
          <Dropdown.Item onClick={() => setSpecificFilter("Title")}>Title</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>


      {/* // Filter on the top that permit you to see only link      */}
      <Form className="search-document"
        style={{
          width: '100%',
          maxWidth: '600px',
          backgroundColor: 'transparent', // Sfondo completamente trasparente
          borderRadius: '10px',
          boxShadow: 'none' // Rimuove l'ombra
        }}

      >
        <FilteredSelection
          documents={props.documents} /*Per avere tutti i titoli dei documenti */

          specificFilter={specificFilter}
          handleShowFilteredDocuments={handleShowFilteredDocuments}
        />

      </Form>




      {/* Modal for the document */}
      {selectedDoc && <OffcanvasMarker
        selectedDoc={selectedDoc}
        documents={props.documents}
        isUrbanPlanner={props.isUrbanPlanner}
        setErrorMsg={props.setErrorMsg}
        closeDocumentModal={closeDocumentModal}
        handleForceRefresh={props.handleForceRefresh}

        handleChangeMapViewBasedOnDocId={props.handleChangeMapViewBasedOnDocId}
        handleShowAllLinkedDocument={handleShowAllLinkedDocument}
        allAssociations={props.allAssociations}
        setAllAssociations={props.setAllAssociations}
      />}
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
  setErrorMsg: PropTypes.func.isRequired, 
};


export default CustomMap;