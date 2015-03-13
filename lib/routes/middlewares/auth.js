exports.ensureLoggedIn = function(req, res, next) {
    if (!req.isAuthenticated || !req.isAuthenticated()) return res.sendStatus(401);
    next();
};

exports.isAdmin = function(req, res, next) {
    if (!req.user.isAdmin) return res.sendStatus(403);
    next();
};
