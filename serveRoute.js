import { Router } from "express";
import process from "process";

let modules = [];

export const router = Router();

export const addModule = async (moduleImport) => {
  const module = await import("file://" + process.cwd() + "/" + moduleImport);
  modules.push({
    name: moduleImport.replace(/^.*[\\\/]/, "").split(".js")[0],
    module,
  });
};

const findModule = (moduleImport) => {
  if (modules.length < 1) {
    return { success: false, errorText: "Module not found!" };
  }
  let module;
  if (moduleImport && modules.length > 1) {
    for (let i in modules)
      if (modules[i].name == moduleImport) module = modules[i];
  }
  if (!module) {
    module = modules[0];
  }

  return { success: true, module };
};

router.post("/data", async (req, res) => {
  const find = findModule(req.body.module);
  if (!find.success) return find;
  let module = find.module.module;
  if (!req.body.export || !module[req.body.export]) {
    res.status(200).send({ success: false, errorText: "Export not found!" });
    return;
  }
  if (module[req.body.export] instanceof Function) {
    let data = req.body.arguments
      ? await module[req.body.export](...req.body.arguments)
      : await module[req.body.export]();
    res.status(200).send({
      success: true,
      data,
    });
    return;
  }
  res.status(200).send({ success: true, data: module[req.body.export] });
  return;
});

router.post("/info", (req, res) => {
  let info;
  if (req.body.module) {
    const find = findModule(req.body.module);
    if (!find.success) {
      res.status(200).send(find);
      return find;
    }
    info = Object.keys(find.module.module).map((value) => {
      return {
        export: value,
        function: find.module.module[value] instanceof Function,
      };
    });
  } else {
    info = modules.map((value) => value.name);
  }
  res.status(200).send({ success: true, info });
  return;
});
