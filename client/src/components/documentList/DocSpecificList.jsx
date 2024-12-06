import "bootstrap/dist/css/bootstrap.min.css";
import "./DocList.css";
import React, { useEffect, useState } from "react";
import DocumentAPI from "../../api/documentAPI";
import { Table, Container, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import Select from "react-select";
import PositionAPI from "../../api/positionAPI";


import associationAPI from "../../api/associationAPI";

import { useParams } from "react-router-dom";

function DocSpecificList() {
    const { docId } = useParams();
    const docIdInt = parseInt(docId);
    const [allDocuments, setAllDocuments] = useState([]);
    const [documentShown, setDocumentShown] = useState([]);
    const [allPositions, setAllPositions] = useState([]);
    const [highlightedDocId, setHighlightedDocId] = useState(null);

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                console.log("Sono in DocSpecificList, useEffect, docId:", docIdInt);
                const docs = await DocumentAPI.listDocuments();
                setAllDocuments(docs);
                console.log("Sono in DocSpecificList, useEffect, ecco i documenti:", docs);

                const allPositions = await PositionAPI.listPositions();
                console.log("Sono in DocSpecificList, useEffect, ecco le posizioni:", allPositions);
                setAllPositions(allPositions);

                const allAssociations = await associationAPI.getAllAssociations(); // Fetch all associations
                console.log("Sono in DocSpecificList, useEffect, ecco le associazioni:", allAssociations);
                const associations = allAssociations.filter(association => association.doc1 === docIdInt || association.doc2 === docIdInt);
                console.log("Sono in DocSpecificList, useEffect, ecco le associazioni filtrate:", associations);
                // Rendo una lista di id dei documenti associati ( enon tutte le associzioni)
                const docIdGetFromAssociations = associations.map(association => {
                    if (association.doc1 === docIdInt) {
                        return association.doc2;
                    } else if (association.doc2 === docIdInt) {
                        return association.doc1;
                    }
                });
                console.log("Sono in DocSpecificList, useEffect, ecco gli id dei documenti associati:", docIdGetFromAssociations);
                const documentsFiltered = docs.filter(doc => docIdGetFromAssociations.includes(doc.docId));
                console.log("Sono in DocSpecificList, useEffect, ecco i documenti filtrati:", documentsFiltered);
                const docFromDocId = docs.find(doc => doc.docId === docIdInt);
                console.log("Sono in DocSpecificList, useEffect, ecco il documento con docId:", docFromDocId);
                setHighlightedDocId(docIdInt);
                setDocumentShown([docFromDocId, ...documentsFiltered]); // Ci saranno errori per i documenti dovrebbe essere qui il problema

            } catch (error) {
                console.error("Error fetching documents:", error);
            }
        };

        fetchDocuments();

    }, [docIdInt]);


    return (
        <>
            {/*<h2>Dettagli del documento con ID: {docIdInt}</h2>*/}
            <div className="custom-table-wrapper-secondary">
                <div className="table-scroll-secondary">
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
                            {documentShown.map((doc, index) => (
                                <DocumentRow key={index}
                                    document={doc}
                                    isHighlighted={highlightedDocId !== null && highlightedDocId === doc.docId}
                                    allPositions={allPositions}
                                />
                            ))}
                        </tbody>
                    </Table>;
                </div>
            </div>


        </>
    );
};

function DocumentRow(props) {

    return (
        <tr >
            <DocumentData
                key={props.index}
                document={props.document}
                isHighlighted={props.isHighlighted}
                allPositions={props.allPositions}
            />
            <DocumentFile
                key={props.index}
                document={props.document}
            />
        </tr>
    );
}

function DocumentData(props) {
    const [position, setPosition] = useState({ lat: "N/A", lng: "N/A" });

    // Stato per tracciare se la descrizione è espansa
    const [isExpanded, setIsExpanded] = useState(false);

    // Troncamento della descrizione
    const truncatedDescription = props.document.description
        ? (props.document.description.split(" ").length > 10 ? props.document.description.split(" ").slice(0, 10).join(" ") + "..." : props.document.description)
        : "";

    // Descrizione mostrata in base allo stato `isExpanded`
    const displayedDescription = isExpanded
        ? props.document.description
        : truncatedDescription;

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
            <td onClick={() => setIsExpanded(!isExpanded)} style={{ cursor: "pointer" }}>
                {displayedDescription}
                {props.document.description.split(" ").length > 10 && (
                    <span style={{ color: "blue", textDecoration: "underline" }}>
                        {isExpanded ? "Reduce" : " Show all "}
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
            <td>
                {position.lat === "N/A" || position.lng === "N/A" ?
                    <td>N/A</td>
                    :
                    <td>{`${parseFloat(position.lat).toFixed(4)}, ${parseFloat(position.lng).toFixed(4)} `}</td>
                }
            </td>
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







export default DocSpecificList;