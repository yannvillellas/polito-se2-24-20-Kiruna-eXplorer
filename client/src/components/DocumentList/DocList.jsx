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
  const [filteredDocs, setFilteredDocs] = useState([]);


  const [filters, setFilters] = useState({
    title: "",
    description: "",
    stakeholder: "",
    scale: "",
    issuanceDate: "",
    type: "",
    connections: "",
  });

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const docs = await DocumentAPI.listDocuments();
        setAllDocuments(docs);
        console.log("Sono in DocList, ecco i documenti:", docs);
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
    };
    fetchDocuments();
  }, []);

  return (
    <Container fluid className="mt-3">
      <h1 className="mb-4">"Kiruna's Document Library"</h1>

      {/* Tabella dei documenti */}
      <DocumentTable allDocuments={allDocuments} />
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
    console.log("Sono in DocumentTable, useEffect, ecco i documenti che mi sono stati passati:", props.allDocuments);
  }, [props.allDocuments]);


  const handleConnectionsClick = async (docId) => {
    console.log("Sono in DocList.jsx, handleConnectionsClick,ecco il docId che mi è stato passato:", docId);

    // Devi mettere === null altriment quando docId = 0 passa dentro l'if
    if (docId === null) {

      setHighlightedDocId(null);
      setIsHighlighted(false);

      setDocumentShown(props.allDocuments);
      console.log("Sono in DOcList, handleConnectionsClick, No docId: ", props.allDocuments);
      return;
    }

    // Else (docId !== null)
    try {
      console.log("Sono in DOcList, handleConnectionsClick, ecco  TUTTI i documenti: ", props.allDocuments);
      const associations = await associationAPI.getAssociationsByDocId(docId);
      console.log("Sono in DOcList, handleConnectionsClick, ecco le associazioni:", associations);
      const docIdGetFromAssociations = associations.map(association => {
        if (association.doc1 === docId) {
          return association.doc2;
        } else if (association.doc2 === docId) {
          return association.doc1;
        }
      });

      console.log("Sono in DOcList, handleConnectionsClick, ecco i docIdGetFromAssociations:", docIdGetFromAssociations);
      const documentsFiltered = props.allDocuments.filter(doc => docIdGetFromAssociations.includes(doc.docId));
      const docFromDocId = props.allDocuments.find(doc => doc.docId === docId);

      setHighlightedDocId(docId);
      setIsHighlighted(true);

      console.log("Sono in DOcList, handleConnectionsClick, ecco i documenti filtrati:", documentsFiltered);
      setDocumentShown([docFromDocId, ...documentsFiltered]); // Ci saranno errori per i documenti dovrebbe essere qui il problema
      console.log("Sono in DOcList, handleConnectionsClick, ecco i documenti mostrati:", documentShown);

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
              console.log("Sono in DocumentTable, ho cliccato su connections, ecco il documetns", props.allDocuments);
            }}>
              <i className="bi bi-x-circle"></i>
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
            isHighlighted={ highlightedDocId ? highlightedDocId === doc.docId : false }
            handleConnectionsClick={handleConnectionsClick}
          />
        ))}
      </tbody>
    </Table>);
}

function DocumentRow(props) {

  return (
    <tr >
      <DocumentData key={props.index} document={props.document} isHighlighted={props.isHighlighted} handleConnectionsClick={props.handleConnectionsClick} />{/* <------------------------------------ Qui ho aggiunto handleConnectionsClick ma sembra sia qui il problema */}
      <DocumentFile key={props.index} document={props.document} />
    </tr>
  );
}


function DocumentData(props) {
  const [position, setPosition] = useState({ lat: "N/A", lng: "N/A" });

  useEffect(() => {
    const fetchPosition = async () => {
      try {
        const positions = await PositionAPI.listPositions();
        const docPos = positions.find((pos) => pos.docId === props.document.docId);
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
        <td>{props.document.stakeholders}</td>
        <td>{props.document.scale}</td>
        <td>{props.document.issuanceDate}</td>
        <td>{props.document.type}</td>
        <td>
          <Button variant="link" onClick={() => {
            console.log("Sono in DocumentData, ho cliccato su connections, ecco il document.docId:", props.document.docId);
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
