import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState, useRef } from "react";
import { scaleTime, scaleBand } from "@visx/scale";
import { line, curveBasis } from "d3-shape";
import associationAPI from "../../api/associationAPI";
import { OverlayTrigger, Tooltip, Overlay} from "react-bootstrap";
//import { scaleLinear } from 'd3-scale';

// Component to draw the nodes
const Nodes = ({ nodes, xScale, yScale, setSelectedNode }) => {
    // Raggruppa i nodi con la stessa data e categoria
    const groupedNodes = nodes.reduce((acc, node) => {
        const key = `${node.date}-${node.category}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(node);
        return acc;
    }, {});

    const handleClickNode = (node) =>{
        setSelectedNode(node)
    }

    //---------------icon part------------------------------
    const validDocTypes = [
        "Design document",
        "Informative document",
        "Material effects",
        "Prescriptive document",
        "Technical document"
      ];
      
      const validStakeholders = [
        "LKAB",
        "Municipality",
        "Regional authority",
        "Architecture firms",
        "Citizens"
      ];
      
      const getIcon = (docType, stakeholders) => {
        const formattedDocType = validDocTypes.includes(docType)
          ? docType.toLowerCase().replace(' ', '-')
          : "other-document";
      
        const formattedStakeholder = validStakeholders.includes(stakeholders)
          ? stakeholders.toLowerCase().replace(' ', '-')
          : "others";
      
        const iconUrl = `icons/${formattedDocType}_${formattedStakeholder}.png`;
      
        return {
          iconUrl,
          iconSize: [32, 32],
        };
      };
    
  //---------------icon part------------------------------

    /*let diagramNodes=[]
    let previous=1*/

    return (
        <g>
            {Object.values(groupedNodes).flatMap((group) => {
                const count = group.length; // Numero di nodi nel gruppo
                const offsetStep = 22; // Distanza verticale tra i nodi
                const baseY = yScale(group[0].category); // Coordinate Y del gruppo

                return group.map((node, index) => {
                    const offset = (index - (count - 1) / 2) * offsetStep; // Calcola l'offset verticale
                    const x = xScale(new Date(node.date));
                    let y = baseY + offset; // Applica l'offset verticale
                    /*for(let prevNode of diagramNodes){
                        if(Math.abs(prevNode.x-x)<20 && prevNode.y===y){
                            console.log(y)
                            if(previous===-1){
                                y=y+35
                                previous=1
                                break;
                            }else{
                                y=y-35
                                previous=-1
                                break;
                            }
                        }
                    }
                    diagramNodes.push({x:x,y:y})*/

                    const { iconUrl } = getIcon(node.docType, node.stakeholders);

                    return (
                        <OverlayTrigger
                            key={node.id}
                            placement="top"
                            overlay={
                                <Tooltip id={`tooltip-${node.id}`}>
                                    {node.label || "No title available"}
                                </Tooltip>
                            }
                        >
                            <g
                                transform={`translate(${x}, ${y})`}
                                style={{ cursor: "pointer" }}
                                onClick={() => handleClickNode(node)}
                            >
                                <image
                                    href={iconUrl}
                                    width={32} 
                                    height={32}
                                    x={-16} 
                                    y={-16} 
                                />
                            </g>
                        </OverlayTrigger>
                    );
                });
            })}
        </g>
    );
};

export default Nodes