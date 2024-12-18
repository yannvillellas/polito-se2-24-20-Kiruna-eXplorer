import { Container, Modal, Button, Tooltip, OverlayTrigger, Offcanvas, Form, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import scaleAPI from "../../../api/scaleAPI";
import Select from "react-select";
import ChosenPosition from "../UnifiedForms/chosenPosition/ChosenPosition";
import stakeholderAPI from "../../../api/stakeholderAPI";
import documentTypeAPI from "../../../api/documentTypeAPI";
import DocumentAPI from "../../../api/documentAPI";
import areaAPI from "../../../api/areaAPI";
import { use } from "react";

import IconaModificaSezione from "../../assets/iconaModificaSezione.png";
import IconaStakeolder from "../../assets/iconaStakeolder.png";
import IconaIssuanceDate from "../../assets/iconaIssuanceDate.png";
import IconaType from "../../assets/iconaType.png";


// Sezione2: Stakeholder, Issuance Data, Type, Language, Pages


function OffCanvasMarkerSezione2(props) {

    const [stakeholders, setStakeholders] = useState(""); // In  selectedDocument sono: stakeholders: "Municipality, Architecture firms"
    const [oldStakeholders, setOldStakeholders] = useState("");
    const [stakeholdersOptions, setStakeholdersOptions] = useState([]); // Qui ci vanno i stakeholders che vengono dal server
    const [selectedOption, setSelectedOption] = useState([]); // Qui ci vanno i stakeholders selezionati dall'utente


    const [issuanceDate, setIssuanceDate] = useState("");
    const [oldIssuanceDate, setOldIssuanceDate] = useState("");

    const [type, setType] = useState("");
    const [typeOptions, setTypeOptions] = useState([]); // Qui ci vanno i type che vengono dal server
    const [oldType, setOldType] = useState("");
    const [showModalAddNewType, setShowModalAddNewType] = useState(false);
    const [newType, setNewType] = useState("");

    const [language, setLanguage] = useState("");
    const languageOptions = [
        { value: "Swedish", label: "Swedish" },
        { value: "English", label: "English" },
    ];
    const [oldLanguage, setOldLanguage] = useState("");

    const [pages, setPages] = useState("");
    const [oldPages, setOldPages] = useState("");

    const [isSectionToBeModify, setIsSection1ToBeModify] = useState(false);
    const [showModalAddNewStakeholder, setShowModalAddNewStakeholder] = useState(false);
    const [newStakeholder, setNewStakeholder] = useState("");

    useEffect(() => {
        if (props.selectedDoc) {
            setStakeholders(props.selectedDoc.stakeholders);
            setOldStakeholders(props.selectedDoc.stakeholders);
            setSelectedOption(props.selectedDoc.stakeholders.split(", ").map((s) => { return { value: s, label: s } }));

            setIssuanceDate(props.selectedDoc.issuanceDate);
            setNewIssuanceDate(props.selectedDoc.issuanceDate);
            setOldIssuanceDate(props.selectedDoc.issuanceDate);

            setType(props.selectedDoc.type);
            setOldType(props.selectedDoc.type);

            setLanguage(props.selectedDoc.language);
            setOldLanguage(props.selectedDoc.language);

            setPages(props.selectedDoc.pages);
            setOldPages(props.selectedDoc.pages);
        }
    }, [props.selectedDoc]);


    useEffect(() => {
        const fetchTypeOptions = async () => {
            const typeList = await documentTypeAPI.getDocumentTypes();
            console.log("OffCanvas2, TypeOptions:", typeList);
            setTypeOptions(typeList.map((t) => { return { value: parseInt(t.dtId, 10), label: t.type } }));
        }

        fetchTypeOptions();
    }, [props.selectedDoc]);


    useEffect(() => {
        const fetchStakeHoldersOptions = async () => {
            const stakeholderList = await stakeholderAPI.getStakeholders();
            setStakeholdersOptions(stakeholderList.map((s) => { return { value: parseInt(s.shId, 10), label: s.name } }));
            console.log("OffCanvas2, StakeholdersOptions:", stakeholderList);
        }

        fetchStakeHoldersOptions();
    }, [props.selectedDoc]);





    const handleChangeMultiStakeholders = (selectedOptions) => {
        setSelectedOption(selectedOptions);
        console.log('Selected options:', selectedOptions);
    };


    const handleRevertChanges = () => {

        setStakeholders(props.selectedDoc.stakeholders); // altrimenti crasha se cambi dopo la prima volta
        setIssuanceDate(oldIssuanceDate);
        setType(oldType);
        setLanguage(oldLanguage);
        setPages(oldPages);

        setIsSection1ToBeModify(false);
    };


    const handleSaveChanges = async () => {

        // Controlli: di TUTTI I CAMPI
        // if(.....)
        /*if (!isIssuanceDateValid) {
            alert("Please enter the date in 'yyyy/mm/dd' format. Year is mandatory, month and day are optional.");
            return;
        }
            */
        if (selectedOption.length === 0 || type === "" || language === "" || pages === "" || issuanceDate === "" || !isIssuanceDateValid) {
            alert("The fields cannot be empty or not in the correct format.");
            return;
        }

        setOldStakeholders(selectedOption);
        setStakeholders(selectedOption.map(option => option.label).join(", ")); // così li slvo come stringa con la virgola nel db.

        setOldIssuanceDate(issuanceDate);
        setOldType(type);
        setOldLanguage(language);
        setOldPages(pages);

        setIsSection1ToBeModify(false);

        // Aggiunta al database...

        const lastVersionDocument = await DocumentAPI.listDocuments().then((documents) => {
            return documents.filter((document) => document.docId === props.selectedDoc.docId)[0];
        });

        console.log("offcanvaMarkerSezione2, lastVersionDocument: ", lastVersionDocument);


        const updatedDocument = {
            docId: props.selectedDoc.docId,
            ...lastVersionDocument,
            stakeholders: selectedOption.map(option => option.label).join(", "), // altrimenti lo stato non viene aggiornato in tempo
            issuanceDate: issuanceDate,
            type: type,
            language: language,
            pages: pages,
        };

        console.log("offcanvaMarkerSezione2, sto spedendo ad updateDocument: ", updatedDocument);
        const res = await DocumentAPI.updateDocument(updatedDocument);

        // Per avere un refresh del documento:
        props.handleForceRefresh();
    };






    // UseEffect, check se issua date è già valida (anche se per default se è scritta lo è)

    const [isIssuanceDateValid, setIsIssuanceDateValid] = useState(true);
    const [newIssuanceDate, setNewIssuanceDate] = useState("");
    const handleDateChange = (e) => {
        const value = e.target.value;
        const regex = /^[1-9][0-9]{3}(\/(0[1-9]|1[0-2])(\/(0[1-9]|[1-2][0-9]|3[0-1]))?)?$/;
        if (regex.test(value)) {
            setIsIssuanceDateValid(true);
            setIssuanceDate(value);
        } else {
            setIsIssuanceDateValid(false);
        }
        setNewIssuanceDate(value);
    };

    const handleAddNewStakeholderTOTheDb = async (newStakeholder) => {
        // Aggiungi stakeholder al db:
        const newStakeholderId = await stakeholderAPI.addStakeholder(newStakeholder);
        console.log("OffCanvas2, ho aggiunto al db lo skatakeholder, newStakeholderId:", newStakeholder, newStakeholderId);
    };



    return (
        <>
            {isSectionToBeModify ?

                <>
                    {/**Gestione della modifica di stakeolders */}
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <div style={{ flex: 1 }}>
                            <Card.Body>
                                <Card.Title style={{ paddingLeft: '20px' }}>
                                    <img src={IconaStakeolder} alt="search" width="45" height="45" style={{ marginLeft: '40px' }} />
                                    <br />
                                    Stakeholder(s)
                                </Card.Title>


                                <Select
                                    options={stakeholdersOptions}
                                    value={selectedOption}
                                    onChange={handleChangeMultiStakeholders}
                                    isMulti={true}
                                    placeholder="Select"
                                />

                                <>
                                    <Button
                                        variant="primary"
                                        onClick={() => setShowModalAddNewStakeholder(true)}
                                        style={{
                                            backgroundColor: '#3e5168',
                                            border: 'none',
                                            marginTop: '4px',
                                            fontSize: '18px' // Riduce la dimensione del testo
                                        }}
                                    >
                                        Add new stakeholder
                                    </Button>

                                    <Modal show={showModalAddNewStakeholder} onHide={() => setShowModalAddNewStakeholder(false)}>
                                        <Modal.Header closeButton>
                                            <Modal.Title>Please, add the new stakeholder</Modal.Title>
                                        </Modal.Header>
                                        <Modal.Body>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Stakeholder </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    required={true}
                                                    placeholder="Enter stakeholder"
                                                    onChange={(e) => setNewStakeholder(e.target.value)}
                                                />
                                            </Form.Group>
                                        </Modal.Body>
                                        <Modal.Footer>
                                            <Button variant="secondary" onClick={() => { setNewStakeholder(""); setShowModalAddNewStakeholder(false); }}>
                                                Close
                                            </Button>
                                            <Button variant="primary" onClick={() => {

                                                // Se la scala non è già presente nell'elenco delle scale, aggiungila
                                                if (!stakeholdersOptions.some(option => option.label === newStakeholder)) {
                                                    stakeholdersOptions.push({ value: stakeholdersOptions.length + 1, label: newStakeholder });

                                                    setNewStakeholder("");
                                                    setShowModalAddNewStakeholder(false);

                                                    // Aggiungi stakeholder al db:
                                                    handleAddNewStakeholderTOTheDb(newStakeholder);

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

                        {/**Gestione di issuance date */}
                        <div style={{ flex: 1 }}>
                            <Card.Body>
                                <Card.Title style={{ paddingLeft: '25px' }}>
                                    <img src={IconaIssuanceDate} alt="search" width="45" height="45" style={{ marginLeft: '40px' }} />
                                    <br />
                                    Issuance Date
                                </Card.Title>

                                <Form.Control
                                    type="text"
                                    required={true}
                                    placeholder="Enter date in yyyy/mm/dd format"
                                    value={newIssuanceDate}
                                    onChange={handleDateChange}
                                    isInvalid={!isIssuanceDateValid}
                                />
                                <Form.Control.Feedback type="invalid">
                                    Year is mandatory.
                                </Form.Control.Feedback>
                            </Card.Body>
                        </div>

                        {/**Gestione di Type */}
                        <div style={{ flex: 1 }}>
                            <Card.Body>
                                <Card.Title style={{ paddingLeft: '60px' }}>
                                    <img src={IconaType} alt="search" width="45" height="45" />
                                    <br />
                                    Type
                                </Card.Title>
                                <Select
                                    options={typeOptions}
                                    placeholder="Please, select the type"
                                    value={typeOptions.find(option => option.label === type)}
                                    onChange={(option) => setType(option.label)}
                                />

                                <>

                                    <Button
                                        variant="primary"
                                        onClick={() => setShowModalAddNewType(true)}
                                        style={{ backgroundColor: '#3e5168', border: 'none', marginTop: '4px' }}
                                    >
                                        Add new type
                                    </Button>

                                    <Modal show={showModalAddNewType} onHide={() => setShowModalAddNewType(false)}>
                                        <Modal.Header closeButton>
                                            <Modal.Title>Please, add the new type</Modal.Title>
                                        </Modal.Header>
                                        <Modal.Body>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Type Name</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    required={true}
                                                    placeholder="Enter scale name"
                                                    onChange={(e) => setNewType(e.target.value)}
                                                />
                                            </Form.Group>
                                        </Modal.Body>
                                        <Modal.Footer>
                                            <Button variant="secondary" onClick={() => { setNewType(""); setShowModalAddNewType(false); }}>
                                                Close
                                            </Button>
                                            <Button variant="primary" onClick={async () => {

                                                // Se la scala non è già presente nell'elenco delle scale, aggiungila
                                                if (!typeOptions.some(option => option.label === newType)) {
                                                    typeOptions.push({ value: typeOptions.length + 1, label: newType });

                                                    // Perchè non faccio aggiungere nuovi architectural scale, perchè si può modificare direttametne solo ASvalue
                                                    setType(newType);
                                                    setNewType("");
                                                    setShowModalAddNewType(false);

                                                    // Aggiungo la scala al db, così è riusabile
                                                    const risposta = await documentTypeAPI.addDocumentType(newType);

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
                    </div>


                    {/**Gestione di Language */}
                    <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                        <div style={{ flex: 1 }}>

                            <Card.Body>
                                <Card.Title>
                                    Language
                                </Card.Title>
                                <Select
                                    options={languageOptions}
                                    placeholder="Select Language"
                                    value={languageOptions.find(opt => opt.value === language)}
                                    onChange={(option) =>
                                        setLanguage(option.value)
                                    }

                                />
                            </Card.Body>
                        </div>


                        {/**Gestione di Pages */}
                        <div style={{ flex: 1 }}>
                            <Card.Body>
                                <Card.Title>
                                    Pages
                                </Card.Title>
                                <Form.Control
                                    type="text"
                                    value={pages}
                                    onChange={(e) => setPages(e.target.value)}

                                />
                            </Card.Body>
                        </div>

                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <Button
                            variant="primary"
                            className="d-flex flex-column align-items-center"
                            onClick={() => handleSaveChanges()}
                            style={{
                                backgroundColor: '#3e5168',
                                border: 'none',
                                width: '30px',
                                height: '30px',
                                padding: '5px' // Opzionale, per ridurre il padding interno 
                            }}
                        >
                            <i className="bi bi-floppy-fill" style={{ fontSize: '15px' }} />
                        </Button>
                        <Button
                            variant="primary"
                            className="d-flex flex-column align-items-center"
                            onClick={() => handleRevertChanges()}
                            style={{
                                backgroundColor: '#3e5168',
                                border: 'none',
                                width: '30px',
                                height: '30px',
                                padding: '5px' // Opzionale, per ridurre il padding interno 
                            }}
                        >
                            <i className="bi bi-x-circle" style={{ fontSize: '15px' }} />
                        </Button>
                    </div>
                    {/**Riga di separazione: */}
                    <p style={{ marginTop: '10px' }}>____________________________________________________________________________________________________</p>
                </>


                :

                <>
                    {/**Utente NON deve modificare SEZIONE 1: */}
                    {/** Metto Scala e AVScala uno a fianco all'altro: */}
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <div style={{ flex: 1 }}>
                            <Card.Body>
                                <Card.Title style={{ paddingLeft: '20px' }}>
                                    <img src={IconaStakeolder} alt="search" width="45" height="45" style={{ marginLeft: '40px' }} />
                                    <br />
                                    Stakeholder(s)
                                </Card.Title>

                                <Card.Text style={{
                                    backgroundColor: '#ffffff', // Sfondo bianco
                                    color: '#000000', // Testo nero (o altro colore a tua scelta)
                                    border: '2px solid #9ebbd8', // Bordo celeste
                                    borderRadius: '5px', // Angoli arrotondati (opzionale)
                                    paddingLeft: '5px'
                                }}

                                >
                                    {stakeholders === "" ? "No stakeholders" : stakeholders}
                                </Card.Text>
                            </Card.Body>
                        </div>
                        <div style={{ flex: 1 }}>
                            <Card.Body>
                                <Card.Title style={{ paddingLeft: '25px' }}>
                                    <img src={IconaIssuanceDate} alt="search" width="45" height="45" style={{ marginLeft: '40px' }} />
                                    <br />
                                    Issuance Date
                                </Card.Title>
                                <Card.Text style={{
                                    backgroundColor: '#ffffff', // Sfondo bianco
                                    color: '#000000', // Testo nero (o altro colore a tua scelta)
                                    border: '2px solid #9ebbd8', // Bordo celeste
                                    borderRadius: '5px', // Angoli arrotondati (opzionale)
                                    paddingLeft: '5px'
                                }}>
                                    {issuanceDate === "" ? "No issuance date" : issuanceDate}
                                </Card.Text>
                            </Card.Body>
                        </div>
                        <div style={{ flex: 1 }}>
                            <Card.Body>
                                <Card.Title style={{ paddingLeft: '60px' }}>
                                    <img src={IconaType} alt="search" width="45" height="45" />
                                    <br />
                                    Type
                                </Card.Title>
                                <Card.Text style={{
                                    backgroundColor: '#ffffff', // Sfondo bianco
                                    color: '#000000', // Testo nero (o altro colore a tua scelta)
                                    border: '2px solid #9ebbd8', // Bordo celeste
                                    borderRadius: '5px', // Angoli arrotondati (opzionale)
                                    paddingLeft: '2px'
                                }}>
                                    {type === "" ? "No type" : type}
                                </Card.Text>
                            </Card.Body>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                        <div style={{ flex: 1 }}>
                            <Card.Body>
                                <Card.Title style={{ marginBottom: '2px' }}>Language</Card.Title>
                                <Card.Text style={{
                                    backgroundColor: '#9ebbd8',
                                    color: '#ffffff'
                                }}>
                                    {language === "" ? "No language" : language}
                                </Card.Text>
                            </Card.Body>
                        </div>
                        <div style={{ flex: 1 }}>
                            <Card.Body>
                                <Card.Title style={{ marginBottom: '2px' }}>Pages</Card.Title>
                                <Card.Text style={{
                                    backgroundColor: '#9ebbd8',
                                    color: '#ffffff'
                                }}>
                                    {pages === "" ? "No pages" : pages}
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
                    <p style={{ marginTop: '10px' }}>____________________________________________________________________________________________________</p>
                </>


            }



        </>
    )
};


export default OffCanvasMarkerSezione2;


