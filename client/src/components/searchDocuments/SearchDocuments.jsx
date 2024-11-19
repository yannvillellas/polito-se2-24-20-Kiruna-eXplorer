import React, { useState, useEffect } from "react";
import DocumentAPI from "../../api/documentAPI";
import { Container, Row, Col, Form, Button, Table, Spinner } from "react-bootstrap";

function SearchDocuments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [allDocuments, setAllDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      try {
        const documents = await DocumentAPI.listDocuments();
        setAllDocuments(documents || []);
      } catch (error) {
        console.error("Error fetching documents:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const results = allDocuments.filter((doc) =>
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.stakeholders.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSearchResults(results);
  };
  return (
    <Container className="py-4">
      <h1 className="text-center mb-4">Search Documents</h1>
      <Form onSubmit={handleSearch}>
        <Row className="mb-3">
          <Col md={8}>
            <Form.Control
              type="text"
              placeholder="Enter title, description, or stakeholder..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Col>
          <Col md={4}>
            <Button type="submit" variant="primary" className="w-100">
              Search
            </Button>
          </Col>
        </Row>
      </Form>
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading documents...</p>
        </div>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Stakeholders</th>
              <th>Scale</th>
              <th>Issuance Date</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {searchResults.map((doc) => (
              <tr key={doc.docId}>
                <td>{doc.title}</td>
                <td>{doc.description}</td>
                <td>{doc.stakeholders}</td>
                <td>{doc.scale}</td>
                <td>{doc.issuanceDate}</td>
                <td>{doc.type}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      {searchResults.length === 0 && !loading && (
        <p className="text-center text-muted">No documents found.</p>
      )}
    </Container>
  );
}

export default SearchDocuments;
