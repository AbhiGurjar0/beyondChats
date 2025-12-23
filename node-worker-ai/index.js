import express from "express";
import { v4 as uuidv4 } from "uuid";
const uuid = () => uuidv4().replace(/-/g, "");
const app = express();
app.use(express.json());
import startHeavyGeneration from "./worker.js";

app.post("/generate", async (req, res) => {
  const jobId = uuid();
  startHeavyGeneration(jobId, req.body.article_id);
  console.log("Job started with ID:", jobId);
  return res.json({
    job_id: jobId,
    status: "started",
  });
});

app.listen(4000, () => {
  console.log("AI worker running on port 4000");
});
