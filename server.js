/**
 * The Server side combine class
 * This modules also contains an instance of this class with its main exports (add module & data)
 */
export class Combine {
  modules = {};

  /**
   * Add a Module to the Combine Server
   * @param {Object} module An Object with Functions and Attributes
   * @param {String} name A custom name for the module.
   */
  addModule = async (module, name) => {
    if (typeof module == "string") module = await import(module);
    this.modules[name] = {
      name: name,
      module,
    };
  };

  /**
   * The main function combine interacts with
   * @param {Object} req The content of the request made by combine
   * @returns {Object} A result that can be parsed by the client
   */
  data = async (req) => {
    if (req.info && req.module) return this.info(req);
    if (req.info) return this.moduleInfo(req);
    const find = this.modules[req.module];
    if (!find) return { success: false, errorText: "Module not found." };
    let module = find.module;
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

  /**
   * Returns info about a module
   * @param {Object} req Object requested by the client side
   * @returns Info about a module
   */
  info = (req) => {
    const find = this.modules[req.module];
    if (!find) return { success: false, errorText: "Module not found." };
    let module = find.module;
    let functions = {};
    for (let i of Object.keys(module)) {
      if (module[i] instanceof Function) {
        functions[i] = true;
      }
    }
    let exports = {};
    for (let i of Object.keys(module)) {
      if (module[i] instanceof Function) {
        exports[i] = { function: true };
      } else {
        exports[i] = { function: false };
      }
    }

    return { success: true, functions, exports };
  };

  /**
   * Returns all modules
   * @param {Object} req Object requested by the client side
   * @returns All modules
   */
  moduleInfo = (req) => {
    let moduleResponse = [];
    modules.forEach((value) => {
      moduleResponse.push({ name: value.name });
    });
    return { success: true, modules: moduleResponse };
  };
}

export const instance = new Combine();

export const addModule = instance.addModule;
export const data = instance.data;
