import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DocumentAPI from "../../api/documentAPI";
import { Table, Container, Spinner, Button } from "react-bootstrap";
import Select from "react-select";

import "../../DocList.css";
import PositionAPI from "../../api/positionAPI";


/**
 * 
 * Bugs: 
 * - stakeholder is mispelled in the database (as stackeholders)
 * - I need polling otherwise i cannot get the updated documents
 * 
 */

function DocList() {

  const [documents, setDocuments] = useState([]);
  const [allDocuments, setAllDocuments] = useState([]);


  const documentOptions = documents.map((doc) => ({
    value: doc.docId,
    label: doc.title,
  }));
  const [selectedDocument, setSelectedDocument] = useState(null);

  // for some reasons sometimes documents is empty (if i use it in DocList)
  const fetchDocuments = async () => {
    try {
      const res = await DocumentAPI.listDocuments();
      // console.log("Sono in DocList.jsx, ricevo dal db i documenti: ", res);
      setDocuments(res || []);
      setAllDocuments(res || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  // Fetch documents on component mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  // Polling: and then update the document after 5 sec
  useEffect(() => {
    const intervalId = setInterval(async () => {
      if (selectedDocument === null) {
        fetchDocuments();
      } else {
        console.log("Not polling for documents because a document is selected");
      }

    }, 5000); // dopo 5sec

    return () => clearInterval(intervalId);
  }, []);


  // Gestione del cambio selezione nel Select
  const handleSelectChange = (selectedOption) => {
    if (selectedOption) {
      setSelectedDocument(selectedOption); // Aggiorna selectedDocument con l'intero oggetto selezionato
      setDocuments(documents.filter((doc) => doc.docId === selectedOption.value));
    } else {
      setSelectedDocument(null); // Rimuovi la selezione
      setDocuments(allDocuments); // Ripristina la lista di documenti
    }
  };

  return (
    <>
      <Container fluid className="mt-3">
        <h1 className="mt-3">
          "Kiruna's Document Library"
          <Select
            options={documentOptions}
            isClearable // will set selectedDocument (the value) to null => i can use it for the polling
            placeholder="Select a document"
            required={true}
            value={selectedDocument}
            onChange={handleSelectChange}

          />

        </h1>
        <DocumentTable documents={documents} />
      </Container>

    </>
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
        {documents.map((doc) => (
          <DocumentRow key={doc.docId} document={doc} />
        ))}
      </tbody>
    </Table>);
}

function DocumentRow(props) {
  // console.log("Sono in DocList.jsx, DocumentRow, ricevo dal db il documento: ", props.document);
  return (
    <tr key={props.document.docId}>
      <DocumentData key={props.document.docId} document={props.document} />
      <DocumentFile key={props.document.docId} document={props.document} />
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
        //console.log("Sono in DocList.jsxm DocumentData, ricevo dal db la posizione: (doId, pos)", props.document.docId, docPos);

        if (docPos) {
          setPosition({ lat: docPos.latitude, lng: docPos.longitude });
          // console.log("Sono in DocList.jsx, DocumentData, ho settato la posizione: ", docPos);
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
      <td>{props.document.connections}</td>
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
        // console.log("Sono in DocList.jsx, DocumentFile, ricevo dal db i files: ", props.document.docId, files);
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
    // console.log(URL)

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
