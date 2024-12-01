import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import LocalStrategy from 'passport-local';
import session from 'express-session';
import passport from 'passport';
import { check, validationResult } from 'express-validator';
import { getUser, createUser } from './src/dao/userDAO.mjs';
import { listDocuments, addDocument, deleteDocument } from './src/dao/documentDAO.mjs';
import { listPositions, addPosition, updatePosition } from './src/dao/positionDAO.mjs';
import { getLinksType } from './src/dao/linkTypeDAO.mjs';
import { addArea, listAreas, listAreaAssociations } from './src/dao/areaDAO.mjs';
import { getAssociations, insertAssociation, deleteAssociation, UpdateAssociation, CheckAssociation, getAllAssociations } from './src/dao/associationDAO.mjs';
import { isUrbanPlanner, isValidType, createFolder } from './middleware.mjs';
import fileUpload from 'express-fileupload'
import path from "path";
import fs from "fs";
import {getStakeholders,addStakeholder} from './src/dao/stakeholdersDAO.mjs'
import {getScales, addScale} from './src/dao/scaleDAO.mjs'
import {getDocumentTypes, addDocumentType} from './src/dao/documentTypeDAO.mjs'

const __dirname = path.resolve()
const app = express();
const PORT = 3001;

app.use(express.json());
app.use(morgan('dev'));

app.use(fileUpload());

const corsOptions = {
    origin: 'http://localhost:5173',
    optionsSuccessStatus: 200,
    credentials: true
};
app.use(cors(corsOptions));

passport.use(new LocalStrategy(async function verify(username, password, cb) {
    try {
        const user = await getUser(username, password);
        if (!user) {
            return cb(null, false, { message: 'Incorrect username or password.' });
        }
        return cb(null, user);
    } catch (err) {
        return cb(err);
    }
}));

passport.serializeUser(function (user, cb) {
    cb(null, user);
});

passport.deserializeUser(function (user, cb) {
    return cb(null, user);
});

app.use(session({
    secret: "!terces a s'ti ...hhhhs",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

app.use(passport.authenticate('session'));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


//authAPI
app.post('/api/sessions', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.status(401).json({ error: info.message });

        req.login(user, (err) => {
            if (err) return next(err);

            return res.status(201).json(req.user);
        });
    })(req, res, next);
});

app.get('/api/sessions/current', (req, res) => {
    if (req.isAuthenticated()) {
        res.status(200).json(req.user);
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});

app.delete('/api/sessions/current', (req, res) => {
    req.logout(() => {
        res.end();
    });
});


//userAPi
app.post('/api/users', [
    // Validazione del campo username
    check('username')
        .isString()
        .withMessage('Username must be a string.')
        .isLength({ min: 3, max: 20 })
        .withMessage('Username must be between 3 and 20 characters.')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores.'),

    // Validazione del campo password
    check('password')
        .isString()
        .withMessage('Password must be a string.')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long.')
        .matches(/[A-Z]/)
        .withMessage('Password must contain at least one uppercase letter.')
        .matches(/[a-z]/)
        .withMessage('Password must contain at least one lowercase letter.')
        .matches(/\d/)
        .withMessage('Password must contain at least one number.')
        .matches(/[!@#$%^&*(),_.?":{}|<>]/)
        .withMessage('Password must contain at least one special character.')
        .not()
        .matches(/\s/)
        .withMessage('Password must not contain spaces.'),
], async (req, res) => {
    // Gestione degli errori di validazione
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
        // Creazione utente con ruolo predefinito "urbanPlanner"
        const user = await createUser(username, password, 'urbanPlanner');
        res.status(200).json(user);
    } catch (err) {
        console.error('Error creating user:', err);

        // Gestione di errori specifici per conflitti di username
        if (err.code === 'SQLITE_CONSTRAINT') {
            res.status(409).json({ error: 'Username already exists.' });
        } else {
            res.status(500).json({ error: 'Internal server error.' });
        }
    }
});


//documentAPI
app.post('/api/documents', isUrbanPlanner, [
    check('title').isString(),
    //check('stakeholders').isString(),
    check('scale').isInt(),
    check('ASvalue').optional(),
    check('issuanceDate').isString(),
    check('type').isInt(),
    check('connections').isInt(),
    check('language').optional().isString(),
    check('pages').optional().isString(),
    check('description').isString(),
], async (req, res) => {
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        // Here i manage teh first infos of the document
        const documentId = await addDocument(req.body);

        res.status(201).json(documentId);
    }catch(err){
        console.error('Error adding document:', err.message);
        res.status(500).json({error: err.message});
    }
});

app.post("/api/documents/:docId/files", (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send("No file uploaded.");
    }

    const files = Array.isArray(req.files.files) ? req.files.files : [req.files.files];

    files.forEach((file) => {
        // choose the subfolder based on the document associated with the file
        let subfolder = `${req.params.docId}`;

        const uploadPath = path.join(__dirname, "uploads", subfolder);
        createFolder(uploadPath);

        //save the file in the choosen subfolder
        const filePath = path.join(uploadPath, file.name);
        file.mv(filePath, (err) => {
            if (err) {
                console.error("Error during file saving:", err);
                return res.status(500).send("Error during file upload.");
            }
        });
    });

    res.send("Files uploaded succesfully!");
});

