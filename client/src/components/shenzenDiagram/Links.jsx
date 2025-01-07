import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState, useRef, useCallback} from "react";
import { scaleTime, scaleBand } from "@visx/scale";
import { line, curveBasis } from "d3-shape";
import associationAPI from "../../api/associationAPI";
import { OverlayTrigger, Tooltip, Overlay } from "react-bootstrap";
//import { scaleLinear } from 'd3-scale';


// Compare function to avoid sorting elements alphabetically
const compare = (a, b) => {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
};

// Component to draw the links
const Links = ({ links, nodes, xScale, yScale, verticalSpacing, horizontalSpacing, nodePositions }) => {

    // Funzione per controllare se un punto è vicino a un nodo
    const isNearNode = (x, y, nodeId = null, nodeRadius = 15) => {
        for (const node of nodes) {
            if (node.id == nodeId) {
                continue
            }
            const { x: nx, y: ny } = nodePositions[node.id];
            //console.log(nx,ny)
            if (Math.sqrt((x - nx) ** 2 + (y - ny) ** 2) < nodeRadius * 4) {
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
        const key = [link.source, link.target].sort(compare).join("-");
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
    const [tooltipData, setTooltipData] = useState({
        show: false,
        x: 0,
        y: 0,
        content: "",
    });

    // Riferimento per il timeout (debounce)
    const timeoutRef = useRef(null);

    // Funzione debounce per migliorare la performance
    const debouncedSetTooltip = useCallback((x, y, content) => {
        // Cancella il timeout precedente se c'è
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            setTooltipData({ show: true, x, y, content });
        }, 50); // Ritarda l'aggiornamento a 50ms
    }, []);

    const handleMouseEnter = (event, linkType) => {
        const { clientX, clientY } = event; // Posizione del mouse
        debouncedSetTooltip(clientX, clientY, `${linkType}`);
    };

    const handleMouseMove = (event) => {
        const { clientX, clientY } = event;
        debouncedSetTooltip(clientX, clientY, tooltipData.content); // Usa la funzione debounce
    };

    const handleMouseLeave = () => {
        // Cancella il timeout se il mouse esce prima che il tooltip venga mostrato
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setTooltipData({ show: false, x: 0, y: 0, content: "" });
    };

    const getPointAtDistance = (x1, y1, x2, y2, distance) => {
        // Calcola la differenza tra le coordinate (direzione del vettore)
        const dx = x2 - x1;
        const dy = y2 - y1;

        // Calcola la distanza tra i due punti (lunghezza del vettore)
        const length = Math.sqrt(dx * dx + dy * dy);

        // Normalizza il vettore (direzione unitaria)
        const unitX = dx / length;
        const unitY = dy / length;

        // Calcola il punto alla distanza specificata (ad esempio, 20px da source)
        const pointX = x1 + unitX * distance;
        const pointY = y1 + unitY * distance;

        return { x: pointX, y: pointY };
    };

    const isVerticalLink = (sourceX, targetX) => {
        //console.log(targetX,sourceX)
        if (Math.abs(sourceX - targetX) < 30) {
            return true
        } else {
            return false
        }
    }


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
                        let horizontalOffset = (index - (totalLinks - 1) / 2) * step;
                        if (isVerticalLink(x1, x2)) {
                            horizontalOffset = index * step / 4;
                        }
                        const stepV = verticalSpacing / (totalLinks - 1 || 1)
                        const verticalOffset = (index - (totalLinks - 1) / 2) * stepV;

                        // Trova punti di deviazione se necessario
                        let midX = (x1 + x2) / 2 + horizontalOffset;
                        let midY = (y1 + y2) / 2 + verticalShift + verticalOffset;

                        let { x: pointFromSourceX, y: pointFromSourceY } = getPointAtDistance(x1, y1, x2, y2, 15); // Punto a 10px dalla source
                        let { x: pointFromDestX, y: pointFromDestY } = getPointAtDistance(x2, y2, x1, y1, 15); // Punto a 10px dalla destination
                        //console.log(x1, y2, pointFromSourceX, pointFromSourceY)

                        if (isVerticalLink(x1, x2)) {
                            // Se il link è verticale
                            if (isNearNode(midX, midY) !== 0) {
                                midX += 30; // Applica l'offset alla midX per separare il link
                            }
                        } else {
                            // Se il link non è verticale
                            if (isNearNode(midX, midY) === 1) {
                                midY -= 50; // Nodo sopra
                            } else if (isNearNode(midX, midY) === -1) {
                                midY += 50; // Nodo sotto
                            }
                        }
                        //pointFromSourceY += 50;

                        if (isNearNode(pointFromSourceX, pointFromSourceY, link.source) === 1) {
                            pointFromSourceY -= 50;
                        } else if (isNearNode(pointFromSourceX, pointFromSourceY, link.source) === -1) {
                            pointFromSourceY += 50;
                        }


                        if (isNearNode(pointFromDestX, pointFromDestY, link.target) === 1) {
                            pointFromDestY -= 50;
                        } else if (isNearNode(pointFromDestX, pointFromDestY, link.target) === -1) {
                            pointFromDestY += 50;
                        }


                        // Linea curva
                        const curvedLine = line()
                            .x((d) => d.x)
                            .y((d) => d.y)
                            .curve(curveBasis)([
                                { x: x1, y: y1 },
                                { x: pointFromSourceX, y: pointFromSourceY },
                                { x: midX, y: midY },
                                { x: pointFromDestX, y: pointFromDestY },
                                { x: x2, y: y2 },
                            ]);

                        return (
                            <>
                                <path
                                    key={`${key}-${index}-invisible`}
                                    d={curvedLine}
                                    fill="none"
                                    stroke="transparent" // Rendi il path invisibile
                                    strokeWidth={5} // Aumenta la larghezza per intercettare meglio il mouse
                                    onMouseEnter={(e) => handleMouseEnter(e, link.linkType)}
                                    onMouseLeave={handleMouseLeave}
                                    //onMouseMove={handleMouseMove}
                                />
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

export default Links