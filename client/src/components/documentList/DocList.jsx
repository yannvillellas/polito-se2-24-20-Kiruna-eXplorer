import "bootstrap/dist/css/bootstrap.min.css";
import "./DocList.css"
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DocumentAPI from "../../api/documentAPI";
import { Table, Container, Button, Row,Col } from "react-bootstrap";
import { Form, Card } from 'react-bootstrap';
import Select from "react-select";
import PositionAPI from "../../api/positionAPI";

import stakeholderAPI from "../../api/stakeholderAPI"
import scaleAPI from "../../api/scaleAPI"
import documentTypeAPI from "../../api/documentTypeAPI"

/**
 * 
 * Bugs: 
 * - I need polling otherwise i cannot get the updated documents
 * 
 */

function DocList(props) {
  const [documents, setDocuments] = useState([]);

  const [searchedTitle, setSearchedTitle] = useState("");
  const [selectedStakeholder, setSelectedStakeholder] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedScale, setSelectedScale] = useState(null);

  const applyFilters = () => {
    const filteredDocuments = props.documents.filter((doc) => {
      const matchesTitle = doc.title.toLowerCase().includes(searchedTitle.toLowerCase());
      const matchesStakeholder = selectedStakeholder ? doc.stakeholders.includes(selectedStakeholder.value) : true;
      const matchesType = selectedType ? doc.type.includes(selectedType.value) : true;
      const matchesScale = selectedScale ? doc.scale.includes(selectedScale.value) : true;

      return matchesTitle && matchesStakeholder && matchesType && matchesScale;
    });

    setDocuments(filteredDocuments);
  };

  // Effetto per aggiornare i documenti ogni volta che cambia un filtro
  useEffect(() => {
    applyFilters();
  }, [searchedTitle, selectedStakeholder, selectedType, selectedScale]);

  return (
    <>
      <Row className="filters">
        <Col>
        <Form.Group>
          <Form.Label>Search by title</Form.Label>
          <Form.Control
            type="text"
            className="border-dark border-2"
            value={searchedTitle}
            onChange={(e) => setSearchedTitle(e.target.value)}
          />
        </Form.Group>
        </Col>
        <Col>
        <Form.Group>
          <Form.Label>Search by stakeholder</Form.Label>
          <Select
            options={props.stakeholdersOptions}
            isClearable
            placeholder="Select stakeholder"
            onChange={setSelectedStakeholder}
          />
        </Form.Group>
        </Col>
        <Col>
        <Form.Group>
          <Form.Label>Search by type</Form.Label>
          <Select
            options={props.typeOptions}
            isClearable
            placeholder="Select type of document"
            onChange={setSelectedType}
          />
        </Form.Group>
        </Col>
        <Col>
        <Form.Group>
          <Form.Label>Search by scale</Form.Label>
          <Select
            options={props.scaleOptions}
            isClearable
            placeholder="Select scale of document"
            onChange={setSelectedScale}
          />
        </Form.Group>
        </Col>
      </Row>
      <Container fluid >
        {/* Tabella dei documenti */}
        <DocumentTable documents={documents} allPositions={props.positions} />
      </Container>
    </>
  );
}



function DocumentTable(props) {
  const { documents } = props;
  console.log(documents)
  return (
    <Container fluid >
      <div className="custom-table-wrapper-main">
      <div className="table-scroll-main">
        <Table striped bordered hover className="custom-table shadow-sm">
          <thead style={{ backgroundColor: "#007bff", color: "white" }}>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Stakeholders</th>
              <th>Scale</th>
              <th>Issuance Date</th>
              <th>Type</th>
              <th>Connections</th>
              <th>Language</th>
              <th>Pages</th>
              <th>(lat, lng)</th>
              <th>Files</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc, index) => (
              <DocumentRow key={index} document={doc} allPositions={props.allPositions} />
            ))}
          </tbody>
        </Table>
      </div>
      </div>
    </Container>
  );
}

