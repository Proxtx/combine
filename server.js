let modules = [];

/**
 * Add a Module to the Combine Server
 * @param {Object} module An Object with Functions and Attributes
 * @param {String} name A custom name for the module.
 */
export const addModule = async (module, name) => {
  modules.push({
    name: name,
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

/**
 * The main function combine interacts with
 * @param {Object} req The content of the request made by combine
 * @returns {Object} A result that can be parsed by the client
 */
export const data = async (req) => {
  if (req.info) return info(req);
  const find = findModule(req.module);
  if (!find.success) return find;
  let module = find.module.module;
  if (!req.export || module[req.export] === undefined) {
    return { success: false, errorText: "Export not found!" };
  }
  try {
    if (module[req.export] instanceof Function) {
      let data = req.arguments
        ? await module[req.export](...req.arguments)
        : await module[req.export]();
      return {
        success: true,
        data,
      };
    }
    return { success: true, data: module[req.export] };
  } catch (e) {
    console.log("A combine export has thrown an error:\n", e);
    return { success: false, errorText: "Internal Error" };
  }
};

const info = (req) => {
  const find = findModule(req.module);
  if (!find.success) return find;
  let module = find.module.module;
  let functions = {};
  for (let i of Object.keys(module)) {
    if (module[i] instanceof Function) {
      functions[i] = true;
    }
  }
  return { success: true, functions };
};
