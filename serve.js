import express from "express";
import {
  router as serveRouter,
  addModule as addModuleImport,
} from "./serveRoute.js";

export const addModule = addModuleImport;

const app = express();

app.use(express.json());
app.use(serveRouter);

/**
 * Starts the express Server
 * @param {Integer} port The Port
 */
export const listen = (port) => {
  app.listen(port);
};

/**
 * Starts the server with one module
 * @param {Integer} port The Port
 * @param {String} moduleImport Location of the Module file
 */
export const serve = async (port, moduleImport) => {
  await addModule(moduleImport);
  listen(port);
};
