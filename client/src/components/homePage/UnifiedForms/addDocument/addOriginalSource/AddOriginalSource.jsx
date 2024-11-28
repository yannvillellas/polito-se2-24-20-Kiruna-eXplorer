import "bootstrap/dist/css/bootstrap.min.css";
import "./addOriginalSource.css";
import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Form, Modal, Offcanvas } from "react-bootstrap";
import { FaTrashAlt } from "react-icons/fa"; // Importa l'icona del cestino





function AddOriginalSource(props){
    const [files, setFiles] = useState([]);


    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files); // Convert the FileList object to an Array
        setFiles(selectedFiles); // Save the selected files in the state
        props.handleAddedFiles(selectedFiles);
    };

    const handleFileRemove = (index) => {
        const updatedFiles = files.filter((_, i) => i !== index);
        setFiles(updatedFiles);
        props.handleAddedFiles(files);
      };

    return (
    <>
        <Form.Group controlId="formFileSm" className="mt-3">
            <Form.Label>Select here the file in input </Form.Label>
            <Form.Control 
                type="file" 
                size="sm" 
                onChange={handleFileChange} 
                multiple // So multiple files can be selected
            />
        </Form.Group>

        {/* Lost of files uploaded */}
        {files.length > 0 && (
            <ul className="file-list">
            {files.map((file, index) => (
              <li key={index} className="file-item">
                <span className="file-name">
                  {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </span>
                <Button 
                  variant="link" 
                  className="delete-button" 
                  onClick={() => handleFileRemove(index)}
                >
                  <FaTrashAlt color="red" />
                </Button>
              </li>
            ))}
          </ul>
        )}
    </>
    );
}

export default AddOriginalSource;

