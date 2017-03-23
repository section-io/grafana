///<reference path="../../../headers/common.d.ts" />
System.register(["angular", "lodash", "app/plugins/sdk"], function (exports_1, context_1) {
    "use strict";
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var __moduleName = context_1 && context_1.id;
    var angular_1, lodash_1, sdk_1, PrometheusQueryCtrl;
    return {
        setters: [
            function (angular_1_1) {
                angular_1 = angular_1_1;
            },
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            },
            function (sdk_1_1) {
                sdk_1 = sdk_1_1;
            }
        ],
        execute: function () {///<reference path="../../../headers/common.d.ts" />
            PrometheusQueryCtrl = (function (_super) {
                __extends(PrometheusQueryCtrl, _super);
                /** @ngInject */
                function PrometheusQueryCtrl($scope, $injector, templateSrv) {
                    var _this = _super.call(this, $scope, $injector) || this;
                    _this.templateSrv = templateSrv;
                    var target = _this.target;
                    target.expr = target.expr || '';
                    target.intervalFactor = target.intervalFactor || 2;
                    _this.metric = '';
                    _this.resolutions = lodash_1.default.map([1, 2, 3, 4, 5, 10], function (f) {
                        return { factor: f, label: '1/' + f };
                    });
                    $scope.$on('typeahead-updated', function () {
                        _this.$scope.$apply(function () {
                            _this.target.expr += _this.target.metric;
                            _this.metric = '';
                            _this.refreshMetricData();
                        });
                    });
                    // called from typeahead so need this
                    // here in order to ensure this ref
                    _this.suggestMetrics = function (query, callback) {
                        console.log(_this);
                        _this.datasource.performSuggestQuery(query).then(callback);
                    };
                    _this.updateLink();
                    return _this;
                }
                PrometheusQueryCtrl.prototype.refreshMetricData = function () {
                    if (!lodash_1.default.isEqual(this.oldTarget, this.target)) {
                        this.oldTarget = angular_1.default.copy(this.target);
                        this.panelCtrl.refresh();
                        this.updateLink();
                    }
                };
                PrometheusQueryCtrl.prototype.updateLink = function () {
                    var range = this.panelCtrl.range;
                    if (!range) {
                        return;
                    }
                    var rangeDiff = Math.ceil((range.to.valueOf() - range.from.valueOf()) / 1000);
                    var endTime = range.to.utc().format('YYYY-MM-DD HH:mm');
                    var expr = {
                        expr: this.templateSrv.replace(this.target.expr, this.panelCtrl.panel.scopedVars, this.datasource.interpolateQueryExpr),
                        range_input: rangeDiff + 's',
                        end_input: endTime,
                        step_input: this.target.step,
                        stacked: this.panelCtrl.panel.stack,
                        tab: 0
                    };
                    var hash = encodeURIComponent(JSON.stringify([expr]));
                    this.linkToPrometheus = this.datasource.directUrl + '/graph#' + hash;
                };
                return PrometheusQueryCtrl;
            }(sdk_1.QueryCtrl));
            PrometheusQueryCtrl.templateUrl = 'partials/query.editor.html';
            exports_1("PrometheusQueryCtrl", PrometheusQueryCtrl);
        }
    };
});
//# sourceMappingURL=query_ctrl.js.map