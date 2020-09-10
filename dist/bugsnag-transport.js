"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BugsnagTransport = void 0;
var js_1 = __importDefault(require("@bugsnag/js"));
var winston_transport_1 = __importDefault(require("winston-transport"));
var lodash_1 = __importDefault(require("lodash"));
var SYM_LEVEL = Symbol.for('level');
var SYM_SPLAT = Symbol.for('splat');
var SYM_MESSAGE = Symbol.for('message');
/**
 * Bugsnag transport for Winston v3.
 * See the README file for more instructions.
 *
 * Manual reporting in Bugsnag client:
 * https://docs.bugsnag.com/platforms/javascript/reporting-handled-errors/#sending-errors
 */
var BugsnagTransport = /** @class */ (function (_super) {
    __extends(BugsnagTransport, _super);
    function BugsnagTransport(opts) {
        var _this = _super.call(this, opts) || this;
        _this.logLevelToSeverity = new Map([
            ['error', 'error'],
            ['warn', 'warning'],
            ['info', 'info'],
        ]);
        _this.logLevelToPriority = new Map([
            ['error', 0],
            ['warn', 1],
            ['info', 2],
            ['verbose', 3],
            ['debug', 4],
            ['silly', 5],
        ]);
        _this.client = js_1.default.start(opts.bugsnag);
        return _this;
    }
    BugsnagTransport.prototype.getBugsnagClient = function () {
        return this.client;
    };
    BugsnagTransport.prototype.log = function (info, next) {
        var _this = this;
        setImmediate(function () {
            _this.emit('logged', info);
        });
        var level = info.level, meta = __rest(info, ["level"]);
        if (this.silent || !this.shouldLog(level)) {
            return next();
        }
        var notifyOptions = {
            severity: this.logLevelToSeverity.get(level),
        };
        /* Filter our properties we don't want in Bugsnag
        see: https://github.com/winstonjs/winston#streams-objectmode-and-info-objects */
        notifyOptions.metaData = lodash_1.default.omit(meta, 'message', SYM_LEVEL, SYM_SPLAT, SYM_MESSAGE);
        // The logger has been used with an Error as a single param
        if (lodash_1.default.isError(info)) {
            /* Instances of Error are the favorite food of Bugsnag client, give it "as is"
            see: https://docs.bugsnag.com/platforms/javascript/reporting-handled-errors/#sending-errors */
            this.client.notify(info, function (event) {
                event.addMetadata('meta', notifyOptions.metaData);
                if (info.message) {
                    event.addMetadata('error', 'message', info.message);
                }
                event.severity = notifyOptions.severity;
            });
            return next();
        }
        this.client.notify(Error(info.message), function (event) {
            event.addMetadata('meta', notifyOptions.metaData);
            if (info.message) {
                event.addMetadata('error', 'message', info.message);
            }
            event.severity = notifyOptions.severity;
        });
        return next();
    };
    /**
     * Determine whether the Transport should pass the log to Bugsnag.
     * Will pass the log if:
     * - There is no logging level defined at the Transport level (this instance)
     * - If the given `level` has a priority <= than the Transport's one
     * - If the priority of one of the two levels is undefined (shouldn't happen...)
     *
     * e.g. if `level` is set to `'error'` (0, the biggest priority (in descending order))
     * and the level of the Transport is set to `'warn'`, then the log can pass, as `0 < 1`.
     *
     * @param level Candidate logging level, compared with the level of the Transport
     *
     * @return `true` if the log should be sent to Bugsnag.
     */
    BugsnagTransport.prototype.shouldLog = function (level) {
        if (!this.level) {
            return true;
        }
        var transportLevelPriority = this.logLevelToPriority.get(this.level);
        var logLevelPriority = this.logLevelToPriority.get(level);
        if (transportLevelPriority === undefined || logLevelPriority === undefined) {
            return true;
        }
        return logLevelPriority <= transportLevelPriority;
    };
    return BugsnagTransport;
}(winston_transport_1.default));
exports.BugsnagTransport = BugsnagTransport;
//# sourceMappingURL=bugsnag-transport.js.map