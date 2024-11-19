import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DocumentAPI from "../../api/documentAPI";
import { Table, Container, Spinner } from "react-bootstrap";
import "../../DocList.css";
import "bootstrap/dist/css/bootstrap.min.css";
function DocList() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await DocumentAPI.listDocuments();
        setDocuments(res || []);
      } catch (error) {
        console.error("Error fetching documents:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  return (
    <div className="min-vh-100 py-4">
      <header className="text-center my-4">
        <h1>Kiruna's Document Library</h1>
      </header>

      <Container>
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Loading documents...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center text-muted py-5">
            <p>No documents found. Please try again later.</p>
          </div>
        ) : (
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
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr
                  key={doc.id}
                  onClick={() => navigate(`/document/${doc.id}`)}
                  className="clickable-row"
                >
                  <td>{doc.title}</td>
                  <td>{doc.description}</td>
                  <td>{doc.stakeholders}</td>
                  <td>{doc.scale}</td>
                  <td>{doc.issuanceDate}</td>
                  <td>{doc.type}</td>
                  <td>{doc.connections}</td>
                  <td>{doc.language}</td>
                  <td>{doc.pages}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Container>
    </div>
  );
}

export default DocList;
