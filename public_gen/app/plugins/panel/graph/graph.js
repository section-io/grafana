///<reference path="../../../headers/common.d.ts" />
System.register(["jquery.flot", "jquery.flot.selection", "jquery.flot.time", "jquery.flot.stack", "jquery.flot.stackpercent", "jquery.flot.fillbelow", "jquery.flot.crosshair", "./jquery.flot.events", "jquery", "lodash", "moment", "app/core/utils/kbn", "app/core/core", "./graph_tooltip", "./threshold_manager"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var jquery_1, lodash_1, moment_1, kbn_1, core_1, graph_tooltip_1, threshold_manager_1;
    return {
        setters: [
            function (_1) {
            },
            function (_2) {
            },
            function (_3) {
            },
            function (_4) {
            },
            function (_5) {
            },
            function (_6) {
            },
            function (_7) {
            },
            function (_8) {
            },
            function (jquery_1_1) {
                jquery_1 = jquery_1_1;
            },
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            },
            function (moment_1_1) {
                moment_1 = moment_1_1;
            },
            function (kbn_1_1) {
                kbn_1 = kbn_1_1;
            },
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (graph_tooltip_1_1) {
                graph_tooltip_1 = graph_tooltip_1_1;
            },
            function (threshold_manager_1_1) {
                threshold_manager_1 = threshold_manager_1_1;
            }
        ],
        execute: function () {///<reference path="../../../headers/common.d.ts" />
            core_1.coreModule.directive('grafanaGraph', function ($rootScope, timeSrv) {
                return {
                    restrict: 'A',
                    template: '',
                    link: function (scope, elem) {
                        var ctrl = scope.ctrl;
                        var dashboard = ctrl.dashboard;
                        var panel = ctrl.panel;
                        var data;
                        var annotations;
                        var plot;
                        var sortedSeries;
                        var legendSideLastValue = null;
                        var rootScope = scope.$root;
                        var panelWidth = 0;
                        var thresholdManager = new threshold_manager_1.ThresholdManager(ctrl);
                        var tooltip = new graph_tooltip_1.default(elem, dashboard, scope, function () {
                            return sortedSeries;
                        });
                        // panel events
                        ctrl.events.on('panel-teardown', function () {
                            thresholdManager = null;
                            if (plot) {
                                plot.destroy();
                                plot = null;
                            }
                        });
                        ctrl.events.on('render', function (renderData) {
                            data = renderData || data;
                            if (!data) {
                                return;
                            }
                            annotations = ctrl.annotations;
                            render_panel();
                        });
                        // global events
                        core_1.appEvents.on('graph-hover', function (evt) {
                            // ignore other graph hover events if shared tooltip is disabled
                            if (!dashboard.sharedTooltipModeEnabled()) {
                                return;
                            }
                            // ignore if we are the emitter
                            if (!plot || evt.panel.id === panel.id || ctrl.otherPanelInFullscreenMode()) {
                                return;
                            }
                            tooltip.show(evt.pos);
                        }, scope);
                        core_1.appEvents.on('graph-hover-clear', function (event, info) {
                            if (plot) {
                                tooltip.clear(plot);
                            }
                        }, scope);
                        function getLegendHeight(panelHeight) {
                            if (!panel.legend.show || panel.legend.rightSide) {
                                return 0;
                            }
                            if (panel.legend.alignAsTable) {
                                var legendSeries = lodash_1.default.filter(data, function (series) {
                                    return series.hideFromLegend(panel.legend) === false;
                                });
                                var total = 23 + (21 * legendSeries.length);
                                return Math.min(total, Math.floor(panelHeight / 2));
                            }
                            else {
                                return 26;
                            }
                        }
                        function setElementHeight() {
                            try {
                                var height = ctrl.height - getLegendHeight(ctrl.height);
                                elem.css('height', height + 'px');
                                return true;
                            }
                            catch (e) {
                                console.log(e);
                                return false;
                            }
                        }
                        function shouldAbortRender() {
                            if (!data) {
                                return true;
                            }
                            if (!setElementHeight()) {
                                return true;
                            }
                            if (panelWidth === 0) {
                                return true;
                            }
                        }
                        function drawHook(plot) {
                            // Update legend values
                            var yaxis = plot.getYAxes();
                            for (var i = 0; i < data.length; i++) {
                                var series = data[i];
                                var axis = yaxis[series.yaxis - 1];
                                var formater = kbn_1.default.valueFormats[panel.yaxes[series.yaxis - 1].format];
                                // decimal override
                                if (lodash_1.default.isNumber(panel.decimals)) {
                                    series.updateLegendValues(formater, panel.decimals, null);
                                }
                                else {
                                    // auto decimals
                                    // legend and tooltip gets one more decimal precision
                                    // than graph legend ticks
                                    var tickDecimals = (axis.tickDecimals || -1) + 1;
                                    series.updateLegendValues(formater, tickDecimals, axis.scaledDecimals + 2);
                                }
                                if (!rootScope.$$phase) {
                                    scope.$digest();
                                }
                            }
                            // add left axis labels
                            if (panel.yaxes[0].label) {
                                var yaxisLabel = jquery_1.default("<div class='axisLabel left-yaxis-label flot-temp-elem'></div>")
                                    .text(panel.yaxes[0].label)
                                    .appendTo(elem);
                            }
                            // add right axis labels
                            if (panel.yaxes[1].label) {
                                var rightLabel = jquery_1.default("<div class='axisLabel right-yaxis-label flot-temp-elem'></div>")
                                    .text(panel.yaxes[1].label)
                                    .appendTo(elem);
                            }
                            thresholdManager.draw(plot);
                        }
                        function processOffsetHook(plot, gridMargin) {
                            var left = panel.yaxes[0];
                            var right = panel.yaxes[1];
                            if (left.show && left.label) {
                                gridMargin.left = 20;
                            }
                            if (right.show && right.label) {
                                gridMargin.right = 20;
                            }
                            // apply y-axis min/max options
                            var yaxis = plot.getYAxes();
                            for (var i = 0; i < yaxis.length; i++) {
                                var axis = yaxis[i];
                                var panelOptions = panel.yaxes[i];
                                axis.options.max = panelOptions.max;
                                axis.options.min = panelOptions.min;
                            }
                        }
                        // Series could have different timeSteps,
                        // let's find the smallest one so that bars are correctly rendered.
                        // In addition, only take series which are rendered as bars for this.
                        function getMinTimeStepOfSeries(data) {
                            var min = Number.MAX_VALUE;
                            for (var i = 0; i < data.length; i++) {
                                if (!data[i].stats.timeStep) {
                                    continue;
                                }
                                if (panel.bars) {
                                    if (data[i].bars && data[i].bars.show === false) {
                                        continue;
                                    }
                                }
                                else {
                                    if (typeof data[i].bars === 'undefined' || typeof data[i].bars.show === 'undefined' || !data[i].bars.show) {
                                        continue;
                                    }
                                }
                                if (data[i].stats.timeStep < min) {
                                    min = data[i].stats.timeStep;
                                }
                            }
                            return min;
                        }
                        // Function for rendering panel
                        function render_panel() {
                            panelWidth = elem.width();
                            if (shouldAbortRender()) {
                                return;
                            }
                            // give space to alert editing
                            thresholdManager.prepare(elem, data);
                            var stack = panel.stack ? true : null;
                            // Populate element
                            var options = {
                                hooks: {
                                    draw: [drawHook],
                                    processOffset: [processOffsetHook],
                                },
                                legend: { show: false },
                                series: {
                                    stackpercent: panel.stack ? panel.percentage : false,
                                    stack: panel.percentage ? null : stack,
                                    lines: {
                                        show: panel.lines,
                                        zero: false,
                                        fill: translateFillOption(panel.fill),
                                        lineWidth: panel.linewidth,
                                        steps: panel.steppedLine
                                    },
                                    bars: {
                                        show: panel.bars,
                                        fill: 1,
                                        barWidth: 1,
                                        zero: false,
                                        lineWidth: 0
                                    },
                                    points: {
                                        show: panel.points,
                                        fill: 1,
                                        fillColor: false,
                                        radius: panel.points ? panel.pointradius : 2
                                    },
                                    shadowSize: 0
                                },
                                yaxes: [],
                                xaxis: {},
                                grid: {
                                    minBorderMargin: 0,
                                    markings: [],
                                    backgroundColor: null,
                                    borderWidth: 0,
                                    hoverable: true,
                                    clickable: true,
                                    color: '#c8c8c8',
                                    margin: { left: 0, right: 0 },
                                },
                                selection: {
                                    mode: "x",
                                    color: '#666'
                                },
                                crosshair: {
                                    mode: 'x'
                                }
                            };
                            for (var i = 0; i < data.length; i++) {
                                var series = data[i];
                                series.data = series.getFlotPairs(series.nullPointMode || panel.nullPointMode);
                                // if hidden remove points and disable stack
                                if (ctrl.hiddenSeries[series.alias]) {
                                    series.data = [];
                                    series.stack = false;
                                }
                            }
                            switch (panel.xaxis.mode) {
                                case 'series': {
                                    options.series.bars.barWidth = 0.7;
                                    options.series.bars.align = 'center';
                                    for (var i = 0; i < data.length; i++) {
                                        var series = data[i];
                                        series.data = [[i + 1, series.stats[panel.xaxis.values[0]]]];
                                    }
                                    addXSeriesAxis(options);
                                    break;
                                }
                                case 'table': {
                                    options.series.bars.barWidth = 0.7;
                                    options.series.bars.align = 'center';
                                    addXTableAxis(options);
                                    break;
                                }
                                default: {
                                    options.series.bars.barWidth = getMinTimeStepOfSeries(data) / 1.5;
                                    addTimeAxis(options);
                                    break;
                                }
                            }
                            thresholdManager.addPlotOptions(options, panel);
                            addAnnotations(options);
                            configureAxisOptions(data, options);
                            sortedSeries = lodash_1.default.sortBy(data, function (series) { return series.zindex; });
                            function callPlot(incrementRenderCounter) {
                                try {
                                    plot = jquery_1.default.plot(elem, sortedSeries, options);
                                    if (ctrl.renderError) {
                                        delete ctrl.error;
                                        delete ctrl.inspector;
                                    }
                                }
                                catch (e) {
                                    console.log('flotcharts error', e);
                                    ctrl.error = e.message || "Render Error";
                                    ctrl.renderError = true;
                                    ctrl.inspector = { error: e };
                                }
                                if (incrementRenderCounter) {
                                    ctrl.renderingCompleted();
                                }
                            }
                            if (shouldDelayDraw(panel)) {
                                // temp fix for legends on the side, need to render twice to get dimensions right
                                callPlot(false);
                                setTimeout(function () { callPlot(true); }, 50);
                                legendSideLastValue = panel.legend.rightSide;
                            }
                            else {
                                callPlot(true);
                            }
                        }
                        function translateFillOption(fill) {
                            return fill === 0 ? 0.001 : fill / 10;
                        }
                        function shouldDelayDraw(panel) {
                            if (panel.legend.rightSide) {
                                return true;
                            }
                            if (legendSideLastValue !== null && panel.legend.rightSide !== legendSideLastValue) {
                                return true;
                            }
                        }
                        function addTimeAxis(options) {
                            var ticks = panelWidth / 100;
                            var min = lodash_1.default.isUndefined(ctrl.range.from) ? null : ctrl.range.from.valueOf();
                            var max = lodash_1.default.isUndefined(ctrl.range.to) ? null : ctrl.range.to.valueOf();
                            options.xaxis = {
                                timezone: dashboard.getTimezone(),
                                show: panel.xaxis.show,
                                mode: "time",
                                min: min,
                                max: max,
                                label: "Datetime",
                                ticks: ticks,
                                timeformat: time_format(ticks, min, max),
                            };
                        }
                        function addXSeriesAxis(options) {
                            var ticks = lodash_1.default.map(data, function (series, index) {
                                return [index + 1, series.alias];
                            });
                            options.xaxis = {
                                timezone: dashboard.getTimezone(),
                                show: panel.xaxis.show,
                                mode: null,
                                min: 0,
                                max: ticks.length + 1,
                                label: "Datetime",
                                ticks: ticks
                            };
                        }
                        function addXTableAxis(options) {
                            var ticks = lodash_1.default.map(data, function (series, seriesIndex) {
                                return lodash_1.default.map(series.datapoints, function (point, pointIndex) {
                                    var tickIndex = seriesIndex * series.datapoints.length + pointIndex;
                                    return [tickIndex + 1, point[1]];
                                });
                            });
                            ticks = lodash_1.default.flatten(ticks, true);
                            options.xaxis = {
                                timezone: dashboard.getTimezone(),
                                show: panel.xaxis.show,
                                mode: null,
                                min: 0,
                                max: ticks.length + 1,
                                label: "Datetime",
                                ticks: ticks
                            };
                        }
                        function addAnnotations(options) {
                            if (!annotations || annotations.length === 0) {
                                return;
                            }
                            var types = {};
                            types['$__alerting'] = {
                                color: 'rgba(237, 46, 24, 1)',
                                position: 'BOTTOM',
                                markerSize: 5,
                            };
                            types['$__ok'] = {
                                color: 'rgba(11, 237, 50, 1)',
                                position: 'BOTTOM',
                                markerSize: 5,
                            };
                            types['$__no_data'] = {
                                color: 'rgba(150, 150, 150, 1)',
                                position: 'BOTTOM',
                                markerSize: 5,
                            };
                            types['$__execution_error'] = ['$__no_data'];
                            for (var i = 0; i < annotations.length; i++) {
                                var item = annotations[i];
                                if (item.newState) {
                                    console.log(item.newState);
                                    item.eventType = '$__' + item.newState;
                                    continue;
                                }
                                if (!types[item.source.name]) {
                                    types[item.source.name] = {
                                        color: item.source.iconColor,
                                        position: 'BOTTOM',
                                        markerSize: 5,
                                    };
                                }
                            }
                            options.events = {
                                levels: lodash_1.default.keys(types).length + 1,
                                data: annotations,
                                types: types,
                            };
                        }
                        function configureAxisOptions(data, options) {
                            var defaults = {
                                position: 'left',
                                show: panel.yaxes[0].show,
                                index: 1,
                                logBase: panel.yaxes[0].logBase || 1,
                                max: null
                            };
                            options.yaxes.push(defaults);
                            if (lodash_1.default.find(data, { yaxis: 2 })) {
                                var secondY = lodash_1.default.clone(defaults);
                                secondY.index = 2;
                                secondY.show = panel.yaxes[1].show;
                                secondY.logBase = panel.yaxes[1].logBase || 1;
                                secondY.position = 'right';
                                options.yaxes.push(secondY);
                                applyLogScale(options.yaxes[1], data);
                                configureAxisMode(options.yaxes[1], panel.percentage && panel.stack ? "percent" : panel.yaxes[1].format);
                            }
                            applyLogScale(options.yaxes[0], data);
                            configureAxisMode(options.yaxes[0], panel.percentage && panel.stack ? "percent" : panel.yaxes[0].format);
                        }
                        function applyLogScale(axis, data) {
                            if (axis.logBase === 1) {
                                return;
                            }
                            var series, i;
                            var max = axis.max;
                            if (max === null) {
                                for (i = 0; i < data.length; i++) {
                                    series = data[i];
                                    if (series.yaxis === axis.index) {
                                        if (max < series.stats.max) {
                                            max = series.stats.max;
                                        }
                                    }
                                }
                                if (max === void 0) {
                                    max = Number.MAX_VALUE;
                                }
                            }
                            axis.min = axis.min !== null ? axis.min : 0;
                            axis.ticks = [0, 1];
                            var nextTick = 1;
                            while (true) {
                                nextTick = nextTick * axis.logBase;
                                axis.ticks.push(nextTick);
                                if (nextTick > max) {
                                    break;
                                }
                            }
                            if (axis.logBase === 10) {
                                axis.transform = function (v) { return Math.log(v + 0.1); };
                                axis.inverseTransform = function (v) { return Math.pow(10, v); };
                            }
                            else {
                                axis.transform = function (v) { return Math.log(v + 0.1) / Math.log(axis.logBase); };
                                axis.inverseTransform = function (v) { return Math.pow(axis.logBase, v); };
                            }
                        }
                        function configureAxisMode(axis, format) {
                            axis.tickFormatter = function (val, axis) {
                                return kbn_1.default.valueFormats[format](val, axis.tickDecimals, axis.scaledDecimals);
                            };
                        }
                        function time_format(ticks, min, max) {
                            if (min && max && ticks) {
                                var range = max - min;
                                var secPerTick = (range / ticks) / 1000;
                                var oneDay = 86400000;
                                var oneYear = 31536000000;
                                if (secPerTick <= 45) {
                                    return "%H:%M:%S";
                                }
                                if (secPerTick <= 7200 || range <= oneDay) {
                                    return "%H:%M";
                                }
                                if (secPerTick <= 80000) {
                                    return "%m/%d %H:%M";
                                }
                                if (secPerTick <= 2419200 || range <= oneYear) {
                                    return "%m/%d";
                                }
                                return "%Y-%m";
                            }
                            return "%H:%M";
                        }
                        elem.bind("plotselected", function (event, ranges) {
                            scope.$apply(function () {
                                timeSrv.setTime({
                                    from: moment_1.default.utc(ranges.xaxis.from),
                                    to: moment_1.default.utc(ranges.xaxis.to),
                                });
                            });
                        });
                        scope.$on('$destroy', function () {
                            tooltip.destroy();
                            elem.off();
                            elem.remove();
                        });
                    }
                };
            });
        }
    };
});
//# sourceMappingURL=graph.js.map