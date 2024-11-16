import React, { useState, useEffect } from "react";
import associationAPI from "../../api/associationAPI";
import { Modal, Row, Col, Form, Button } from "react-bootstrap";
import "./Link.css";
import Select from "react-select";

function Link(props) {
  
  const [linkTypes, setLinkTypes] = useState([]); // State for link types
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [doc2, setDoc2] = useState("");

  // It works
  // Funzione per gestire il cambiamento della checkbox
  const handleCheckboxChange = (linkType) => {
    setSelectedTypes((prevSelected) => {
      const isSelected = prevSelected.includes(linkType);
      if (isSelected) {
        return prevSelected.filter((type) => type !== linkType);
      } else {
        return [...prevSelected, linkType];
      }
    });

  };

  // for checking the selected types
  useEffect(() => {
    console.log("Sono in Link.jsx, ho selezionato i tipi di link: ", selectedTypes);
  }, [selectedTypes]);


  // it works
  useEffect(() => {
    console.log("Sono in Link.jsx, ho ricevuto da HomePages.jsx questi documenti: ", props.documents)
    const fetchLinkTypes = async () => {
      try {
        const types = await associationAPI.getLinkTypes();
        console.log("Sono in Link.jsx, ho ricevuto dal db i tipi di link, in forma di vettore: ", types);
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
      const docId = await props.handleAddDocument(props.newDocument); // this sentd to HomePage.jsx the new document----------------------------------------------------------------------------------------
      console.log("Sono in Link.jsx, ho mandato il documento a HomePage.jsx, mi è tornato l'id: ", props.newDocument, docId);
      //console.log("Sono in link.jsx: sto spedendo,", association);
      console.log("tipi selezionati: ", selectedTypes)
      for (let link of selectedTypes) {
        console.log("stop creando associazione: ", link)
        let association = {
          doc1: docId, //doc1
          type: link,
          doc2: doc2
        };
        console.log("sto creando associazione: ", association)
        await associationAPI.createAssociation(association);

      }
      // Reset form fields after successful submission
      setLinkTypes([]);
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
              {linkTypes.map((linkType) => (
                <Form.Check
                  key={linkType}
                  type="checkbox"
                  id={`checkbox-${linkType}`}
                  label={linkType}
                  checked={selectedTypes.includes(linkType)}
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
              <Select
                options={props.documents.map((d) => {
                  return { value: d.docId, label: d.title }
                })}
                isClearable
                placeholder="Select document"
                required={true}
                onChange={(selectedOption) => {
                  setDoc2(selectedOption ? selectedOption.value : "");
                }}
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
