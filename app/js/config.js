System.register([], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var Config;
    return {
        setters:[],
        execute: function() {
            Config = (function () {
                function Config() {
                }
                Config.SITE_NAME = "Zizki viewer";
                Config.API = "http://localhost:8080/";
                return Config;
            }());
            exports_1("Config", Config);
        }
    }
});
//# sourceMappingURL=config.js.map