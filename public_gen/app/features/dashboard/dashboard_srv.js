///<reference path="../../headers/common.d.ts" />
System.register(["app/core/core_module", "./model"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var core_module_1, model_1, DashboardSrv;
    return {
        setters: [
            function (core_module_1_1) {
                core_module_1 = core_module_1_1;
            },
            function (model_1_1) {
                model_1 = model_1_1;
            }
        ],
        execute: function () {///<reference path="../../headers/common.d.ts" />
            DashboardSrv = (function () {
                /** @ngInject */
                function DashboardSrv(backendSrv, $rootScope, $location) {
                    this.backendSrv = backendSrv;
                    this.$rootScope = $rootScope;
                    this.$location = $location;
                }
                DashboardSrv.prototype.create = function (dashboard, meta) {
                    return new model_1.DashboardModel(dashboard, meta);
                };
                DashboardSrv.prototype.setCurrent = function (dashboard) {
                    this.dash = dashboard;
                };
                DashboardSrv.prototype.getCurrent = function () {
                    return this.dash;
                };
                DashboardSrv.prototype.saveDashboard = function (options) {
                    var _this = this;
                    if (!this.dash.meta.canSave && options.makeEditable !== true) {
                        return Promise.resolve();
                    }
                    if (this.dash.title === 'New dashboard') {
                        return this.saveDashboardAs();
                    }
                    var clone = this.dash.getSaveModelClone();
                    return this.backendSrv.saveDashboard(clone, options).then(function (data) {
                        _this.dash.version = data.version;
                        _this.$rootScope.appEvent('dashboard-saved', _this.dash);
                        var dashboardUrl = '/dashboard/db/' + data.slug;
                        if (dashboardUrl !== _this.$location.path()) {
                            _this.$location.url(dashboardUrl);
                        }
                        _this.$rootScope.appEvent('alert-success', ['Dashboard saved', 'Saved as ' + clone.title]);
                    }).catch(this.handleSaveDashboardError.bind(this));
                };
                DashboardSrv.prototype.handleSaveDashboardError = function (err) {
                    var _this = this;
                    if (err.data && err.data.status === "version-mismatch") {
                        err.isHandled = true;
                        this.$rootScope.appEvent('confirm-modal', {
                            title: 'Conflict',
                            text: 'Someone else has updated this dashboard.',
                            text2: 'Would you still like to save this dashboard?',
                            yesText: "Save & Overwrite",
                            icon: "fa-warning",
                            onConfirm: function () {
                                _this.saveDashboard({ overwrite: true });
                            }
                        });
                    }
                    if (err.data && err.data.status === "name-exists") {
                        err.isHandled = true;
                        this.$rootScope.appEvent('confirm-modal', {
                            title: 'Conflict',
                            text: 'Dashboard with the same name exists.',
                            text2: 'Would you still like to save this dashboard?',
                            yesText: "Save & Overwrite",
                            icon: "fa-warning",
                            onConfirm: function () {
                                _this.saveDashboard({ overwrite: true });
                            }
                        });
                    }
                    if (err.data && err.data.status === "plugin-dashboard") {
                        err.isHandled = true;
                        this.$rootScope.appEvent('confirm-modal', {
                            title: 'Plugin Dashboard',
                            text: err.data.message,
                            text2: 'Your changes will be lost when you update the plugin. Use Save As to create custom version.',
                            yesText: "Overwrite",
                            icon: "fa-warning",
                            altActionText: "Save As",
                            onAltAction: function () {
                                _this.saveDashboardAs();
                            },
                            onConfirm: function () {
                                _this.saveDashboard({ overwrite: true });
                            }
                        });
                    }
                };
                DashboardSrv.prototype.saveDashboardAs = function () {
                    var newScope = this.$rootScope.$new();
                    newScope.clone = this.dash.getSaveModelClone();
                    newScope.clone.editable = true;
                    newScope.clone.hideControls = false;
                    this.$rootScope.appEvent('show-modal', {
                        src: 'public/app/features/dashboard/partials/saveDashboardAs.html',
                        scope: newScope,
                        modalClass: 'modal--narrow'
                    });
                };
                return DashboardSrv;
            }());
            exports_1("DashboardSrv", DashboardSrv);
            core_module_1.default.service('dashboardSrv', DashboardSrv);
        }
    };
});
//# sourceMappingURL=dashboard_srv.js.map