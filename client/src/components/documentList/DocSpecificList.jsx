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

function DocSpecificList(props) {
    const { docId } = useParams();

    // const [docIdInt, setDocIdInt] = useState(docId ? parseInt(docId) : 0);
    const docIdInt = parseInt(docId);
    const [documentShown, setDocumentShown] = useState([]);
    const [highlightedDocId, setHighlightedDocId] = useState(null);




    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const associations = props.allAssociations.filter(association => association.doc1 === docIdInt || association.doc2 === docIdInt);
                // Rendo una lista di id dei documenti associati ( enon tutte le associzioni)
                const docIdGetFromAssociations = associations.map(association => {
                    if (association.doc1 === docIdInt) {
                        return association.doc2;
                    } else if (association.doc2 === docIdInt) {
                        return association.doc1;
                    }
                });
                const documentLists = await DocumentAPI.listDocuments();
                const documentsFiltered = documentLists.filter(doc => docIdGetFromAssociations.includes(doc.docId));
                const docFromDocId = documentLists.find(doc => doc.docId === docIdInt);

                setHighlightedDocId(docIdInt);
                setDocumentShown([docFromDocId, ...documentsFiltered]); // Ci saranno errori per i documenti dovrebbe essere qui il problema

            } catch (error) {
                console.error("Error fetching documents:", error);
            }
        };

        fetchDocuments();
    }, [docIdInt, props.documents, props.positions, props.allAssociations]);


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
                                <th>Map/Diagram</th>
                                <th>Files</th>
                            </tr>
                        </thead>
                        <tbody>
                            {documentShown.map((doc, index) => (
                                <DocumentRow key={index}
                                    document={doc}
                                    isHighlighted={highlightedDocId !== null && highlightedDocId === doc.docId}
                                    allPositions={props.positions}
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
                isHighlighted={props.isHighlighted}
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

    useEffect(() => {
        console.log("Sono in DocSpecificList, props.document.docId: isNumber? connecsiotn:", props.document.docId, typeof (props.document.docId), props.document.connections);
    }, [props.document.docId]);



    return (
        <>


            <td style={{
                backgroundColor: props.isHighlighted ? '#3e5168' : '',
                color: props.isHighlighted ? 'white' : ''
            }} >
                {props.document.title}

            </td >

            <td style={{
                backgroundColor: props.isHighlighted ? '#3e5168' : '',
                color: props.isHighlighted ? 'white' : ''
            }} >
                {props.document.description}
            </td>

            <td style={{
                backgroundColor: props.isHighlighted ? '#3e5168' : '',
                color: props.isHighlighted ? 'white' : ''
            }} >
                {props.document.stakeholders}
            </td>

            <td style={{
                backgroundColor: props.isHighlighted ? '#3e5168' : '',
                color: props.isHighlighted ? 'white' : ''
            }} >
                {props.document.ASvalue ? props.document.ASvalue : props.document.scale}
            </td>
            <td style={{
                backgroundColor: props.isHighlighted ? '#3e5168' : '',
                color: props.isHighlighted ? 'white' : ''
            }} >
                {props.document.issuanceDate}
            </td>
            <td style={{
                backgroundColor: props.isHighlighted ? '#3e5168' : '',
                color: props.isHighlighted ? 'white' : ''
            }} >
                {props.document.type}
            </td>
            <td style={{
                backgroundColor: props.isHighlighted ? '#3e5168' : '',
                color: props.isHighlighted ? 'white' : ''
            }} >

                {props.document.connections !== 0 &&

                    <Link to={`/documentPage/${props.document.docId}`} style={{ color: props.isHighlighted ? "white" : "blue", textDecoration: "none" }}>
                        {props.document.connections}
                        <i className="bi bi-link-45deg" style={{ marginLeft: '9px' }}></i>
                    </Link>

                }

                {props.document.connections === 0 && <p>0</p>}
            </td>
            <td style={{
                backgroundColor: props.isHighlighted ? '#3e5168' : '',
                color: props.isHighlighted ? 'white' : ''
            }} >
                {props.document.language}
            </td>
            <td style={{
                backgroundColor: props.isHighlighted ? '#3e5168' : '',
                color: props.isHighlighted ? 'white' : ''
            }} >
                {props.document.pages}
            </td>
            <td style={{
                backgroundColor: props.isHighlighted ? '#3e5168' : '',
                color: props.isHighlighted ? 'white' : ''
            }} >

                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    <Link to={`/mapPage/${props.document.docId}`} style={{
                        color: props.isHighlighted ? "white" : "blue", textDecoration: "none", display: "inline-flex",
                        alignItems: "center",
                        gap: "5px"
                    }}>
                        Map
                        <i class="bi bi-arrow-right-circle"></i>
                    </Link>


                    <Link to={`/diagram/${props.document.docId}`} style={{
                        color: props.isHighlighted ? "white" : "blue", textDecoration: "none", display: "inline-flex",
                        alignItems: "center",
                        gap: "5px"
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
    const [files, setFiles] = useState([]);

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const files = await DocumentAPI.getFiles(props.document.docId); // Will stay here, and not on App.jsx, for the same reason of the other times
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

        <td className={props.isHighlighted ? "highlighted-row" : ""}>
            {files.length > 0 ? (
                files.map((f, index) => (
                    <div key={f.name || index}>
                        <Button onClick={() => handleDownload(f)}>
                            <i className="bi bi-file-earmark-text-fill"></i>
                        </Button>
                        <p style={{ color: props.isHighlighted ? "white" : "blue", textDecoration: "none" }}>{f.name}</p>
                    </div>
                ))
            ) : (
                <p>No files available</p>
            )}
        </td>
    );
}







export default DocSpecificList;