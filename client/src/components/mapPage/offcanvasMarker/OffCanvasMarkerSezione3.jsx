import { Container, Modal, Button, Tooltip, OverlayTrigger, Offcanvas, Form, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import scaleAPI from "../../../api/scaleAPI";
import Select from "react-select";
import ChosenPosition from "../UnifiedForms/chosenPosition/ChosenPosition";
import stakeholderAPI from "../../../api/stakeholderAPI";
import documentTypeAPI from "../../../api/documentTypeAPI";
import associationAPI from "../../../api/associationAPI";
import DocumentAPI from "../../../api/documentAPI";
import Link from "../UnifiedForms/link/Link";
import AddOriginalSource from "../UnifiedForms/addDocument/addOriginalSource/AddOriginalSource";
import areaAPI from "../../../api/areaAPI";
import { use } from "react";

// Sezione: conenctions, Origian resources

function OffCanvasMarkerSezione3(props) {

    const [linkedDocuments, setLinkedDocuments] = useState([]); // Call API (getAssociationBy_DOC_ID), but here is easier (same concept of files) 
    // where each element will have structure: {aId: 1, title: "title", type: "type", doc1: doc1Id, doc2: doc2Id}
    const [oldLinkedDocuments, setOldLinkedDocuments] = useState([]);

    const [onlyLinkForm, setOnlyLinkForm] = useState(false);
    const [errorMsg, setErrorMsg] = useState("Erroer generico, arriva da OffCanvasMarkerSezione3");

    const [files, setFiles] = useState([]); // Got called here when a user press on the document (is bettere if is here? I think yes bc otherwise every time you have add/modify a new document in APP.jsx )
    const [isNeededAFileRefresh, setIsNeededAFileRefresh] = useState(false);

    const [isSectionToBeModify, setIsSectionToBeModify] = useState(false);


    useEffect(() => {

        const fetchConnections = async () => {
            if (props.selectedDoc) {
                try {
                    await handleShowTitleAllLinkedDocument(props.selectedDoc.docId);
                } catch (error) {
                    console.error("Error fetching linked documents:", error);
                }
            }
        };

        fetchConnections();
    }, [props.selectedDoc, onlyLinkForm]);


    useEffect(() => {
        const fetchFiles = async () => {
            if (props.selectedDoc) {
                // Questo codice con i files è problematico: quando non ci sono files
                try {
                    await handleGetFiles(props.selectedDoc.docId);
                } catch (error) {
                    console.error("Error fetching files:", error);
                }
            }
        }

        fetchFiles();
    }, [props.selectedDoc, isNeededAFileRefresh]);


    const handleShowTitleAllLinkedDocument = async (docId) => {
        if (!docId) { // Se non è stato selezionato nessun documento
            setLinkedDocuments([]);
            return;
        }
        let assciationToShow = await associationAPI.getAssociationsByDocId(docId);
        let titleList = [];
        let title = "";
        for (let association of assciationToShow) {
            if (association.doc1 === docId) {
                // se il titolo non è già presente in titleList aggiuggilo
                title = props.documents.filter(doc => doc.docId === association.doc2)[0].title;
                if (!titleList.some(item => item.docTitle === title)) {
                    titleList.push({ docTitle: title, otherDocumentId: association.doc2 });
                }
            } else {
                title = props.documents.filter(doc => doc.docId === association.doc1)[0].title;
                if (!titleList.some(item => item.docTitle === title)) {
                    titleList.push({ docTitle: title, otherDocumentId: association.doc1 });
                }
            }
        }
        setLinkedDocuments(titleList);
    }

    // Funzione mdocificata (restituiva errore)
    const handleGetFiles = async (docId) => {
        try {
            const files = await DocumentAPI.getFiles(docId); // Risolvi la Promise
            console.log("Ecco i files: ", files);
            if (files) {
                setFiles(Array.from(files));
            } else {
                setFiles([]); // Inizializza con array vuoto se non ci sono file
            }
        } catch (error) {
            console.error("Error fetching files:", error);
        }
    };


    const handleConnectionClick = async (docId) => {
        props.handleChangeMapViewBasedOnDocId(docId);
        console.log("Sono in handleConnectionClick, ecco il docId: ", docId);
    };


    const handleDownload = (file) => {
        const URL = `http://localhost:3001/${file.path.slice(1)}`

        const aTag = document.createElement("a");
        aTag.href = URL
        aTag.setAttribute("download", file.name)
        document.body.appendChild(aTag)
        aTag.click();
        aTag.remove();
    }

    const handleUpload = async (document) => {
        const formData = new FormData();
        Array.from(document.files).forEach((file) => {
            formData.append("files", file);
        });

        try {
            await DocumentAPI.addFiles(document.docId, formData)
        } catch (error) {
            console.error("Error:", error);
            alert("Error uploading file.");
        }
    };

    // handleAddedFiles={(files) => setNewDocument({ ...newDocument, files })
    const [isNeededAddNewOriginalResources, setIsNeededAddNewOriginalResources] = useState(true);

    const handleAddedFiles = (files) => {
        setFiles(files);
        setIsNeededAddNewOriginalResources(false);
    };

    const handleConfirmationAddNewOriginalResources = async () => {
        if (files.length > 0) {
            await handleUpload({ docId: props.selectedDoc.docId, files: files });
        }
        setIsNeededAddNewOriginalResources(true);
        setIsNeededAFileRefresh(!isNeededAFileRefresh); // così mutua ogni volta che aggiungo un file        
    };



    return (
        <>
            <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flex: 1 }}>
                    <Card> {/**Mettendo card ti generea il bordo */}
                        <Card.Body>
                            <Card.Title>
                                Connections
                            </Card.Title>

                            {/* Mappo connectionsTitle e mostro ogni elemento */}

                            {linkedDocuments.length > 0 ? linkedDocuments.map((connection) => (
                                <p
                                    key={connection.docTitle}
                                    style={{
                                        marginBottom: '8px',  // Spazio tra i paragrafi
                                    }}
                                >
                                    <span
                                        onClick={() => handleConnectionClick(connection.otherDocumentId)}
                                        style={{
                                            color: 'blue',
                                            textDecoration: 'underline',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {connection.docTitle}
                                    </span>
                                </p>
                            )) : "This file has no connections"}
                            {props.isUrbanPlanner &&
                                <Button
                                    variant="primary"
                                    onClick={() => setOnlyLinkForm(true)}
                                    style={{
                                        backgroundColor: '#3e5168',
                                        border: 'none',
                                        marginTop: '4px',
                                        fontSize: '18px' // Riduce la dimensione del testo
                                    }}
                                >
                                    Add connections
                                </Button>
                            }
                            {/*Modal only for link documents*/}
                            <Modal show={onlyLinkForm} onHide={() => setOnlyLinkForm(false)} size="xl">
                                <Modal.Header closeButton>
                                    <Modal.Title className="modal-title"> Insert link</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>

                                    <Link
                                        documents={props.documents}
                                        alone={true}
                                        doc1Id={props.selectedDoc.docId}
                                        title={props.selectedDoc.title}
                                        setOnlyLinkForm={setOnlyLinkForm}
                                        setErrorMsg={setErrorMsg}>
                                    </Link>

                                </Modal.Body>
                            </Modal>

                        </Card.Body>
                    </Card>
                </div>

                <div style={{ flex: 1 }}>
                    <Card>
                        <Card.Body>
                            <Card.Title>
                                Original resources
                            </Card.Title>


                            {isNeededAddNewOriginalResources ? <p>This is the origina resources you uploaded: </p> : <p>These are the original resources you are uploading: </p>}

                            {(files && files.length > 0) ? files.map((f, index) => (
                                <div key={f.name || index} className="download-btns">
                                    <Button
                                        onClick={() => handleDownload(f)}
                                        className="files"
                                        style={{
                                            backgroundColor: '#9ebbd8',
                                            border: 'none',
                                            marginTop: '4px',
                                            fontSize: '18px' // Riduce la dimensione del testo
                                        }}
                                    >
                                        <i className="bi bi-file-earmark-text-fill"></i>
                                    </Button>
                                    <p className="file-name">{f.name}</p>
                                </div>
                            )) : ""}

                            {isNeededAddNewOriginalResources ?
                                <>
                                    {
                                        props.isUrbanPlanner &&

                                        <AddOriginalSource
                                            handleAddedFiles={handleAddedFiles}
                                        />
                                    }
                                </>
                                :
                                <>

                                    <Button
                                        variant="primary"
                                        onClick={() => handleConfirmationAddNewOriginalResources()}
                                        style={{
                                            backgroundColor: '#3e5168',
                                            border: 'none',
                                            marginTop: '4px',
                                            fontSize: '18px' // Riduce la dimensione del testo
                                        }}
                                    > Confirm</Button>
                                </>
                            }


                        </Card.Body>
                    </Card>
                </div>

            </div >


        </>
    )
}

export default OffCanvasMarkerSezione3;