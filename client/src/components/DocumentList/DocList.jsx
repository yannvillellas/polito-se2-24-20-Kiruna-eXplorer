import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DocumentAPI from "../../api/documentAPI";
import { Table, Container } from "react-bootstrap";

function DocList(props) {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    const fetchDocuments = async () => {
      DocumentAPI.listDocuments().then((res) => {
        setDocuments(res || []);
      });
    };
    fetchDocuments();
  }, []);

  return (
    <Container>
      <h1 className="text-dark">Kiruna's Document Library</h1>
      <Table striped bordered hover>
        <thead>
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
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr key={doc.id}>
              <td>{doc.title}</td>
              <td>{doc.description}</td>
              <td>{doc.stakeholders}</td>
              <td>{doc.scale}</td>
              <td>{doc.issuanceDate}</td>
              <td>{doc.type}</td>
              <td>{doc.connections}</td>
              <td>{doc.language}</td>
              <td>{doc.pages}</td>
              <td>{doc.description}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

export default DocList;
