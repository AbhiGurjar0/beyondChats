import express from "express";
import uuid from "uuid/v4";
const app = express();
app.use(express.json());
import startHeavyGeneration from "./worker.js";

app.post("/generate", async (req, res) => {
  const jobId = uuid();
  startHeavyGeneration(jobId, req.body.article_id);
  res.json({
    job_id: jobId,
    status: "started",
  });
});

app.listen(4000, () => {
  console.log("AI worker running on port 4000");
});
