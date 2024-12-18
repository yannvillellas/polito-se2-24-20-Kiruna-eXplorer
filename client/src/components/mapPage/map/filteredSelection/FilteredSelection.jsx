import { use } from 'react';
import Select from 'react-select';
import { useEffect, useState } from 'react';

/**
     *         <Select
                options={props.documents.map((doc) => {
                    return { value: doc.docId, label: doc.title }
                })}
                isClearable
                placeholder="Search document by title"
                required={true}
                onChange={(selectedOption) => handleShowSingeDocument(selectedOption?.value || null)}
                />
     */

function FilteredSelection(props) {
    const [selectOptions, setSelectOptions] = useState([]);

    // Gestisce il cambio di specificFilter
    useEffect(() => {
        console.log("FilteredSelection: ", props.specificFilter, props.documents);
        if (props.specificFilter === "Stakeholders") {
            // Prendi tutti da tutti i documenti tutti gli stakeholders, non ripetuti
            let stakeholders = [];
            props.documents.forEach(doc => {
                let stakeholdersInDoc = doc.stakeholders.trim().split(","); // Split dei valori separati da virgola
                console.log("stakeholdersInDoc: ", stakeholdersInDoc);

                if (stakeholdersInDoc.length > 0) {
                    stakeholdersInDoc.forEach(stakeholder => {
                        let trimmedStakeholder = stakeholder.trim(); // Rimuove spazi extra da ogni stakeholder
                        if (trimmedStakeholder && !stakeholders.includes(trimmedStakeholder)) { // Aggiungi solo se non vuoto e non già presente
                            stakeholders.push(trimmedStakeholder);
                        }
                    });
                }
            });

            console.log("stakeholders: ", stakeholders);
            setSelectOptions(stakeholders.map(stakeholder => {
                return { value: stakeholder, label: stakeholder }
            }));

        } else if (props.specificFilter === "Type") {
            // Prendi tutti da tutti i documenti tutti i tipi di documento, non ripetuti
            let types = [];
            props.documents.forEach(doc => {
                let type = doc.type.trim(); // Rimuove spazi extra da ogni tipo di documento
                if (type && !types.includes(type)) { // Aggiungi solo se non vuoto e non già presente
                    types.push(type);
                }
            });

            console.log("types: ", types);
            setSelectOptions(types.map(type => {
                return { value: type, label: type }
            }));
        } else if (props.specificFilter === "Title") {
            // Prendi tutti da tutti i documenti tutti i titoli, non ripetuti
            let titles = [];
            props.documents.forEach(doc => {
                let title = doc.title.trim(); // Rimuove spazi extra da ogni titolo
                if (title && !titles.includes(title)) { // Aggiungi solo se non vuoto e non già presente
                    titles.push(title);
                }
            });

            console.log("titles: ", titles);
            setSelectOptions(titles.map(title => {
                return { value: title, label: title }
            }));
        }

    }, [props.specificFilter, props.documents]);


    // Mi prendo tutti i docId in base al filtro selezionato e li mando al padre

    const handleShowSingeDocument = async (docId) => {
        if (!docId) { // Se non è stato selezionato nessun documento
            // setFilterOn(false);
            return;
        }

        // setFilterOn(true);
        // let docToShow = props.documents.filter(doc => doc.docId === docId);
        // setDocumentShown(docToShow);
    }


    const handleSendDocumentOnTheFather = (selectedOption) => {
        let documetentsToBeShown = [];
        console.log("selectedOption: ", selectedOption);
        if (selectedOption === null) {
            props.handleShowFilteredDocuments(documetentsToBeShown);
            return;
        }


        if (props.specificFilter === "Title") {
            props.documents.forEach(doc => {
                if (doc.title === selectedOption) {
                    documetentsToBeShown.push(doc);
                }
            });
            props.handleShowFilteredDocuments(documetentsToBeShown);
        }

        if (props.specificFilter === "Stakeholders") {
            let stakeholders = [];
            props.documents.forEach(doc => {
                let stakeholdersInDoc = doc.stakeholders.trim().split(","); // Split dei valori separati da virgola
                console.log("stakeholdersInDoc: ", stakeholdersInDoc);

                if (stakeholdersInDoc.length > 0) {
                    stakeholdersInDoc.forEach(stakeholder => {
                        let trimmedStakeholder = stakeholder.trim(); // Rimuove spazi extra da ogni stakeholder
                        if (trimmedStakeholder) { // Aggiungi solo se non vuoto e non già presente
                            stakeholders.push(trimmedStakeholder);

                            // Non mi prende i coumenti con stakeholder già segnati
                            if (trimmedStakeholder === selectedOption) {
                                documetentsToBeShown.push(doc);
                            }

                        }
                    });
                }
            });

            // Se la selectedOption è in stakeholdersInDoc, allora aggiungi il documento a documetentsToBeShown
            props.handleShowFilteredDocuments(documetentsToBeShown);

        };

        if (props.specificFilter === "Type") {
            props.documents.forEach(doc => {
                if (doc.type === selectedOption) {
                    documetentsToBeShown.push(doc);
                }
            });
            props.handleShowFilteredDocuments(documetentsToBeShown);
        }


    }


    return (
        <>
            {/**Select By title */}
            {!props.specificFilter &&

                <Select
                    options={selectOptions}
                    isClearable
                    placeholder="Select a filter"
                    required={true}
                    onChange={(selectedOption) => console.log(selectedOption?.value || null)}
                />
            }


            {props.specificFilter === "Title" &&

                <Select
                    options={selectOptions}
                    isClearable
                    placeholder="Search document by title"
                    required={true}
                    onChange={(selectedOption) => handleSendDocumentOnTheFather(selectedOption?.value || null)}
                />
            }
            {props.specificFilter === "Stakeholders" &&

                <Select
                    options={selectOptions}
                    isClearable
                    placeholder="Search document by stakeholders"
                    required={true}
                    onChange={(selectedOption) => handleSendDocumentOnTheFather(selectedOption?.value || null)}
                />
            }

            {props.specificFilter === "Type" &&

                <Select
                    options={selectOptions}
                    isClearable
                    placeholder="Search document by type"
                    required={true}
                    onChange={(selectedOption) => handleSendDocumentOnTheFather(selectedOption?.value || null)}
                />
            }

        </>

    );
}













export default FilteredSelection;