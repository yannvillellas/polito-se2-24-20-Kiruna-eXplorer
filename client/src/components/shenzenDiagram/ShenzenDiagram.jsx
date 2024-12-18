import "bootstrap/dist/css/bootstrap.min.css";
import "./ShenzenDiagram.css"
import React, { useEffect, useState, useRef } from "react";
import { scaleTime, scaleBand } from "@visx/scale";
import DocumentAPI from "../../api/documentAPI";
import { line, curveBasis } from "d3-shape";
import associationAPI from "../../api/associationAPI";
import { OverlayTrigger, Tooltip, Overlay, Modal, Button } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import Nodes from "./Nodes";
import Links from "./Links";
import diagramAPI from "../../api/diagramAPI";
import * as d3 from "d3"
import { use } from "react";

function ShenzenDiagram(props) {
  const { docId } = useParams();
  const [isUrbanPlanner] = useState(props.role === 'urbanPlanner');
  const [isOpen, setIsOpen] = useState(false); //legend trigger
  const associationsData = [
    { type: "solid", color: "#000000", label: "Direct consequence" },
    { type: "solid", color: "#0018a5", label: "Indirect consequence" },
    { type: "dashed", color: "#da4700", label: "Collateral consequence" },
    { type: "dashed", color: "#00920e", label: "Projection" },
    { type: "dotted", color: "#bf21b2", label: "Update" },
    { type: "dash-dotted", color: "#757575", label: "Others" },
  ];

  const validDocTypes = [
    "Design document",
    "Informative document",
    "Material effect",
    "Prescriptive document",
    "Technical document",
    "Other document"
  ];

  //create data for diagram from documents and links
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [files, setFiles] = useState(); // Got called here when a user press on the document (is bettere if is here? I think yes bc otherwise every time you have add/modify a new document in APP.jsx )  
  const [linkedDocuments, setLinkedDocuments] = useState([]); // Call API (getAssociationBy_DOC_ID), but here is easier (same concept of files) where each element will have structure: {aId: 1, title: "title", type: "type", doc1: doc1Id, doc2: doc2Id}
  const [nodesPosition, setNodesPosition] = useState({})
  const [xScale, setXScale] = useState(null);
  const [yScale, setYScale] = useState(null);
  const [fixedPositions, setFixedPositions] = useState({})
  const marginLeft = 50; // Aggiungi un margine per spostare a destra il grafico

  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight - 150,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight - 150,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const selectType = (typeId) => {
    if (typeId == 1 || typeId == 2) {  //direct and indirect consequence
      return "solid"
    } else if (typeId == 3 || typeId == 4) {  //projection and collateral consequence
      return "dashed"
    } else if (typeId == 5) { //update
      return "dotted"
    } else { //other
      return "dash-dotted"
    }
  }

  const selectLinkColor = (typeId) => {
    if (typeId == 1) {  //direct consequence
      return "#000000"    //black
    } else if (typeId == 2) {  //indirect consequence
      return "#0018a5"    //blue
    } else if (typeId == 3) {  //collateral consequence
      return "#da4700"     //orange
    } else if (typeId == 4) {  //projection
      return "#00920e"    //green
    } else if (typeId == 5) {  //update
      return "#bf21b2"    //purple
    } else {  //other types
      return "#757575"    //grey
    }
  }

  const selectDate = (date) => {
    if (date.split("/").length == 1) {  //only year
      return date + "/01/01"  //add month and day
    } else if (date.split("/").length == 2) {  //only month and year
      return date + "/01" //add day
    } else {
      return date //complete date
    }
  }

  const selectColor = (sh) => {
    if (sh.split(",").length > 1) {//more than 1 stakeholders==> others
      return "#819d9f"
    }

    if (sh === "LKAB") {
      return "#181a1b"
    } else if (sh === "Municipality") {
      return "#805f5b"
    } else if (sh === "Regional authority") {
      return "#62222c"
    } else if (sh === "Architecture firms") {
      return "#a8a19b"
    } else if (sh === "Citizens") {
      return "#a5cacc"
    } else {  //others
      return "#819d9f"
    }
  }

  function findDateRange(nodes) {
    // Inizializza le date più vicina e più lontana con la data del primo nodo
    const { minDate, maxDate } = nodes.reduce(
      (acc, node, index) => {
        const nodeDate = new Date(node.date);

        // Per il primo nodo, inizializza minDate e maxDate
        if (index === 0) {
          acc.minDate = nodeDate;
          acc.maxDate = nodeDate;
        } else {
          // Aggiorna la data più vicina (minDate)
          if (nodeDate < acc.minDate) acc.minDate = nodeDate;
          // Aggiorna la data più lontana (maxDate)
          if (nodeDate > acc.maxDate) acc.maxDate = nodeDate;
        }

        return acc;
      },
      {}
    );

    return [minDate, maxDate];
  }

  function findScaleRange(nodes) {
    let fixed = ["Text", "Concept", "Blueprint/Effects"]
    let result = ["Text", "Concept"]
    let archScale = []
    let others = ["Blueprint/Effects"]
    nodes.forEach((n) => {
      if (!fixed.includes(n.category) && n.category.startsWith("1:")) { //architectural scales
        archScale.push(n.category)
      } else if (!others.includes(n.category) && !fixed.includes(n.category) && !n.category.startsWith("1:")) {  //others category
        others.push(n.category)
      }
    })
    const sortedArcScale = archScale.sort((a, b) => {
      const numA = parseInt(a.split(":")[1], 10); // Ottieni il numero dopo ":"
      const numB = parseInt(b.split(":")[1], 10);
      return numB - numA; // Ordine decrescente
    });
    result = result.concat(sortedArcScale)
    result = result.concat(others)
    return result
  }


  /************ COMPUTING NODE POSITIONS *****************************/
  // Funzione per calcolare posizioni solo per nodi nuovi
  const computeNodePositionsForNewNodes = (Nodes, existingPositions) => {
    const groupedNodes = Nodes.reduce((acc, node) => {
      const year = new Date(node.date).getFullYear();
      const key = `${year}-${node.category}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(node);
      return acc;
    }, {});

    let positions = {}; // Memorizza solo nuove posizioni
    Object.entries(groupedNodes).forEach(([groupKey, group]) => {
      group.sort((a, b) => new Date(a.date) - new Date(b.date));

      const verticalOffsetStep = 21;
      const baseX = xScale(new Date(group[0].date));
      const baseY = yScale(group[0].category);
      group.forEach((node, index) => {
        const verticalOffset = index % 2 === 0 ? 0 : verticalOffsetStep;
        let horizontalOffset = 0;

        if (index > 0) {
          const previousDate = new Date(group[index - 1].date);
          const currentDate = new Date(node.date);
          if (currentDate.getTime() !== previousDate.getTime()) {
            const timeDifference = currentDate - previousDate;
            horizontalOffset = Math.max(
              11,
              timeDifference / (1000 * 60 * 60 * 24)
            );
          }
        }

        const x = baseX + horizontalOffset;
        const y = baseY - verticalOffset + 5;

        positions[node.id] = { x, y }; // Memorizza solo le nuove posizioni
      });
    });
    return positions;
  };

  /********************************************************************/


  useEffect(() => {
    const fetchData = async () => {
      const newNodes = [];
      const newLinks = [];

      props.documents.forEach((doc) => {
        const node = {
          id: doc.docId,
          label: doc.title,
          category: doc.scale === "Architectural Scale" ? doc.ASvalue : doc.scale,
          date: selectDate(doc.issuanceDate),
          color: selectColor(doc.stakeholders),
          docType: doc.type,
          stakeholders: doc.stakeholders,
          draggable: doc.issuanceDate.split("/").length <= 2 ? true : false
        };
        newNodes.push(node);
      });

      setNodes(newNodes);

      props.allAssociations.forEach(async (link) => {
        newLinks.push({
          source: link.doc1,
          target: link.doc2,
          type: selectType(link.typeId),
          color: selectLinkColor(link.typeId),
          linkType: await associationAPI.getTypeByTypeId(link.typeId),
        });
      });

      setLinks(newLinks);
    };

    fetchData();
  }, [props.documents, props.allAssociations]);

  // Define the X scale with the full date range


  // useEffect per calcolare le scale quando `nodes` è pronto
  useEffect(() => {
    if (nodes && nodes.length > 0) {
      // Calcolo della scala X (time scale)
      const newXScale = () => scaleTime()
        .domain(findDateRange(nodes))  // Assicurati che findDateRange restituisca un array con il range di date
        .range([50 + marginLeft, dimensions.width - 50]);
      setXScale(newXScale);

      // Calcolo della scala Y (band scale)
      const newYScale = () => scaleBand()
        .domain(findScaleRange(nodes)) // Assicurati che findScaleRange restituisca i valori per l'asse Y
        .range([50, dimensions.height - 50])
        .padding(0.5);

      // Imposta le scale calcolate nello stato
      setYScale(newYScale);
    }
  }, [nodes, dimensions]);

  let isUpdating = false

  useEffect(() => {
    const computePositions = async () => {
      if (nodes && nodes.length > 0 && xScale && yScale) {
        const traslatedNodes = await diagramAPI.getTraslatedNodes()  // object with {nodeId: {x: % traslation, y:%traslation}}
        const newPositions = computeNodePositionsForNewNodes(nodes, {})
        setFixedPositions(newPositions)
        let updatedPositions = {}
        for (let node of nodes) {
          //console.log(node)
          if (traslatedNodes[node.id]) {
            //traslation
            const currentPosition = newPositions[node.id];
            const newPosition = {
              x: currentPosition.x + (traslatedNodes[node.id].x / 100) * dimensions.width,
              y: currentPosition.y + (traslatedNodes[node.id].y / 100) * dimensions.height,
            };
            updatedPositions[node.id] = newPosition;

          } else {
            //no traslation
            updatedPositions[node.id] = newPositions[node.id]
          }
        }
        setNodesPosition(updatedPositions);
      }
    }
    computePositions()
  }, [xScale, yScale, nodes])

  // Generate ticks for the grid
  const xTicks = xScale?.ticks(d3.timeYear.every(1)); // Generate year ticks
  const yTicks = yScale?.domain();

  const svgRef = useRef(null);
  const [zoomTransform, setZoomTransform] = useState(d3.zoomIdentity); // Stato per il zoom

  useEffect(() => {
    const svg = d3.select(svgRef.current);

    // Crea il comportamento di zoom
    const zoom = d3
      .zoom()
      .scaleExtent([1, 5])
      .translateExtent([
        [0, 0],
        [dimensions.width, dimensions.height],
      ])
      .filter((event) => {
        // Disabilita lo zoom sui nodi (solo click o trascinamento sui nodi)
        return !event.target.closest("g.exclude");
      })
      .on("zoom", (event) => {
        setZoomTransform(event.transform);
        svg.select("g.chart-container").attr("transform", event.transform);
      });

    svg.call(zoom);
    svg.call(zoom.transform, d3.zoomIdentity);

    return () => svg.on(".zoom", null);
  }, [dimensions]);

  const updateNodePosition = async (id, newPosition/*,startPosition*/) => {
    const traslationX = ((newPosition.x - fixedPositions[id].x) / dimensions.width) * 100
    const traslationY = ((newPosition.y - fixedPositions[id].y) / dimensions.height) * 100
    setNodesPosition((prevPositions) => ({
      ...prevPositions,
      [id]: newPosition,
    }));
    console.log("transformed state")
    const traslatedNodes = await diagramAPI.getTraslatedNodes()
    console.log(Object.keys(traslatedNodes))
    if (Object.keys(traslatedNodes).includes(`${id}`)) {
      console.log("update", { docId: id, x: traslationX, y: traslationY })
      await diagramAPI.updateNodeTraslation({ docId: id, x: traslationX, y: traslationY })
    } else {
      console.log("add", { docId: id, x: traslationX, y: traslationY })
      await diagramAPI.addNodeTraslation({ docId: id, x: traslationX, y: traslationY })
    }
    console.log("fine")
    //await diagramAPI.updateNodePositions({ docId: id, x: newPosition.x, y: newPosition.y })

  };

  const { k, x, y } = zoomTransform;

  useEffect(() => {
    const fetchDocumentDetails = async () => {
      try {
        if (!selectedDoc) {
          setShowDocumentModal(false);
          return;
        }

        console.warn("Documentz:", props.documents);
        console.warn("SelectedDoc:", selectedDoc);


        // Trova il documento corrispondente
        const document = props.documents.find((doc) => doc.docId == selectedDoc.id);
        if (!document) {

          console.warn("Document not found with id:", selectedDoc);
          setShowDocumentModal(false);
          return;
        }

        setSelectedDoc(document);

        // Fetch linked documents (associations)
        await handleShowTitleAllLinkedDocument(document.docId);
        console.log("Fetched linked documents for:", document.docId);

        // Fetch files
        await handleGetFiles(document.docId);
        console.log("Fetched files for:", document.docId);

        setShowDocumentModal(true);
      } catch (error) {
        console.error("Error fetching document details:", error);
      }
    };

    fetchDocumentDetails();
  }, [selectedDoc]); // Aggiorna quando cambia selectedDoc o props.documents

  const handleShowTitleAllLinkedDocument = async (docId) => {

    if (!docId) { // Se non è stato selezionato nessun documento
      console.log("Sono in handleShowTitleAllLinkedDocument, non c'è nessun docId");
      setLinkedDocuments([]);
      return;
    }
    let assciationToShow = await associationAPI.getAssociationsByDocId(docId);
    let titleList = [];
    let title = "";
    for (let association of assciationToShow) {
      if (association.doc1 === docId) {
        // se il titolo non è già presente in titleList aggiuggilo
        title = props.documents.filter(doc => doc.docId === association.doc2)[0].title;
        if (!titleList.some(item => item.docTitle === title)) {
          titleList.push({ docTitle: title, otherDocumentId: association.doc2 });
        }
      } else {
        title = props.documents.filter(doc => doc.docId === association.doc1)[0].title;
        if (!titleList.some(item => item.docTitle === title)) {
          titleList.push({ docTitle: title, otherDocumentId: association.doc1 });
        }
      }
    }
    console.log("Ecco i documenti associati: ", titleList);
    setLinkedDocuments(titleList);
  }

  const handleGetFiles = async (docId) => {
    try {
      const files = await DocumentAPI.getFiles(docId); // Risolvi la Promise
      console.log("Ecco i files: ", files);
      if (files) {
        setFiles(Array.from(files));
      } else {
        setFiles([]); // Inizializza con array vuoto se non ci sono file
      }

      console.log("Ecco i files: ", files);
    } catch (error) {
      console.error("Error fetching files:", error);
      setFiles([]); // Fallback in caso di errore
    }
  };

  const handleDownload = (file) => {
    const URL = `http://localhost:3001/${file.path.slice(1)}`

    const aTag = document.createElement("a");
    aTag.href = URL
    aTag.setAttribute("download", file.name)
    document.body.appendChild(aTag)
    aTag.click();
    aTag.remove();
  }

  const handleConnectionClick = async (docId) => {
    const doc = nodes.find((doc) => doc.id === Number(docId));
    if (doc) {
      console.log("Sono in handleConnectionClick, ecco il documento selezionato: ", doc);
      setSelectedDoc(doc);
    }
  };

  return (
    <div className="diagram-container">
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        style={{ background: "white" }}
      >
        <rect width={dimensions.width} height={dimensions.height} fill="white" />

        <g className="chart-container">
          {xTicks?.map((tick, i) => (
            <line
              key={i}
              x1={xScale(tick)}
              y1={50}
              x2={xScale(tick)}
              y2={dimensions.height - 50}
              stroke="#e0e0e0"
              strokeDasharray="4"
            />
          ))}

          {yTicks?.map((category, i) => (
            <line
              key={i}
              x1={50 + marginLeft}
              y1={yScale(category) + yScale.bandwidth() / 2}
              x2={dimensions.width - 50 + marginLeft}
              //x2={extendedWidth - 50 + marginLeft}
              y2={yScale(category) + yScale.bandwidth() / 2}
              stroke="#e0e0e0"
              strokeDasharray="4"
            />
          ))}
        </g>

        <g className="chart-container" transform={zoomTransform.toString()}>
          <Links
            links={links}
            nodes={nodes}
            xScale={(date) => xScale(new Date(date))}
            yScale={yScale}
            verticalSpacing={-10}
            horizontalSpacing={30}
            nodePositions={nodesPosition}
          />
          <Nodes
            nodes={nodes}
            xScale={(date) => xScale(new Date(date))}
            yScale={yScale}
            nodePositions={nodesPosition}
            updateNodePosition={updateNodePosition}
            isUrbanPlanner={props.isUrbanPlanner}
            setSelectedNode={setSelectedDoc}
          />
          {/*docId && nodesPosition[docId]!=undefined &&(
            <HandPointer nodesPositions={nodesPosition} nodeId={docId} />
          )*/}
          {nodesPosition[docId] && (
            <g>
              {/* Freccia disegnata sopra il nodo */}
              <polygon
                points={`${nodesPosition[docId].x - 10},${nodesPosition[docId].y + 30} 
                             ${nodesPosition[docId].x + 10},${nodesPosition[docId].y + 30} 
                             ${nodesPosition[docId].x},${nodesPosition[docId].y + 10}`}
                className="arrow-bounce"
              />
            </g>
          )}
        </g>
        {/* Etichette della scala Y, fisse ai bordi, si muovono con il pan verticale */}
        <g
          className="y-axis-labels"
          transform={`translate(0, ${y}) scale(1, ${k})`} // Zoom verticale
          style={{ backgroundColor: "white" }}
        >
          <rect
            x={0} // Posizione del rettangolo
            y={0} // Posizione verticale (sotto la linea dell'asse)
            width={85} // Larghezza del rettangolo
            height={dimensions.height} // Altezza del rettangolo
            fill="white" // Colore di sfondo
          />

          {yTicks?.map((category, i) => (
            <text
              key={i}
              x={10}
              y={yScale(category) + yScale.bandwidth() / 2 - 30}
              fontSize={10 * k} // Applica la scala del zoom
              textAnchor="start"
              dominantBaseline="middle"
            >
              {category}
            </text>
          ))}
        </g>

        {/* Etichette della scala X, fisse ai bordi, si muovono con il pan orizzontale */}
        <g
          className="x-axis-labels"
          transform={`translate(${x}, 0) scale(${k}, 1)`} // Zoom orizzontale
        >
          <rect
            x={0} // Posizione del rettangolo
            y={dimensions.height - 60} // Posizione verticale (sotto la linea dell'asse)
            width={dimensions.width} // Larghezza del rettangolo
            height={100} // Altezza del rettangolo
            fill="white" // Colore di sfondo
          />
          {xTicks?.map((tick, i) => (
            <text
              key={i}
              x={xScale(tick)} // Posizione su scala X
              y={dimensions.height - 30}
              fontSize="1vw" // Applica la scala del zoom
              textAnchor="middle"
            >
              {tick.getFullYear()}
            </text>
          ))}
        </g>
        <rect
          x={0} // Posizione del rettangolo
          y={dimensions.height - 60} // Posizione verticale (sotto la linea dell'asse)
          width={80} // Larghezza del rettangolo
          height={100} // Altezza del rettangolo
          fill="white" // Colore di sfondo
        />
      </svg>
      <Modal show={showDocumentModal} onHide={() => setSelectedDoc(null)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedDoc ? (
              selectedDoc.title
            ) : (
              <p>Select a marker for visualize the details.</p>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedDoc ? (
            <>
              {Object.entries(selectedDoc)
                .filter(([key, value]) =>
                  key !== "docId" &&
                  key !== "title" &&
                  key !== "lat" &&
                  key !== "lng" &&
                  key !== "connections" &&
                  value !== null &&
                  value !== undefined &&
                  value !== "" // esclude stringhe vuote
                )
                .map(([key, value]) => (
                  <p key={key}>
                    <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value}
                  </p>
                ))}

              <div key={"connections"}>
                <p>
                  <strong>Connections:</strong>
                </p>
                {linkedDocuments.length > 0 ? linkedDocuments.map((connection) => (
                  <p
                    key={connection.docTitle}
                    style={{
                      marginBottom: '8px',  // Spazio tra i paragrafi
                    }}
                  >
                    <span
                      onClick={() => handleConnectionClick(connection.otherDocumentId)}
                      style={{
                        color: 'blue',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                      }}
                    >
                      {connection.docTitle}
                    </span>
                  </p>
                )) : "This file has no connections"}
              </div>

              <div className="download-buttons-container">
                {(files && files.length > 0) ? files.map((f, index) => (
                  <div key={f.name || index} className="download-btns">
                    <Button onClick={() => handleDownload(f)} className="files">
                      <i className="bi bi-file-earmark-text-fill"></i>
                    </Button>
                    <p className="file-name">{f.name}</p>
                  </div>
                )) : ""}
              </div>
            </>
          ) : (
            <p>Select a marker for visualize the details.</p>
          )}
        </Modal.Body>
      </Modal>

      <div className={`legend-container ${isOpen ? "open" : ""}`}>
        {/* Bottone per aprire/chiudere la legenda */}
        <Button
          className="toggle-button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Legend"
        >
          <span className={`arrow ${isOpen ? "left" : "right"}`}></span>
        </Button>

        {/* Contenitore della legenda */}
        {isOpen && (
          <div className="legend-content">
            <h2>LEGEND</h2>

            {/* Sezione Documenti */}
            <h3>Document types</h3>
            <div className="legend-icons">
              {validDocTypes.map((docType) => (
                <div key={docType} className="legend-item">
                  <img
                    src={`icons/${docType.toLowerCase().replace(' ', '-')}_others.png`}
                    alt={docType}
                    className="legend-icon"
                    style={{ width: "32px", height: "32px", marginRight: "10px" }}
                  />
                  <p className="legend-label">{docType}</p>
                </div>
              ))}
            </div>

            {/* Sezione Nodi */}
            <h3>Stakeholders</h3>
            <div className="legend-icons">
              <div className="legend-item">
                <div
                  className="legend-color"
                  style={{ backgroundColor: "#181a1b", width: "20px", height: "20px", marginRight: "10px" }}
                ></div>
                <p className="legend-label">LKAB</p>
              </div>
              <div className="legend-item">
                <div
                  className="legend-color"
                  style={{ backgroundColor: "#805f5b", width: "20px", height: "20px", marginRight: "10px" }}
                ></div>
                <p className="legend-label">Municipality</p>
              </div>
              <div className="legend-item">
                <div
                  className="legend-color"
                  style={{ backgroundColor: "#62222c", width: "20px", height: "20px", marginRight: "10px" }}
                ></div>
                <p className="legend-label">Regional authority</p>
              </div>
              <div className="legend-item">
                <div
                  className="legend-color"
                  style={{ backgroundColor: "#a8a19b", width: "20px", height: "20px", marginRight: "10px" }}
                ></div>
                <p className="legend-label">Architecture firms</p>
              </div>
              <div className="legend-item">
                <div
                  className="legend-color"
                  style={{ backgroundColor: "#a5cacc", width: "20px", height: "20px", marginRight: "10px" }}
                ></div>
                <p className="legend-label">Citizens</p>
              </div>
              <div className="legend-item">
                <div
                  className="legend-color"
                  style={{ backgroundColor: "#819d9f", width: "20px", height: "20px", marginRight: "10px" }}
                ></div>
                <p className="legend-label">Others</p>
              </div>
            </div>

            {/* Sezione Link */}
            <h3>Associations</h3>
            {associationsData.map((item, index) => (
              <div key={index} className="legend-item">
                <div
                  className="legend-line"
                  style={{
                    borderTop: `2px ${item.type} ${item.color}`,
                    width: "40px",
                    marginRight: "10px",
                  }}
                ></div>
                <p className="legend-label">{item.label}</p>
              </div>
            ))}

          </div>
        )}
      </div>


    </div>
  );
}

export default ShenzenDiagram;
