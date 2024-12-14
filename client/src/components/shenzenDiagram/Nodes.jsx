import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState, useRef } from "react";
import { scaleTime, scaleBand } from "@visx/scale";
import { line, curveBasis } from "d3-shape";
import associationAPI from "../../api/associationAPI";
import { OverlayTrigger, Tooltip, Overlay} from "react-bootstrap";
//import { scaleLinear } from 'd3-scale';

// Component to draw the nodes
const Nodes = ({ nodes, xScale, yScale, nodePositions }) => {
    return (
        <g>
            {nodes.map((node) => {
                const position = nodePositions[node.id];
                if (!position) return null; // Se non ci sono posizioni calcolate per il nodo, salta

                const { x, y } = position;

                return (
                    <circle
                        key={node.id}
                        cx={x}
                        cy={y}
                        r={node.category >= 4 ? 8 : 10} // esempio di logica per il raggio
                        fill={node.color}
                        stroke="black"
                        strokeWidth={1}
                    />
                );
            })}
        </g>
    );
};

export default Nodes;
