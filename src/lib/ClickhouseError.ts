import {ExError} from '@sora-soft/framework';

export enum ClickhouseErrorCode {
  ERR_COMPONENT_NOT_CONNECTED = 'ERR_COMPONENT_NOT_CONNECTED',
  ERR_CLICKHOUSE_PING_FAILED = 'ERR_CLICKHOUSE_PING_FAILED',
  ERR_CLICKHOUSE_PUSH_STREAM_CLOSED = 'ERR_CLICKHOUSE_PUSH_STREAM_CLOSED',
}

class ClickhouseError extends ExError {
  constructor(code: ClickhouseErrorCode, message: string) {
    super(code, 'ClickhouseError', message);
    Object.setPrototypeOf(this, ClickhouseError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export {ClickhouseError};
