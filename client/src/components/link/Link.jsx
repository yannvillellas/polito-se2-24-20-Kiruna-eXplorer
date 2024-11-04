import React, { useState, useEffect } from "react";
import associationAPI from "../../api/associationAPI"; 
import { Modal } from "react-bootstrap";
import "./Link.css";

function Link(props) {
  const [doc1, setDoc1] = useState("");
  const [link, setLink] = useState("");
  const [doc2, setDoc2] = useState("");
  const [documents, setDocuments] = useState([]); // State for documents
  const [linkTypes, setLinkTypes] = useState([]); // State for link types

  // Static link types if not fetching from backend
  const staticLinkTypes = ["Direct Consequence", "Collateral Consequence", "Projection"];

  // Set link types to static values
  useEffect(() => {
    setLinkTypes(staticLinkTypes); // Use static link types
  }, []);

  // Fetch documents from the API
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const docs = await associationAPI.getDocuments();
        setDocuments(docs);
      } catch (error) {
        console.error("Failed to fetch documents:", error);
      }
    };
    fetchDocuments();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const association = { doc1, link, doc2 };

    try {
      const createdAssociation = await associationAPI.createAssociation(association); // Create association using API
      console.log("Association created:", createdAssociation);
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
    <Modal show={props.showModalLink} onHide={props.handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Link Documents</Modal.Title>
      </Modal.Header> 
      <Modal.Body>
        <main className="text-center">
          <h2>Add Link</h2>
          <form onSubmit={handleSubmit} className="form">
            <div className="formGroup">
              <label>
                Doc1:
                <select value={doc1} onChange={(e) => setDoc1(e.target.value)} required>
                  <option value="">Select Document 1</option>
                  {documents.map((doc) => (
                    <option key={doc.docId} value={doc.docId}>
                      {doc.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="formGroup">
              <label>
                Link Type:
                <select value={link} onChange={(e) => setLink(e.target.value)} required>
                  <option value="">Select Link Type</option>
                  {linkTypes.map((type, index) => (
                    <option key={index} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="formGroup">
              <label>
                Doc2:
                <select value={doc2} onChange={(e) => setDoc2(e.target.value)} required>
                  <option value="">Select Document 2</option>
                  {documents.map((doc) => (
                    <option key={doc.docId} value={doc.docId}>
                      {doc.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="buttons justify-content-center">
              <button type="submit" className="submitButton">Submit</button>
              <button 
                type="button" 
                className="cancelButton" 
                onClick={() => { setDoc1(""); setLink(""); setDoc2(""); props.handleClose(); }}
              >
                Cancel
              </button>
            </div>
          </form>
        </main>
      </Modal.Body>
    </Modal>
  );
}

export default Link;
