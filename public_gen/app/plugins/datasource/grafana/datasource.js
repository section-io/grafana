///<reference path="../../../headers/common.d.ts" />
System.register(["lodash"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var lodash_1, GrafanaDatasource;
    return {
        setters: [
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            }
        ],
        execute: function () {///<reference path="../../../headers/common.d.ts" />
            GrafanaDatasource = (function () {
                /** @ngInject */
                function GrafanaDatasource(backendSrv) {
                    this.backendSrv = backendSrv;
                }
                GrafanaDatasource.prototype.query = function (options) {
                    return this.backendSrv.post('/api/tsdb/query', {
                        from: options.range.from.valueOf().toString(),
                        to: options.range.to.valueOf().toString(),
                        queries: [
                            {
                                "refId": "A",
                                "scenarioId": "random_walk",
                                "intervalMs": options.intervalMs,
                                "maxDataPoints": options.maxDataPoints,
                            }
                        ]
                    }).then(function (res) {
                        var data = [];
                        if (res.results) {
                            lodash_1.default.forEach(res.results, function (queryRes) {
                                for (var _i = 0, _a = queryRes.series; _i < _a.length; _i++) {
                                    var series = _a[_i];
                                    data.push({
                                        target: series.name,
                                        datapoints: series.points
                                    });
                                }
                            });
                        }
                        return { data: data };
                    });
                };
                GrafanaDatasource.prototype.annotationQuery = function (options) {
                    return this.backendSrv.get('/api/annotations', {
                        from: options.range.from.valueOf(),
                        to: options.range.to.valueOf(),
                        limit: options.limit,
                        type: options.type,
                    });
                };
                return GrafanaDatasource;
            }());
            exports_1("GrafanaDatasource", GrafanaDatasource);
        }
    };
});
//# sourceMappingURL=datasource.js.map