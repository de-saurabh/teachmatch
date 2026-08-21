import "dotenv/config";

// imported to confirm the pg-adapter Prisma client wires up; not
// queried yet since no database is provisioned in this scaffold
import "./config/db";
import { createApp } from "./app";

const app = createApp();
const port = process.env.PORT ?? 4000;

app.listen(port, () => {
  console.log(`api listening on :${port}`);
});
