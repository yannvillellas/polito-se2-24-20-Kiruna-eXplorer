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
 * - stakeholder is mispelled in the database (as stackeholders)
 * - I need polling otherwise i cannot get the updated documents
 * 
 */

function DocList() {
  const [documents, setDocuments] = useState([]);
  const [allDocuments, setAllDocuments] = useState([]);

  /*const titleOptions = documents.map((doc) => ({
    value: doc.docId,
    label: doc.title,
  }));

  const stakeholderOptions = documents.map((doc) => ({
    value: doc.docId,
    label: doc.stackeholders,
  }));*/

  const [stakeholdersOptions, setStakeholdersOptions] = useState([]);
  const [scaleOptions, setScaleOptions] = useState([]);
  const [typeOptions, setTypeOptions] = useState([])
  useEffect(() => {
    const fetchOptions = async () => {
      const stakeholderList = await stakeholderAPI.getStakeholders()
      const scaleList = await scaleAPI.getScales()
      const typeList = await documentTypeAPI.getDocumentTypes()
      setStakeholdersOptions(stakeholderList.map((s) => { return { value: s.name, label: s.name } }))
      setScaleOptions(scaleList.map((s) => { return { value: s.name, label: s.name } }))
      setTypeOptions(typeList.map((t) => { return { value: t.type, label: t.type } }))
    }
    fetchOptions();
  }, [])

  /*const scaleOptions = documents.map((doc) => ({
    value: doc.docId,
    label: doc.scale,
  }));

  const typeOptions = documents.map((doc) => ({
    value: doc.docId,
    label: doc.type,
  }));

  const languageOptions = documents.map((doc) => ({
    value: doc.docId,
    label: doc.language,
  }));*/



  const [selectedDocument, setSelectedDocument] = useState(null);
  const [allPositions, setAllPositions] = useState([]);

  // for some reasons sometimes documents is empty (if i use it in DocList)
  const fetchDocuments = async () => {
    try {
      const res = await DocumentAPI.listDocuments();
      const pos = await PositionAPI.listPositions();
      // console.log("Sono in DocList.jsx, ricevo dal db i documenti: ", res);
      setDocuments(res || []);
      setAllDocuments(res || []);
      console.log(res)

      setAllPositions(pos || []);

    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  // Fetch documents on component mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  /*
  // Polling: and then update the document after 5 sec
  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        const res = await DocumentAPI.listDocuments();

        if (!selectedDocument) {
          // Aggiorna sia la lista completa sia i documenti mostrati
          setAllDocuments(res || []);
          setDocuments(res || []);
        } else {
          // Aggiorna solo la lista completa per evitare sovrascritture
          setAllDocuments(res || []);
          console.log("Polling: Document list updated in background.");
        }
      } catch (error) {
        console.error("Error during polling:", error);
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [selectedDocument]);
  */

  // Gestione del cambio selezione nel Select
  const handleSelectChange = (selectedOption) => {
    if (selectedOption) {
      setSelectedDocument(selectedOption);
      setDocuments(allDocuments.filter((doc) => doc.docId === selectedOption.value));
    } else {
      setSelectedDocument(null);
      setDocuments(allDocuments); // Ripristina solo quando non c'è selezione
    }
  };

  //const [searchedTitle, setSearchedTitle] = useState("")

  const [searchedTitle, setSearchedTitle] = useState("");
  const [selectedStakeholder, setSelectedStakeholder] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedScale, setSelectedScale] = useState(null);

  const applyFilters = () => {
    const filteredDocuments = allDocuments.filter((doc) => {
      const matchesTitle = doc.title.toLowerCase().includes(searchedTitle.toLowerCase());
      const matchesStakeholder = selectedStakeholder ? doc.stackeholders.includes(selectedStakeholder.value) : true;
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
      <h2 className="mb-4">"Kiruna's Document Library"</h2>
      <Row className="filters">
        <Col>
        <Form.Group>
          <Form.Label>Search by title</Form.Label>
          <Form.Control
            type="text"
            className="border-dark border-2"
            value={searchedTitle}
            /*onChange={(e) => {
              setSearchedTitle(e.target.value)
              console.log(e.target.value)
              setDocuments(() => allDocuments.filter(doc => doc.title.toLowerCase().includes(e.target.value.toLowerCase())))
            }}*/
            onChange={(e) => setSearchedTitle(e.target.value)}
          />
        </Form.Group>
        </Col>
        <Col>
        <Form.Group>
          <Form.Label>Search by stakeholder</Form.Label>
          <Select
            options={stakeholdersOptions}
            isClearable
            placeholder="Select stakeholder"
            /*onChange={(selectedOption) =>{
              if (selectedOption) {
                setDocuments(()=>allDocuments.filter((doc)=>doc.stackeholders.includes(selectedOption.value)))
              } else {
                setDocuments(allDocuments);
              }
            }}*/
            onChange={setSelectedStakeholder}
          />
        </Form.Group>
        </Col>
        <Col>
        <Form.Group>
          <Form.Label>Search by type</Form.Label>
          <Select
            options={typeOptions}
            isClearable
            placeholder="Select type of document"
            /*onChange={(selectedOption) =>{
              if (selectedOption) {
                setDocuments(()=>allDocuments.filter((doc)=>doc.type.includes(selectedOption.value)))
              } else {
                setDocuments(allDocuments);
              }
            }}*/
            onChange={setSelectedType}
          />
        </Form.Group>
        </Col>
        <Col>
        <Form.Group>
          <Form.Label>Search by scale</Form.Label>
          <Select
            options={scaleOptions}
            isClearable
            placeholder="Select scale of document"
            /*onChange={(selectedOption) =>{
              if (selectedOption) {
                setDocuments(()=>allDocuments.filter((doc)=>doc.type.includes(selectedOption.value)))
              } else {
                setDocuments(allDocuments);
              }
            }}*/
            onChange={setSelectedScale}
          />
        </Form.Group>
        </Col>
      </Row>
      <Container fluid >
        {/* Tabella dei documenti */}
        <DocumentTable documents={documents} allPositions={allPositions} />
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

  /*useEffect(() => {
    const description = props.document.description;
    if (isCompact && description) {
      setTruncatedDescription(description.split(" ").slice(0, 3).join(" ") + "...");
    } else {
      setTruncatedDescription(description);
    }
  }, [isCompact, props.document.description]);

  useEffect(() => {
    console.log("Is compact?", isCompact);
  }, [isCompact]);*/

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
      <td>{props.document.stackeholders}</td>
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
  const [files, setFiles] = useState([]);

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
