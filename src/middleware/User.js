const jwtDecode = require("jwt-decode");

const attachUser = (req, res, next) => {
  let token = req.cookies.token;
  if (!token)
    return res.status(401).json({ message: "Authentication Invalid" });

  const decodedToken = jwtDecode(token);
  if (!decodedToken)
    return res.status(401).json({ message: "Authentication Invalid" });

  req.user = decodedToken;
  next();
};

const requireAdmin = (req, res, next) => {
  const { role } = req.user;
  if (role !== "admin")
    return res.status(401).json({ message: "Insufficient role" });
  next();
};

module.exports = { attachUser, requireAdmin };
