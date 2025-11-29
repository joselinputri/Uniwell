const mongoose = require("mongoose");

/**
 * connectWithRetry
 * - mencoba konek ke MongoDB beberapa kali (exponential backoff)
 * - tidak langsung process.exit pada kegagalan, melainkan melempar error ke caller
 *
 * Usage:
 *  await connectWithRetry(process.env.MONGO_URI, { /* mongoose opts * / }, 6);
 */
async function connectWithRetry(uri, opts = {}, maxRetries = 6) {
  if (!uri) {
    throw new Error("MONGO_URI is not defined");
  }

  let attempt = 0;

  const connect = async () => {
    attempt++;
    try {
      await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        ...opts,
      });
      console.log("✅ MongoDB connected.");
      return;
    } catch (err) {
      console.error(`MongoDB connection attempt ${attempt} failed:`, err && err.message ? err.message : err);
      if (attempt >= maxRetries) {
        const message = `MongoDB: reached max retries (${maxRetries}), giving up.`;
        console.error(message);
        throw err;
      }
      const delay = Math.min(30000, 1000 * Math.pow(2, attempt)); // exponential backoff up to 30s
      console.log(`Retrying MongoDB connection in ${delay}ms...`);
      await new Promise((res) => setTimeout(res, delay));
      return connect();
    }
  };

  return connect();
}

function mongooseConnection() {
  return mongoose.connection;
}

module.exports = {
  connectWithRetry,
  mongooseConnection,
};