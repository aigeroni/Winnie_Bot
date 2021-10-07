import { ValueTransformer } from 'typeorm/decorator/options/ValueTransformer'
import { DateTime } from 'luxon'

class DateTimeTransformer implements ValueTransformer {
  from (value: string): DateTime {
    return DateTime.fromISO(value)
  }

  to (value: DateTime): string {
    return value.toISO()
  }
}

class NullableDateTimeTransformer implements ValueTransformer {
  from (value: string): DateTime | null {
    if (value == null) { return null }

    return DateTime.fromISO(value)
  }

  to (value: DateTime): string | null {
    if (value == null) { return null }

    return value.toISO()
  }
}

export {
  DateTimeTransformer,
  NullableDateTimeTransformer
}
