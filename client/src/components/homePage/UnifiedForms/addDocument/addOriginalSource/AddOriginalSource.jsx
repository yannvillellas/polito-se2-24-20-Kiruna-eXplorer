import "bootstrap/dist/css/bootstrap.min.css";
import "./addOriginalSource.css";
import React, { useEffect, useState,useRef } from "react";
import { Container, Row, Col, Button, Form, Modal, Offcanvas } from "react-bootstrap";
import { FaTrashAlt } from "react-icons/fa"; // Importa l'icona del cestino





function AddOriginalSource(props){
    const [files, setFiles] = useState([]);

    const fileInputRef = useRef(null);

    useEffect(()=>{ 
      console.log("ho cambiato i file in ", files)
    },[files])

    const handleButtonClick = () => {
      // Simula il clic sull'input file nascosto
      console.log("click")
      fileInputRef.current.click();
      console.log("ho cliccato il form")
  };


    const handleFileChange = (e) => {
        console.log("proa")
        const selectedFiles = Array.from(e.target.files); // Convert the FileList object to an Array
        console.log("sono nel file change")
        console.log(selectedFiles)
        setFiles(selectedFiles); // Save the selected files in the state
        props.handleAddedFiles(selectedFiles);
    };

    const handleFileRemove = (index) => {
        console.log(files)
        const updatedFiles = files.filter((_, i) => i !== index);
        console.log(updatedFiles)
        setFiles(updatedFiles);
        props.handleAddedFiles(files);
    };

    return (
    <>
        <Form.Group controlId="formFileSm" className="mt-3">
            <Form.Label>Select here the file in input </Form.Label>
            {/* Bottone personalizzato */}
            <div>
              <Button onClick={handleButtonClick} className="btn-upload btn btn-primary">
                Upload files
              </Button>
              {files?.length>0? `${files.length} file(s) selected` : ""}
            </div>
            <Form.Control 
                type="file" 
                size="sm" 
                onChange={handleFileChange} 
                multiple // So multiple files can be selected
                ref={fileInputRef}
                style={{ display: "none" }}
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

