export interface RiinLoggerOptions {
  enableTimestamp?: boolean;
  lineInfoWrap?: boolean;
  somethingElse?: boolean;
  unwrapReactivity?: boolean;
}

export class RiinLogger {
  originalOption: RiinLoggerOptions;
  option: RiinLoggerOptions;

  constructor();
  config(option?: RiinLoggerOptions): void;

  log(...args: any[]): void;
  info(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;
  debug(...args: any[]): void;
}

declare const logger: RiinLogger;
export default logger;
export { RiinLogger };