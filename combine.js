let f;
try {
  f = fetch;
} catch (e) {
  f = (await import("node-fetch")).default;
}

let modules = [];

/**
 * Generates a proxy object which represents the server.
 * @param {String} url The Url of the combine api
 * @param {String} module The module name. Optional if you only have one module
 * @returns A proxy objects which acts like "import * as allExports from server"
 */
export const genModule = async (url, module) => {
  let infoUrl = new URL(url);
  infoUrl.pathname += "info";
  let result = await Fetch(infoUrl.href, { module: module ? module : " " });
  if (!result.success) {
    return result;
  }
  let dataUrl = new URL(url);
  dataUrl.pathname += "data";
  const moduleIndex = modules.length;
  modules.push({ url: dataUrl.href, module, export: result.info });

  return new Proxy(
    {},
    {
      get: (target, p) => {
        let module = modules[moduleIndex];
        let index = 0;
        let found = false;
        for (let i in module.export) {
          if (module.export[i].export == p) {
            index = i;
            found = true;
          }
        }
        if (!found) return false;
        if (module.export[index].function) {
          return async function (...args) {
            return (
              await Fetch(module.url, {
                export: p,
                arguments: args,
                module: module.module,
              })
            ).data;
          };
        }
        return Fetch(module.url, { export: p, module: module.module }).then(
          (result) => {
            return result.data;
          }
        );
      },
      set: () => {
        return false;
      },
    }
  );
};

const Fetch = async (url, json = {}, headers = {}, options = {}) => {
  return await (
    await f(url, {
      ...{
        method: "POST",
        headers: {
          ...{
            "Content-Type": "application/json",
          },
          ...headers,
        },
        body: JSON.stringify(json),
      },
      ...options,
    })
  ).json();
};
