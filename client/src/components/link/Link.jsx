import React, { useState, useEffect } from "react";
import associationAPI from "../../api/associationAPI"; 
import "./Link.css";

function Link() {
  const [doc1, setDoc1] = useState("");
  const [link, setLink] = useState("");
  const [doc2, setDoc2] = useState("");
  const [linkTypes, setLinkTypes] = useState([]); // State for link types

  // Fetch link types from the API on component mount
  useEffect(() => {
    const fetchLinkTypes = async () => {
      try {
        const types = await associationAPI.getLinkTypes();
        setLinkTypes(types);
      } catch (error) {
        console.error("Failed to fetch link types:", error);
      }
    };
    fetchLinkTypes();
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
    } catch (error) {
      console.error("Failed to create association:", error);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h2>Header</h2>
        <button className="logout">Logout</button>
      </header>
      <aside className="sidebar">
        <h3>Map</h3>
        {/* Placeholder for map, could be replaced with a map component later */}
      </aside>
      <main className="mainContent">
        <h2>Add Link</h2>
        <form onSubmit={handleSubmit} className="form">
          <div className="formGroup">
            <label>
              Doc1:
              <select value={doc1} onChange={(e) => setDoc1(e.target.value)}>
                <option value="">Select Doc1</option>
                <option value="doc1-1">Doc1 Option 1</option>
                <option value="doc1-2">Doc1 Option 2</option>
                {/* Additional options can be added here */}
              </select>
            </label>
          </div>
          <div className="formGroup">
            <label>
              Link:
              <select value={link} onChange={(e) => setLink(e.target.value)}>
                <option value="">Select Link</option>
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
              <select value={doc2} onChange={(e) => setDoc2(e.target.value)}>
                <option value="">Select Doc2</option>
                <option value="doc2-1">Doc2 Option 1</option>
                <option value="doc2-2">Doc2 Option 2</option>
                {/* Additional options can be added here */}
              </select>
            </label>
          </div>
          <div className="buttons">
            <button type="submit" className="submitButton">Submit</button>
            <button 
              type="button" 
              className="cancelButton" 
              onClick={() => { setDoc1(""); setLink(""); setDoc2(""); }}
            >
              Cancel
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default Link;
