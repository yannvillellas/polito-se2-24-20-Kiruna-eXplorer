import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DocumentAPI from "../../api/documentAPI";
import { Table, Container, Button, Row, Col } from "react-bootstrap";
import { Form, Card } from 'react-bootstrap';
import Select from "react-select";
import PositionAPI from "../../api/positionAPI";

import stakeholderAPI from "../../api/stakeholderAPI"
import scaleAPI from "../../api/scaleAPI"
import documentTypeAPI from "../../api/documentTypeAPI"
import associationAPI from "../../api/associationAPI"


// va importata da: client\src\components\assets\IconaModificaPosizione.png
import IconaSearch from "../assets/IconaSearch.png";
/**<img src={IconaModificaPosizione} alt="search" width="90" height="90" /> */

/**
 * 
 * Bugs: 
 * - I need polling otherwise i cannot get the updated documents
 * 
 */

function DocList(props) {

  const [documents, setDocuments] = useState([]);
  const [allAssociations, setAllAssociations] = useState([]);

  const [searchedTitle, setSearchedTitle] = useState("");
  const [selectedStakeholder, setSelectedStakeholder] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedScale, setSelectedScale] = useState(null);
  const [selectedDescription, setSelectedDescription] = useState("");

  const applyFilters = () => {
    const filteredDocuments = props.documents.filter((doc) => {
      const matchesTitle = doc.title.toLowerCase().includes(searchedTitle.toLowerCase());
      const matchesStakeholder = selectedStakeholder ? doc.stakeholders.includes(selectedStakeholder.value) : true;
      const matchesType = selectedType ? doc.type.includes(selectedType.value) : true;
      const matchesScale = selectedScale ? doc.scale.includes(selectedScale.value) : true;
      const matchesDescription = selectedDescription ? doc.description.toLowerCase().includes(selectedDescription.toLowerCase()) : true;

      return matchesTitle && matchesStakeholder && matchesType && matchesScale && matchesDescription;
    });

    setDocuments(filteredDocuments);
  };

  // Effetto per aggiornare i documenti ogni volta che cambia un filtro
  useEffect(() => {
    applyFilters();
  }, [searchedTitle, selectedStakeholder, selectedType, selectedScale, selectedDescription]);


  useEffect(() => {

    const fetchAssociations = async () => {
      console.log("DocList, documents: ", props.documents, props.allAssociations)
      const listAllAssociations = await associationAPI.getAllAssociations();
      setAllAssociations(listAllAssociations);
      setDocuments(props.documents);
    }

    fetchAssociations();
  }, [props.documents, props.allAssociations]);


  return (
    <>
      <Row className="filters" style={{ backgroundColor: '#9ebbd8', padding: '20px', borderRadius: '8px' }}>

        <Col className="d-flex align-items-center" xs="auto">
          <img src={IconaSearch} alt="search" width="60" height="60" />
          {/* La classe 'fs-3' aumenta la dimensione dell'icona */}
        </Col>

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
            <Form.Label>Search by description</Form.Label>
            <Form.Control
              type="text"
              className="border-dark border-2"
              value={selectedDescription}
              onChange={(e) => setSelectedDescription(e.target.value)}
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
        <DocumentTable documents={documents} allPositions={props.positions} allAssociations={allAssociations} />
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
        <div className="table-scroll-main" style={{ overflowY: 'auto', maxHeight: '1000px' }}>
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
                <th>Map/Diagram</th>
                <th>Files</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc, index) => (
                <DocumentRow key={index} document={doc} allPositions={props.allPositions} allAssociations={props.allAssociations} />
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
      <DocumentData document={props.document} allPositions={props.allPositions} allAssociations={props.allAssociations} />
      <DocumentFile document={props.document} />
    </tr>
  );
}
function DocumentData(props) {
  console.log("DocumentData, props: ", props.allAssociations);
  const numberOfConnectionsForThisDocument = props.allAssociations.filter(association => association.doc1 === props.document.docId || association.doc2 === props.document.docId).length;


  return (
    <>
      <td>{props.document.title}</td>
      <td>
        {props.document.description}
      </td>
      <td>{props.document.stakeholders}</td>
      <td>
        {props.document.ASvalue ? props.document.ASvalue : props.document.scale}
      </td>
      <td>{props.document.issuanceDate}</td>
      <td>{props.document.type}</td>
      <td>

        {numberOfConnectionsForThisDocument !== 0 &&
          <Link to={`/documentPage/${props.document.docId}`} style={{ color: "blue", textDecoration: "none" }}>
            {numberOfConnectionsForThisDocument}
            <i className="bi bi-link-45deg" style={{ marginLeft: '9px' }}></i>
          </Link>
        }

        {numberOfConnectionsForThisDocument === 0 && <p>0</p>}

      </td>
      <td>{props.document.language}</td>
      <td>{props.document.pages}</td>

      <td>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Link to={`/mapPage/${props.document.docId}`} style={{
            color: "blue",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "5px" // Aggiunge uno spazio tra il link e l'icona
          }}>
            Map
            <i class="bi bi-arrow-right-circle"></i>
          </Link>



          <Link to={`/diagram/${props.document.docId}`} style={{
            color: "blue",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "5px" // Aggiunge uno spazio tra il link e l'icona
          }}>
            Diagram
            <i class="bi bi-arrow-right-circle"></i>
          </Link>
        </div>

      </td>
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
