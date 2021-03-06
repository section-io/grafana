///<reference path="../../../headers/common.d.ts" />
System.register(["lodash", "moment", "app/core/utils/kbn", "app/core/utils/datemath", "./metric_find_query"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    /** @ngInject */
    function PrometheusDatasource(instanceSettings, $q, backendSrv, templateSrv, timeSrv) {
        this.type = 'prometheus';
        this.editorSrc = 'app/features/prometheus/partials/query.editor.html';
        this.name = instanceSettings.name;
        this.supportMetrics = true;
        this.url = instanceSettings.url;
        this.directUrl = instanceSettings.directUrl;
        this.basicAuth = instanceSettings.basicAuth;
        this.withCredentials = instanceSettings.withCredentials;
        this.lastErrors = {};
        this._request = function (method, url, requestId) {
            var options = {
                url: this.url + url,
                method: method,
                requestId: requestId,
            };
            if (this.basicAuth || this.withCredentials) {
                options.withCredentials = true;
            }
            if (this.basicAuth) {
                options.headers = {
                    "Authorization": this.basicAuth
                };
            }
            return backendSrv.datasourceRequest(options);
        };
        function prometheusSpecialRegexEscape(value) {
            return value.replace(/[\\^$*+?.()|[\]{}]/g, '\\\\$&');
        }
        this.interpolateQueryExpr = function (value, variable, defaultFormatFn) {
            // if no multi or include all do not regexEscape
            if (!variable.multi && !variable.includeAll) {
                return value;
            }
            if (typeof value === 'string') {
                return prometheusSpecialRegexEscape(value);
            }
            var escapedValues = lodash_1.default.map(value, prometheusSpecialRegexEscape);
            return escapedValues.join('|');
        };
        this.targetContainsTemplate = function (target) {
            return templateSrv.variableExists(target.expr);
        };
        // Called once per panel (graph)
        this.query = function (options) {
            var _this = this;
            var self = this;
            var start = this.getPrometheusTime(options.range.from, false);
            var end = this.getPrometheusTime(options.range.to, true);
            var queries = [];
            var activeTargets = [];
            options = lodash_1.default.clone(options);
            lodash_1.default.each(options.targets, function (target) {
                if (!target.expr || target.hide) {
                    return;
                }
                activeTargets.push(target);
                var query = {};
                query.expr = templateSrv.replace(target.expr, options.scopedVars, self.interpolateQueryExpr);
                query.requestId = options.panelId + target.refId;
                var interval = templateSrv.replace(target.interval, options.scopedVars) || options.interval;
                var intervalFactor = target.intervalFactor || 1;
                target.step = query.step = _this.calculateInterval(interval, intervalFactor);
                var range = Math.ceil(end - start);
                target.step = query.step = _this.adjustStep(query.step, range);
                queries.push(query);
            });
            // No valid targets, return the empty result to save a round trip.
            if (lodash_1.default.isEmpty(queries)) {
                var d = $q.defer();
                d.resolve({ data: [] });
                return d.promise;
            }
            var allQueryPromise = lodash_1.default.map(queries, function (query) {
                return _this.performTimeSeriesQuery(query, start, end);
            });
            return $q.all(allQueryPromise).then(function (allResponse) {
                var result = [];
                lodash_1.default.each(allResponse, function (response, index) {
                    if (response.status === 'error') {
                        self.lastErrors.query = response.error;
                        throw response.error;
                    }
                    delete self.lastErrors.query;
                    lodash_1.default.each(response.data.data.result, function (metricData) {
                        result.push(self.transformMetricData(metricData, activeTargets[index], start, end));
                    });
                });
                return { data: result };
            });
        };
        this.adjustStep = function (step, range) {
            // Prometheus drop query if range/step > 11000
            // calibrate step if it is too big
            if (step !== 0 && range / step > 11000) {
                return Math.ceil(range / 11000);
            }
            return step;
        };
        this.performTimeSeriesQuery = function (query, start, end) {
            if (start > end) {
                throw { message: 'Invalid time range' };
            }
            var url = '/api/v1/query_range?query=' + encodeURIComponent(query.expr) + '&start=' + start + '&end=' + end + '&step=' + query.step;
            return this._request('GET', url, query.requestId);
        };
        this.performSuggestQuery = function (query) {
            var url = '/api/v1/label/__name__/values';
            return this._request('GET', url).then(function (result) {
                return lodash_1.default.filter(result.data.data, function (metricName) {
                    return metricName.indexOf(query) !== 1;
                });
            });
        };
        this.metricFindQuery = function (query) {
            if (!query) {
                return $q.when([]);
            }
            var interpolated;
            try {
                interpolated = templateSrv.replace(query, {}, this.interpolateQueryExpr);
            }
            catch (err) {
                return $q.reject(err);
            }
            var metricFindQuery = new metric_find_query_1.default(this, interpolated, timeSrv);
            return metricFindQuery.process();
        };
        this.annotationQuery = function (options) {
            var annotation = options.annotation;
            var expr = annotation.expr || '';
            var tagKeys = annotation.tagKeys || '';
            var titleFormat = annotation.titleFormat || '';
            var textFormat = annotation.textFormat || '';
            if (!expr) {
                return $q.when([]);
            }
            var interpolated;
            try {
                interpolated = templateSrv.replace(expr, {}, this.interpolateQueryExpr);
            }
            catch (err) {
                return $q.reject(err);
            }
            var step = '60s';
            if (annotation.step) {
                step = templateSrv.replace(annotation.step);
            }
            var start = this.getPrometheusTime(options.range.from, false);
            var end = this.getPrometheusTime(options.range.to, true);
            var query = {
                expr: interpolated,
                step: this.adjustStep(kbn_1.default.interval_to_seconds(step), Math.ceil(end - start)) + 's'
            };
            var self = this;
            return this.performTimeSeriesQuery(query, start, end).then(function (results) {
                var eventList = [];
                tagKeys = tagKeys.split(',');
                lodash_1.default.each(results.data.data.result, function (series) {
                    var tags = lodash_1.default.chain(series.metric)
                        .filter(function (v, k) {
                        return lodash_1.default.includes(tagKeys, k);
                    }).value();
                    lodash_1.default.each(series.values, function (value) {
                        if (value[1] === '1') {
                            var event = {
                                annotation: annotation,
                                time: Math.floor(value[0]) * 1000,
                                title: self.renderTemplate(titleFormat, series.metric),
                                tags: tags,
                                text: self.renderTemplate(textFormat, series.metric)
                            };
                            eventList.push(event);
                        }
                    });
                });
                return eventList;
            });
        };
        this.testDatasource = function () {
            return this.metricFindQuery('metrics(.*)').then(function () {
                return { status: 'success', message: 'Data source is working', title: 'Success' };
            });
        };
        this.calculateInterval = function (interval, intervalFactor) {
            var m = interval.match(durationSplitRegexp);
            var dur = moment_1.default.duration(parseInt(m[1]), m[2]);
            var sec = dur.asSeconds();
            if (sec < 1) {
                sec = 1;
            }
            return Math.ceil(sec * intervalFactor);
        };
        this.transformMetricData = function (md, options, start, end) {
            var dps = [], metricLabel = null;
            metricLabel = this.createMetricLabel(md.metric, options);
            var stepMs = parseInt(options.step) * 1000;
            var baseTimestamp = start * 1000;
            lodash_1.default.each(md.values, function (value) {
                var dp_value = parseFloat(value[1]);
                if (lodash_1.default.isNaN(dp_value)) {
                    dp_value = null;
                }
                var timestamp = value[0] * 1000;
                for (var t = baseTimestamp; t < timestamp; t += stepMs) {
                    dps.push([null, t]);
                }
                baseTimestamp = timestamp + stepMs;
                dps.push([dp_value, timestamp]);
            });
            var endTimestamp = end * 1000;
            for (var t = baseTimestamp; t <= endTimestamp; t += stepMs) {
                dps.push([null, t]);
            }
            return { target: metricLabel, datapoints: dps };
        };
        this.createMetricLabel = function (labelData, options) {
            if (lodash_1.default.isUndefined(options) || lodash_1.default.isEmpty(options.legendFormat)) {
                return this.getOriginalMetricName(labelData);
            }
            return this.renderTemplate(templateSrv.replace(options.legendFormat), labelData) || '{}';
        };
        this.renderTemplate = function (aliasPattern, aliasData) {
            var aliasRegex = /\{\{\s*(.+?)\s*\}\}/g;
            return aliasPattern.replace(aliasRegex, function (match, g1) {
                if (aliasData[g1]) {
                    return aliasData[g1];
                }
                return g1;
            });
        };
        this.getOriginalMetricName = function (labelData) {
            var metricName = labelData.__name__ || '';
            delete labelData.__name__;
            var labelPart = lodash_1.default.map(lodash_1.default.toPairs(labelData), function (label) {
                return label[0] + '="' + label[1] + '"';
            }).join(',');
            return metricName + '{' + labelPart + '}';
        };
        this.getPrometheusTime = function (date, roundUp) {
            if (lodash_1.default.isString(date)) {
                date = dateMath.parse(date, roundUp);
            }
            return Math.ceil(date.valueOf() / 1000);
        };
    }
    exports_1("PrometheusDatasource", PrometheusDatasource);
    var lodash_1, moment_1, kbn_1, dateMath, metric_find_query_1, durationSplitRegexp;
    return {
        setters: [
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            },
            function (moment_1_1) {
                moment_1 = moment_1_1;
            },
            function (kbn_1_1) {
                kbn_1 = kbn_1_1;
            },
            function (dateMath_1) {
                dateMath = dateMath_1;
            },
            function (metric_find_query_1_1) {
                metric_find_query_1 = metric_find_query_1_1;
            }
        ],
        execute: function () {///<reference path="../../../headers/common.d.ts" />
            durationSplitRegexp = /(\d+)(ms|s|m|h|d|w|M|y)/;
        }
    };
});
//# sourceMappingURL=datasource.js.map