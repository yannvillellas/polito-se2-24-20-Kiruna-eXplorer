import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState, useRef } from "react";
import { scaleTime, scaleBand } from "@visx/scale";
import { line, curveBasis } from "d3-shape";
import associationAPI from "../../api/associationAPI";
import { OverlayTrigger, Tooltip, Overlay} from "react-bootstrap";
//import { scaleLinear } from 'd3-scale';

import * as d3 from "d3"

const width = 1100;
const height = 600;

// Mock data
/*const data = {
  nodes: [
    { id: 1, label: "Node 1", category: "Plan", date: "2008/10/31", color: "#ff0000" },
    { id: 2, label: "Node 2", category: "Text", date: "2010/11/15", color: "#00ff00" },
    { id: 3, label: "Node 3", category: "Text", date: "2006/03/27", color: "#00ff01" },
    { id: 4, label: "Node 4", category: "Plan", date: "2008/10/31", color: "#ff0000" },
    { id: 5, label: "Node 5", category: "Concept", date: "2009/10/31", color: "#ff0000" },
  ],
  links: [
    { source: 4, target: 2, type: "dashed", color: "#ff0000", offset: 10 },
    { source: 1, target: 2, type: "solid", color: "#00ff00", offset: 10 },
    { source: 1, target: 2, type: "solid", color: "#00ff0f", offset: 10 },
    { source: 1, target: 2, type: "solid", color: "#0000ff", offset: 10 },
    { source: 2, target: 3, type: "dotted", color: "#0000ff", offset: 10 },
    { source: 5, target: 2, type: "dotted", color: "#0000ff", offset: 10 },
  ],
};*/

