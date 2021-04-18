import { BaseEntity, SaveOptions } from 'typeorm'
import { ValidationError, validate } from 'class-validator'

/**
 * A base class for all Winnie_Bot models containing some
 * common functionality.
 */
export class BaseModel extends BaseEntity {
  /**
   * A list of all validation errors
   */
  errors: ValidationError[] = []

  /**
   * Runs the validations for the model.
   */
  async validate (): Promise<this> {
    this.errors = await validate(this)
    return this
  }

  /**
   * Attempts to save the record first checking that the
   * record is valid.
   *
   * @param options Options for saving the record
   */
  async save (options?: SaveOptions): Promise<this> {
    await this.validate()

    if (this.errors.length <= 0) {
      await super.save(options)
    }

    return this
  }
}
