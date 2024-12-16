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
import diagramAPI from "../../api/diagramAPI";

import * as d3 from "d3"
import { use } from "react";

/*const width = 1100;
const height = 600;*/

function ShenzenDiagram(props) {
  const { docId } = useParams();
  const [isUrbanPlanner] = useState(props.role === 'urbanPlanner');

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
    ////console.log(typeId)
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
        ////console.log(n.category)
        others.push(n.category)
      }
    })
    const sortedArcScale = archScale.sort((a, b) => {
      const numA = parseInt(a.split(":")[1], 10); // Ottieni il numero dopo ":"
      const numB = parseInt(b.split(":")[1], 10);
      return numB - numA; // Ordine decrescente
    });
    ////console.log(others)
    result = result.concat(sortedArcScale)
    result = result.concat(others)
    return result
  }

  //create data for diagram from documents and links
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  const [nodesPosition, setNodesPosition] = useState({})

  /************ COMPUTING NODE POSITIONS *****************************/
  // Funzione per calcolare posizioni solo per nodi nuovi
  const computeNodePositionsForNewNodes = (Nodes, existingPositions) => {
    //console.log("dentro la compute")
    const groupedNodes = Nodes.reduce((acc, node) => {
      const year = new Date(node.date).getFullYear();
      const key = `${year}-${node.category}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(node);
      return acc;
    }, {});

    let positions = {}; // Memorizza solo nuove posizioni
    ////console.log(groupedNodes)
    Object.entries(groupedNodes).forEach(([groupKey, group]) => {
      group.sort((a, b) => new Date(a.date) - new Date(b.date));

      const verticalOffsetStep = 21;
      /*//console.log(group[0].date)
      //console.log(nodes)*/
      //console.log("prima delle scale", xScale)
      const baseX = xScale(new Date(group[0].date));
      //console.log(baseX)
      const baseY = yScale(group[0].category);
      //console.log("dopo le scale")
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
    //console.log("fine compute", positions)
    return positions;
  };

  /********************************************************************/

  const [xScale, setXScale] = useState(null);
  const [yScale, setYScale] = useState(null);

  useEffect(() => {
    //console.log("inizio")
    const fetchData = async () => {
      //console.log("fetcho i dati")
      const newNodes = [];
      const newLinks = [];

      props.documents.forEach((doc) => {
        const node = {
          id: doc.docId,
          label: doc.title,
          category: doc.scale === "Architectural Scale" ? doc.ASvalue : doc.scale,
          date: selectDate(doc.issuanceDate),
          color: selectColor(doc.stakeholders),
          draggable: doc.issuanceDate.split("/").length <= 2 ? true : false
        };
        newNodes.push(node);
        //console.log(newNodes)
      });
      //console.log("nodi pronti", newNodes)
      //console.log("setto", newNodes)
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
      //console.log("setto links", newLinks)
      setLinks(newLinks);

    };

    fetchData();
    //console.log("finito di fetchare i dati")

  }, [props.documents, props.allAssociations]);

  const marginLeft = 50; // Aggiungi un margine per spostare a destra il grafico

  // Define the X scale with the full date range


  // useEffect per calcolare le scale quando `nodes` è pronto
  useEffect(() => {
    //console.log("dentro use effect scale")
    if (nodes && nodes.length > 0) {
      // Calcolo della scala X (time scale)
      //console.log("definisco scale giuste")

      const newXScale = () => scaleTime()
        .domain(findDateRange(nodes))  // Assicurati che findDateRange restituisca un array con il range di date
        .range([50 + marginLeft, dimensions.width - 50]);
      //console.log("scalaX", newXScale)
      setXScale(newXScale);
      //console.log("scala settata")

      // Calcolo della scala Y (band scale)
      const newYScale = () => scaleBand()
        .domain(findScaleRange(nodes)) // Assicurati che findScaleRange restituisca i valori per l'asse Y
        .range([50, dimensions.height - 50])
        .padding(0.5);
      //console.log("scala Y", newYScale)

      // Imposta le scale calcolate nello stato
      setYScale(newYScale);
      //console.log("scala settata")
    }
  }, [nodes, dimensions]);

  let isUpdating = false

  useEffect(() => {
    //console.log("inizio posizioni con scale", xScale, yScale)
    const computePositions = async () => {
      if (nodes && nodes.length > 0 && xScale && yScale) {
        if (isUpdating) {
          console.log("Update in progress, skipping...");
          return;
        }

        isUpdating = true; // Imposta il lock
        try {
          const xValues = xScale?.ticks(d3.timeYear.every(1)).map((ts) => `${ts.getFullYear()}`);
          const yValues = [...new Set(nodes.map((node) => node.category))];
          const oldXValues = await diagramAPI.getXValues();
          const oldYValues = await diagramAPI.getYValues();

          //console.log(xValues);
          //console.log(oldXValues);

          let xToAdd = xValues.filter((element) => !oldXValues.includes(element));
          let yToAdd = yValues.filter((element) => !oldYValues.includes(element));

          /*const oldWidth= await diagramAPI.getWidth()
          const oldHeight = await diagramAPI.getHeight()*/
          const {width:oldWidth, height:oldHeight} = await diagramAPI.getDimensions()

          //console.log(xToAdd);
          //console.log(yToAdd);

          if (xToAdd.length > 0 || yToAdd.length > 0 || dimensions.width!=oldWidth || dimensions.height!=oldHeight) {
            console.log("sono dentro");
            console.log(xToAdd.length > 0)
            console.log(yToAdd.length > 0)
            console.log(dimensions.width!=oldWidth)
            console.log("attuale",dimensions.width)
            console.log("vecchia",oldWidth)
            console.log(dimensions.height!=oldHeight)
            // Forza il ricalcolo di tutte le posizioni dei nodi
            await diagramAPI.clearAllPositions();

            if (xToAdd.length > 0) {
              await diagramAPI.addNewX(xToAdd);
              xToAdd = [];
            }
            if (yToAdd.length > 0) {
              await diagramAPI.addNewY(yToAdd);
              yToAdd = [];
            }
            if(!oldWidth && !oldHeight){
              await diagramAPI.addDimensions(dimensions.width,dimensions.height)
            }
            if(dimensions.width!=oldWidth){
              console.log("width", dimensions.width)
              await diagramAPI.updateWidth(dimensions.width)
            }

            if(dimensions.height!=oldHeight){
              await diagramAPI.updateHeight(dimensions.height)
            }
          }
        } catch (error) {
          console.error("Errore durante l'aggiornamento:", error);
        } finally {
          isUpdating = false; // Rimuovi il lock
        }



        //console.log("entro posizioni")
        const nodePositionsFromDB = await diagramAPI.getNodesPosition(); // Funzione per recuperare posizioni
        console.log("posizioni",nodePositionsFromDB)

        const updatedPositions = { ...nodePositionsFromDB }; // Inizializza con posizioni esistenti
        const nodesWithoutPosition = []; // Per raccogliere i nodi nuovi

        nodes?.forEach((node) => {
          if (!nodePositionsFromDB[node.id]) {
            nodesWithoutPosition.push(node);
          }
        })

        // Calcola posizioni per i nodi senza posizione
        let newPositions = {};
        //console.log("prima delle posizioni")
        if (nodesWithoutPosition.length > 0) {
          //console.log("dentro le posizioni")
          ////console.log(nodesWithoutPosition)
          newPositions = computeNodePositionsForNewNodes(
            nodesWithoutPosition,
            updatedPositions
          );
          //console.log("dopo la compute")
          // Salva solo le nuove posizioni nel database
          //console.log("salvo", newPositions)
          ////console.log("prima",updatedPositions)
          await diagramAPI.saveNodesPositions(newPositions);

          // Aggiorna lo stato con le nuove posizioni
          Object.assign(updatedPositions, newPositions);
          ////console.log("dopo",updatedPositions)
          //console.log("dentro", updatedPositions)
        }
        //console.log("fuori", updatedPositions)
        setNodesPosition(updatedPositions); // Combina posizioni dal DB e nuove calcolate
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
        return !event.target.closest("circle");
      })
      .on("zoom", (event) => {
        setZoomTransform(event.transform);
        svg.select("g.chart-container").attr("transform", event.transform);
      });

    svg.call(zoom);
    svg.call(zoom.transform, d3.zoomIdentity);

    return () => svg.on(".zoom", null);
  }, [dimensions]);
  /*//console.log(docId)
  //console.log(nodesPosition[docId])*/

  const updateNodePosition = async (id, newPosition) => {
    setNodesPosition((prevPositions) => ({
      ...prevPositions,
      [id]: newPosition,
    }));
    await diagramAPI.updateNodePositions({ docId: id, x: newPosition.x, y: newPosition.y })
  };

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

          {xTicks?.map((tick, i) => (
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

          {yTicks?.map((category, i) => (
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