// Component to draw the nodes
const Nodes = ({ nodes, xScale, yScale }) => {
  // Raggruppa i nodi con la stessa data e categoria
  const groupedNodes = nodes.reduce((acc, node) => {
    const key = `${node.date}-${node.category}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(node);
    return acc;
  }, {});

  return (
    <g>
      {Object.values(groupedNodes).flatMap((group) => {
        const count = group.length; // Numero di nodi nel gruppo
        const offsetStep = 22; // Distanza verticale tra i nodi
        const baseY = yScale(group[0].category); // Coordinate Y del gruppo

        return group.map((node, index) => {
          const offset = (index - (count - 1) / 2) * offsetStep; // Calcola l'offset verticale
          const x = xScale(new Date(node.date));
          const y = baseY + offset; // Applica l'offset verticale

          return (
            <circle
              key={node.id}
              cx={x}
              cy={y}
              r={10}
              fill={node.color}
              stroke="black"
              strokeWidth={1}
            />
          );
        });
      })}
    </g>
  );
};

// Component to draw the links
const Links = ({ links, nodes, xScale, yScale, verticalSpacing, horizontalSpacing }) => {
  // Raggruppa i nodi con la stessa data e categoria
  const groupedNodes = nodes.reduce((acc, node) => {
    const key = `${node.date}-${node.category}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(node);
    return acc;
  }, {});

  // Calcola le posizioni dei nodi con offset
  const nodePositions = {};
  Object.values(groupedNodes).forEach((group) => {
    const count = group.length;
    const offsetStep = 20; // Distanza verticale tra i nodi
    const baseY = yScale(group[0].category);

    group.forEach((node, index) => {
      const offset = (index - (count - 1) / 2) * offsetStep; // Calcola offset verticale
      const x = xScale(new Date(node.date));
      const y = baseY + offset;
      nodePositions[node.id] = { x, y }; // Memorizza la posizione
    });
  });

  // Funzione per controllare se un punto è vicino a un nodo
  const isNearNode = (x, y, nodeRadius = 15) => {
    for (const node of nodes) {
      const { x: nx, y: ny } = nodePositions[node.id];
      if (Math.sqrt((x - nx) ** 2 + (y - ny) ** 2) < nodeRadius * 2) {
        if (ny >= y) {
          return 1; // Nodo sopra
        } else {
          return -1; // Nodo sotto
        }
      }
    }
    return 0; // Nessun nodo vicino
  };


  // Raggruppa i link tra gli stessi nodi (indipendentemente dall'ordine)
  const groupedLinks = links.reduce((acc, link) => {
    // Ordina source e target per normalizzare la chiave
    const key = [link.source, link.target].sort().join("-");
    if (!acc[key]) acc[key] = [];
    acc[key].push(link);
    return acc;
  }, {});

  // Calcola i centri dei gruppi di link
  const groupCenters = Object.entries(groupedLinks).map(([key, groupedLinks]) => {
    const sourcePos = nodePositions[groupedLinks[0].source];
    const targetPos = nodePositions[groupedLinks[0].target];

    if (sourcePos && targetPos) {
      const centerX = (sourcePos.x + targetPos.x) / 2;
      const centerY = (sourcePos.y + targetPos.y) / 2;
      return { key, centerX, centerY };
    }
    return null;
  }).filter(Boolean);

  // Tieni traccia dei gruppi già spostati
  const verticalAdjustments = {};
  const adjustedGroups = new Set();

  groupCenters.forEach((group, index) => {
    groupCenters.forEach((otherGroup, otherIndex) => {
      if (index !== otherIndex && !adjustedGroups.has(group.key) && !adjustedGroups.has(otherGroup.key)) {
        const distX = Math.abs(group.centerX - otherGroup.centerX);
        const distY = Math.abs(group.centerY - otherGroup.centerY);

        if (distX < 100 && distY < 50) { // Se i gruppi sono vicini
          if (group.centerY > otherGroup.centerY) {
            // Sposta solo il gruppo più in basso
            verticalAdjustments[group.key] = (verticalAdjustments[group.key] || 0) + 200;
            adjustedGroups.add(group.key);
          } else {
            // Sposta solo il gruppo più in alto
            verticalAdjustments[otherGroup.key] = (verticalAdjustments[otherGroup.key] || 0) - 200;
            adjustedGroups.add(otherGroup.key);
          }
        }
      }
    });
  });

  const [tooltipData, setTooltipData] = useState({ show: false, x: 0, y: 0, content: "" });
  const virtualTarget = {
    getBoundingClientRect: () => ({
      top: tooltipData.y,
      left: tooltipData.x,
      bottom: tooltipData.y,
      right: tooltipData.x,
      width: 0,
      height: 0,
    }),
  };
  const handleMouseEnter = (event, linkType) => {
    const { clientX, clientY } = event; // Posizione del mouse
    setTooltipData({
      show: true,
      x: clientX,
      y: clientY,
      content: `${linkType}`,
    });
  };

  const handleMouseMove = (event) => {
    const { clientX, clientY } = event;
    setTooltipData((prev) => ({
      ...prev,
      x: clientX,
      y: clientY,
    }));
  };

  const handleMouseLeave = () => {
    setTooltipData({ show: false, x: 0, y: 0, content: "" });
  };


  return (
    <>
      <g>
        {Object.entries(groupedLinks).flatMap(([key, groupedLinks]) => {
          const verticalShift = verticalAdjustments[key] || 0;
          //console.log(verticalShift,key)
          return groupedLinks.map((link, index) => {
            const sourcePos = nodePositions[link.source];
            const targetPos = nodePositions[link.target];
            //console.log(link.linkType)
            if (!sourcePos || !targetPos) {
              console.warn(`Invalid link: source=${link.source}, target=${link.target}`);
              return null;
            }

            const { x: x1, y: y1 } = sourcePos;
            const { x: x2, y: y2 } = targetPos;

            // Calcola offset orizzontale per separare i link sovrapposti
            const totalLinks = groupedLinks.length;
            const step = horizontalSpacing / (totalLinks - 1 || 1); // Evita divisioni per 0
            const horizontalOffset = (index - (totalLinks - 1) / 2) * step;
            const stepV = verticalSpacing / (totalLinks - 1 || 1)
            const verticalOffset = (index - (totalLinks - 1) / 2) * stepV;

            // Trova punti di deviazione se necessario
            let midX = (x1 + x2) / 2 + horizontalOffset;
            let midY = (y1 + y2) / 2 + verticalShift + verticalOffset;

            if (isNearNode(midX, midY) === 1) {
              midY -= 50;
            } else if (isNearNode(midX, midY) === -1) {
              midY += 50;
            }

            // Linea curva
            const curvedLine = line()
              .x((d) => d.x)
              .y((d) => d.y)
              .curve(curveBasis)([
                { x: x1, y: y1 },
                { x: midX, y: midY },
                { x: x2, y: y2 },
              ]);

            return (
              <>
                <path
                  key={`${key}-${index}`}
                  d={curvedLine}
                  fill="none"
                  stroke={link.color || "black"}
                  strokeWidth={2}
                  strokeDasharray={
                    link.type === "dashed"
                      ? "6,3"
                      : link.type === "dotted"
                        ? "2,2"
                        : link.type === "dash-dotted"
                          ? "6,3,2,3"
                          : "0" //else solid
                  }
                  onMouseEnter={(e) => handleMouseEnter(e, link.linkType)}
                  onMouseLeave={handleMouseLeave}
                  //onMouseMove={handleMouseMove}
                />
              </>
            );
          });
        })}
      </g>
      <Overlay show={tooltipData.show} target={virtualTarget} placement="top">
        {(props) => (
          <Tooltip {...props} id="tooltip-link">
            {tooltipData.content}
          </Tooltip>
        )}
      </Overlay>
    </>
  );
};



