
import './App.css';
import { useState, useEffect } from 'react';
import { Routes, Route, Outlet, Navigate, useNavigate } from 'react-router-dom';
import MainPage from './components/mainPage/MainPage';
import MapPage from './components/mapPage/MapPage';
import PageNotFound from './components/pageNotFound/PageNotFound';
import Map from './components/mapPage/map/Map';
import Login from './components/authentication/Login';
import Registration from './components/authentication/Registration';
import Header from './components/header/Header';
import AuthAPI from './api/authAPI';
import UserAPI from './api/userAPI';
import DocList from "./components/documentList/DocList";
import DocSpecificList from "./components/documentList/DocSpecificList";

// Import updated:
import DocumentAPI from './api/documentAPI';
import PositionAPI from './api/positionAPI';
import associationAPI from './api/associationAPI';
import areaAPI from './api/areaAPI';
import documentTypeAPI from './api/documentTypeAPI';
import scaleAPI from './api/scaleAPI';
import stakeholderAPI from './api/stakeholderAPI';


function App() {
    const [user, setUser] = useState(null);  // Consolidato `user` e `userRole`
    const [authChecked, setAuthChecked] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);
    const [isUrbanPlanner, setIsUrbanPlanner] = useState(false);

    const navigate = useNavigate();


    // Document has been moved here:
    const [documents, setDocuments] = useState([]); // if is here will be easier for tehe shenzen diagram; position is different for the map and for shenzen diagram so will be managed in their componetns
    const [linksType, setLinksType] = useState([]);
    const [areas, setAreas] = useState([]);
    const [areaAssociations, setAreaAssociations] = useState([]);
    const [positions, setPositions] = useState([]);
    const [stakeholdersOptions, setStakeholdersOptions] = useState([]);
    const [scaleOptions, setScaleOptions] = useState([]);
    const [typeOptions, setTypeOptions] = useState([]);

    const [allAssociations, setAllAssociations] = useState([]);

    useEffect(() => {
        const fetchAllAssociations = async () => {
            try {
                const allAssociations = await associationAPI.getAllAssociations();
                setAllAssociations(allAssociations);
            } catch (error) {
                console.error("Error fetching all associations:", error);
            }
        }
        fetchAllAssociations();
    }, [documents]);


    useEffect(() => {
        const fetchOptions = async () => {
            const stakeholderList = await stakeholderAPI.getStakeholders()
            const scaleList = await scaleAPI.getScales()
            const typeList = await documentTypeAPI.getDocumentTypes()
            setStakeholdersOptions(stakeholderList.map((s) => { return { value: s.name, label: s.name } }))
            setScaleOptions(scaleList.map((s) => { return { value: s.name, label: s.name } }))
            setTypeOptions(typeList.map((t) => { return { value: t.type, label: t.type } }))
        }
        fetchOptions();
    }, [documents])




    useEffect(() => {
        const fetchAreas = async () => {
            try {
                const areas = await areaAPI.listAreas();
                const areaAssociations = await areaAPI.listAreaAssociations();
                setAreas(areas);
                setAreaAssociations(areaAssociations);
            } catch (error) {
                console.error("Error fetching areas:", error);
            }
        }
        fetchAreas();
    }, [documents]);


    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const documents = await DocumentAPI.listDocuments();
                const positions = await PositionAPI.listPositions();
                const updatedDocuments = updateDocumentsWithPositions(documents, positions);
                setDocuments(updatedDocuments);
                setPositions(positions);
            } catch (error) {
                console.error("Error fetching documents:", error);
            }
        }
        fetchDocuments();
    }, []);

    useEffect(() => {
        const fetchLinksType = async () => {
            try {
                const linksType = await associationAPI.getLinkTypes();
                console.log("Sono in App.jsx, fetchLinksType, ho ricevuto linksType:", linksType);
                setLinksType(linksType);
            } catch (error) {
                console.error("Error fetching link types:", error);
            }
        }
        fetchLinksType();
    }, [documents]);







    const updateDocumentsWithPositions = (documents, positions) => {
        return documents.map(document => {
            const position = positions.find(position => position.docId === document.docId);
            if (position) {
                document.lat = position.latitude;
                document.lng = position.longitude;
            }
            return document;
        });
    };


    const handleUpload = async (document) => {
        const formData = new FormData();
        Array.from(document.files).forEach((file) => {
            formData.append("files", file);
        });

        try {
            await DocumentAPI.addFiles(document.docId, formData)
        } catch (error) {
            console.error("Error:", error);
            alert("Error uploading file.");
        }
    };

    const handleAddArea = async (document) => {
        try {
            console.log("Sono in Homepage.jsx, handleAddArea, sto spedendo alle API:", document.docId, document.area);
            const areaId = await areaAPI.addArea(document.docId, document.area);
            console.log("Sono in Homepage.jsx, handleAddArea, ho ricevuto dalle API areaId:", areaId);

            return areaId;
        } catch (error) {
            console.error("Error adding area:", error);
        }
    }


    const handleAddDocument = async (document) => {

        try {
            console.log("Sono in App.jsx, handleAddDocument, sto aggiungendo il documento:", document);
            // fix document.pages as blank string
            if (document.pages === "") {
                document.pages = "-";
            } 
            
            if (document.language === "" || document.language === null || document.language === undefined) {
                document.language = "-";
            }


            const docId = await DocumentAPI.addDocument(document);

            const position = {
                docId: docId,
                lat: document.lat,
                lng: document.lng,
            };
            await PositionAPI.addPosition(position);

            let areaId = null;
            if (document.area) {
                areaId = await handleAddArea({ ...document, docId: docId });
            }

            const shs = await stakeholderAPI.getStakeholders()
            const scales = await scaleAPI.getScales()
            const types = await documentTypeAPI.getDocumentTypes()

            const stateDocument = {
                docId: docId,
                title: document.title,
                description: document.description,
                //stakeholders: document.stakeholders,
                stakeholders: shs.filter(sh => document.stakeholders.split(', ').map(s => parseInt(s, 10)).includes(sh.shId)).map(sh => sh.name).join(', '),
                //scale: document.scale,
                scale: scales.find(s => s.scaleId == document.scale).name,
                ASvalue: document.ASvalue,
                issuanceDate: document.issuanceDate,
                //type: document.type,
                type: types.find(t => t.dtId == document.type).type,
                connections: document.connections,
                language: document.language,
                pages: document.pages,
                lat: document.lat,
                lng: document.lng,
                // files:document.files
                areaId: areaId,

            }
            setDocuments([...documents, stateDocument]);
            console.log("Sono in App.jsx, handleAddDocument, ho aggiunto il documento:", stateDocument);
            // adding files to the document
            if (document.files.length > 0) {
                console.log("file ", document.files)
                handleUpload({ ...document, docId: docId });
            }


            return docId;
        } catch (error) {
            console.error("Error adding document:", error);
        }
    }

    // Si viene aggiunto alla lista correttaemtne (va modificato il conenctions perchè viene aggiunto al file solo al refresh della pagina)
    useEffect(() => {
        console.log("Sono in App.jsx, handleAddDocument, ho aggiunto il documento, documents:", documents);
    }, [documents]);



    const handleModifyPosition = async (docId, lat, lng) => {
        try {
            await PositionAPI.modifyPosition(docId, lat, lng);

            const updatedDocuments = documents.map(document => {
                if (document.docId === docId) {
                    return {
                        ...document,
                        lat: lat,
                        lng: lng,
                    };
                }
                return document;
            });
            setDocuments(updatedDocuments);

        } catch (error) {
            console.error("Error modifying position:", error);
        }
    }


    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ END

















    useEffect(() => {
        const checkAuth = async () => {
            try {
                const user = await AuthAPI.getUserInfo();
                if (user) {
                    setLoggedIn(true);
                    setUser(user);
                    setIsUrbanPlanner(user.role === 'urbanPlanner');
                } else {
                    console.log('User is not logged in');
                }
            } catch (error) {
                console.error("Authentication error:", error);
                setUser(null);
            } finally {
                setAuthChecked(true);
            }
        };

        checkAuth();
    }, []);

    const handleLogin = async (credentials) => {
        try {
            const user = await AuthAPI.logIn(credentials);
            if (user) {
                setLoggedIn(true);
                setUser(user);
                setIsUrbanPlanner(user.role === 'urbanPlanner');
                return user;
            }
        } catch (err) {
            console.error("Login error:", err.message);
            return null;
        }
    };

    const handleLogout = async () => {
        try {
            if (loggedIn) {
                const response = await AuthAPI.logOut();
                if (response) {
                    setLoggedIn(false);
                    setUser(null);
                    setIsUrbanPlanner(false);

                    navigate('/mainPage');
                }
            } else {
                navigate('/mainPage');
            }
        } catch (err) {
            console.error("Logout error:", err.message);
        }
    };

    const handleRegistration = async (credentials) => {
        try {
            const newUser = await UserAPI.createUser(credentials);
            if (newUser) {
                console.log("Registration successful:");
                const response = await AuthAPI.logIn(credentials)
                if (response) {
                    setUser(newUser)
                    setLoggedIn(true);
                    setIsUrbanPlanner(true);
                    navigate('/mapPage'); // <------------------------------------------------- be careful now ther e is mapPage
                } else {
                    console.log("errore durante il login")
                    navigate('/login')
                }
            }
        } catch (err) {
            console.error("Registration error:", err.message);
        }
    };

    if (!authChecked) {
        return <div>Loading...</div>;
    }

    return (
        <Routes>
            <Route
                element={
                    <>
                        <Header
                            loggedIn={loggedIn}
                            handleLogout={handleLogout}
                            isUrbanPlanner={isUrbanPlanner}
                        />
                        <Outlet />
                    </>
                }
            >

                <Route path="/" element={<Navigate replace to={loggedIn ? '/mapPage' : '/mainPage'} />} /> {/*<------------------------------------------------- be careful now ther e is mapPage */}
                <Route
                    path="/login"
                    element={loggedIn ? <Navigate replace to="/" /> : <Login login={handleLogin} />}
                />
                <Route path="/registration" element={<Registration registration={handleRegistration} />} />
                <Route path="*" element={<PageNotFound />} />
                <Route path='/mainPage' element={<MainPage loggedIn={loggedIn} role={user?.role} handleLogout={handleLogout} isUrbanPlanner={isUrbanPlanner} />} />


                <Route
                    path='/mapPage/:docId?'
                    element={<MapPage loggedIn={loggedIn} role={user?.role} handleLogout={handleLogout}
                        isUrbanPlanner={isUrbanPlanner}
                        documents={documents}
                        linksType={linksType}

                        stakeholdersOptions={stakeholdersOptions}
                        scaleOptions={scaleOptions}
                        typeOptions={typeOptions}

                        handleModifyPosition={handleModifyPosition}
                        handleAddDocument={handleAddDocument}

                        areas={areas}
                        areaAssociations={areaAssociations}

                    />} />
                <Route
                    path="/documentPage"
                    element={<DocList
                        documents={documents}
                        positions={positions}

                        stakeholdersOptions={stakeholdersOptions}
                        scaleOptions={scaleOptions}
                        typeOptions={typeOptions}

                    />}
                />
                <Route
                    path="/documentPage/:docId"
                    element={<DocSpecificList
                        documents={documents}
                        positions={positions}
                        allAssociations={allAssociations}

                    />}
                />

            </Route>
        </Routes>
    );
}

export default App;
