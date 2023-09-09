import {ClickhouseColumnType, IClickhouseColumnMeta} from './ClickhouseType.js';

class ClickhouseColumn {
  constructor(meta: IClickhouseColumnMeta) {
    this.meta_ = meta;
  }

  transform(raw: string) {
    switch(this.meta_.type) {
      case ClickhouseColumnType.UInt8:
      case ClickhouseColumnType.UInt16:
      case ClickhouseColumnType.UInt32:
      case ClickhouseColumnType.UInt64:
      case ClickhouseColumnType.Int8:
      case ClickhouseColumnType.Int16:
      case ClickhouseColumnType.Int32:
      case ClickhouseColumnType.Int64:
        return parseInt(raw, 10);

      case ClickhouseColumnType.Float32:
      case ClickhouseColumnType.Float64:
        return parseFloat(raw);

      case ClickhouseColumnType.Boolean:
        return raw === 'true';

      case ClickhouseColumnType.String:
      case ClickhouseColumnType.UUID:

      case ClickhouseColumnType.Date:
      case ClickhouseColumnType.Date32:
        return raw;

      case ClickhouseColumnType.DateTime:
      case ClickhouseColumnType.DateTime64:
        return new Date(raw);
    }
  }

  get name() {
    return this.meta_.name;
  }

  get type() {
    return this.meta_.type;
  }

  private meta_: IClickhouseColumnMeta;
}

export {ClickhouseColumn};