function ShenzenDiagram(props) {

  const selectType = (typeId) => {
    //console.log(typeId)
    /*if(typeId==1){  //direct consequence
      return "solid"
    }else if(typeId==2){  //indirect consequence
      return "wavy"
    }else if(typeId==3){  //collateral consequence
      return "dashed"
    }else if(typeId==4){  //projection
      return "dotted"
    }else if(typeId==5){  //update
      return "dash-dotted"
    }else{  //other types
      return "double-dotted"
    }*/
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
    } else if (date.split("/").length == 1) {  //only month and year
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
    /*let result = []
    nodes.forEach((n) => {
      if (!result.includes(n.category)) {
        result.push(n.category)
      }
    })
    return result*/
    let fixed = ["Text", "Concept", "Blueprint/Effects"]
    let result = ["Text", "Concept"]
    let archScale = []
    let others = ["Blueprint/Effects"]
    nodes.forEach((n) => {
      if (!fixed.includes(n.category) && n.category.startsWith("1:")) { //architectural scales
        archScale.push(n.category)
      } else if (!others.includes(n.category) && !fixed.includes(n.category) && !n.category.startsWith("1:")) {  //others category
        //console.log(n.category)
        others.push(n.category)
      }
    })
    const sortedArcScale = archScale.sort((a, b) => {
      const numA = parseInt(a.split(":")[1], 10); // Ottieni il numero dopo ":"
      const numB = parseInt(b.split(":")[1], 10);
      return numB - numA; // Ordine decrescente
    });
    //console.log(others)
    result = result.concat(sortedArcScale)
    result = result.concat(others)
    return result
  }

  //create data for diagram from documents and links
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const newNodes = [];
      const newLinks = [];

      props.documents.forEach((doc) => {
        newNodes.push({
          id: doc.docId,
          label: doc.title,
          category: doc.scale === "Architectural Scale" ? doc.ASvalue : doc.scale,
          date: selectDate(doc.issuanceDate),
          color: selectColor(doc.stakeholders),
        });
      });

      props.allAssociations.forEach(async (link) => {
        newLinks.push({
          source: link.doc1,
          target: link.doc2,
          type: selectType(link.typeId),
          color: selectLinkColor(link.typeId),
          linkType: await associationAPI.getTypeByTypeId(link.typeId)
        });
      });

      setNodes(newNodes);
      setLinks(newLinks);
    }

    fetchData();
  }, [props.documents, props.allAssociations]);

  const marginLeft = 50; // Aggiungi un margine per spostare a destra il grafico

  // Define the X scale with the full date range
  const xScale = scaleTime({
    domain: findDateRange(nodes), // Include the full date range
    range: [50 + marginLeft, width - 50], // Applica il margine alla scala X
  });

  /*const getDaysBetween = (nodes) => {
    const range=findDateRange(nodes)
    const endDate=range[1]
    const startDate=range[0]
    const timeDiff = endDate - startDate; // Differenza in millisecondi
    return Math.floor(timeDiff / (1000 * 3600 * 24)); // Converti in giorni
  };

  const totalDays = getDaysBetween(nodes);

  const xScale = scaleLinear({
    domain: [0, totalDays], // Include the full date range
    range: [50 + marginLeft, width - 50], // Applica il margine alla scala X
  });*/

  const yScale = scaleBand({
    domain: findScaleRange(nodes),
    range: [50, height - 50],
    padding: 0.5,
  });

  // Generate ticks for the grid
  const xTicks = xScale.ticks(d3.timeYear.every(1)); // Generate year ticks
  const yTicks = yScale.domain();

  const svgRef = useRef(null);
  const [zoomTransform, setZoomTransform] = useState(d3.zoomIdentity); // Stato per il zoom

  // Funzione di gestione del zoom
  const handleZoom = (event) => {
    // Aggiorna lo stato con la trasformazione di zoom
    setZoomTransform(event.transform);

    // Applica la trasformazione al gruppo 'chart-container'
    const svg = d3.select(svgRef.current);
    svg.select('g.chart-container')
      .attr('transform', event.transform);
  };

  useEffect(() => {
    const svg = d3.select(svgRef.current);

    // Crea il comportamento di zoom
    const zoom = d3.zoom()
      .scaleExtent([1, 5])  // Limita lo zoom tra 0.5x e 5x
      .translateExtent([[0, 0], [width, height]])  // Limita la traslazione
      .on('zoom', handleZoom);  // Imposta la funzione di zoom

    // Aggiungi la funzionalità di zoom all'SVG
    svg.call(zoom);

    // Resetta lo zoom al caricamento (opzionale)
    svg.call(zoom.transform, d3.zoomIdentity);

    return () => {
      // Cleanup dell'evento di zoom quando il componente è smontato
      svg.on('.zoom', null);
    };
  }, [width, height]);

  return (
    <svg ref={svgRef} width={width} height={height} style={{ background: "white" }}>
      {/* Background */}
      <rect width={width} height={height} fill="white" />

      {/* Griglia e assi */}
      <g className="chart-container">
        {/* Linee verticali per l'asse X */}
        {xTicks.map((tick, i) => (
          <line
            key={i}
            x1={xScale(tick)}
            y1={50}
            x2={xScale(tick)}
            y2={height - 50}
            stroke="#e0e0e0"
            strokeDasharray="4"
          />
        ))}

        {/* Linee orizzontali per l'asse Y */}
        {yTicks.map((category, i) => (
          <line
            key={i}
            x1={50 + marginLeft}
            y1={yScale(category) + yScale.bandwidth() / 2}
            x2={width - 50 + marginLeft}
            y2={yScale(category) + yScale.bandwidth() / 2}
            stroke="#e0e0e0"
            strokeDasharray="4"
          />
        ))}

        {/* Asse X (etichette temporali) */}
        {xTicks.map((tick, i) => (
          <text key={i} x={xScale(tick)} y={height - 30} fontSize={10} textAnchor="middle">
            {tick.getFullYear()}
          </text>
        ))}

        {/* Asse Y (etichette delle categorie) */}
        {yTicks.map((category, i) => (
          <text
            key={i}
            x={10}
            y={yScale(category) + yScale.bandwidth() / 2 - 30}
            fontSize={10}
            textAnchor="start"
            dominantBaseline="middle"
          >
            {category}
          </text>
        ))}
      </g>

      {/* Nodi */}
      <g className="chart-container" transform={zoomTransform.toString()}>
        <Nodes
          nodes={nodes}
          xScale={(date) => xScale(new Date(date))}
          yScale={yScale}
        />
      </g>

      {/* Link */}
      <g className="chart-container" transform={zoomTransform.toString()}>
        <Links
          links={links}
          nodes={nodes}
          xScale={(date) => xScale(new Date(date))}
          yScale={yScale}
          verticalSpacing={-10}
          horizontalSpacing={30}
        />
      </g>
    </svg>
  );
}

export default ShenzenDiagram;
