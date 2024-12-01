import "bootstrap/dist/css/bootstrap.min.css";
import "./DocList.css";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DocumentAPI from "../../api/documentAPI";
import { Table, Container, Button } from "react-bootstrap";
import Select from "react-select";
import PositionAPI from "../../api/positionAPI";

/**
 * 
 * Bugs: 
 * - stakeholder is mispelled in the database (as stackeholders)
 * - I need polling otherwise i cannot get the updated documents
 * 
 */

import { Row, Col, Form } from "react-bootstrap";

function DocList() {
  const [documents, setDocuments] = useState([]);
  const [allDocuments, setAllDocuments] = useState([]);

  const [filters, setFilters] = useState({
    title: "",
    description: "",
    stakeholder: "",
    scale: "",
    issuanceDate: "",
    type: "",
    connections: "",
  });

  const fetchDocuments = async () => {
    try {
      const res = await DocumentAPI.listDocuments();
      setDocuments(res || []);
      setAllDocuments(res || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    const applyFilters = () => {
      const filteredDocs = allDocuments.filter((doc) => {
        return (
          (!filters.title || doc.title.toLowerCase().includes(filters.title.toLowerCase())) &&
          (!filters.description || doc.description.toLowerCase().includes(filters.description.toLowerCase())) &&
          (!filters.stakeholder || (doc.stackeholders && doc.stackeholders.includes(filters.stakeholder))) &&
          (!filters.scale || doc.scale === filters.scale) &&
          (!filters.issuanceDate || doc.issuanceDate === filters.issuanceDate) &&
          (!filters.type || doc.type === filters.type)
        );
      });
      setDocuments(filteredDocs);
    };

    applyFilters();
  }, [filters, allDocuments]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
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
      <DocumentTable documents={documents} />
    </Container>
  );
}



function DocumentTable(props) {
  const { documents } = props;

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
          <th>Connections</th>
          <th>Language</th>
          <th>Pages</th>
          <th>(lat, lng)</th>
          <th>Files</th>
        </tr>
      </thead>
      <tbody>
        {documents.map((doc, index) => (
          <DocumentRow key={index} document={doc} />
        ))}
      </tbody>
    </Table>);
}

function DocumentRow(props) {
  return (
    <tr >
      <DocumentData document={props.document} />
      <DocumentFile document={props.document} />
    </tr>
  );
}
function DocumentData(props) {
  const [position, setPosition] = useState({ lat: "N/A", lng: "N/A" });

  useEffect(() => {
    const fetchPosition = async () => {
      try {
        const pos = await PositionAPI.listPositions();

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
      <td>{props.document.description}</td>
      <td>{props.document.stackeholders}</td>
      <td>{props.document.scale}</td>
      <td>{props.document.issuanceDate}</td>
      <td>{props.document.type}</td>
      <td>
        <Link to={`/documentPage/${props.document.docId}`} style={{ color: "blue", textDecoration: "none" }}>
          {props.document.connections}
        </Link>
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