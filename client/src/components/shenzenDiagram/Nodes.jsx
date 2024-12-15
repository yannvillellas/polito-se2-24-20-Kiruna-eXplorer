import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState, useRef } from "react";
import { scaleTime, scaleBand } from "@visx/scale";
import { line, curveBasis } from "d3-shape";
import associationAPI from "../../api/associationAPI";
import { OverlayTrigger, Tooltip, Overlay} from "react-bootstrap";
//import { scaleLinear } from 'd3-scale';

// Component to draw the nodes
const Nodes = ({ nodes, nodePositions, updateNodePosition, isUrbanPlanner}) => {
    const [draggedNode, setDraggedNode] = useState(null); // Nodo attualmente trascinato
    const [offset, setOffset] = useState({ x: 0, y: 0 }); // Offset per il trascinamento

    const handleMouseDown = (event, node) => {
        console.log(node.draggable)
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

    return (
        <g
            onMouseMove={handleMouseMove} // Gestisci il trascinamento
            onMouseUp={handleMouseUp} // Rilascia il nodo
        >
            {nodes.map((node) => {
                const position = nodePositions[node.id];
                if (!position) return null; // Ignora se non c'è posizione

                const { x, y } = position;

                return (
                    <circle
                        className={node.label}
                        key={node.id}
                        cx={x}
                        cy={y}
                        r={10}
                        fill={node.color}
                        stroke="black"
                        strokeWidth={1}
                        onMouseDown={(event) => handleMouseDown(event, node)} // Inizia il trascinamento
                    />
                );
            })}
        </g>
    );
};

export default Nodes;
