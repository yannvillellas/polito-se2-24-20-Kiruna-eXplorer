import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState } from "react";
import { Routes, Route, Outlet, Navigate, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Form, Modal, Offcanvas } from "react-bootstrap";
import Select from "react-select";




function AddOriginalSource(props){
    const [files, setFiles] = useState([]);


    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files); // Convert the FileList object to an Array
        setFiles(selectedFiles); // Save the selected files in the state
        props.handleAddedFiles(selectedFiles);
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
            <ul>
            {files.map((file, index) => (
                <li key={index}>
                {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </li>
            ))}
            </ul>
        )}
    </>
    );
}

export default AddOriginalSource;

