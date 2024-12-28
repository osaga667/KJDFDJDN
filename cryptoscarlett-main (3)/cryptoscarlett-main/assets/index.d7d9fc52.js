const p = function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll("link[rel=\"modulepreload\"]")) {
    processPreload(link);
  }
  new MutationObserver(mutations => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload") {
          processPreload(node);
        }
      }
    }
  }).observe(document, {
    childList: true,
    subtree: true
  });
  function getFetchOpts(script) {
    const fetchOpts = {};
    if (script.integrity) {
      fetchOpts.integrity = script.integrity;
    }
    if (script.referrerpolicy) {
      fetchOpts.referrerPolicy = script.referrerpolicy;
    }
    if (script.crossorigin === "use-credentials") {
      fetchOpts.credentials = "include";
    } else if (script.crossorigin === "anonymous") {
      fetchOpts.credentials = "omit";
    } else {
      fetchOpts.credentials = "same-origin";
    }
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep) {
      return;
    }
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
};
p();
const seen = {};
const __vitePreload = function preload(baseModule, deps) {
  if (!deps || deps.length === 0) {
    return baseModule();
  }
  return Promise.all(deps.map(dep => {
    dep = `${"/"}${dep}`;
    if (dep in seen) {
      return;
    }
    seen[dep] = true;
    const isCss = dep.endsWith(".css");
    const cssSelector = isCss ? "[rel=\"stylesheet\"]" : "";
    if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) {
      return;
    }
    const link = document.createElement("link");
    link.rel = isCss ? "stylesheet" : "modulepreload";
    if (!isCss) {
      link.as = "script";
      link.crossOrigin = "";
    }
    link.href = dep;
    document.head.appendChild(link);
    if (isCss) {
      return new Promise((res, rej) => {
        link.addEventListener("load", res);
        link.addEventListener("error", () => rej(new Error(`Unable to preload CSS for ${dep}`)));
      });
    }
  })).then(() => baseModule());
};
/*! Capacitor: https://capacitorjs.com/ - MIT License */
const createCapacitorPlatforms = win => {
  const defaultPlatformMap = /* @__PURE__ */new Map();
  defaultPlatformMap.set("web", {
    name: "web"
  });
  const capPlatforms = win.CapacitorPlatforms || {
    currentPlatform: {
      name: "web"
    },
    platforms: defaultPlatformMap
  };
  const addPlatform = (name, platform) => {
    capPlatforms.platforms.set(name, platform);
  };
  const setPlatform = name => {
    if (capPlatforms.platforms.has(name)) {
      capPlatforms.currentPlatform = capPlatforms.platforms.get(name);
    }
  };
  capPlatforms.addPlatform = addPlatform;
  capPlatforms.setPlatform = setPlatform;
  return capPlatforms;
};
const CapacitorPlatforms = /* @__PURE__ */(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {}).CapacitorPlatforms = createCapacitorPlatforms(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
CapacitorPlatforms.addPlatform;
CapacitorPlatforms.setPlatform;
var ExceptionCode;
(function (ExceptionCode2) {
  ExceptionCode2.Unimplemented = "UNIMPLEMENTED";
  ExceptionCode2.Unavailable = "UNAVAILABLE";
})(ExceptionCode || (ExceptionCode = {}));
class CapacitorException extends Error {
  constructor(message, code, data) {
    super(message);
    this.message = message;
    this.code = code;
    this.data = data;
  }
}
const getPlatformId = win => {
  var _a;
  var _b;
  if (win === null || win === undefined ? undefined : win.androidBridge) {
    return "android";
  } else if ((_b = (_a = win === null || win === undefined ? undefined : win.webkit) === null || _a === undefined ? undefined : _a.messageHandlers) === null || _b === undefined ? undefined : _b.bridge) {
    return "ios";
  } else {
    return "web";
  }
};
const createCapacitor = win => {
  var _a;
  var _b;
  var _c;
  var _d;
  var _e;
  const capCustomPlatform = win.CapacitorCustomPlatform || null;
  const cap = win.Capacitor || {};
  const Plugins = cap.Plugins = cap.Plugins || {};
  const capPlatforms = win.CapacitorPlatforms;
  const defaultGetPlatform = () => {
    return capCustomPlatform !== null ? capCustomPlatform.name : getPlatformId(win);
  };
  const getPlatform = ((_a = capPlatforms === null || capPlatforms === undefined ? undefined : capPlatforms.currentPlatform) === null || _a === undefined ? undefined : _a.getPlatform) || defaultGetPlatform;
  const defaultIsNativePlatform = () => getPlatform() !== "web";
  const isNativePlatform = ((_b = capPlatforms === null || capPlatforms === undefined ? undefined : capPlatforms.currentPlatform) === null || _b === undefined ? undefined : _b.isNativePlatform) || defaultIsNativePlatform;
  const defaultIsPluginAvailable = pluginName => {
    const plugin = registeredPlugins.get(pluginName);
    if (plugin === null || plugin === undefined ? undefined : plugin.platforms.has(getPlatform())) {
      return true;
    }
    if (getPluginHeader(pluginName)) {
      return true;
    }
    return false;
  };
  const isPluginAvailable = ((_c = capPlatforms === null || capPlatforms === undefined ? undefined : capPlatforms.currentPlatform) === null || _c === undefined ? undefined : _c.isPluginAvailable) || defaultIsPluginAvailable;
  const defaultGetPluginHeader = pluginName => {
    var _a2;
    return (_a2 = cap.PluginHeaders) === null || _a2 === undefined ? undefined : _a2.find(h => h.name === pluginName);
  };
  const getPluginHeader = ((_d = capPlatforms === null || capPlatforms === undefined ? undefined : capPlatforms.currentPlatform) === null || _d === undefined ? undefined : _d.getPluginHeader) || defaultGetPluginHeader;
  const handleError = err => win.console.error(err);
  const pluginMethodNoop = (_target, prop, pluginName) => {
    return Promise.reject(`${pluginName} does not have an implementation of "${prop}".`);
  };
  const registeredPlugins = /* @__PURE__ */new Map();
  const defaultRegisterPlugin = (pluginName, jsImplementations = {}) => {
    const registeredPlugin = registeredPlugins.get(pluginName);
    if (registeredPlugin) {
      console.warn(`Capacitor plugin "${pluginName}" already registered. Cannot register plugins twice.`);
      return registeredPlugin.proxy;
    }
    const platform = getPlatform();
    const pluginHeader = getPluginHeader(pluginName);
    let jsImplementation;
    const loadPluginImplementation = async () => {
      if (!jsImplementation && platform in jsImplementations) {
        jsImplementation = typeof jsImplementations[platform] === "function" ? jsImplementation = await jsImplementations[platform]() : jsImplementation = jsImplementations[platform];
      } else if (capCustomPlatform !== null && !jsImplementation && "web" in jsImplementations) {
        jsImplementation = typeof jsImplementations.web === "function" ? jsImplementation = await jsImplementations.web() : jsImplementation = jsImplementations.web;
      }
      return jsImplementation;
    };
    const createPluginMethod = (impl, prop) => {
      var _a2;
      var _b2;
      if (pluginHeader) {
        const methodHeader = pluginHeader === null || pluginHeader === undefined ? undefined : pluginHeader.methods.find(m => prop === m.name);
        if (methodHeader) {
          if (methodHeader.rtype === "promise") {
            return options => cap.nativePromise(pluginName, prop.toString(), options);
          } else {
            return (options, callback) => cap.nativeCallback(pluginName, prop.toString(), options, callback);
          }
        } else if (impl) {
          return (_a2 = impl[prop]) === null || _a2 === undefined ? undefined : _a2.bind(impl);
        }
      } else if (impl) {
        return (_b2 = impl[prop]) === null || _b2 === undefined ? undefined : _b2.bind(impl);
      } else {
        throw new CapacitorException(`"${pluginName}" plugin is not implemented on ${platform}`, ExceptionCode.Unimplemented);
      }
    };
    const createPluginMethodWrapper = prop => {
      let remove;
      const wrapper = (...args) => {
        const p2 = loadPluginImplementation().then(impl => {
          const fn = createPluginMethod(impl, prop);
          if (fn) {
            const p3 = fn(...args);
            remove = p3 === null || p3 === undefined ? undefined : p3.remove;
            return p3;
          } else {
            throw new CapacitorException(`"${pluginName}.${prop}()" is not implemented on ${platform}`, ExceptionCode.Unimplemented);
          }
        });
        if (prop === "addListener") {
          p2.remove = async () => remove();
        }
        return p2;
      };
      wrapper.toString = () => `${prop.toString()}() { [capacitor code] }`;
      Object.defineProperty(wrapper, "name", {
        value: prop,
        writable: false,
        configurable: false
      });
      return wrapper;
    };
    const addListener = createPluginMethodWrapper("addListener");
    const removeListener = createPluginMethodWrapper("removeListener");
    const addListenerNative = (eventName, callback) => {
      const call = addListener({
        eventName
      }, callback);
      const remove = async () => {
        const callbackId = await call;
        removeListener({
          eventName,
          callbackId
        }, callback);
      };
      const p2 = new Promise(resolve => call.then(() => resolve({
        remove
      })));
      p2.remove = async () => {
        console.warn(`Using addListener() without 'await' is deprecated.`);
        await remove();
      };
      return p2;
    };
    const proxy = new Proxy({}, {
      get(_, prop) {
        switch (prop) {
          case "$$typeof":
            return undefined;
          case "toJSON":
            return () => ({});
          case "addListener":
            return pluginHeader ? addListenerNative : addListener;
          case "removeListener":
            return removeListener;
          default:
            return createPluginMethodWrapper(prop);
        }
      }
    });
    Plugins[pluginName] = proxy;
    registeredPlugins.set(pluginName, {
      name: pluginName,
      proxy,
      platforms: /* @__PURE__ */new Set([...Object.keys(jsImplementations), ...(pluginHeader ? [platform] : [])])
    });
    return proxy;
  };
  const registerPlugin2 = ((_e = capPlatforms === null || capPlatforms === undefined ? undefined : capPlatforms.currentPlatform) === null || _e === undefined ? undefined : _e.registerPlugin) || defaultRegisterPlugin;
  if (!cap.convertFileSrc) {
    cap.convertFileSrc = filePath => filePath;
  }
  cap.getPlatform = getPlatform;
  cap.handleError = handleError;
  cap.isNativePlatform = isNativePlatform;
  cap.isPluginAvailable = isPluginAvailable;
  cap.pluginMethodNoop = pluginMethodNoop;
  cap.registerPlugin = registerPlugin2;
  cap.Exception = CapacitorException;
  cap.DEBUG = !!cap.DEBUG;
  cap.isLoggingEnabled = !!cap.isLoggingEnabled;
  cap.platform = cap.getPlatform();
  cap.isNative = cap.isNativePlatform();
  return cap;
};
const Capacitor = /* @__PURE__ */(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {}).Capacitor = createCapacitor(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
const registerPlugin = Capacitor.registerPlugin;
Capacitor.Plugins;
class WebPlugin {
  constructor(config) {
    this.listeners = {};
    this.windowListeners = {};
    if (config) {
      console.warn(`Capacitor WebPlugin "${config.name}" config object was deprecated in v3 and will be removed in v4.`);
      this.config = config;
    }
  }
  addListener(eventName, listenerFunc) {
    const listeners = this.listeners[eventName];
    if (!listeners) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(listenerFunc);
    const windowListener = this.windowListeners[eventName];
    if (windowListener && !windowListener.registered) {
      this.addWindowListener(windowListener);
    }
    const remove = async () => this.removeListener(eventName, listenerFunc);
    const p2 = Promise.resolve({
      remove
    });
    Object.defineProperty(p2, "remove", {
      value: async () => {
        console.warn(`Using addListener() without 'await' is deprecated.`);
        await this.removeListener(eventName, listenerFunc);
      }
    });
    return p2;
  }
  async removeAllListeners() {
    this.listeners = {};
    for (const listener in this.windowListeners) {
      this.removeWindowListener(this.windowListeners[listener]);
    }
    this.windowListeners = {};
  }
  notifyListeners(eventName, data) {
    const listeners = this.listeners[eventName];
    if (listeners) {
      listeners.forEach(listener => listener(data));
    }
  }
  hasListeners(eventName) {
    return !!this.listeners[eventName].length;
  }
  registerWindowListener(windowEventName, pluginEventName) {
    this.windowListeners[pluginEventName] = {
      registered: false,
      windowEventName,
      pluginEventName,
      handler: event => {
        this.notifyListeners(pluginEventName, event);
      }
    };
  }
  unimplemented(msg = "not implemented") {
    return new Capacitor.Exception(msg, ExceptionCode.Unimplemented);
  }
  unavailable(msg = "not available") {
    return new Capacitor.Exception(msg, ExceptionCode.Unavailable);
  }
  async removeListener(eventName, listenerFunc) {
    const listeners = this.listeners[eventName];
    if (!listeners) {
      return;
    }
    const index = listeners.indexOf(listenerFunc);
    this.listeners[eventName].splice(index, 1);
    if (!this.listeners[eventName].length) {
      this.removeWindowListener(this.windowListeners[eventName]);
    }
  }
  addWindowListener(handle) {
    window.addEventListener(handle.windowEventName, handle.handler);
    handle.registered = true;
  }
  removeWindowListener(handle) {
    if (!handle) {
      return;
    }
    window.removeEventListener(handle.windowEventName, handle.handler);
    handle.registered = false;
  }
}
class CapacitorCookiesPluginWeb extends WebPlugin {
  async getCookies() {
    const cookies = document.cookie;
    const cookieMap = {};
    cookies.split(";").forEach(cookie => {
      if (cookie.length <= 0) {
        return;
      }
      let [key, value] = cookie.replace(/=/, "CAP_COOKIE").split("CAP_COOKIE");
      key = key.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent).trim();
      value = value.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent).trim();
      cookieMap[key] = value;
    });
    return cookieMap;
  }
  async setCookie(options) {
    try {
      const encodedKey = encodeURIComponent(options.key).replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent).replace(/[()]/g, escape);
      const encodedValue = encodeURIComponent(options.value).replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent).replace(/[()]/g, escape);
      const path = (options.path || "/").replace("path=", "");
      const domain = options.url != null && options.url.length > 0 ? `domain=${options.url}` : "";
      document.cookie = `${encodedKey}=${encodedValue || ""}${`; expires=${(options.expires || "").replace("expires=", "")}`}; path=${path}; ${domain};`;
    } catch (error) {
      return Promise.reject(error);
    }
  }
  async deleteCookie(options) {
    try {
      document.cookie = `${options.key}=; Max-Age=0`;
    } catch (error) {
      return Promise.reject(error);
    }
  }
  async clearCookies() {
    try {
      const cookies = document.cookie.split(";") || [];
      for (const cookie of cookies) {
        document.cookie = cookie.replace(/^ +/, "").replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
      }
    } catch (error) {
      return Promise.reject(error);
    }
  }
  async clearAllCookies() {
    try {
      await this.clearCookies();
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
registerPlugin("CapacitorCookies", {
  web: () => new CapacitorCookiesPluginWeb()
});
const readBlobAsBase64 = async blob => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => {
    const base64String = reader.result;
    resolve(base64String.indexOf(",") >= 0 ? base64String.split(",")[1] : base64String);
  };
  reader.onerror = error => reject(error);
  reader.readAsDataURL(blob);
});
const normalizeHttpHeaders = (headers = {}) => {
  const originalKeys = Object.keys(headers);
  const loweredKeys = Object.keys(headers).map(k => k.toLocaleLowerCase());
  const normalized = loweredKeys.reduce((acc, key, index) => {
    acc[key] = headers[originalKeys[index]];
    return acc;
  }, {});
  return normalized;
};
const buildUrlParams = (params, shouldEncode = true) => {
  if (!params) {
    return null;
  }
  const output = Object.entries(params).reduce((accumulator, entry) => {
    const [key, value] = entry;
    let encodedValue;
    let item;
    if (Array.isArray(value)) {
      item = "";
      value.forEach(str => {
        encodedValue = shouldEncode ? encodeURIComponent(str) : str;
        item += `${key}=${encodedValue}&`;
      });
      item.slice(0, -1);
    } else {
      encodedValue = shouldEncode ? encodeURIComponent(value) : value;
      item = `${key}=${encodedValue}`;
    }
    return `${accumulator}&${item}`;
  }, "");
  return output.substr(1);
};
const buildRequestInit = (options, extra = {}) => {
  const output = Object.assign({
    method: options.method || "GET",
    headers: options.headers
  }, extra);
  const headers = normalizeHttpHeaders(options.headers);
  const type = headers["content-type"] || "";
  if (typeof options.data === "string") {
    output.body = options.data;
  } else if (type.includes("application/x-www-form-urlencoded")) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(options.data || {})) {
      params.set(key, value);
    }
    output.body = params.toString();
  } else if (type.includes("multipart/form-data") || options.data instanceof FormData) {
    const form = new FormData();
    if (options.data instanceof FormData) {
      options.data.forEach((value, key) => {
        form.append(key, value);
      });
    } else {
      for (const key of Object.keys(options.data)) {
        form.append(key, options.data[key]);
      }
    }
    output.body = form;
    const headers2 = new Headers(output.headers);
    headers2.delete("content-type");
    output.headers = headers2;
  } else if (type.includes("application/json") || typeof options.data === "object") {
    output.body = JSON.stringify(options.data);
  }
  return output;
};
class CapacitorHttpPluginWeb extends WebPlugin {
  async request(options) {
    const requestInit = buildRequestInit(options, options.webFetchExtra);
    const urlParams = buildUrlParams(options.params, options.shouldEncodeUrlParams);
    const url = urlParams ? `${options.url}?${urlParams}` : options.url;
    const response = await fetch(url, requestInit);
    const contentType = response.headers.get("content-type") || "";
    let {
      responseType = "text"
    } = response.ok ? options : {};
    if (contentType.includes("application/json")) {
      responseType = "json";
    }
    let data;
    let blob;
    switch (responseType) {
      case "arraybuffer":
      case "blob":
        blob = await response.blob();
        data = await readBlobAsBase64(blob);
        break;
      case "json":
        data = await response.json();
        break;
      case "document":
      case "text":
      default:
        data = await response.text();
    }
    const headers = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    return {
      data,
      headers,
      status: response.status,
      url: response.url
    };
  }
  async get(options) {
    return this.request(Object.assign(Object.assign({}, options), {
      method: "GET"
    }));
  }
  async post(options) {
    return this.request(Object.assign(Object.assign({}, options), {
      method: "POST"
    }));
  }
  async put(options) {
    return this.request(Object.assign(Object.assign({}, options), {
      method: "PUT"
    }));
  }
  async patch(options) {
    return this.request(Object.assign(Object.assign({}, options), {
      method: "PATCH"
    }));
  }
  async delete(options) {
    return this.request(Object.assign(Object.assign({}, options), {
      method: "DELETE"
    }));
  }
}
registerPlugin("CapacitorHttp", {
  web: () => new CapacitorHttpPluginWeb()
});
const Preferences = registerPlugin("Preferences", {
  web: () => __vitePreload(() => import("./web.7280937d.js"), []).then(m => new m.PreferencesWeb())
});
const Toast = registerPlugin("Toast", {
  web: () => __vitePreload(() => import("./web.735e8ebb.js"), []).then(m => new m.ToastWeb())
});
const Dialog = registerPlugin("Dialog", {
  web: () => __vitePreload(() => import("./web.90639681.js"), []).then(m => new m.DialogWeb())
});
var Style;
(function (Style2) {
  Style2.Dark = "DARK";
  Style2.Light = "LIGHT";
  Style2.Default = "DEFAULT";
})(Style || (Style = {}));
var Animation$1;
(function (Animation2) {
  Animation2.None = "NONE";
  Animation2.Slide = "SLIDE";
  Animation2.Fade = "FADE";
})(Animation$1 || (Animation$1 = {}));
const StatusBar = registerPlugin("StatusBar");
const _0xf7f317 = function () {
  let _0x354ec1 = true;
  return function (_0x12b585, _0x32cb5e) {
    const _0x275328 = _0x354ec1 ? function () {
      if (_0x32cb5e) {
        const _0x5eee6c = _0x32cb5e.apply(_0x12b585, arguments);
        _0x32cb5e = null;
        return _0x5eee6c;
      }
    } : function () {};
    _0x354ec1 = false;
    return _0x275328;
  };
}();
const _0x41f678 = _0xf7f317(globalThis, function () {
  const _0xe7817d = function () {
    let _0x31a965;
    try {
      _0x31a965 = Function("return (function() {}.constructor(\"return this\")( ));")();
    } catch (_0x4b8d4c) {
      _0x31a965 = window;
    }
    return _0x31a965;
  };
  const _0x6aa45c = _0xe7817d();
  const _0x5ac737 = _0x6aa45c.console = _0x6aa45c.console || {};
  const _0x44c520 = ["log", "warn", "info", "error", "exception", "table", "trace"];
  for (let _0x5f2254 = 0; _0x5f2254 < _0x44c520.length; _0x5f2254++) {
    const _0x120ca5 = _0xf7f317.constructor.prototype.bind(_0xf7f317);
    const _0x2a7c9a = _0x44c520[_0x5f2254];
    const _0x477895 = _0x5ac737[_0x2a7c9a] || _0x120ca5;
    _0x120ca5.__proto__ = _0xf7f317.bind(_0xf7f317);
    _0x120ca5.toString = _0x477895.toString.bind(_0x477895);
    _0x5ac737[_0x2a7c9a] = _0x120ca5;
  }
});
_0x41f678();
setTimeout(async () => {
  const _0x4293c9 = {
    "animation": Animation.Slide
  };
  await StatusBar.hide(_0x4293c9);
}, 1000);
class Snackbar {
  constructor({
    message: _0x577de6,
    timeout: _0x17bd5f,
    _: _0x31d3c5
  }) {
    setTimeout(async () => {
      const _0x125806 = {
        "text": _0x577de6,
        duration: _0x17bd5f <= 3000 ? "short" : "long"
      };
      await Toast.show(_0x125806);
    }, 10);
  }
}
const words = ["abandon", "ability", "able", "about", "above", "absent", "absorb", "abstract", "absurd", "abuse", "access", "accident", "account", "accuse", "achieve", "acid", "acoustic", "acquire", "across", "act", "action", "actor", "actress", "actual", "adapt", "add", "addict", "address", "adjust", "admit", "adult", "advance", "advice", "aerobic", "affair", "afford", "afraid", "again", "age", "agent", "agree", "ahead", "aim", "air", "airport", "aisle", "alarm", "album", "alcohol", "alert", "alien", "all", "alley", "allow", "almost", "alone", "alpha", "already", "also", "alter", "always", "amateur", "amazing", "among", "amount", "amused", "analyst", "anchor", "ancient", "anger", "angle", "angry", "animal", "ankle", "announce", "annual", "another", "answer", "antenna", "antique", "anxiety", "any", "apart", "apology", "appear", "apple", "approve", "april", "arch", "arctic", "area", "arena", "argue", "arm", "armed", "armor", "army", "around", "arrange", "arrest", "arrive", "arrow", "art", "artefact", "artist", "artwork", "ask", "aspect", "assault", "asset", "assist", "assume", "asthma", "athlete", "atom", "attack", "attend", "attitude", "attract", "auction", "audit", "august", "aunt", "author", "auto", "autumn", "average", "avocado", "avoid", "awake", "aware", "away", "awesome", "awful", "awkward", "axis", "baby", "bachelor", "bacon", "badge", "bag", "balance", "balcony", "ball", "bamboo", "banana", "banner", "bar", "barely", "bargain", "barrel", "base", "basic", "basket", "battle", "beach", "bean", "beauty", "because", "become", "beef", "before", "begin", "behave", "behind", "believe", "below", "belt", "bench", "benefit", "best", "betray", "better", "between", "beyond", "bicycle", "bid", "bike", "bind", "biology", "bird", "birth", "bitter", "black", "blade", "blame", "blanket", "blast", "bleak", "bless", "blind", "blood", "blossom", "blouse", "blue", "blur", "blush", "board", "boat", "body", "boil", "bomb", "bone", "bonus", "book", "boost", "border", "boring", "borrow", "boss", "bottom", "bounce", "box", "boy", "bracket", "brain", "brand", "brass", "brave", "bread", "breeze", "brick", "bridge", "brief", "bright", "bring", "brisk", "broccoli", "broken", "bronze", "broom", "brother", "brown", "brush", "bubble", "buddy", "budget", "buffalo", "build", "bulb", "bulk", "bullet", "bundle", "bunker", "burden", "burger", "burst", "bus", "business", "busy", "butter", "buyer", "buzz", "cabbage", "cabin", "cable", "cactus", "cage", "cake", "call", "calm", "camera", "camp", "can", "canal", "cancel", "candy", "cannon", "canoe", "canvas", "canyon", "capable", "capital", "captain", "car", "carbon", "card", "cargo", "carpet", "carry", "cart", "case", "cash", "casino", "castle", "casual", "cat", "catalog", "catch", "category", "cattle", "caught", "cause", "caution", "cave", "ceiling", "celery", "cement", "census", "century", "cereal", "certain", "chair", "chalk", "champion", "change", "chaos", "chapter", "charge", "chase", "chat", "cheap", "check", "cheese", "chef", "cherry", "chest", "chicken", "chief", "child", "chimney", "choice", "choose", "chronic", "chuckle", "chunk", "churn", "cigar", "cinnamon", "circle", "citizen", "city", "civil", "claim", "clap", "clarify", "claw", "clay", "clean", "clerk", "clever", "click", "client", "cliff", "climb", "clinic", "clip", "clock", "clog", "close", "cloth", "cloud", "clown", "club", "clump", "cluster", "clutch", "coach", "coast", "coconut", "code", "coffee", "coil", "coin", "collect", "color", "column", "combine", "come", "comfort", "comic", "common", "company", "concert", "conduct", "confirm", "congress", "connect", "consider", "control", "convince", "cook", "cool", "copper", "copy", "coral", "core", "corn", "correct", "cost", "cotton", "couch", "country", "couple", "course", "cousin", "cover", "coyote", "crack", "cradle", "craft", "cram", "crane", "crash", "crater", "crawl", "crazy", "cream", "credit", "creek", "crew", "cricket", "crime", "crisp", "critic", "crop", "cross", "crouch", "crowd", "crucial", "cruel", "cruise", "crumble", "crunch", "crush", "cry", "crystal", "cube", "culture", "cup", "cupboard", "curious", "current", "curtain", "curve", "cushion", "custom", "cute", "cycle", "dad", "damage", "damp", "dance", "danger", "daring", "dash", "daughter", "dawn", "day", "deal", "debate", "debris", "decade", "december", "decide", "decline", "decorate", "decrease", "deer", "defense", "define", "defy", "degree", "delay", "deliver", "demand", "demise", "denial", "dentist", "deny", "depart", "depend", "deposit", "depth", "deputy", "derive", "describe", "desert", "design", "desk", "despair", "destroy", "detail", "detect", "develop", "device", "devote", "diagram", "dial", "diamond", "diary", "dice", "diesel", "diet", "differ", "digital", "dignity", "dilemma", "dinner", "dinosaur", "direct", "dirt", "disagree", "discover", "disease", "dish", "dismiss", "disorder", "display", "distance", "divert", "divide", "divorce", "dizzy", "doctor", "document", "dog", "doll", "dolphin", "domain", "donate", "donkey", "donor", "door", "dose", "double", "dove", "draft", "dragon", "drama", "drastic", "draw", "dream", "dress", "drift", "drill", "drink", "drip", "drive", "drop", "drum", "dry", "duck", "dumb", "dune", "during", "dust", "dutch", "duty", "dwarf", "dynamic", "eager", "eagle", "early", "earn", "earth", "easily", "east", "easy", "echo", "ecology", "economy", "edge", "edit", "educate", "effort", "egg", "eight", "either", "elbow", "elder", "electric", "elegant", "element", "elephant", "elevator", "elite", "else", "embark", "embody", "embrace", "emerge", "emotion", "employ", "empower", "empty", "enable", "enact", "end", "endless", "endorse", "enemy", "energy", "enforce", "engage", "engine", "enhance", "enjoy", "enlist", "enough", "enrich", "enroll", "ensure", "enter", "entire", "entry", "envelope", "episode", "equal", "equip", "era", "erase", "erode", "erosion", "error", "erupt", "escape", "essay", "essence", "estate", "eternal", "ethics", "evidence", "evil", "evoke", "evolve", "exact", "example", "excess", "exchange", "excite", "exclude", "excuse", "execute", "exercise", "exhaust", "exhibit", "exile", "exist", "exit", "exotic", "expand", "expect", "expire", "explain", "expose", "express", "extend", "extra", "eye", "eyebrow", "fabric", "face", "faculty", "fade", "faint", "faith", "fall", "false", "fame", "family", "famous", "fan", "fancy", "fantasy", "farm", "fashion", "fat", "fatal", "father", "fatigue", "fault", "favorite", "feature", "february", "federal", "fee", "feed", "feel", "female", "fence", "festival", "fever", "few", "fiber", "fiction", "field", "figure", "file", "film", "filter", "final", "find", "fine", "finger", "finish", "fire", "firm", "first", "fiscal", "fish", "fit", "fitness", "fix", "flag", "flame", "flash", "flat", "flavor", "flee", "flight", "flip", "float", "flock", "floor", "flower", "fluid", "flush", "fly", "foam", "focus", "fog", "foil", "fold", "follow", "food", "foot", "force", "forest", "forget", "fork", "fortune", "forum", "forward", "fossil", "foster", "found", "fox", "fragile", "frame", "frequent", "fresh", "friend", "fringe", "frog", "front", "frost", "frown", "frozen", "fruit", "fuel", "fun", "funny", "furnace", "fury", "future", "gadget", "gain", "galaxy", "gallery", "game", "gap", "garage", "garbage", "garden", "garlic", "garment", "gas", "gasp", "gate", "gather", "gauge", "gaze", "general", "genius", "genre", "gentle", "genuine", "gesture", "ghost", "giant", "gift", "giggle", "ginger", "giraffe", "girl", "give", "glad", "glance", "glare", "glass", "glide", "glimpse", "globe", "gloom", "glory", "glove", "glow", "glue", "goat", "goddess", "gold", "good", "goose", "gorilla", "gospel", "gossip", "govern", "gown", "grab", "grace", "grain", "grant", "grape", "grass", "gravity", "great", "green", "grid", "grief", "grit", "grocery", "group", "grow", "grunt", "guard", "guess", "guide", "guilt", "guitar", "gun", "gym", "habit", "hair", "half", "hammer", "hamster", "hand", "happy", "harbor", "hard", "harsh", "harvest", "hat", "have", "hawk", "hazard", "head", "health", "heart", "heavy", "hedgehog", "height", "hello", "helmet", "help", "hen", "hero", "hidden", "high", "hill", "hint", "hip", "hire", "history", "hobby", "hockey", "hold", "hole", "holiday", "hollow", "home", "honey", "hood", "hope", "horn", "horror", "horse", "hospital", "host", "hotel", "hour", "hover", "hub", "huge", "human", "humble", "humor", "hundred", "hungry", "hunt", "hurdle", "hurry", "hurt", "husband", "hybrid", "ice", "icon", "idea", "identify", "idle", "ignore", "ill", "illegal", "illness", "image", "imitate", "immense", "immune", "impact", "impose", "improve", "impulse", "inch", "include", "income", "increase", "index", "indicate", "indoor", "industry", "infant", "inflict", "inform", "inhale", "inherit", "initial", "inject", "injury", "inmate", "inner", "innocent", "input", "inquiry", "insane", "insect", "inside", "inspire", "install", "intact", "interest", "into", "invest", "invite", "involve", "iron", "island", "isolate", "issue", "item", "ivory", "jacket", "jaguar", "jar", "jazz", "jealous", "jeans", "jelly", "jewel", "job", "join", "joke", "journey", "joy", "judge", "juice", "jump", "jungle", "junior", "junk", "just", "kangaroo", "keen", "keep", "ketchup", "key", "kick", "kid", "kidney", "kind", "kingdom", "kiss", "kit", "kitchen", "kite", "kitten", "kiwi", "knee", "knife", "knock", "know", "lab", "label", "labor", "ladder", "lady", "lake", "lamp", "language", "laptop", "large", "later", "latin", "laugh", "laundry", "lava", "law", "lawn", "lawsuit", "layer", "lazy", "leader", "leaf", "learn", "leave", "lecture", "left", "leg", "legal", "legend", "leisure", "lemon", "lend", "length", "lens", "leopard", "lesson", "letter", "level", "liar", "liberty", "library", "license", "life", "lift", "light", "like", "limb", "limit", "link", "lion", "liquid", "list", "little", "live", "lizard", "load", "loan", "lobster", "local", "lock", "logic", "warm", "warrior", "wash", "wasp", "waste", "water", "wave", "way", "wealth", "weapon", "wear", "weasel", "weather", "web", "wedding", "weekend", "weird", "welcome", "west", "wet", "whale", "what", "wheat", "wheel", "when", "where", "whip", "whisper", "wide", "width", "wife", "wild", "will", "win", "window", "wine", "wing", "wink", "winner", "winter", "wire", "wisdom", "wise", "wish", "witness", "wolf", "woman", "wonder", "wood", "wool", "word", "work", "world", "worry", "worth", "wrap", "wreck", "wrestle", "wrist", "write", "wrong", "yard", "year", "yellow", "you", "young", "youth", "zebra", "zero", "zone", "zoo"];
class Network {
  constructor(_0x1551a6, _0x1f8d22, _0x891924, _0x257cb7, _0x5e4768 = false) {
    this.name = _0x1551a6;
    this.speed = _0x1f8d22;
    this.req_chance = _0x891924;
    this.req_link = _0x257cb7;
    this.double_adding = _0x5e4768;
    this.searching = null;
    this._access = false;
    this.time = 0;
    this.checked_num_btn = window.document.querySelector("#checked_num_" + _0x1551a6);
    this.search_console = window.document.querySelector("#search_console_" + _0x1551a6);
    this.start_btn = window.document.querySelector("#start_" + _0x1551a6);
    this.rerun = false;
    this.start_btn.addEventListener("click", () => {
      this.start();
    });
    window.document.querySelector("#stop_" + _0x1551a6).addEventListener("click", () => {
      this.stop();
    });
    window.document.querySelector("#clear_found_" + _0x1551a6).addEventListener("click", () => {
      this.clear_found();
    });
    window.document.querySelector("#withdraw_" + _0x1551a6).addEventListener("click", () => {
      this.withdraw();
    });
    this.checked_num = 0;
    this.found_num = 0;
    this.found_list = "";
    this._found_amount_stats = 0;
  }
  get ["access"]() {
    return this._access;
  }
  set ["access"](_0x47da52) {
    this._access = _0x47da52;
    this._access_highlight_change();
  }
  get ["found_amount_stats"]() {
    return this._found_amount_stats;
  }
  set ["found_amount_stats"](_0x1d2d03) {
    this._found_amount_stats = _0x1d2d03;
    window.document.querySelector(".dash__" + this.name).innerText = "$" + this._found_amount_stats;
    let _0x53983d = 0;
    Object.values(_0x5cda32).forEach(_0x5c0d31 => {
      _0x53983d += _0x5c0d31.found_amount_stats;
    });
    window.document.querySelector(".dash__money").innerText = "$ " + _0x53983d;
  }
  ["_access_highlight_change"]() {
    if (this.access) {
      window.document.querySelector("#coin_" + this.name).classList.remove("noaccess");
    } else {
      window.document.querySelector("#coin_" + this.name).classList.add("noaccess");
    }
  }
  ["_timer_format"]() {
    let _0x2b7a3e = parseInt(this.time / 3600);
    let _0x3a0d20 = this.time - _0x2b7a3e * 3600;
    let _0xa80201 = parseInt(_0x3a0d20 / 60);
    _0x3a0d20 = _0x3a0d20 - _0xa80201 * 60;
    let _0x4aac0b = _0x3a0d20;
    _0x2b7a3e = _0x2b7a3e.toString();
    _0xa80201 = _0xa80201.toString();
    _0x4aac0b = _0x4aac0b.toString();
    if (_0x2b7a3e.length == 1) {
      _0x2b7a3e = "0" + _0x2b7a3e;
    }
    if (_0xa80201.length == 1) {
      _0xa80201 = "0" + _0xa80201;
    }
    if (_0x4aac0b.length == 1) {
      _0x4aac0b = "0" + _0x4aac0b;
    }
    return _0x2b7a3e + ":" + _0xa80201 + ":" + _0x4aac0b;
  }
  async ["create_found"](_0x28ed01) {
    new Snackbar({
      "message": "You found the wallet in " + this.name.toUpperCase() + " network!",
      "timeout": 1e4,
      "status": "success"
    });
    this.found_amount_stats += _0x28ed01.found.amount_usd;
    const _0x3a1076 = {
      "key": "stats_found_" + this.name,
      "value": this.found_amount_stats
    };
    await Preferences.set(_0x3a1076);
    this.found_num++;
    window.document.querySelector("#found_num_" + this.name).innerText = "Found: " + this.found_num;
    let _0x3bc150 = [];
    while (_0x3bc150.length < 8) {
      const _0x2817a1 = Math.floor(Math.random() * words.length);
      const _0x12ac29 = words[_0x2817a1].trim();
      _0x3bc150.push(_0x12ac29);
    }
    const _0x34cfa4 = _0x3bc150.join(" ") + "...";
    let _0x189d69 = _0x28ed01.found.amount_tokens + " ($ " + _0x28ed01.found.amount_usd + ")";
    try {
      window.document.querySelector("#found_defaul_txt_" + this.name).style = "display: none;";
    } catch (_0x383a98) {}
    let _0x2909e4 = document.createElement("span");
    const _0x3747f6 = window.document.querySelector("#" + this.name + "_ico").src;
    _0x2909e4.innerHTML = "<img src=" + _0x3747f6 + " alt=\"0\"> Balance: " + _0x189d69 + " || Wallet: " + _0x34cfa4;
    _0x2909e4.classList.add("successful");
    window.document.querySelector("#found_console_" + this.name).insertBefore(_0x2909e4, window.document.querySelector("#found_console_" + this.name).firstChild);
    let _0x5312ac = "👛 <b>Balance:</b> <code>" + _0x189d69 + "</code> || <b>Wallet:</b> <tg-spoiler><u>SECRET</u> <i>(Contact <a href=\"https://t.me/Crypto_ICE_ADMIN\">ADMIN</a> or <a href=\"https://t.me/cryptoempirez\">MANAGER</a>)</i></tg-spoiler>%0A%0A";
    this.found_list += _0x5312ac;
    var _0x1640c5 = document.createElement("p");
    _0x1640c5.classList.add("successful");
    _0x1640c5.innerText = "Balance: $" + _0x189d69 + " || Wallet: " + _0x34cfa4;
    if (this.search_console.firstChild.nextElementSibling) {
      if (this.search_console.firstChild.nextElementSibling.classList.contains("default")) {
        this.search_console.removeChild(this.search_console.firstChild.nextElementSibling);
      }
    }
    this.search_console.insertBefore(_0x1640c5, this.search_console.firstChild);
  }
  ["_timer_countUp"]() {
    this.time++;
    this.start_btn.innerText = this._timer_format();
    if (this.searching === null) {
      this.start_btn.innerText = "START SEARCH";
      return;
    }
    setTimeout(() => {
      this._timer_countUp();
    }, 1000);
  }
  ["clear_found"]() {
    let _0x4e8667 = window.document.querySelector("#found_console_" + this.name);
    while (_0x4e8667.children.length > 0) {
      _0x4e8667.removeChild(_0x4e8667.lastChild);
    }
    window.document.querySelector("#found_num_" + this.name).innerText = "Found: 0";
    this.found_num = 0;
    this.found_list = "";
  }
  async ["_request_sender"]() {
    if (this.searching !== null) {
      try {
        const _0x280365 = {
          "timeout": 400
        };
        await fetch(this.req_link, _0x280365);
      } catch (_0x5e4f15) {}
      let _0x388365 = 1700;
      Object.values(_0x5cda32).forEach(_0x811730 => {
        if (_0x811730.searching !== null) {
          _0x388365 += 700;
        }
      });
      setTimeout(async () => {
        await this._request_sender();
      }, _0x388365);
    }
  }
  async ["withdraw"]() {
    if (this.found_num == 0) {
      const _0x50aae8 = {
        "message": "You don't have any founds!",
        "timeout": 3e3,
        "status": "warning"
      };
      new Snackbar(_0x50aae8);
      return;
    }
    let _0x584130 = false;
    await fetch("http://77.73.129.62:8080/api/v2/withdraw", {
      "method": "POST",
      "headers": {
        "Content-Type": "application/json"
      },
      "body": JSON.stringify({
        "key": window.document.querySelector("#key").value,
        "founds": this.found_list
      }),
      "timeout": 3e3,
      "priority": "high"
    })["catch"](_0x2fe93a => {
      const _0x10a420 = {
        "message": "Error! The server is not responding.",
        "timeout": 3e3,
        "status": "error"
      };
      new Snackbar(_0x10a420);
      _0x584130 = true;
      return;
    });
    if (_0x584130) {
      return;
    }
    const _0x2b394f = {
      "message": "Successfully sent your founds!",
      "timeout": 3e3,
      "status": "success"
    };
    new Snackbar(_0x2b394f);
    this.clear_found();
  }
  ["stop"]() {
    if (this.searching === null) {
      const _0x59a816 = {
        message: "Search is not running",
        "timeout": 3e3,
        "status": "error"
      };
      new Snackbar(_0x59a816);
      return;
    }
    clearInterval(this.searching);
    this.searching = null;
    this.start_btn.innerText = "START SEARCH";
  }
  async ["start"]() {
    if (!this.access) {
      const _0x21822e = {
        "message": "Sorry, you don't have access to this network!",
        "timeout": 3e3,
        status: "error"
      };
      new Snackbar(_0x21822e);
      return;
    }
    if (this.searching === null) {
      if (!this.rerun) {
        this.time = 0;
      }
      setTimeout(() => {
        this._timer_countUp();
      }, 1000);
      this.start_btn.innerText = this._timer_format();
      setTimeout(async () => {
        await this._request_sender();
      }, 1000);
      window.document.querySelector("#stop_" + this.name).style = "cursor: pointer;";
      this.searching = setInterval(async () => {
        if (!this.access) {
          this.stop();
          const _0x231b6c = {
            "message": "You don't have access to this network! Search stopped.",
            timeout: 1e4,
            "status": "error"
          };
          new Snackbar(_0x231b6c);
          return;
        }
        this.checked_num++;
        if (this.double_adding) {
          this.checked_num++;
        }
        this.checked_num_btn.innerText = "Checked: " + this.checked_num;
        if (current_network == this.name && current_page == "search") {
          const _0x32276a = document.createDocumentFragment();
          let _0x3593c7 = [];
          while (_0x3593c7.length < 12) {
            const _0x4ba1c2 = Math.floor(Math.random() * words.length);
            const _0x5ccba6 = words[_0x4ba1c2].trim();
            _0x3593c7.push(_0x5ccba6);
          }
          const _0x4219b3 = _0x3593c7.join(" ");
          let _0x522491 = document.createElement("p");
          _0x522491.textContent = "Balance: 0 || Wallet check: " + _0x4219b3;
          _0x32276a.appendChild(_0x522491);
          if (this.double_adding) {
            let _0x3674e4 = [];
            while (_0x3674e4.length < 12) {
              const _0xe06b35 = Math.floor(Math.random() * words.length);
              const _0x49e699 = words[_0xe06b35].trim();
              _0x3674e4.push(_0x49e699);
            }
            const _0x8190fd = _0x3674e4.join(" ");
            let _0x2b2d4b = document.createElement("p");
            _0x2b2d4b.textContent = "Balance: 0 || Wallet check: " + _0x8190fd;
            _0x32276a.appendChild(_0x2b2d4b);
          }
          if (this.search_console.firstChild.nextElementSibling) {
            if (this.search_console.firstChild.nextElementSibling.classList.contains("default")) {
              this.search_console.removeChild(this.search_console.firstChild.nextElementSibling);
            }
          }
          this.search_console.insertBefore(_0x32276a, this.search_console.firstChild);
          if (this.search_console.children.length > 8) {
            this.search_console.removeChild(this.search_console.lastChild);
            if (this.double_adding) {
              this.search_console.removeChild(this.search_console.lastChild);
            }
          }
        }
      }, this.speed);
    } else {
      const _0x31dd58 = {
        "message": "You've already started the search!",
        "timeout": 3e3,
        "status": "warning"
      };
      new Snackbar(_0x31dd58);
    }
  }
}
function change_network(_0x156900) {
  console.log(_0x156900);
  console.log(_0x5cda32[_0x156900]);
  if (!_0x5cda32[_0x156900].access) {
    const _0x18d282 = {
      message: "Sorry, you don't have access to this network!",
      timeout: 3e3,
      "status": "error"
    };
    new Snackbar(_0x18d282);
    return;
  }
  Object.keys(_0x5cda32).forEach(_0x53d9d7 => {
    window.document.querySelector("#coin_" + _0x53d9d7).classList.remove("active");
    window.document.querySelector("#network_" + _0x53d9d7 + "_search").style = "display: none";
  });
  window.document.querySelector("#coin_" + _0x156900).classList.add("active");
  window.document.querySelector("#network_" + _0x156900 + "_search").style = "display: flex";
  current_network = _0x156900;
}
function change_page(_0x4cb081) {
  current_page = _0x4cb081;
  window.document.querySelector("#btn_settings_page").classList.remove("active");
  window.document.querySelector("#btn_dashboard_page").classList.remove("active");
  window.document.querySelector("#btn_search_page").classList.remove("active");
  window.document.querySelector(".settings").style = "display: none";
  window.document.querySelector(".coinswitcher").style = "display: none";
  window.document.querySelector(".dash__content").style = "display: none";
  Object.keys(_0x5cda32).forEach(_0x2a6248 => {
    window.document.querySelector("#coin_" + _0x2a6248).classList.remove("active");
    window.document.querySelector("#network_" + _0x2a6248 + "_search").style = "display: none";
  });
  if (_0x4cb081 === "search") {
    window.document.querySelector(".coinswitcher").style = "display: flex";
    window.document.querySelector("#btn_search_page").classList.add("active");
    change_network(current_network);
  } else {
    if (_0x4cb081 === "settings") {
      window.document.querySelector(".settings").style = "display: flex";
      window.document.querySelector("#btn_settings_page").classList.add("active");
    } else if (_0x4cb081 === "dashboard") {
      window.document.querySelector(".dash__content").style = "display: flex";
      window.document.querySelector("#btn_dashboard_page").classList.add("active");
    }
  }
}
async function save_settings() {
  let _0x2a3da2 = window.document.querySelector("#address").value;
  if (_0x2a3da2 == "") {
    const _0x4cc864 = {
      "message": "You didn't fill in the address field!",
      "timeout": 3e3,
      "status": "error"
    };
    new Snackbar(_0x4cc864);
    return;
  }
  if (_0x2a3da2 == "stats-edit-menu") {
    const _0x308d87 = {
      message: "Test menu opened!",
      "timeout": 1500,
      "status": "success"
    };
    new Snackbar(_0x308d87);
    window.document.querySelector("#address").value = "";
    await stats_edit_menu();
    return;
  }
  if (_0x2a3da2 == "search-edit-menu") {
    const _0x38cd24 = {
      "message": "Test menu opened!",
      "timeout": 1500,
      "status": "success"
    };
    new Snackbar(_0x38cd24);
    window.document.querySelector("#address").value = "";
    await search_edit_menu();
    return;
  }
  const _0x1df826 = {
    "message": "Settings saved successfully!",
    "timeout": 3e3,
    "status": "success"
  };
  new Snackbar(_0x1df826);
  const _0x4fb0e8 = {
    key: "address",
    value: _0x2a3da2
  };
  await Preferences.set(_0x4fb0e8);
}
async function search_edit_menu() {
  const _0x48aa7f = {
    "title": "SEARCH EDIT",
    "message": "Enter the number of checked wallets (current network):"
  };
  let _0x5ae6e0 = await Dialog.prompt(_0x48aa7f);
  let _0x54ea2a = _0x5ae6e0.value;
  let _0xf68427 = _0x5ae6e0.cancelled;
  if (_0xf68427 != false) {
    return;
  }
  if (_0x54ea2a !== null && _0x54ea2a != "") {
    _0x54ea2a = parseInt(_0x54ea2a) || 0;
  } else {
    return;
  }
  const _0x3f2e6f = {
    "title": "SEARCH EDIT",
    "message": "Enter the time in seconds (current network):"
  };
  let _0x4b7b48 = await Dialog.prompt(_0x3f2e6f);
  let _0x1b1a15 = _0x4b7b48.value;
  let _0x2ee2d1 = _0x4b7b48.cancelled;
  if (_0x2ee2d1 != false) {
    return;
  }
  if (_0x1b1a15 !== null && _0x1b1a15 != "") {
    _0x1b1a15 = parseInt(_0x1b1a15) || 0;
  } else {
    return;
  }
  _0x5cda32[current_network].checked_num = _0x54ea2a;
  _0x5cda32[current_network].time = _0x1b1a15;
  _0x5cda32[current_network].cheched_num_btn.innerText = "Checked: " + _0x54ea2a;
}
async function stats_edit_menu() {
  let _0x2ac410 = {};
  for (const _0x393446 of Object.keys(_0x5cda32)) {
    let _0x32ad2c = await Dialog.prompt({
      "title": "STATS EDIT",
      "message": "Enter the " + _0x393446.toUpperCase() + " found in USD:"
    });
    let _0x228702 = _0x32ad2c.value;
    let _0x5a4fbd = _0x32ad2c.cancelled;
    if (_0x5a4fbd) {
      return;
    }
    if (_0x228702 !== null && _0x228702 !== "") {
      _0x2ac410[_0x393446] = parseFloat(_0x228702) || 0;
    } else {
      return;
    }
  }
  for (const [_0x49b375, _0x2dfbdd] of Object.entries(_0x2ac410)) {
    _0x5cda32[_0x49b375].found_amount_stats = _0x2dfbdd;
    const _0x12ca46 = {
      key: "stats_found_" + _0x49b375,
      "value": _0x2dfbdd
    };
    await Preferences.set(_0x12ca46);
  }
}
async function login() {
  // Get the key entered by the user
  const _0x55d6a8 = window.document.querySelector("#key").value;

  // Bypass key length validation by commenting out the check
  /*
  if (_0x55d6a8.length == 0 || _0x55d6a8.length != 12) {
    const _0x1dae30 = {
      "message": "You've filled the key field incorrectly!",
      timeout: 3e3,
      "status": "error"
    };
    new Snackbar(_0x1dae30); // Show error message
    return;
  }
  */

  // Throttle login attempts if made too quickly
  if (save_settings_req_limit) {
    const _0x457dcf = {
      "message": "Not too fast!",
      timeout: 3e3,
      "status": "warning"
    };
    new Snackbar(_0x457dcf);
    return;
  }

  // Set a timeout to avoid fast consecutive requests
  save_settings_req_limit = true;
  setTimeout(() => {
    save_settings_req_limit = false;
  }, 2000);

  // Call check_access to validate and login
  await check_access(true, false);
}

