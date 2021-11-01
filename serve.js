import express from "express";
import {
  router as serveRouter,
  addModule as addModuleImport,
} from "./serveRoute.js";

export const addModule = addModuleImport;

const app = express();

app.use(express.json());
app.use(serveRouter);

export const listen = (port) => app.listen(port);

export const serve = async (port, moduleImport) => {
  await addModule(moduleImport);
  listen(port);
};
