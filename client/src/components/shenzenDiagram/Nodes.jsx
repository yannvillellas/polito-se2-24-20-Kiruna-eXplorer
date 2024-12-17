import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState, useRef } from "react";
import { scaleTime, scaleBand } from "@visx/scale";
import { line, curveBasis } from "d3-shape";
import associationAPI from "../../api/associationAPI";
import { OverlayTrigger, Tooltip, Overlay } from "react-bootstrap";
//import { scaleLinear } from 'd3-scale';

// Component to draw the nodes

const Nodes = ({ nodes, xScale, yScale, setSelectedNode, nodePositions, updateNodePosition, isUrbanPlanner }) => {

    const [draggedNode, setDraggedNode] = useState(null); // Nodo attualmente trascinato
    const [offset, setOffset] = useState({ x: 0, y: 0 }); // Offset per il trascinamento

    const handleMouseDown = (event, node) => {
        //console.log(node.draggable)
        if (!isUrbanPlanner || !node.draggable) return;
        const position = nodePositions[node.id];
        if (!position) return;

        setDraggedNode(node.id); // Imposta il nodo trascinato
        setOffset({
            x: event.clientX - position.x,
            y: event.clientY - position.y,
        });
    };

    const handleMouseMove = (event) => {
        if (!draggedNode) return; // Se non c'è un nodo trascinato, ignora
        const newX = event.clientX - offset.x;
        const newY = event.clientY - offset.y;

        // Aggiorna la posizione del nodo trascinato
        updateNodePosition(draggedNode, { x: newX, y: newY });
    };

    const handleMouseUp = () => {
        setDraggedNode(null); // Fine del trascinamento
    };

    const handleClickNode = (node) => {
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


    return (
        <g
            onMouseMove={handleMouseMove} // Gestisci il trascinamento
            onMouseUp={handleMouseUp} // Rilascia il nodo
        >
            {nodes.map((node) => {
                const position = nodePositions[node.id];
                if (!position) return null; // Ignora se non c'è posizione

                const { x, y } = position;

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
                        <g className="exclude"
                            key={node.id}
                            transform={`translate(-11, -11)`}
                            style={{ cursor: "pointer", backgroundColor: "white" }}
                            onMouseDown={(event) => handleMouseDown(event, node)} // Inizia il trascinamento
                            //onClick={() => handleClickNode(node)}
                        >
                            <circle cx={x} cy={y} r={11} fill="white" transform={`translate(11, 11)`}/>
                            <image
                                href={iconUrl}
                                width={22}
                                height={22}
                                x={x}
                                y={y}
                            />

                        </g>
                    </OverlayTrigger>
                );
            })}
        </g>
    );
};

export default Nodes;