function DocumentRow(props) {
  console.log(props.document.title)
  return (
    <tr >
      <DocumentData document={props.document} allPositions={props.allPositions} />
      <DocumentFile document={props.document} />
    </tr>
  );
}
function DocumentData(props) {
  const [position, setPosition] = useState({ lat: "N/A", lng: "N/A" });


  const [isCompact, setIsCompact] = useState(false);
  //const [truncatedDescription, setTruncatedDescription] = useState(props.document.description ? props.document.description.split(" ").slice(0, 3).join(" ") + "..." : "");

  // Stato per tracciare se la descrizione è espansa
  const [isExpanded, setIsExpanded] = useState(false);

  // Troncamento della descrizione
  const truncatedDescription = props.document.description
    ? (props.document.description.split(" ").length>10? props.document.description.split(" ").slice(0, 10).join(" ") + "..." : props.document.description)
    : "";

  // Descrizione mostrata in base allo stato `isExpanded`
  const displayedDescription = isExpanded
    ? props.document.description
    : truncatedDescription;
  
  // Effetto per tracciare la larghezza della finestra
  useEffect(() => {
    const handleResize = () => {
      setIsCompact(window.innerWidth < 1790); // Cambia la soglia secondo necessità
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Imposta lo stato iniziale

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const fetchPosition = async () => {
      try {
        // const pos = await PositionAPI.listPositions();
        const pos = props.allPositions;

        // Trova la posizione del documento basandosi sul docId di props.document
        const docPos = pos.find((p) => p.docId === props.document.docId);

        if (docPos) {
          setPosition({ lat: docPos.latitude, lng: docPos.longitude });
        } else {
          setPosition({ lat: "N/A", lng: "N/A" });
        }
      } catch (error) {
        console.error("Error fetching position:", error);
      }
    };

    fetchPosition();
  }, [props.document.docId]); // Dipende da props.document.docId

  return (
    <>
      <td>{props.document.title}</td>
      <td onClick={() => setIsExpanded(!isExpanded)} style={{ cursor: "pointer" }}>
        {displayedDescription}
        {props.document.description.split(" ").length > 10 && (
          <span style={{ color: "blue", textDecoration: "underline" }}>
            {isExpanded ? " Reduce" : " Show all"}
          </span>
        )}
      </td>
      <td>{props.document.stakeholders}</td>
      <td>
        {props.document.ASvalue ? props.document.ASvalue : props.document.scale}
      </td>
      <td>{props.document.issuanceDate}</td>
      <td>{props.document.type}</td>
      <td>
        {props.document.connections !== 0 &&

          <Link to={`/documentPage/${props.document.docId}`} style={{ color: "blue", textDecoration: "none" }}>
            {props.document.connections}
          </Link>

        }

        {props.document.connections === 0 && <p>0</p>}


      </td>
      <td>{props.document.language}</td>
      <td>{props.document.pages}</td>
      {position.lat === "N/A" || position.lng === "N/A" ?
        <td>N/A</td>
        :
        <td>{`${parseFloat(position.lat).toFixed(4)}, ${parseFloat(position.lng).toFixed(4)} `}</td>
      }
    </>
  );
}


function DocumentFile(props) {
  const [files, setFiles] = useState([]); // Will be maintein here so that file get taken only when the document appear in the table

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const files = await DocumentAPI.getFiles(props.document.docId);
        console.log("DocumentFile, hot preso i file di docId: ", props.document.docId, files)
        if (files) {
          setFiles(Array.from(files));
        } else {
          setFiles([]);
        }
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };
    fetchFiles();
  }, [props.document.docId]);

  const handleDownload = (file) => {
    const URL = `http://localhost:3001/${file.path.slice(1)}`

    const aTag = document.createElement("a");
    aTag.href = URL
    aTag.setAttribute("download", file.name)
    document.body.appendChild(aTag)
    aTag.click();
    aTag.remove();
  }

  return (

    <td>
      {files.length > 0 ? (
        files.map((f, index) => (
          <div key={f.name || index}>
            <Button onClick={() => handleDownload(f)}>
              <i className="bi bi-file-earmark-text-fill"></i>
            </Button>
            <p>{f.name}</p>
          </div>
        ))
      ) : (
        <p>No files available</p>
      )}
    </td>
  );
}

export default DocList;
