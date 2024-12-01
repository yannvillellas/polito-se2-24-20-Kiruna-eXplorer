import "bootstrap/dist/css/bootstrap.min.css";
import "./DocList.css";
import React, { useEffect, useState } from "react";
import DocumentAPI from "../../api/documentAPI";
import { Table, Container, Button } from "react-bootstrap";
import Select from "react-select";
import PositionAPI from "../../api/positionAPI";

import associationAPI from "../../api/associationAPI";


/**
 * 
 * Bugs: 
 * - stakeholder is mispelled in the database (as stackeholders)
 * - I need polling otherwise i cannot get the updated documents
 * 
 */

import { Row, Col, Form } from "react-bootstrap";

function DocList() {
  const [allDocuments, setAllDocuments] = useState([]);
  const [allAssociations, setAllAssociations] = useState([]);
  const [allPositions, setAllPositions] = useState([]);
  const [allFiles, setAllFiles] = useState([]);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const docs = await DocumentAPI.listDocuments();
        setAllDocuments(docs);
        console.log("Sono in DocList, useEffect, ecco i documenti:", docs);

        const allAssociations = await associationAPI.getAllAssociations(); // Fetch all associations
        console.log("Sono in DocList, useEffect, ecco le associazioni:", allAssociations);
        setAllAssociations(allAssociations);

        const allPositions = await PositionAPI.listPositions();
        console.log("Sono in DocList, useEffect, ecco le posizioni:", allPositions);
        setAllPositions(allPositions);

      } catch (error) {
        console.error("Error fetching documents:", error);
      }
    };
    fetchDocuments();
  }, []);


  const handleAddFiles = (docId, files) => {
    console.log("Adding files to document with id:", docId, files);
    setAllFiles([...allFiles, { docId, files }]);
  };


  return (
    <Container fluid className="mt-3">
      <h1 className="mb-4">"Kiruna's Document Library"</h1>

      {/* Barra di Filtri */}
      <Row className="g-3 mb-4 align-items-center bg-light p-3 rounded shadow-sm">
        <Col md={3}>
          <Form.Control
            type="text"
            placeholder="Filter by Title"
            onChange={(e) => handleFilterChange("title", e.target.value)}
          />
        </Col>
        <Col md={3}>
          <Form.Control
            type="text"
            placeholder="Filter by Description"
            onChange={(e) => handleFilterChange("description", e.target.value)}
          />
        </Col>
        <Col md={3}>
          <Select
            options={[...new Set(allDocuments.map((doc) => doc.stackeholders))]
              .filter(Boolean)
              .map((s) => ({ value: s, label: s }))}
            placeholder="Filter by Stakeholder"
            isClearable
            onChange={(option) => handleFilterChange("stakeholder", option ? option.value : "")}
          />
        </Col>
        <Col md={3}>
          <Select
            options={[...new Set(allDocuments.map((doc) => doc.scale))]
              .filter(Boolean)
              .map((scale) => ({ value: scale, label: scale }))}
            placeholder="Filter by Scale"
            isClearable
            onChange={(option) => handleFilterChange("scale", option ? option.value : "")}
          />
        </Col>
        <Col md={3}>
          <Form.Control
            type="date"
            placeholder="Filter by Issuance Date"
            onChange={(e) => handleFilterChange("issuanceDate", e.target.value)}
          />
        </Col>
        <Col md={3}>
          <Select
            options={[...new Set(allDocuments.map((doc) => doc.type))]
              .filter(Boolean)
              .map((type) => ({ value: type, label: type }))}
            placeholder="Filter by Type"
            isClearable
            onChange={(option) => handleFilterChange("type", option ? option.value : "")}
          />
        </Col>

      </Row>



      {/* Tabella dei documenti */}
      <DocumentTable allDocuments={allDocuments} allAssociations={allAssociations} allPositions={allPositions} handleAddFiles={handleAddFiles} allFiles={allFiles} />
    </Container>
  );
}



