// import dotenv from "dotenv";
// dotenv.config(); // Or provide path: dotenv.config({ path: "../../.env" });
import express, { Request, Response } from "express";
import { prisma } from "@repo/prisma";

const app = express();
app.use(express.json());

// Endpoint to fetch all users
app.get("/users", async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
