import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  try {
    console.log("middleware satarted");
    const authHeader = req.headers.authorization;

    console.log("Autherization header recived:", !!authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer")) {
      console.log("missing the bearer header");

      return res.status(401).json({
        success: false,
        messageL: "Authentication required. Please log in.",
      });
    }
    console.log("autherisation header  recieve");

    const token = authHeader.split(" ")[1];
    console.log("token receview.", !!token);
    console.log("token part",token?token.split(".").length:0);
    console.log("jwt verification loaded:", !!process.eventNames.JWT_SECRET);

    let decoded;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
      console.log("jwt verification successfull");
    } catch (error) {
      console.log("jwt verfication failed !!", error.message);

      return res.status(401).json({
        success: false,
        message: "token verification failed !!",
        error: error.message,
      });
    }

    console.log("Token verified successfully");

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please login again.",
    });
  }
};
