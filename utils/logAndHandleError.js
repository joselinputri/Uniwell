// utils/logAndHandleError.js
module.exports = function logAndHandleError(fn) {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (err) {
      console.error("=== ROUTE ERROR ===");
      console.error("URL:", req.originalUrl);
      console.error("Method:", req.method);
      console.error("User:", req.user ? (req.user._id || req.user.email) : "no user");
      try {
        console.error("Payload:", JSON.stringify(req.body).slice(0, 2000));
      } catch (e) {
        console.error("Payload: <could not stringify>");
      }
      console.error("Error stack:", err.stack || err);
      const isDev = process.env.NODE_ENV !== "production";
      res.status(500).json({
        message: err.message || "Internal server error",
        ...(isDev ? { stack: err.stack } : {})
      });
    }
  };
};