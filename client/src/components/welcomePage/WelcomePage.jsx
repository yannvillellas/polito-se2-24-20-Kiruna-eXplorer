import { Button } from "react-bootstrap";
import './WelcomePage.css';
import { useState } from "react";
import { Link } from "react-router-dom";

function WelcomePage() {
    const [isHovered, setIsHovered] = useState(false);
    const [isHoveredDiagram, setIsHoveredDiagram] = useState(false);


    return (
        <div className="wrapper">
            <div className="login_box">
                <div className="login-header">
                    <span style={{ fontSize: '32px' }}>Welcome</span>
                </div>


                <div className="input_box">
                    <Link
                        to="/mapPage"
                        style={{
                            display: 'flex', // Flexbox
                            justifyContent: 'center', // Centra orizzontalmente
                            alignItems: 'center', // Centra verticalmente
                            textDecoration: 'none',
                            top: "20px",
                            left: "20px",
                            zIndex: 1000,
                            backgroundColor: isHovered ? "white" : "rgba(255, 255, 255, 0.2)",
                            borderRadius: "8px",
                            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                            backdropFilter: "blur(20px)",
                            border: "2px solid white",
                            color: isHovered ? "black" : "white",
                            fontSize: "14px",
                            padding: "10px 20px",
                            transition: 'background-color 0.3s ease, color 0.3s ease',
                        }}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        Go to Map
                    </Link>
                </div>

                <div className="input_box">
                    <Link
                        to="/diagram"
                        style={{
                            display: 'flex', // Flexbox
                            justifyContent: 'center', // Centra orizzontalmente
                            alignItems: 'center', // Centra verticalmente
                            textDecoration: 'none',
                            top: "20px",
                            left: "20px",
                            zIndex: 1000,
                            backgroundColor: isHoveredDiagram ? "white" : "rgba(255, 255, 255, 0.2)",
                            borderRadius: "8px",
                            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                            backdropFilter: "blur(20px)",
                            border: "2px solid white",
                            color: isHoveredDiagram ? "black" : "white",
                            fontSize: "14px",
                            padding: "10px 20px",
                            transition: 'background-color 0.3s ease, color 0.3s ease',
                        }}
                        onMouseEnter={() => setIsHoveredDiagram(true)}
                        onMouseLeave={() => setIsHoveredDiagram(false)}
                    >
                        Go to Diagram
                    </Link>
                </div>

            </div>
        </div>
    );
}


export default WelcomePage;