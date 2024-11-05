import { getLinksType } from "./src/dao/LinkTypeDAO.mjs";

export const isUrbanPlanner = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'urbanPlanner') {
        return next();
    }
    return res.status(401).json({ error: 'Not authorized' });
};

export const isValidType = async (req, res, next) => {
    try {
        const validTypes = await getLinksType();
        console.log("tipi dal db:", validTypes);
        console.log("tipo passato dal front:",req.body.type)
        if (validTypes.includes(req.body.type)) {
            return next();
        }
        return res.status(425).json({ error: 'wrong link type' });
    } catch (error) {
        console.error('Error fetching valid types:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};