app.get('/api/documents', [], async (req, res) => {
    try {
        const documents = await listDocuments();
        res.status(200).json(documents);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/documents/:docId/files", (req, res) => {
    const subfolder = req.params.docId;
    const uploadDir = path.join(__dirname, "uploads");

    // Ottiene la lista delle sottocartelle presenti nella cartella uploads
    const availableFolders = fs.readdirSync(uploadDir).filter((item) => {
        const itemPath = path.join(uploadDir, item);
        return fs.statSync(itemPath).isDirectory();
    });

    // Verifica che la sottocartella richiesta esista: res.status(400).send("Sottocartella non valida o non trovata.")
    if (!availableFolders.includes(subfolder)) {
        return;
    }

    const folderPath = path.join(uploadDir, subfolder);

    // Legge i file nella sottocartella specificata
    const files = fs.readdirSync(folderPath).map((file) => ({
        name: file,
        path: `/uploads/${subfolder}/${file}`,
    }));

    res.json(files);
});

app.delete('/api/documents', isUrbanPlanner, [], async (req, res) => {
    try {
        await deleteDocument(req.body.docId);
        res.status(200).end();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

});


/**********************  TO TEST ***************************** */
// documentTypes API
app.get('/api/documents/types',[], async(req, res) => {
    try{
        const documentTypes = await getDocumentTypes();
        res.status(200).json(documentTypes);
    }catch(err){
        res.status(500).json({error: err.message});
    }
});
app.post('/api/documents/types', isUrbanPlanner, [
    check('type').isString(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const documentTypeId = await addDocumentType(req.body.type);
    res.status(201).json(documentTypeId);
});
// stakeholders API
app.get('/api/documents/stakeholders',[], async(req, res) => {
    try{
        const stakeholders = await getStakeholders();
        console.log("sh from server:",stakeholders)
        res.status(200).json(stakeholders);
    }catch(err){
        res.status(500).json({error: err.message});
    }
});
app.post('/api/documents/stakeholders', isUrbanPlanner, [
    check('name').isString(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const stakeholderId = await addStakeholder(req.body.name);
    res.status(201).json(stakeholderId);
});
// scales API
app.get('/api/documents/scales',[], async(req, res) => {
    try{
        const scales = await getScales();
        res.status(200).json(scales);
    }catch(err){
        res.status(500).json({error: err.message});
    }
});
app.post('/api/documents/scales', isUrbanPlanner, [
    check('name').isString(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const scaleId = await addScale(req.body.name);
    res.status(201).json(scaleId);
});
/****************************************************************************/


//areaAPI

app.post('/api/:docId/areas', isUrbanPlanner, async (req, res) => {

    const docId = req.params.docId;
    const area = req.body;

    console.log("Sono in serve.mjs, :docId/areas, ho ricevuto (docID, area): ",docId, area);

    if(area.type === "polygon"){
        /**
         *  type: 'polygon',
            latlngs: '[[{"lat":67.85923341814025,"lng":20.202684405958284},{"lat":67.85320538037035,"lng":20.198907855665315},
            {"lat":67.85002869054144,"lng":20.234785083448518},{"lat":67.85677053723843,"lng":20.250406268751252}]]'
         * 
         */
        const coordinates = JSON.stringify(area.latlngs); // => il recupero va fatto con "const savedCoordinates = JSON.parse(row.coordinates);"
        const areaType = "polygon";
        const areaId = await addArea(docId, areaType, coordinates);
        console.log("Sono in serve.mjs, :docId/areas, ho aggiunto un'area di tipo polygon il DB mi ha ritornato id: ", areaId);

        /**DA CANCELLARE: 
        const tutteLeAree = await listAreas();
        console.log("Sono in serve.mjs, :docId/areas, ho recuperato tutte le aree: ", tutteLeAree);
        */

        res.status(201).json(areaId);


    } else if (area.type === "circlemarker"){
        /** type: 'circlemarker',
            center: '{"lat":67.85314055429082,"lng":20.229291919386018}' 
        */
        const coordinates = JSON.stringify(area.center);
        const areaType = "circlemarker";
        /*const areaId = await addArea(docId, areaType, coordinates);
        console.log("Sono in serve.mjs, :docId/areas, ho aggiunto un'area di tipo circlemarker il DB mi ha ritornato id: ", areaId);
        res.status(201).json(areaId); */
    } else{
        res.status(400).json({ error: 'Invalid area type' });
    }

});

app.get('/api/areas', [], async (req, res) => {
    try {
        const areas = await listAreas(); // areas are a list of OBJECTS
        console.log("Sono in serve.mjs, /api/areas, ho recuperato tutte le aree: ", areas);
        res.status(200).json(areas);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.get('/api/areaAssociations', [], async (req, res) => {
    try {
        const areasAssociations = await listAreaAssociations(); // areasAssociations are a list of OBJECTS
        console.log("Sono in serve.mjs, /api/areaAssociations, ho recuperato tutte le aree association: ", areasAssociations);
        res.status(200).json(areasAssociations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});






//positionAPI
app.post('/api/positions', isUrbanPlanner, [
    check('docId').isInt(),
    check('lat').isFloat(),
    check('lng').isFloat(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // Here i manage the (lat, long), float values
    const docId = req.body.docId;
    const lat = req.body.lat;
    const lng = req.body.lng;
    await addPosition(docId, lat, lng);

    res.status(201).end();
});

app.get('/api/positions', [], async (req, res) => {
    try {
        const positions = await listPositions();
        res.status(200).json(positions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/positions/:docId', isUrbanPlanner, [
    check('lat').isFloat(),
    check('lng').isFloat(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // Here i manage the (lat, long), float values
    const docId = req.params.docId;
    const lat = req.body.lat;
    const lng = req.body.lng;
    await updatePosition(docId, lat, lng);

    res.status(200).end();
});


//associationsAPI
app.get('/api/associations', [], async (req, res) => {
    try {
        const associations = await getAllAssociations();
        console.log("Sono in server, /api/associations, ho recuperato tutte le associazioni:",associations);
        res.status(200).json(associations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.post('/api/associations', isUrbanPlanner, isValidType, [
    check('doc1').notEmpty().isNumeric(),
    check('doc2').notEmpty().isNumeric(),
    check('type').notEmpty().isString()/*.isIn(validTypes),*/ //controllare
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const association = {
        doc1: req.body.doc1,
        doc2: req.body.doc2,
        type: req.body.type
    };

    try {
        if ((await CheckAssociation(association)).length > 0 /*|| (await CheckAssociation(association)).length>0*/) {    //if the association already exist
            res.status(201).json({ msg: "association already exist", doc1: association.doc1, doc2: association.doc2, type: association.type })  //check if the tatus code is correct
        } else {  //if not exist create a new association
            const newId = await insertAssociation(association);
            res.status(200).json({ id: newId });  //return the Id of the new association to the frontend
        }
    } catch (e) {
        res.status(500).json({ error: 'Error adding a new link between documents' });
    }
});

app.get('/api/associations/:docId', [], async (req, res) => {
    try {
        const associations = await getAssociations(parseInt(req.params.docId)); // verify if docId are integers
        res.status(200).json(associations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/associations/:aId', isUrbanPlanner, [], async (req, res) => {
    try {
        await deleteAssociation(parseInt(req.params.aId)); // verify if aId is integer
        res.status(200).end();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/associations/:aId', isUrbanPlanner, isValidType, [
    check('doc1').notEmpty().isString(),
    check('doc2').notEmpty().isString(),
    check('type').notEmpty().isString()/*.isIn(validTypes),*/
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const association = {
        aId: parseInt(req.params.aId),      //verify if aId is Int
        doc1: req.body.doc1,
        doc2: req.body.doc2,
        type: req.body.type
    };

    try {
        await UpdateAssociation(association);
        res.status(200).end();
    } catch (e) {
        res.status(500).json({ error: 'Error updating the association' });
    }
});

//linkTypeAPI
// load the valid links type at the server start
//let validTypes = loadValidTypes();
app.get('/api/linkTypes', [], async (req, res) => {
    try {
        const types = await getLinksType();
        res.status(200).json(types);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Remove comments if you want to run tests for the server (needed for havinf the server running just for the tests)
//if (require.main === module) {
app.listen(PORT, () => { console.log(`API server started at http://localhost:${PORT}`); });
//}
export default app;