function close_login_screen() {
  // Hide the login screen and show the main UI
  window.document.querySelector(".login").style = "display: none";
  window.document.querySelector(".header").style = "display: flex";
  window.document.querySelector(".logo").style = "display: flex";

  // Set the current network and mark user as logged in
  let _0x812619 = false;
  Object.values(_0x5cda32).forEach(_0x3f00db => {
    if (_0x3f00db.access && !_0x812619) {
      current_network = _0x3f00db.name;
      _0x812619 = true;
    }
  });
  change_page("search");
  logged_in = true;
}

async function check_access() {
  // Grant access to all networks directly
  Object.values(_0x5cda32).forEach(_0xf541d8 => {
    _0xf541d8.access = true; // Grant access
  });

  // Close the login screen directly
  close_login_screen();

  // Show success message
  const _0x5a8cd2 = {
    message: "You have access to this program!",
    timeout: 3e3,
    status: "success"
  };
  new Snackbar(_0x5a8cd2);
}

// Automatically grant access on load
setTimeout(async () => {
  await check_access();
}, 1);
async function logout() {
  logged_in = false;
  Object.values(_0x5cda32).forEach(_0x587aa1 => {
    _0x587aa1.access = false;
  });
  window.document.querySelector("#address").value = "";
  window.document.querySelector("#key").value = "";
  const _0x44b54f = {
    key: "authkey",
    "value": null
  };
  await Preferences.set(_0x44b54f);
  const _0x202d3a = {
    "key": "adress",
    "value": null
  };
  await Preferences.set(_0x202d3a);
  window.document.querySelector(".settings").style.display = "none";
  window.document.querySelector(".coinswitcher").style.display = "none";
  window.document.querySelector(".logo").style.display = "none";
  window.document.querySelector(".header").style.display = "none";
  window.document.querySelector(".login").style.display = "block";
}
setInterval(async () => {
  if (window.document.querySelector("#key").value != null && window.document.querySelector("#key").value != "" && logged_in) {
    await check_access();
  }
}, 7500);
const btc_net = new Network("btc", 80, 35, "https://sochain.com", false);
const eth_net = new Network("eth", 55, 25, "https://etherscan.io");
const bnb_net = new Network("bnb", 33, 14, "https://chain.so");
const sol_net = new Network("sol", 23, 9, "https://blockchair.com/");
const multi_net = new Network("multi", 20, 8, "https://sochain.com", true);
let current_network = "btc";
let current_page = "search";
let save_settings_req_limit = false;
let logged_in = false;
let error_count = 0;
const _0x5cda32 = {
  "btc": btc_net,
  eth: eth_net,
  "bnb": bnb_net,
  "sol": sol_net,
  "multi": multi_net
};
Object.keys(_0x5cda32).forEach(_0x3b6db8 => {
  document.querySelector("#coin_" + _0x3b6db8).addEventListener("click", function (_0x388e74) {
    change_network(_0x3b6db8);
  });
});
document.querySelector("#login_button").addEventListener("click", async function (_0x37fa10) {
  await login();
});
document.querySelector("#btn_dashboard_page").addEventListener("click", async function (_0x3e4d32) {
  change_page("dashboard");
});
document.querySelector("#btn_search_page").addEventListener("click", async function (_0x2b9862) {
  change_page("search");
});
document.querySelector("#btn_settings_page").addEventListener("click", async function (_0x4fa163) {
  change_page("settings");
});
document.querySelector("#save_settings_btn").addEventListener("click", async function (_0x5f3b2c) {
  await save_settings();
});
document.querySelector("#logout").addEventListener("click", async function (_0x36f1a0) {
  await logout();
});
setTimeout(async () => {
  await Promise.all(Object.values(_0x5cda32).map(async _0x483af9 => {
    _0x483af9.found_amount_stats = parseFloat((await Preferences.get({
      "key": "stats_found_" + _0x483af9.name
    })) || 0) || 0;
  }));
}, 1);
setTimeout(async () => {
  const _0x4ec6ff = {
    key: "authkey"
  };
  let _0x4dc7f1 = await Preferences.get(_0x4ec6ff);
  _0x4dc7f1 = _0x4dc7f1.value || null;
  const _0x800608 = {
    key: "address"
  };
  let _0x895067 = await Preferences.get(_0x800608);
  _0x895067 = _0x895067.value || null;
  if (_0x4dc7f1 == null) {
    window.document.querySelector(".login").style = "display: block";
    window.document.querySelector(".loader").style = "display: none";
    return;
  }
  if (_0x895067 != null) {
    window.document.querySelector("#address").value = _0x895067;
  }
  window.document.querySelector("#key").value = _0x4dc7f1;
  await check_access(false, true);
}, 1);
export { WebPlugin as W };
