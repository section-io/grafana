///<reference path="../../headers/common.d.ts" />
System.register(["app/core/core_module"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var core_module_1, DashListCtrl;
    return {
        setters: [
            function (core_module_1_1) {
                core_module_1 = core_module_1_1;
            }
        ],
        execute: function () {///<reference path="../../headers/common.d.ts" />
            DashListCtrl = (function () {
                /** @ngInject */
                function DashListCtrl() {
                }
                return DashListCtrl;
            }());
            exports_1("DashListCtrl", DashListCtrl);
            core_module_1.default.controller('DashListCtrl', DashListCtrl);
        }
    };
});
//# sourceMappingURL=dash_list_ctrl.js.map