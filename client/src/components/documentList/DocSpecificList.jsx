import "bootstrap/dist/css/bootstrap.min.css";
import "./DocList.css";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DocumentAPI from "../../api/documentAPI";
import { Table, Container, Button } from "react-bootstrap";
import Select from "react-select";
import PositionAPI from "../../api/positionAPI";


import { useParams } from "react-router-dom";

function DocSpecificList() {
    const { docId } = useParams();
    /*
    const [documents, setDocuments] = useState([]);

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                // Fetch dei documenti ceh hanno connsessione con il docId
                const res = await DocumentAPI.listDocuments();
                setDocuments(res || []);
            } catch (error) {
                console.error("Error fetching documents:", error);
            }
        };

        fetchDocuments();
    }, []);
    */

    return (
        <>
            <h2>Dettagli del documento con ID: {docId}</h2>

            <Table striped bordered hover className="custom-table shadow-sm">
                <thead style={{ backgroundColor: "#007bff", color: "white" }}>
                    <tr>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Stakeholders</th>
                        <th>Scale</th>
                        <th>Issuance Date</th>
                        <th>Type</th>
                        <th>Connections</th>
                        <th>Language</th>
                        <th>Pages</th>
                        <th>(lat, lng)</th>
                        <th>Files</th>
                    </tr>
                </thead>
                <tbody>
                    {/*documents.map((doc, index) => (
                        <DocumentRow key={index} document={doc} />
                    ))*/}
                </tbody>
            </Table>;


        </>
    );
};


export default DocSpecificList;