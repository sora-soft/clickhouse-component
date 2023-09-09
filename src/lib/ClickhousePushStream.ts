import Stream from 'stream';
import {ClickhouseError, ClickhouseErrorCode} from './ClickhouseError.js';

export class ClickhousePushStream<T> {
  constructor() {
    this.stream_ = new Stream.Readable({
      objectMode: true,
      read: () => {},
    });
  }

  push(data: T) {
    if (!this.stream_)
      throw new ClickhouseError(ClickhouseErrorCode.ERR_CLICKHOUSE_PUSH_STREAM_CLOSED, 'ERR_CLICKHOUSE_PUSH_STREAM_CLOSED');
    this.stream_.push(data);
  }

  async end() {
    if (this.stream_)
      this.stream_.push(null);
    this.stream_ = null;
    await this.insertPromise_;
  }

  setPromise(promise: Promise<unknown>) {
    this.insertPromise_ = promise;
  }

  get stream() {
    return this.stream_;
  }

  private stream_: Stream.Readable | null;
  private insertPromise_?: Promise<unknown>;
}
