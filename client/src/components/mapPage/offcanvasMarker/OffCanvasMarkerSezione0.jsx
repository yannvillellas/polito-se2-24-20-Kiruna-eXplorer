import { Container, Modal, Button, Tooltip, OverlayTrigger, Offcanvas, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import DocumentAPI from "../../../api/documentAPI";

import IconaModificaSezioneBianca from "../../assets/iconaModificaSezioneBianca.png";

// Da fare: Implementare la chiamata al server per salvare le modifiche

// Sezione0 e' quella del titolo
function OffCanvasMarkerSezione0(props) {
    const [title, setTitle] = useState(""); // In questo modo la modifica del titolo la riesco a far vedere immediatamente nel menrte che mando la modifica al server


    // Modifica del titolo
    const [isTitleToBeModified, setIsTitleToBeModified] = useState(false);
    const [oldTitle, setOldTitle] = useState("");


    useEffect(() => {
        if (props.selectedDoc) {
            setTitle(props.selectedDoc.title);
            setOldTitle(props.selectedDoc.title);  // Mantengo il titolo originale, gestisco il caso l'utente non voglia salvare la modifica
        }
    }, [props.selectedDoc]);

    const handleRevertChanges = () => {
        setTitle(oldTitle);
        setIsTitleToBeModified(false);
    };

    const handleSaveChanges = async () => {
        // Controlli:
        if (title === "") {
            alert("Title cannot be empty");
            return;
        }

        setOldTitle(title); // Aggiorno il titolo originale, così quando l'utente salva il titolo, il titolo originale viene aggiornato
        setIsTitleToBeModified(false);
        // Qui va implementata la chiamata al server per salvare il titolo

        console.log("offcanvaMarkerSezione0, sto entrando nel db by docId", props.selectedDoc.docId);
        // Adesso prendo la lista diDocuments e mi prendo solo quello ceh ha docId uguale a quello selezionato
        const lastVersionDocument = await DocumentAPI.listDocuments().then((documents) => {
            return documents.filter((document) => document.docId === props.selectedDoc.docId)[0];
        });

        console.log("offcanvaMarkerSezione0, lastVersionDocument: ", lastVersionDocument);

        
        const updatedDocument = {
            ...lastVersionDocument,
            title: title,
        };

        console.log("offcanvaMarkerSezione0, sto spedendo ad updateDocument: ", updatedDocument);

        const res = await DocumentAPI.updateDocument(updatedDocument);

        // Per avere un refresh del documento:
        props.handleForceRefresh()

    };




    return (
        <Offcanvas.Title
            style={{
                backgroundColor: '#3e5168',
                color: '#ffffff',
            }}

        >
            {isTitleToBeModified ?
                <>
                    <Form.Control
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        style={{ fontSize: '20px' }}
                    />

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Button
                            variant="primary"
                            className="d-flex flex-column align-items-center"
                            onClick={() => handleSaveChanges()}
                            style={{ backgroundColor: 'transparent', border: 'none' }}
                        >
                            <i className="bi bi-floppy-fill" style={{ fontSize: '20px' }} />
                        </Button>

                        <Button
                            variant="primary"
                            className="d-flex flex-column align-items-center"
                            onClick={() => handleRevertChanges()}
                            style={{ backgroundColor: 'transparent', border: 'none' }}
                        >
                            <i className="bi bi-x-circle" style={{ fontSize: '20px' }} />
                        </Button>
                    </div>

                </>
                :
                <>
                    {/*Vedo il titolo */}

                    {title !== "" ? <h2 style={{ padding: '10px' }}>{title}</h2> : <h2 style={{ padding: '10px' }}>Titolo non disponibile</h2>}
                    {/* Ed i vari bottoni: */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                        {
                            props.isUrbanPlanner &&
                            <Button
                                variant="primary"
                                onClick={() => setIsTitleToBeModified(true)}
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'transparent', border: 'none' }}
                            >
                                <img src={IconaModificaSezioneBianca} alt="search" width="20" height="20" style={{ marginLeft: 'auto', marginBottom: '1px' }} />
                                <span style={{ fontSize: '12px', color: 'white' }}>Modify section</span> {/**Uso span per avere la scritta in line */}
                            </Button>
                        }
                    </div>
                </>
            }
        </Offcanvas.Title>
    );
}

export default OffCanvasMarkerSezione0;
