import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  FormControl,
  Modal,
} from "react-bootstrap";

function FirstPage(props) {
  const [showModal, setShowModal] = useState(false);
  const [docTitle, setDocTitle] = useState("");
  const [docType, setDocType] = useState("");
  const [docDescription, setDocDescription] = useState("");
  const [docLat, setDocLat] = useState("");
  const [docLong, setDocLong] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    // Add any form submission logic here
    setShowModal(false); // Close the modal after submission
  };

  const onBtnSelect = () => {
    setShowModal(true); // Show the modal when the plus button is clicked
  };

  const handleClose = () => setShowModal(false); // Hide the modal when close is clicked

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col className="d-flex justify-content-between align-items-center">
          <h1 className="text-primary">Welcome to Kiruna</h1>
          <Button
            onClick={onBtnSelect}
            className="btn-lg rounded-circle d-flex align-items-center justify-content-center"
            variant="primary"
            style={{ width: "50px", height: "50px" }}
          >
            <i className="bi bi-plus" style={{ fontSize: "1.5rem" }}></i>
          </Button>
        </Col>
      </Row>

      {/* Modal for the Form */}
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Insert New Document</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Title:</Form.Label>
              <Form.Control
                type="text"
                value={docTitle}
                onChange={(event) => setDocTitle(event.target.value)}
                placeholder="Enter title"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Type:</Form.Label>
              <Form.Select
                value={docType}
                onChange={(event) => setDocType(event.target.value)}
              >
                <option value="">Select type</option>
                <option value="type1">Type 1</option>
                <option value="type2">Type 2</option>
                <option value="type3">Type 3</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description:</Form.Label>
              <FormControl
                as="textarea"
                rows={3}
                value={docDescription}
                onChange={(event) => setDocDescription(event.target.value)}
                placeholder="Enter description"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Latitude:</Form.Label>
              <FormControl
                type="text"
                value={docLat}
                onChange={(event) => setDocLat(event.target.value)}
                placeholder="Enter latitude"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Longitude:</Form.Label>
              <FormControl
                type="text"
                value={docLong}
                onChange={(event) => setDocLong(event.target.value)}
                placeholder="Enter longitude"
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Submit
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Map Area */}
      <Row>
        <Col>
          <div
            className="border border-2 rounded bg-light"
            style={{
              height: "500px",
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <span className="text-muted fs-4">Map Area</span>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default FirstPage;
