///<reference path="../../headers/common.d.ts" />
System.register(["../../core/core_module"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var core_module_1, AlertNotificationsListCtrl;
    return {
        setters: [
            function (core_module_1_1) {
                core_module_1 = core_module_1_1;
            }
        ],
        execute: function () {///<reference path="../../headers/common.d.ts" />
            AlertNotificationsListCtrl = (function () {
                /** @ngInject */
                function AlertNotificationsListCtrl(backendSrv, $scope) {
                    this.backendSrv = backendSrv;
                    this.$scope = $scope;
                    this.loadNotifications();
                }
                AlertNotificationsListCtrl.prototype.loadNotifications = function () {
                    var _this = this;
                    this.backendSrv.get("/api/alert-notifications").then(function (result) {
                        _this.notifications = result;
                    });
                };
                AlertNotificationsListCtrl.prototype.deleteNotification = function (id) {
                    var _this = this;
                    this.backendSrv.delete("/api/alert-notifications/" + id).then(function () {
                        _this.notifications = _this.notifications.filter(function (notification) {
                            return notification.id !== id;
                        });
                    });
                };
                return AlertNotificationsListCtrl;
            }());
            exports_1("AlertNotificationsListCtrl", AlertNotificationsListCtrl);
            core_module_1.default.controller('AlertNotificationsListCtrl', AlertNotificationsListCtrl);
        }
    };
});
//# sourceMappingURL=notifications_list_ctrl.js.map