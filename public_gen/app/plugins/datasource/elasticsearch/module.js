System.register(["./datasource", "./query_ctrl", "./config_ctrl"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var datasource_1, query_ctrl_1, config_ctrl_1, ElasticQueryOptionsCtrl, ElasticAnnotationsQueryCtrl;
    return {
        setters: [
            function (datasource_1_1) {
                datasource_1 = datasource_1_1;
            },
            function (query_ctrl_1_1) {
                query_ctrl_1 = query_ctrl_1_1;
            },
            function (config_ctrl_1_1) {
                config_ctrl_1 = config_ctrl_1_1;
            }
        ],
        execute: function () {
            exports_1("Datasource", datasource_1.ElasticDatasource);
            exports_1("QueryCtrl", query_ctrl_1.ElasticQueryCtrl);
            exports_1("ConfigCtrl", config_ctrl_1.ElasticConfigCtrl);
            ElasticQueryOptionsCtrl = (function () {
                function ElasticQueryOptionsCtrl() {
                }
                return ElasticQueryOptionsCtrl;
            }());
            ElasticQueryOptionsCtrl.templateUrl = 'partials/query.options.html';
            exports_1("QueryOptionsCtrl", ElasticQueryOptionsCtrl);
            ElasticAnnotationsQueryCtrl = (function () {
                function ElasticAnnotationsQueryCtrl() {
                }
                return ElasticAnnotationsQueryCtrl;
            }());
            ElasticAnnotationsQueryCtrl.templateUrl = 'partials/annotations.editor.html';
            exports_1("AnnotationsQueryCtrl", ElasticAnnotationsQueryCtrl);
        }
    };
});
//# sourceMappingURL=module.js.map