import React, { useState, useEffect } from "react";
import associationAPI from "../../../../api/associationAPI";
import { Modal, Row, Col, Form, Button } from "react-bootstrap";
import "./Link.css";
import Select from "react-select";

function Link(props) {

  const [linkTypes, setLinkTypes] = useState([]); // State for link types
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [doc2, setDoc2] = useState([]);
  const [doc1, setDoc1] = useState([]);

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

  const handleChangeDoc1 = (selectedOptions) => {
    setDoc1(selectedOptions || []);
  };

  const handleChangeDoc2 = (selectedOptions) => {
    setDoc2(selectedOptions || []);
  };

  useEffect(() => {
    const fetchLinkTypes = async () => {
      try {
        const types = await associationAPI.getLinkTypes();
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
      let errors = []
      if (!props.alone) {
        const docId = await props.handleAddDocument(props.newDocument); // this sentd to HomePage.jsx the new document
        for (let link of selectedTypes) {
          for (let dId2 of doc2) {
            let association = {
              doc1: docId,
              type: link,
              doc2: parseInt(dId2.value, 10)
            };
            const response = await associationAPI.createAssociation(association);
            if (response.msg) {
              const doc1Title = props.documents.find(doc => doc.docId === association.doc1)
              const doc2Title = props.documents.find(doc => doc.docId === association.doc2)
              errors.push(<>the link of type <strong>{link}</strong> between documents <strong>{doc1Title.title}</strong> and <strong>{doc2Title.title}</strong> already exist</>)

            }
          }
        }
        props.setErrorMsg(errors)
        props.handleClose(); // Close modal after submission

      } else {  //the link form is detached from addDocument form
        for (let link of selectedTypes) {
          for (let dId1 of doc1) {
            for (let dId2 of doc2) {
              let association = {
                doc1: dId1.value, //doc1
                type: link,
                doc2: dId2.value
              };
              const response = await associationAPI.createAssociation(association);
              if (response.msg) {
                const doc1Title = props.documents.find(doc => doc.docId === association.doc1)
                const doc2Title = props.documents.find(doc => doc.docId === association.doc2)
                errors.push(<>the link of type <strong>{link}</strong> between documents <strong>{doc1Title.title}</strong> and <strong>{doc2Title.title}</strong> already exist</>)

              }
            }
          }
        }
        props.setErrorMsg(errors)
        setDoc1([])
        props.setOnlyLinkForm(false)
      }
      // Reset form fields after successful submission
      setLinkTypes([]);
      setDoc2([]);
    } catch (error) {
      console.error("Failed to create association:", error);
    }

  };

  return (
    <Row className="add-link-form">
      <Col>
        <Form onSubmit={handleSubmit}>
          <Form.Group as={Row} className="mb-3">

            <Form.Label column sm="2">
              Document 1
            </Form.Label>

            <Col sm="9">
              {props.alone ?
                <Select
                  options={props.documents
                    .filter((d) => !doc2.some((doc) => doc.value === d.docId))
                    .map((d) => {
                      return { value: d.docId, label: d.title }
                    })}
                  isClearable
                  placeholder="Select document"
                  required={true}
                  /*onChange={(selectedOption) => {
                    setDoc1(selectedOption ? selectedOption.value : "");
                  }}*/
                  onChange={handleChangeDoc1}
                  isMulti
                  value={doc1}
                  menuPlacement="auto"
                  menuPosition="fixed"
                  styles={{
                    menu: (base) => ({
                      ...base,
                      zIndex: 9999,
                    }),
                    menuList: (base) => ({
                      ...base,
                      maxHeight: '200px',
                      overflowY: 'auto',
                    }),
                  }}
                />
                :
                <Form.Label>
                  {props.title}
                </Form.Label>
              }
            </Col>

          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm="2">
              Link Type
            </Form.Label>

            <Col sm="9">
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
            <Form.Label column sm="2">
              Document 2
            </Form.Label>


            <Col sm="9">
              <Select
                options={props.documents
                  .filter((d) => !doc1.some((doc) => doc.value === d.docId))
                  .map((d) => {
                    return { value: d.docId, label: d.title }
                  })}
                isClearable
                placeholder="Select document"
                required={true}
                /*onChange={(selectedOption) => {
                  setDoc2(selectedOption ? selectedOption.value : "");
                }}*/
                isMulti
                value={doc2}
                onChange={handleChangeDoc2}
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
            {props.alone ?
              <Button onClick={() => props.setOnlyLinkForm(false)} variant="secondary">Close</Button>
              :
              <Button onClick={() => props.handlePrev()} variant="secondary">Previous</Button>
            }

            {(doc1 !== "" || !props.alone) && selectedTypes.length > 0 && doc2 !== "" &&
              <Button variant="primary" type="submit" >
                Submit
              </Button>
            }

            {props.alone == false ?
              <Button variant="danger" onClick={() => props.confirmClose()}>Skip links</Button>
              :
              ""
            }
          </Form.Group>
        </Form>
      </Col>

    </Row>
  );
}

export default Link;
