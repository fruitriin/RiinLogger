import { InspectOptions } from 'util';

export interface RiinLoggerOptions {
  format?: 'short' | 'long' | string;
  enableTimestamp?: boolean;
  lineInfoWrap?: boolean;
  somethingElse?: boolean;
  unwrapReactivity?: boolean;
  inspect?: InspectOptions;
}

export class RiinLogger {
  originalOption: RiinLoggerOptions;
  option: RiinLoggerOptions;
  original: typeof console;
  long?: RiinLogger;

  constructor();
  config(option?: RiinLoggerOptions): void;

  log(...args: any[]): void;
  info(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;
  debug(...args: any[]): void;
}

declare const logger: RiinLogger & {
  long: RiinLogger;
};

export default logger;
export { RiinLogger };