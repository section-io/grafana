///<reference path="../../headers/common.d.ts" />
System.register(["lodash", "app/core/components/query_part/query_part"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function createReducerPart(model) {
        var def = new query_part_1.QueryPartDef({ type: model.type, defaultParams: [] });
        return new query_part_1.QueryPart(model, def);
    }
    function getStateDisplayModel(state) {
        switch (state) {
            case 'ok': {
                return {
                    text: 'OK',
                    iconClass: 'icon-gf icon-gf-online',
                    stateClass: 'alert-state-ok'
                };
            }
            case 'alerting': {
                return {
                    text: 'ALERTING',
                    iconClass: 'icon-gf icon-gf-critical',
                    stateClass: 'alert-state-critical'
                };
            }
            case 'no_data': {
                return {
                    text: 'NO DATA',
                    iconClass: "fa fa-question",
                    stateClass: 'alert-state-warning'
                };
            }
            case 'execution_error': {
                return {
                    text: 'EXECUTION ERROR',
                    iconClass: 'icon-gf icon-gf-critical',
                    stateClass: 'alert-state-critical'
                };
            }
            case 'paused': {
                return {
                    text: 'paused',
                    iconClass: "fa fa-pause",
                    stateClass: 'alert-state-paused'
                };
            }
            case 'pending': {
                return {
                    text: 'PENDING',
                    iconClass: "fa fa-exclamation",
                    stateClass: 'alert-state-warning'
                };
            }
        }
    }
    function joinEvalMatches(matches, separator) {
        return lodash_1.default.reduce(matches, function (res, ev) {
            if (ev.metric !== undefined && ev.value !== undefined) {
                res.push(ev.metric + '=' + ev.value);
            }
            // For backwards compatibility . Should be be able to remove this after ~2017-06-01
            if (ev.Metric !== undefined && ev.Value !== undefined) {
                res.push(ev.Metric + '=' + ev.Value);
            }
            return res;
        }, []).join(separator);
    }
    var lodash_1, query_part_1, alertQueryDef, conditionTypes, alertStateSortScore, evalFunctions, evalOperators, reducerTypes, noDataModes, executionErrorModes;
    return {
        setters: [
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            },
            function (query_part_1_1) {
                query_part_1 = query_part_1_1;
            }
        ],
        execute: function () {///<reference path="../../headers/common.d.ts" />
            alertQueryDef = new query_part_1.QueryPartDef({
                type: 'query',
                params: [
                    { name: "queryRefId", type: 'string', dynamicLookup: true },
                    { name: "from", type: "string", options: ['1s', '10s', '1m', '5m', '10m', '15m', '1h', '24h', '48h'] },
                    { name: "to", type: "string", options: ['now'] },
                ],
                defaultParams: ['#A', '15m', 'now', 'avg']
            });
            conditionTypes = [
                { text: 'Query', value: 'query' },
            ];
            alertStateSortScore = {
                alerting: 1,
                no_data: 2,
                pending: 3,
                ok: 4,
                paused: 5,
            };
            evalFunctions = [
                { text: 'IS ABOVE', value: 'gt' },
                { text: 'IS BELOW', value: 'lt' },
                { text: 'IS OUTSIDE RANGE', value: 'outside_range' },
                { text: 'IS WITHIN RANGE', value: 'within_range' },
                { text: 'HAS NO VALUE', value: 'no_value' }
            ];
            evalOperators = [
                { text: 'OR', value: 'or' },
                { text: 'AND', value: 'and' },
            ];
            reducerTypes = [
                { text: 'avg()', value: 'avg' },
                { text: 'min()', value: 'min' },
                { text: 'max()', value: 'max' },
                { text: 'sum()', value: 'sum' },
                { text: 'count()', value: 'count' },
                { text: 'last()', value: 'last' },
                { text: 'median()', value: 'median' },
            ];
            noDataModes = [
                { text: 'Alerting', value: 'alerting' },
                { text: 'No Data', value: 'no_data' },
                { text: 'Keep Last State', value: 'keep_state' },
                { text: 'Ok', value: 'ok' },
            ];
            executionErrorModes = [
                { text: 'Alerting', value: 'alerting' },
                { text: 'Keep Last State', value: 'keep_state' },
            ];
            exports_1("default", {
                alertQueryDef: alertQueryDef,
                getStateDisplayModel: getStateDisplayModel,
                conditionTypes: conditionTypes,
                evalFunctions: evalFunctions,
                evalOperators: evalOperators,
                noDataModes: noDataModes,
                executionErrorModes: executionErrorModes,
                reducerTypes: reducerTypes,
                createReducerPart: createReducerPart,
                joinEvalMatches: joinEvalMatches,
                alertStateSortScore: alertStateSortScore,
            });
        }
    };
});
//# sourceMappingURL=alert_def.js.map