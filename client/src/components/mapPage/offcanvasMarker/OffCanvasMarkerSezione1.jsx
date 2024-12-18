import { Container, Modal, Button, Tooltip, OverlayTrigger, Offcanvas, Form, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import scaleAPI from "../../../api/scaleAPI";
import Select from "react-select";
import ChosenPosition from "../UnifiedForms/chosenPosition/ChosenPosition";
import DocumentAPI from "../../../api/documentAPI";
import areaAPI from "../../../api/areaAPI";
import { use } from "react";


import IconaModificaPosizione from "../../assets/iconaModificaPosizione.png";
import IconaModificaSezione from "../../assets/iconaModificaSezione.png";
import PositionAPI from "../../../api/positionAPI";

// Sezione: Descrizione, Scale, AVScale
// Posizione non fa parte della sezione, è a se stante.

function OffCanvasMarkerSezione1(props) {
    const [description, setDescription] = useState("");
    const [oldDescription, setOldDescription] = useState("");

    const [position, setPosition] = useState({ lat: null, lng: null }); // { lat, lng }); // Salva come oggetto numerico
    const [oldPosition, setOldPosition] = useState({ lat: null, lng: null });

    const [isPositionToBeModified, setIsPositionToBeModified] = useState(false);
    const [isSection1ToBeModify, setIsSection1ToBeModify] = useState(false);

    const [area, setArea] = useState(null); // La salvo solamente per poi andare a modificare/aggiungere area con quell'id/senzaId nel db 
    const [oldArea, setOldArea] = useState(null);


    const [scale, setScale] = useState("");
    const [oldScale, setOldScale] = useState("");
    const [scaleOptions, setScaleOptions] = useState([]); // Object { scaleId: 1, name: "Architectural Scale" }

    const [isArchitecturalScale, setIsArchitecturalScale] = useState(false);
    const [isArchitecturalScaleFormat, setIsArchitecturalScaleFormat] = useState(false);
    const [avScale, setAvScale] = useState("Da implementare");
    const [oldAvScale, setOldAvScale] = useState("");

    const [showModalAddNewScale, setShowModalAddNewScale] = useState(false);
    const [newScale, setNewScale] = useState("");


    useEffect(() => {
        if (props.selectedDoc) {
            setDescription(props.selectedDoc.description);
            setOldDescription(props.selectedDoc.description);  // Mantengo la descrizione originale, gestisco il caso l'utente non voglia salvare la modifica
            // setPosition(props.selectedDoc.position);
            setScale(props.selectedDoc.scale);
            setOldScale(props.selectedDoc.scale);

            if (props.selectedDoc.scale === "Architectural Scale") {
                setIsArchitecturalScale(true);
                setAvScale(props.selectedDoc.ASvalue);
                setOldAvScale(props.selectedDoc.ASvalue);
            } else {
                setIsArchitecturalScale(false);
                setAvScale("-");
                setOldAvScale("-");
            }

            console.log("OffCanvasMarkerSezione1, selectedDoc", props.selectedDoc);
        }
    }, [props.selectedDoc]);

    useEffect(() => {
        const fetchOptions = async () => {
            const scaleList = await scaleAPI.getScales(); // Li prendo direttametne dal database perchè così mi viene più semplice da gestire l'inserimento della nuova scala 
            // (perchè quelli in App.jsx vengono aggiornati solo quando si aggiunge un nuovo documento).
            setScaleOptions(scaleList.map((s) => { return { value: parseInt(s.scaleId, 10), label: s.name } }));
        };
        fetchOptions();
    }, [props.selectedDoc])

    useEffect(() => {
        const fetchPosition = async () => {
            const lat = Number(props.selectedDoc.lat.toFixed(4)); // Perchè toFixed ritorna una stringa
            const lng = Number(props.selectedDoc.lng.toFixed(4));
            setPosition({ lat, lng }); // Salva come oggetto numerico
            setOldPosition({ lat, lng });
        };

        fetchPosition();
    }, [props.selectedDoc]);



    const handleRevertChangesSection1 = () => {
        // REVERT di TUTTI i campi


        setDescription(oldDescription);
        setScale(oldScale);
        setAvScale(oldAvScale);

        setIsSection1ToBeModify(false);
        setIsArchitecturalScaleFormat(false);
    };

    const handleSaveChangesSection1 = async () => {
        // Controlli: di TUTTI I CAMPI
        // if(.....)
        if (description === "" || scale === "" || (isArchitecturalScale && avScale === "") || (isArchitecturalScale && avScale === "-") || (isArchitecturalScale && !isArchitecturalScaleFormat)) {
            alert("The fields cannot be empty or not in the correct format.");
            return;
        }

        setOldDescription(description);
        setOldScale(scale);
        setOldAvScale(avScale);
        console.log("OffCanvasMarkerSezione1, handleSaveChangesSection1, description", description, scale, avScale);

        setIsSection1ToBeModify(false);
        setIsArchitecturalScaleFormat(false);
        // Qui va implementata la chiamata al server per salvare le modifiche 




        const lastVersionDocument = await DocumentAPI.listDocuments().then((documents) => {
            return documents.filter((document) => document.docId === props.selectedDoc.docId)[0];
        });

        console.log("offcanvaMarkerSezione2, lastVersionDocument: ", lastVersionDocument);
        const fixedAvScale = avScale === "-" ? null : avScale; // perchè nel db è salvata come null e non come 


        const updatedDocument = {
            ...lastVersionDocument,
            description: description,
            scale: scale,
            ASvalue: fixedAvScale,
        };

        console.log("offcanvaMarkerSezione2, sto spedendo ad updateDocument: ", updatedDocument);
        const res = await DocumentAPI.updateDocument(updatedDocument);

        // Per aggiornare la mappa
        props.handleForceRefresh();
    };

    const handleRevertChangesPosition = () => {

        setPosition(oldPosition);
        setArea(oldArea);
        setIsPositionToBeModified(false);
    };











    const handleSaveChangesPosition = async () => {
        // Controlli:
        // if(.....)

        setOldPosition(position);
        setOldArea(area);
        setIsPositionToBeModified(false);
        // Qui va implementata la chiamata al server per salvare le modifiche 

        // CHiamo modify position:
        console.log("OffCanvasMarkerSezione1, handleSaveChangesPosition, position", position);
        console.log("Sto per entrate in modifyPosition con ", position);
        const result = await PositionAPI.modifyPosition(props.selectedDoc.docId, position.lat, position.lng);

        if (area) {

            // Aggiungo l'area al db
            console.log("OffCanvasMarkerSezione1, handleSaveChangesPosition, shape", area);
            const areaId = await areaAPI.addArea(props.selectedDoc.docId, area); // non ritorna
            console.log("OffCanvasMarkerSezione1, sono tornato da addArea", areaId);
            /* Non sta funzionando:
            const centroide = calculateCenterOfPolygon(area.latlngs);
            console.log("OffCanvasMarkerSezione1, handleSetArea, centroide", centroide);
            
            const result = await PositionAPI.modifyPosition(props.selectedDoc.docId, centroide[0], centroide[1]);
            console.log("OffCanvasMarkerSezione1, handleSetArea, result", result);
            */

        }

        // Per aggiornare la mappa
        props.handleForceRefresh();

    };


    function calculateCenterOfPolygon(latlngs) {
        let latSum = 0;
        let lngSum = 0;
        const numPoints = latlngs.length;

        // Somma le coordinate
        latlngs.forEach(latlng => {
            latSum += latlng.lat;
            lngSum += latlng.lng;
        });

        // Calcola la media delle coordinate
        const centerLat = latSum / numPoints;
        const centerLng = lngSum / numPoints;

        return [centerLat, centerLng];
    }










    // Shadowing per la modifica della posizione
    const handleAddLatLongToDocumentModal = (lat, lng) => {

        if (lat === null || lng === null) {
            return;
        }

        const latFixed = Number(lat.toFixed(4)); // Perchè toFixed ritorna una stringa
        const lngFixed = Number(lng.toFixed(4));

        setPosition({ lat: latFixed, lng: lngFixed });
        // Old position verrà aggiornato solo alla conferma delle modifiche di Position
        console.log("OffCanvasMarkerSezione1, handleAddLatLongToDocumentModal, lat, lng", position);
    };

    const handleSetArea = async (shape) => {
        if (shape === null) {
            return;
        }

        console.log("OffCanvasMarkerSezione1, handleSetArea, shape", shape);
        setArea(shape);

        // Setto lat/lng nel centroide dell'area



    };

    useEffect(() => {
        console.log("OffCanvasMarkerSezione1, position", position);
    }, [position]);

    return (
        <>

            {isSection1ToBeModify ?
                <>
                    {/**Modifica della descrizione: */}
                    <Card.Body>
                        <Card.Title>Description:</Card.Title>
                        <Form.Control
                            as="textarea"

                            style={{ height: '180px' }}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}

                        />
                    </Card.Body>

                </>
                :
                <>
                    {/**Utente NON deve modificare SEZIONE 1: */}
                    <Card.Body>
                        <Card.Title>Description:</Card.Title>
                        <Card.Text style={{
                            backgroundColor: '#9ebbd8',
                            color: '#3e5168',
                            borderRadius: '8px',
                            padding: '10px'

                        }}>
                            {description === "" ? "No description" : description}
                        </Card.Text>
                    </Card.Body>
                </>
            }

            {isPositionToBeModified ?
                <>
                    {/**Modifica della posizione: */}
                    <Modal
                        show={isPositionToBeModified}
                        onHide={() => setIsPositionToBeModified(false)}
                        size="xl"
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>Change the position:</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {/**Props da passare: 
                             *  props.handleAddLatLongToDocumentModal(center[0], center[1]);,   
                             * props.handleSetArea(shape); 
                             * 
                             * */}
                            <ChosenPosition
                                handleAddLatLongToDocumentModal={handleAddLatLongToDocumentModal}
                                handleSetArea={handleSetArea}
                            />
                        </Modal.Body>
                        <Modal.Footer>
                            <Button
                                variant="secondary"
                                onClick={() => handleRevertChangesPosition()}
                                style={{ color: '#3e5168', borderColor: '#3e5168', backgroundColor: '#ffff' }}
                            >
                                Back
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => handleSaveChangesPosition()}
                                style={{ color: '#ffffff', borderColor: '#3e5168', backgroundColor: '#3e5168' }}
                            >
                                Save & Close
                            </Button>
                        </Modal.Footer>
                    </Modal>

                </>
                :
                <>
                    {/**Utente NON deve modificare POSIZIONE 1: */}
                    <br />
                    <Card.Body>
                        <Card.Title>Position:</Card.Title>
                        <Card.Text style={{
                            backgroundColor: '#9ebbd8',
                            color: '#ffffff'
                        }}>
                            {position ? `(${position.lat}, ${position.lng})` : "No position"}

                        </Card.Text>
                    </Card.Body>
                </>
            }


            {/**Ho separato perche' graficamente voglio il campo posizione sotto quelo descrizione ma la modifica è separata*/}
            {isSection1ToBeModify ?
                <>
                    {/**Modifica della scala: */}
                    <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                        <div style={{ flex: 1 }}>
                            <Card.Body>
                                <Card.Title>
                                    Scale
                                </Card.Title>
                                <Select
                                    options={scaleOptions} // Opzioni definite
                                    placeholder="Select Scale"
                                    required={true}
                                    isClearable={true}
                                    onChange={(selectedOption) => {
                                        const scaleLabel = selectedOption ? selectedOption.label : "";

                                        if (scaleLabel === "Architectural Scale") {
                                            setIsArchitecturalScale(true);
                                        } else {
                                            setIsArchitecturalScale(false);
                                            setAvScale("-"); // Resetto il campo AVScale
                                        }

                                        setScale(scaleLabel);

                                    }
                                    }
                                    value={scaleOptions.filter(option => option.label === scale)}

                                />

                                <>

                                    <Button
                                        variant="primary"
                                        onClick={() => setShowModalAddNewScale(true)}
                                        style={{ backgroundColor: '#3e5168', border: 'none', marginTop: '4px' }}
                                    >
                                        Add new scale
                                    </Button>

                                    <Modal show={showModalAddNewScale} onHide={() => setShowModalAddNewScale(false)}>
                                        <Modal.Header closeButton>
                                            <Modal.Title>Please, add the new scale</Modal.Title>
                                        </Modal.Header>
                                        <Modal.Body>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Scale Name</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    required={true}
                                                    placeholder="Enter scale name"
                                                    onChange={(e) => setNewScale(e.target.value)}
                                                />
                                            </Form.Group>
                                        </Modal.Body>
                                        <Modal.Footer>
                                            <Button variant="secondary" onClick={() => { setNewScale(""); setShowModalAddNewScale(false); }}>
                                                Close
                                            </Button>
                                            <Button variant="primary" onClick={ async () => {

                                                // Se la scala non è già presente nell'elenco delle scale, aggiungila
                                                if (!scaleOptions.some(option => option.label === newScale)) {
                                                    scaleOptions.push({ value: scaleOptions.length + 1, label: newScale });

                                                    // Perchè non faccio aggiungere nuovi architectural scale, perchè si può modificare direttametne solo ASvalue
                                                    setScale(newScale);
                                                    
                                                    setIsArchitecturalScale(false);
                                                    setAvScale("-");

                                                    setNewScale("");
                                                    setShowModalAddNewScale(false);

                                                    // Aggiungo la scala al db, così è riusabile
                                                    const risposta = await scaleAPI.addScale(newScale);

                                                } else {
                                                    alert("The scale is already present in the list.");
                                                }
                                            }}>
                                                Save Changes
                                            </Button>
                                        </Modal.Footer>
                                    </Modal>

                                </>
                            </Card.Body>
                        </div>

                        {isArchitecturalScale &&
                            <div style={{ flex: 1 }}>
                                <Card.Body>
                                    <Card.Title>
                                        Architectural Scale Format
                                    </Card.Title>
                                    <Form.Control
                                        type="text"
                                        required={true}
                                        placeholder="Enter scale in 1:y format"
                                        onChange={(e) => {
                                            setAvScale(e.target.value);
                                            const regex = /^\d+:\d+$/;
                                            if (regex.test(e.target.value)) {
                                                setAvScale(e.target.value);
                                                setIsArchitecturalScaleFormat(true);
                                            } else {
                                                setIsArchitecturalScaleFormat(false);
                                            }
                                        }}
                                        isInvalid={!isArchitecturalScaleFormat} // Mostra l'errore visivamente
                                        value={avScale}
                                    />
                                    {/* I'm not setting the value, thevalue will be still tehre untill the comontent is not unmounted (refreshed the page). 
                                    isArchitecturalScale  is still true untill you unmount the component */}
                                    <Form.Control.Feedback type="invalid">
                                        Please enter the scale in "1:y" format (e.g., 1:100).
                                    </Form.Control.Feedback>
                                </Card.Body>
                            </div>
                        }

                    </div >


                    {/**BOTTONI SALVA E CANCELLA MODIFICHE: */}
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        < Button
                            variant="primary"
                            className="d-flex flex-column align-items-center"
                            onClick={() => handleSaveChangesSection1()}
                            style={{
                                backgroundColor: '#3e5168',
                                border: 'none',
                                width: '30px',
                                height: '30px',
                                padding: '5px' // Opzionale, per ridurre il padding interno 
                            }}
                        >
                            <i className="bi bi-floppy-fill" style={{ fontSize: '15px' }} />
                        </Button >
                        <Button
                            variant="primary"
                            className="d-flex flex-column align-items-center"
                            onClick={() => handleRevertChangesSection1()}
                            style={{
                                backgroundColor: '#3e5168',
                                border: 'none',
                                width: '30px',
                                height: '30px',
                                padding: '5px' // Opzionale, per ridurre il padding interno 
                            }}
                        >
                            <i class="bi bi-x-circle" style={{ fontSize: '15px' }} />
                        </Button>
                    </div>

                    {/**Riga di separazione: */}
                    <p style={{ marginTop: '1px' }}>____________________________________________________________________________________________________</p>
                </>
                :
                <>
                    {/**Utente NON deve modificare SEZIONE 1: */}
                    {/** Metto Scala e AVScala uno a fianco all'altro: */}
                    <br />
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <div style={{ flex: 1 }}>
                            <Card.Body>
                                <Card.Title>Scale:</Card.Title>
                                <Card.Text style={{
                                    backgroundColor: '#9ebbd8',
                                    color: '#ffffff'
                                }}>
                                    {scale === "" ? "No description" : scale}
                                </Card.Text>
                            </Card.Body>
                        </div>
                        <div style={{ flex: 1 }}>
                            <Card.Body>
                                <Card.Title>AVScale:</Card.Title>
                                <Card.Text style={{
                                    backgroundColor: '#9ebbd8',
                                    color: '#ffffff'
                                }}>
                                    {avScale === "" ? "No description" : avScale}
                                </Card.Text>
                            </Card.Body>
                        </div>
                    </div>

                    {/*Le due iconcine di modifica posizione e modifica sezione1 in basso a destra uno sotto l'altro */}
                    {props.isUrbanPlanner &&

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', alignItems: 'flex-end', marginTop: '20px' }}> {/*gap: '1px' serve per mettere i due bottoni verticalmente più vicini*/}
                            <div>
                                <Button
                                    variant="primary"
                                    onClick={() => setIsPositionToBeModified(true)}
                                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'transparent', border: 'none' }}
                                >
                                    <img src={IconaModificaPosizione} alt="search" width="25" height="25" style={{ marginLeft: 'auto', marginBottom: '1px' }} />
                                    <span style={{ fontSize: '12px', color: 'black' }}>Modify position</span>
                                </Button>
                            </div>
                            <div>
                                <Button
                                    variant="primary"
                                    onClick={() => setIsSection1ToBeModify(true)}
                                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'transparent', border: 'none' }}
                                >
                                    <img src={IconaModificaSezione} alt="search" width="20" height="20" style={{ marginLeft: 'auto', marginBottom: '1px' }} />
                                    <span style={{ fontSize: '12px', color: 'black' }}>Modify section</span>
                                </Button>
                            </div>
                        </div>
                    }


                    {/**Riga di separazione: */}
                    <p style={{ marginTop: '1px' }}>____________________________________________________________________________________________________</p>

                </>
            }

        </>
    );

}


export default OffCanvasMarkerSezione1;

