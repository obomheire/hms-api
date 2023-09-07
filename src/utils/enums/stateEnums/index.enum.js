"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.StateEnum = void 0;
var states_enum_1 = require("./cameroon/states.enum");
var states_enum_2 = require("./ghana/states.enum");
var state_enum_1 = require("./niger/state.enum");
var states_enum_3 = require("./nigeria/states.enum");
var states_enum_4 = require("./togo/states.enum");
var state_enum_2 = require("./benin/state.enum");
exports.StateEnum = __assign(__assign(__assign(__assign(__assign(__assign({}, states_enum_3.NigerianStatesEnum), states_enum_1.CameroonStatesEnum), states_enum_4.TogoStatesEnum), states_enum_2.GhanaStatesEnum), state_enum_2.BeninStatesEnum), state_enum_1.NigerStatesEnum);
