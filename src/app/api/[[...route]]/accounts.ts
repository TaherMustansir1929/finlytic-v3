import { z } from "zod";
import { Hono } from "hono";
import { createId } from "@paralleldrive/cuid2";

import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";

import { db } from "@/db/drizzle";
import { accounts, insertAccountSchema } from "@/db/schema";
import { eq } from "drizzle-orm";

const app = new Hono()
  .get("/", clerkMiddleware(), async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) return c.json({ error: "Unauthorized" }, 401);

    const data = await db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, auth.userId));

    return c.json({ data });
  })
  .post(
    "/create",
    clerkMiddleware(),
    zValidator(
      "json",
      insertAccountSchema.pick({
        name: true,
      })
    ),
    async (c) => {
      const auth = getAuth(c);
      if (!auth?.userId) return c.json({ error: "Unauthorized" }, 401);

      const { name } = c.req.valid("json");

      const [data] = await db
        .insert(accounts)
        .values({
          id: createId(),
          userId: auth.userId,
          name,
        })
        .returning();

      return c.json({ data });
    }
  );

export default app;
