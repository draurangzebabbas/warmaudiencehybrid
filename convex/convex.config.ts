import { defineApp } from "convex/server";
import betterAuth from "@convex-dev/better-auth/convex.config";
import affiliate from "./affiliate/convex.config";

const app = defineApp();
app.use(betterAuth);
app.use(affiliate);

export default app;