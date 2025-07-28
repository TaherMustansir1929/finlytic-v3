import { Hono } from "hono";

const app = new Hono().get("/", (c) => c.json({ data: "list books" }));

export default app;
