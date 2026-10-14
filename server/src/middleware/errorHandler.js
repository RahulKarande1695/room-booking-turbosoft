export const notFound = (req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
};

export const errorHandler = (err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message || "Internal server error";

  if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(", ");
  }

  if (err.name === "CastError") {
    status = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  if (err.code === 11000) {
    status = 409;
    message = "Duplicate entry or slot already taken";
  }

  if (err.response?.status === 429) {
    status = 503;
    message = "please try again shortly";
  } else if (err.isAxiosError && !err.response?.status) {
    status = 502;
    message = "not unreachable";
  } else if (err.response?.status >= 500) {
    status = 502;
    message = "crm error";
  }

  if (err.type === "entity.parse.failed") {
    status = 400;
    message = "Invalid JSON body";
  }

  if (status >= 500) console.error(err);
  else console.warn(`${status} ${message}`);

  res.status(status).json({ error: message });
};