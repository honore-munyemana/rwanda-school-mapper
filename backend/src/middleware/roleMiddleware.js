const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    // Defensive check to prevent crashes if used before authMiddleware
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        error: "Unauthorized"
      });
    }

    // Role verification
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Access denied"
      });
    }

    next();
  };
};

export default roleMiddleware;
