import {Component, FrameworkError, FrameworkErrorCode, IComponentOptions} from '@sora-soft/framework';
import {AssertType} from '@sora-soft/type-guard';
import {ClickHouseClient, ClickHouseClientConfigOptions, createClient} from '@clickhouse/client';
import {ClickhouseError, ClickhouseErrorCode} from './ClickhouseError.js';
import {IClickhouseSelectResponse} from './ClickhouseType.js';
import {ClickhouseColumn} from './ClickhouseColumn.js';
import {ClickhouseRow} from './ClickhouseRow.js';
import {readFile} from 'fs/promises';
import {ClickhousePushStream} from './ClickhousePushStream.js';

const pkg = JSON.parse(
  await readFile(new URL('../../package.json', import.meta.url), {encoding: 'utf-8'})
) as {version: string};

export interface IClickhouseComponentOptions extends IComponentOptions, Omit<ClickHouseClientConfigOptions<unknown>, 'impl'> {}

class ClickhouseComponent extends Component {
  constructor() {
    super();
    this.connected_ = false;
    this.pushStreams_ = new Set();
  }

  protected setOptions(@AssertType() options: IClickhouseComponentOptions) {
    this.databaseOptions_ = options;
  }

  protected async connect() {
    if (this.connected_) return;

    if (!this.databaseOptions_)
      throw new FrameworkError(FrameworkErrorCode.ERR_COMPONENT_OPTIONS_NOT_SET, 'ERR_COMPONENT_OPTIONS_NOT_SET');

    this.client_ = createClient({
      ...this.databaseOptions_,
    });

    const result = await this.client_.ping();
    if (!result.success)
      throw new ClickhouseError(ClickhouseErrorCode.ERR_CLICKHOUSE_PING_FAILED, 'ERR_CLICKHOUSE_PING_FAILED');
    this.connected_ = true;
  }

  protected async disconnect() {
    if (!this.connected_) return;

    for (const stream of [...this.pushStreams_]) {
      await stream.end();
    }

    if (this.client_) {
      await this.client_.close();
    }
    this.client_ = undefined;
    this.connected_ = false;
  }

  async select<T>(sql: string, params: Record<string, unknown>) {
    if (!this.client_) {
      throw new ClickhouseError(ClickhouseErrorCode.ERR_COMPONENT_NOT_CONNECTED, 'ERR_COMPONENT_NOT_CONNECTED');
    }
    const result = await this.client_.query({
      format: 'JSON',
      query: sql,
      query_params: params,
    });

    const jsonResult: IClickhouseSelectResponse = await result.json();
    return this.convertSelectResult<T>(jsonResult);
  }

  async createPushStream(tableName: string) {
    if (!this.client_) {
      throw new ClickhouseError(ClickhouseErrorCode.ERR_COMPONENT_NOT_CONNECTED, 'ERR_COMPONENT_NOT_CONNECTED');
    }
    const stream = new ClickhousePushStream();
    this.pushStreams_.add(stream);
    stream.setPromise(this.client_.insert({
      table: tableName,
      values: stream.stream,
      format: 'JSONEachRow',
    }).finally(() => {
      this.pushStreams_.delete(stream);
    }));
    return stream;
  }

  get version() {
    return pkg.version;
  }

  protected convertSelectResult<T>(result: IClickhouseSelectResponse): T[] {
    const columns: ClickhouseColumn[] = [];
    for (const meta of result.meta) {
      const column = new ClickhouseColumn(meta);
      columns.push(column);
    }

    return result.data.map((line) => {
      const row = new ClickhouseRow(columns);
      return row.transform(line) as T;
    });
  }

  private databaseOptions_?: IClickhouseComponentOptions;
  private client_?: ClickHouseClient;
  private connected_: boolean;
  private pushStreams_: Set<ClickhousePushStream<unknown>>;
}

export {ClickhouseComponent};
