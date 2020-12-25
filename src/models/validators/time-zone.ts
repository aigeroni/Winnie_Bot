import { IANAZone } from 'luxon'
import { ValidationOptions, registerDecorator } from 'class-validator'

/**
 * class-validator validator for validating whether a timezone is legitimate
 *
 * @param validationOptions Options to pass into the validator.
 */
export function IsTimeZone(validationOptions?: ValidationOptions) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (object: Object, propertyName: string): void {
    registerDecorator({
      name: 'IsTimeZone',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(timeZone: IANAZone): boolean {
          return timeZone.isValid
        },
      },
    })
  }
}
