(function () {
  "use strict";

  function read(storageName, key) {
    try {
      const storage = globalThis[storageName];
      return storage ? storage.getItem(key) : null;
    } catch {
      return null;
    }
  }

  function write(storageName, key, value) {
    try {
      const storage = globalThis[storageName];
      if (!storage) return false;
      storage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }

  function remove(storageName, key) {
    try {
      const storage = globalThis[storageName];
      if (storage) storage.removeItem(key);
    } catch {
      // Storage can be unavailable in private or restricted browsers.
    }
  }

  globalThis.BizziStorage = Object.freeze({
    localGet: (key) => read("localStorage", key),
    localSet: (key, value) => write("localStorage", key, value),
    localRemove: (key) => remove("localStorage", key),
    sessionGet: (key) => read("sessionStorage", key),
    sessionSet: (key, value) => write("sessionStorage", key, value),
    sessionRemove: (key) => remove("sessionStorage", key),
  });
})();
