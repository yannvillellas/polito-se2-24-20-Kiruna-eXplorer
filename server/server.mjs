import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import LocalStrategy from 'passport-local';
import session from 'express-session';
import passport from 'passport';
import { check, validationResult } from 'express-validator';
import { getUser } from './src/dao/userDAO.mjs';
import { listDocuments, addDocument, deleteDocument } from './src/dao/documentDAO.mjs';
import { listPositions, addPosition } from './src/dao/positionDAO.mjs';
import { getLinksType } from './src/dao/LinkTypeDAO.mjs';
import { getAssociations, insertAssociation,deleteAssociation,UpdateAssociation } from './src/dao/associationDAO.mjs';
import { isUrbanPlanner,isValidType} from './middleware.mjs';


const app = express();
const PORT = 3001;

app.use(express.json());
app.use(morgan('dev'));

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
        console.log(user);
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

//documentAPI
app.get('/api/documents',[], async(req, res) => {
    try{
        const documents = await listDocuments();
        console.log("il server.mjs, GET ALL Documents riceve dal DAO come documenti: ",documents)
        //console.log("il server riceve come documenti: ",documents)
        res.status(200).json(documents);
    }catch(err){
        res.status(500).json({error: err.message});
    }
});

// addDocument
app.post('/api/documents', isUrbanPlanner, [
    check('title').isString(),
    check('stakeholders').isString(),
    check('scale').isString(),
    check('issuanceDate').isString(),
    check('type').isString(),
    check('connections').isInt(),
    check('language').optional().isString(),
    check('pages').optional().isInt(),
    check('description').isString(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    console.log("sono in server.mjs: sto aggiungendo il corpo del documento", req.body);
    // Here i manage teh first infos of the document
    const documentId = await addDocument(req.body);
    console.log("sono in server.mjs: ho aggiunto il documento, mi è tornato id:", documentId);

    res.status(201).json(documentId);
});

//delete Document
app.delete('/api/documents',isUrbanPlanner,[],async (req, res)=>{
    try{
        console.log("in server elimino: ", req.body.docId)
        await deleteDocument(req.body.docId);
        res.status(200).end();
    }catch(err){
        res.status(500).json({error: err.message});
    }

});





//positionAPI
app.get('/api/positions',[], async(req, res) => {
    try{
        const positions = await listPositions();
        //console.log("il server torna posizioni: ",positions)
        res.status(200).json(positions);
    }catch(err){
        res.status(500).json({error: err.message});
    }
});
// addPosition
app.post('/api/positions', isUrbanPlanner, [
    check('docId').isInt(),
    check('lat').isFloat(),
    check('lng').isFloat(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    console.log("sono in server.mjs: sto aggiungendo la posizione:", req.body);

    // Here i manage the (lat, long), float values
    const docId = req.body.docId;
    const lat = req.body.lat;
    const lng = req.body.lng;
    await addPosition(docId, lat, lng);

    res.status(201).end();
});


//linksAPI

// load the valid links type at the server start
//let validTypes = loadValidTypes();

app.get('/api/linkTypes',[], async(req, res) => {
    try{
        const types = await getLinksType();
        res.status(200).json(types);
    }catch(err){
        res.status(500).json({error: err.message});
    }
});

app.get('/api/associations/:docId',[], async(req, res) => {
    try{
        const associations = await getAssociations(parseInt(req.params.docId)); // verify if docId are integers
        res.status(200).json(associations);
    }catch(err){
        res.status(500).json({error: err.message});
    }
});

app.post('/api/associations', isUrbanPlanner, isValidType,[
    check('doc1').notEmpty().isString(),
    check('doc2').notEmpty().isString(),
    check('type').notEmpty().isString()/*.isIn(validTypes),*/ //controllare
  ], async (req, res) => {
    console.log("sono in server.mjs: mi è arrivato",req.body)
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
        const newId=await insertAssociation(association);
        res.status(200).json({ id: newId });  //return the Id of the new association to the frontend
    } catch (e) {
        res.status(500).json({ error: 'Error adding a new link between documents' });
    }
});

app.delete('/api/associations/:aId',isUrbanPlanner,[],async (req, res)=>{
    try{
        await deleteAssociation(parseInt(req.params.aId)); // verify if aId is integer
        res.status(200).end();
    }catch(err){
        res.status(500).json({error: err.message});
    }
});

app.put('/api/associations/:aId', isUrbanPlanner,isValidType,[
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

// Remove comments if you want to run tests for the server (needed for havinf the server running just for the tests)
//if (require.main === module) {
    app.listen(PORT, () => { console.log(`API server started at http://localhost:${PORT}`); });
//}
export default app;
