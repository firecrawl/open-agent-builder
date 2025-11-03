import "dotenv/config";
import express from "express";
import fetch from "node-fetch";

const app = express();
const port = 3030;

app.use(express.json());

app.post("/v1/mcp", async (req, res) => {
  const { method, params } = req.body;

  try {
    if (method === "quote") {
      const symbol = params?.symbol;
      const apiKey = process.env.FINNHUB_API_KEY!;
      const r = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`);
      const data = await r.json();
      return res.json({ result: data });
    }

    return res.status(400).json({ error: "Unsupported method" });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () =>
  console.log(`✅ Finnhub MCP server running on http://localhost:${port}/v1/mcp`)
);