function DocumentTable(props) {
  const [documentShown, setDocumentShown] = useState([]);

  // Mi serve per fare l'highlight della riga:
  const [highlightedDocId, setHighlightedDocId] = useState(null);
  const [isHighlighted, setIsHighlighted] = useState(false);

  // Altrimenti se viene costruito prima il componente e poi vengono passati i documenti, non si aggiorna
  useEffect(() => {
    setDocumentShown(props.allDocuments);
  }, [props.allDocuments]);


  const handleConnectionsClick = async (docId) => {

    // Devi mettere === null altriment quando docId = 0 passa dentro l'if
    if (docId === null) {

      setHighlightedDocId(null);
      setIsHighlighted(false);

      setDocumentShown(props.allDocuments);
      return;
    }

    // Else (docId !== null)
    try {

      const associations = props.allAssociations.filter(association => association.doc1 === docId || association.doc2 === docId);

      /*
      const associations = await associationAPI.getAssociationsByDocId(docId);
      */

      // Rendo una lista di id dei documenti associati ( enon tutte le associzioni)
      const docIdGetFromAssociations = associations.map(association => {
        if (association.doc1 === docId) {
          return association.doc2;
        } else if (association.doc2 === docId) {
          return association.doc1;
        }
      });


      const documentsFiltered = props.allDocuments.filter(doc => docIdGetFromAssociations.includes(doc.docId));
      const docFromDocId = props.allDocuments.find(doc => doc.docId === docId);

      setHighlightedDocId(docId);
      setIsHighlighted(true);

      setDocumentShown([docFromDocId, ...documentsFiltered]); // Ci saranno errori per i documenti dovrebbe essere qui il problema

    } catch (error) {
      console.error("Error fetching associations:", error);
    }

  };


  return (
    <Table striped bordered hover className="custom-table shadow-sm">
      <thead style={{ backgroundColor: "#007bff", color: "white" }}>
        <tr>
          <th>Title</th>
          <th>Description</th>
          <th>Stakeholders</th>
          <th>Scale</th>
          <th>Issuance Date</th>
          <th>Type</th>
          <th>
            Connections
            <Button variant="link" onClick={() => {
              handleConnectionsClick(null)
            }}>
              <i className="bi bi-x-circle-fill" style={{ backgroundColor: "white", borderRadius: "50%" }}></i>
            </Button>
          </th>
          <th>Language</th>
          <th>Pages</th>
          <th>(lat, lng)</th>
          <th>Files</th>
        </tr>
      </thead>
      <tbody>
        {documentShown.map((doc, index) => (
          <DocumentRow key={index}
            document={doc}
            isHighlighted={highlightedDocId !== null && highlightedDocId === doc.docId}
            handleConnectionsClick={handleConnectionsClick}
            allPositions={props.allPositions}
            handleAddFiles={props.handleAddFiles}
            allFiles={props.allFiles}
          />
        ))}
      </tbody>
    </Table>);
}

function DocumentRow(props) {

  return (
    <tr >
      <DocumentData key={props.index} document={props.document} isHighlighted={props.isHighlighted} handleConnectionsClick={props.handleConnectionsClick} allPositions={props.allPositions} />{/* <------------------------------------ Qui ho aggiunto handleConnectionsClick ma sembra sia qui il problema */}
      <DocumentFile key={props.index} document={props.document} handleAddFiles={props.handleAddFiles} allFiles={props.allFiles} />
    </tr>
  );
}


function DocumentData(props) {
  const [position, setPosition] = useState({ lat: "N/A", lng: "N/A" });


  useEffect(() => {
    const fetchPosition = async () => {
      try {
        const docPos = props.allPositions.find((pos) => pos.docId === props.document.docId);
        setPosition(docPos ? { lat: docPos.latitude, lng: docPos.longitude } : { lat: "N/A", lng: "N/A" });
      } catch (error) {
        console.error("Error fetching position:", error);
      }
    };
    fetchPosition();
  }, [props.document.docId]);


  return (
    <>
      <td className={props.isHighlighted ? "highlighted-row" : ""} >{props.document.title}</td>
      <td>{props.document.description}</td>
      <td>{props.document.stackeholders}</td>
      <td>{props.document.scale}</td>
      <td>{props.document.issuanceDate}</td>
      <td>{props.document.type}</td>
      <td>
        <Button variant="link" onClick={() => {
          props.handleConnectionsClick(props.document.docId)
        }}>
          <i className="bi bi-link-45deg"></i> {props.document.connections}
        </Button>
      </td>
      <td>{props.document.language}</td>
      <td>{props.document.pages}</td>
      <td>{position.lat !== "N/A" && position.lng !== "N/A" ? `${position.lat}, ${position.lng}` : "N/A"}</td>

    </>
  );
}


function DocumentFile(props) {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const files = await DocumentAPI.getFiles(props.document.docId);
        if (files) {
          setFiles(Array.from(files));
          props.handleAddFiles(props.document.docId, files); // altrimenti non sopravvivono al filtro dei documenti
        } else {
          setFiles([]);
          props.handleAddFiles(props.document.docId, files);
        }
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };
    fetchFiles();
  }, [props.document.docId]);

  useEffect(() => {
    const found = props.allFiles.find(f => f.docId === props.document.docId);
    setFiles(found ? found.files : []);
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
