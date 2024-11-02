import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import LocalStrategy from 'passport-local';
import session from 'express-session';
import passport from 'passport';
import { check, validationResult } from 'express-validator';
import { getUser } from './src/dao/userDAO.mjs';
import { listDocuments, addDocument } from './src/dao/documentDAO.mjs';
import { listPositions, addPosition } from './src/dao/positionDAO.mjs';

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

const isUrbanPlanner = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'urbanPlanner') {
        return next();
    }
    return res.status(401).json({ error: 'Not authorized' });
};

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
        res.status(200).json(documents);
    }catch(err){
        res.status(500).json({error: err.message});
    }
});

// addDocument
app.post('/api/documents', isUrbanPlanner, [
    check('id').isInt(),
    check('title').isString(),
    check('stakeholders').isString(),
    check('scale').isString(),
    check('issuanceDate').isDate(),
    check('type').isString(),
    check('connections').isString(),
    check('language').isString(),
    check('pages').isInt(),
    check('description').isString(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    console.log("sono in server.mjs: sto aggiungendo il corpo del documento", req.body);
    // Here i manage teh first infos of the document
    await addDocument(req.body);

    res.status(201).end();
});





//positionAPI
app.get('/api/positions',[], async(req, res) => {
    try{
        const positions = await listPositions();
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


app.listen(PORT, () => { console.log(`API server started at http://localhost:${PORT}`); });

export default app;
