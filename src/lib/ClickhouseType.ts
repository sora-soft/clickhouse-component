import {ClickHouseClient} from '@clickhouse/client';

export enum ClickhouseColumnType {
  UInt8 = 'UInt8',
  UInt16 = 'UInt16',
  UInt32 = 'UInt32',
  UInt64 = 'UInt64',
  Int8 = 'Int8',
  Int16 = 'Int16',
  Int32 = 'Int32',
  Int64 = 'Int64',
  Float32 = 'Float32',
  Float64 = 'Float64',
  // eslint-disable-next-line id-denylist
  Boolean = 'Boolean',
  // eslint-disable-next-line id-denylist
  String = 'String',
  UUID = 'UUID',
  Date = 'Date',
  Date32 = 'Date32',
  DateTime = 'DateTime',
  DateTime64 = 'DateTime64',
}

export interface IClickhouseColumnMeta {
  name: string;
  type: ClickhouseColumnType;
}

export interface IClickhouseSelectResponse {
  meta: IClickhouseColumnMeta[];
  data: Record<string, string>[];
  rows: number;
  statistics: {elapsed: number; rows_read: number; bytes_read: number};
}

export interface IClickhouseMigration {
  up(client: ClickHouseClient): Promise<void>;
  down(client: ClickHouseClient): Promise<void>;
}
