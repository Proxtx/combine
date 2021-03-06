let asyncFunctionConstructor = (async () => {}).constructor;

/**
 * Generates a proxy object which represents the server.
 * @param {Function} request The function that handles the request
 * @param {String} module The module name. Optional if you only have one module
 * @returns A proxy objects which acts like "import * as allExports from server"
 */
export const genModule = async (request, module) => {
  let info = await request({ info: true, module });
  let exports = info.exports;
  if (!info.success)
    throw new Error(
      "Combine error. Server info was unsuccessful: " + JSON.stringify(info)
    );
  return new Proxy(
    {},
    {
      get: (target, p) => {
        if (!info || !exports[p]) return;
        let body;
        if (exports[p].function) {
          body = {
            export: p,
            module: module,
          };
          if (request instanceof asyncFunctionConstructor)
            return async function (...args) {
              body.arguments = args;
              return parseRes(await request(body));
            };
          return function (...args) {
            body.arguments = args;
            return parseRes(request(body));
          };
        }
        body = {
          export: p,
          module: module,
        };
        if (request instanceof asyncFunctionConstructor)
          return request(body).then((res) => {
            return parseRes(res);
          });
        return parseRes(request(body));
      },
      set: () => {
        return false;
      },
    }
  );
};

const parseRes = (res) => {
  if (res.success) {
    return res.data;
  }
  return res;
};
