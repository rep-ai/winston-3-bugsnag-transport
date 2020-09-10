import { NodeConfig } from '@bugsnag/node';
import { Client } from '@bugsnag/browser';
import Transport from 'winston-transport';
declare type BugsnagConfig = NodeConfig;
declare type TransportConfig = Transport.TransportStreamOptions;
declare type WinstonLogLevel = 'silly' | 'debug' | 'verbose' | 'info' | 'warn' | 'error';
export declare type BugsnagTransportConfig = TransportConfig & {
    bugsnag: BugsnagConfig;
} & {
    level?: WinstonLogLevel;
};
declare const SYM_LEVEL: unique symbol;
declare const SYM_SPLAT: unique symbol;
declare const SYM_MESSAGE: unique symbol;
declare type LoggingInfo = {
    level: WinstonLogLevel;
    message?: string;
    [SYM_LEVEL]?: string;
    [SYM_SPLAT]?: unknown;
    [SYM_MESSAGE]?: unknown;
};
/**
 * Bugsnag transport for Winston v3.
 * See the README file for more instructions.
 *
 * Manual reporting in Bugsnag client:
 * https://docs.bugsnag.com/platforms/javascript/reporting-handled-errors/#sending-errors
 */
export declare class BugsnagTransport extends Transport {
    readonly level?: WinstonLogLevel;
    private readonly client;
    private readonly logLevelToSeverity;
    private readonly logLevelToPriority;
    constructor(opts: BugsnagTransportConfig);
    getBugsnagClient(): Client;
    log(info: LoggingInfo, next: () => void): void;
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
    private shouldLog;
}
export {};
