import React, { useState, useEffect } from "react";
import associationAPI from "../../api/associationAPI";
import { Modal, Row, Col, Form, Button } from "react-bootstrap";
import "./Link.css";
import associationApi from "../../api/associationAPI";
import Select from "react-select";

function Link(props) {
  const [doc1, setDoc1] = useState(""); // here there is the id so it is an integer!
  const [link, setLink] = useState("");
  const [doc2, setDoc2] = useState("");
  // const [documents, setDocuments] = useState([]); // State for documents
  const [linkTypes, setLinkTypes] = useState([]); // State for link types
  const [selectedTypes, setSelectedTypes] = useState([]);

  // Funzione per gestire il cambiamento della checkbox
  const handleCheckboxChange = (linkType) => {
    const isSelected = selectedTypes.some((type) => type === linkType);

    if (isSelected) {
      // Rimuovi la proprietà dallo stato se è deselezionata
      setSelectedTypes((prevSelected) =>
        prevSelected.filter((type) => type !== linkType)
      );
    } else {
      // Aggiungi la proprietà allo stato se è selezionata
      setSelectedTypes((prevSelected) => [...prevSelected, linkType]);
    }
    console.log(selectedTypes)
  };

  useEffect(() => {
    console.log("in Link ho questi documenti: ", props.documents)
    const fetchLinkTypes = async () => {
      try {
        const types = await associationApi.getLinkTypes();
        setLinkTypes(types);
      } catch (error) {
        console.error("Failed to fetch documents:", error);
      }
    };
    fetchLinkTypes();
  }, []);


  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();


    try {
      //console.log("Sono in link.jsx: sto spedendo,", association);
      console.log("tipi selezionati: ", selectedTypes)
      for (let link of selectedTypes) {
        console.log("stop creando associazione: ", link)
        let association = {
          doc1: `${props.docId}`, //doc1
          type: link,
          doc2: doc2
        };
        const createdAssociation = await associationAPI.createAssociation(association);

      }
      //console.log("Association created:", createdAssociation);
      // Reset form fields after successful submission
      setDoc1("");
      setLink("");
      setDoc2("");
      props.handleClose(); // Close modal after submission
    } catch (error) {
      console.error("Failed to create association:", error);
    }
  };

  return (
    <Row>
      <Col md={6}>
        <Form onSubmit={handleSubmit}>
          <Form.Group as={Row} className="mb-3">

            <Form.Label column sm="5">
              Document 1
            </Form.Label>

            <Col sm="7">
              {/*<Form.Select
                value={doc1} // doc1 will be the ID of the document, i don't do parseInt() so it will remain string
                onChange={(e) => setDoc1(e.target.value)} // Save ID in doc1  // ?*parseInt(*?e.target.value?*, 10)*?
              >
                <option value="" disabled>
                  Select a document
                </option>
                {props.documents.map((doc) => (
                  <option key={doc.docId} value={doc.docId}>
                    {doc.title}
                  </option>
                ))}
              </Form.Select>*/}
              <Form.Label>
                {props.title}
              </Form.Label>
            </Col>

          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm="5">
              Link Type
            </Form.Label>

            <Col sm="7">
              {/* dropdown menu <Form.Select
                value={link} // link is a string
                onChange={(e) => setLink(e.target.value)}
              >
                <option value="" disabled>
                  Select a link
                </option>
                {linkTypes.map((linkType) => (
                  <option key={linkType} value={linkType}>
                    {linkType}
                  </option>
                ))}
              </Form.Select>*/}
              {linkTypes.map((linkType) => (
                <Form.Check
                  key={linkType}
                  type="checkbox"
                  id={`checkbox-${linkType}`}
                  label={linkType}
                  checked={selectedTypes.some((type) => type === linkType)}
                  onChange={() => handleCheckboxChange(linkType)}
                />
              ))}
            </Col>
          </Form.Group>


          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm="5">
              Document 2
            </Form.Label>

            <Col sm="7">
              {/*<Form.Select
                value={doc2} // doc2 is the ID, i don't do parseInt() so it will remain string
                onChange={(e) => { setDoc2(e.target.value); console.log(props.documents) }} // ?*parseInt(e.target.value, 10)*?e.target.value
              >
                <option value="" disabled>
                  Select a document
                </option>
                {props.documents
                  //.filter((doc) => parseInt(doc.id, 10) !== parseInt(doc1, 10)) // Exclude doc1 from the list here you need to parse the id-string to integer
                  //.filter((doc) => doc.docId != doc1)
                  .map((doc) => (
                    <option key={doc.docId} value={doc.docId}>
                      {doc.title}
                    </option>
                  ))}
              </Form.Select>*/}
              <Select
                options={props.documents.map((d) => {
                  console.log(d.docId)
                  return { value: `${d.docId}`, label: d.title }
                })}
                /*value={props.documents.find((d) => d.docId = doc2)?.docId}*/
                isClearable
                placeholder="Select document"
                required={true}
                onChange={(selectedOption) => { console.log(selectedOption);setDoc2(selectedOption.value) }}
                menuPlacement="auto" // Posiziona il menu in base allo spazio disponibile
                menuPosition="fixed" // Evita overflow dal modal
                styles={{
                  menu: (base) => ({
                    ...base,
                    zIndex: 9999,
                  }),
                  menuList: (base) => ({
                    ...base,
                    maxHeight: '200px', // Imposta l'altezza massima del menu
                    overflowY: 'auto', // Abilita lo scroll verticale
                  }),
                }}
              />
            </Col>
          </Form.Group>
          <Form.Group>
            <Button onClick={() => props.handlePrev()} variant="secondary">Previous</Button>
            {/*doc1 && link &&*/selectedTypes.length > 0 && doc2 &&
              <Button variant="primary" type="submit" >
                Submit
              </Button>
            }
            <Button variant="danger" onClick={() => props.confirmClose()}>Continue without links</Button>
          </Form.Group>
        </Form>
      </Col>
    </Row>
  );
}

export default Link;
