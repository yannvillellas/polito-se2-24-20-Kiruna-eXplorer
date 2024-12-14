import "bootstrap/dist/css/bootstrap.min.css";
import "./ShenzenDiagram.css"
import React, { useEffect, useState, useRef } from "react";
import { scaleTime, scaleBand } from "@visx/scale";
import { line, curveBasis } from "d3-shape";
import associationAPI from "../../api/associationAPI";
import { OverlayTrigger, Tooltip, Overlay } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
//import { scaleLinear } from 'd3-scale';
import Nodes from "./Nodes";
import Links from "./Links";

import * as d3 from "d3"

/*const width = 1100;
const height = 600;*/

function ShenzenDiagram(props) {
  const { docId } = useParams();

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
  const [nodesPosition, setNodesPosition] = useState({})

  /************ COMPUTING NODE POSITIONS *****************************/
  const computeNodePositions = () => {
    const groupedNodes = nodes.reduce((acc, node) => {
      const year = new Date(node.date).getFullYear();
      const key = `${year}-${node.category}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(node);
      return acc;
    }, {});

    let positions = {}

    Object.entries(groupedNodes).forEach(([groupKey, group]) => {
      // Ordina i nodi nel gruppo per data (dal meno recente al più recente)
      group.sort((a, b) => new Date(a.date) - new Date(b.date));

      // Distanza tra i nodi
      const verticalOffsetStep = 21; // Distanza verticale massima alternata

      // Coordinate base per il gruppo
      const baseX = xScale(new Date(group[0].date)); // Primo nodo (minima data)
      const baseY = yScale(group[0].category);

      group.forEach((node, index) => {
        // Calcola offset per evitare sovrapposizioni
        const verticalOffset = (index % 2 === 0 ? 0 : verticalOffsetStep); // Alterna tra 0 e +20

        // Calcolo dell'offset orizzontale proporzionale alla distanza temporale
        let horizontalOffset = 0; // Nessun offset orizzontale di default
        if (index > 0) {
          const previousDate = new Date(group[index - 1].date);
          const currentDate = new Date(node.date);
          if (currentDate.getTime() !== previousDate.getTime()) {
            const timeDifference = currentDate - previousDate; // Differenza temporale in millisecondi
            horizontalOffset = Math.max(11, timeDifference / (1000 * 60 * 60 * 24)); // Proporzionale ai giorni
          }
        }

        const x = baseX + horizontalOffset;
        const y = baseY - verticalOffset + 5;

        // Aggiungi la posizione al array temporaneo
        positions = { ...positions, [node.id]: { x, y } };
      });
    });

    setNodesPosition(positions)
  }

  /********************************************************************/

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
    computeNodePositions();
  }, [props.documents, props.allAssociations]);

  const marginLeft = 50; // Aggiungi un margine per spostare a destra il grafico

  // Define the X scale with the full date range
  const xScale = scaleTime({
    domain: findDateRange(nodes), // Include the full date range
    range: [50 + marginLeft, dimensions.width - 50], // Applica il margine alla scala X
  });

  const yScale = scaleBand({
    domain: findScaleRange(nodes),
    range: [50, dimensions.height - 50],
    padding: 0.5,
  });

  // Generate ticks for the grid
  const xTicks = xScale.ticks(d3.timeYear.every(1)); // Generate year ticks
  const yTicks = yScale.domain();

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
        //[extendedWidth, dimensions.height],
      ])
      .on("zoom", (event) => {
        setZoomTransform(event.transform);
        svg.select("g.chart-container").attr("transform", event.transform);
      });

    svg.call(zoom);
    svg.call(zoom.transform, d3.zoomIdentity);
    computeNodePositions();

    return () => svg.on(".zoom", null);
  }, [dimensions]);
  console.log(docId)
  console.log(nodesPosition[docId])

  return (
    <>
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        style={{ background: "white" }}
      >
        <rect width={dimensions.width} height={dimensions.height} fill="white" />

        <g className="chart-container">
          {xTicks.map((tick, i) => (
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

          {yTicks.map((category, i) => (
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

          {xTicks.map((tick, i) => (
            <text
              key={i}
              x={xScale(tick)}
              y={dimensions.height - 30}
              fontSize={10}
              textAnchor="middle"
            >
              {tick.getFullYear()}
            </text>
          ))}

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

        <g className="chart-container" transform={zoomTransform.toString()}>
          <Nodes
            nodes={nodes}
            xScale={(date) => xScale(new Date(date))}
            yScale={yScale}
            nodePositions={nodesPosition}
          />
          <Links
            links={links}
            nodes={nodes}
            xScale={(date) => xScale(new Date(date))}
            yScale={yScale}
            verticalSpacing={-10}
            horizontalSpacing={30}
            nodePositions={nodesPosition}
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
      </svg>
    </>
  );
}

export default ShenzenDiagram;
