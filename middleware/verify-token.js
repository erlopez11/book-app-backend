const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    try {
        //split creates an array and splits it at space ['Bearer', 'jdbnalsvjlfv']
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.payload;
        //without calling next the request will stall; next calls the next middleware function
        next();
    } catch (error) {
        res.status(401).json({error: 'Invalid token.'});
    }
};

module.exports = verifyToken;