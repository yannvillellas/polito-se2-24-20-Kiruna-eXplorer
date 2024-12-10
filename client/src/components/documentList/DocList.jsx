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
                <th>Map/Diagram</th>
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
        {props.document.connections !== 0 &&

          <Link to={`/documentPage/${props.document.docId}`} style={{ color: "blue", textDecoration: "none" }}>
            {props.document.connections}
          </Link>

        }

        {props.document.connections === 0 && <p>0</p>}

      </td>
      <td>{props.document.language}</td>
      <td>{props.document.pages}</td>

      <td>
        <Link to={`/mapPage/${props.document.docId}`} style={{ color: "blue", textDecoration: "none" }}>
          Map
        </Link>
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
