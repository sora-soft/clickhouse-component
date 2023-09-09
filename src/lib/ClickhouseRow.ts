import {ClickhouseColumn} from './ClickhouseColumn.js';

class ClickhouseRow {
  constructor(columns: ClickhouseColumn[]) {
    this.columns_ = columns;
  }

  transform(raw: Record<string, string>) {
    const result: Record<string, unknown> = {};
    for (const column of this.columns_) {
      result[column.name] = column.transform(raw[column.name]);
    }
    return result;
  }

  private columns_: ClickhouseColumn[];
}

export {ClickhouseRow};
