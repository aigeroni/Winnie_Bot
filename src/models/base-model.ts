import { BaseEntity, SaveOptions } from 'typeorm'
import { ValidationError, validate } from 'class-validator'

export class BaseModel extends BaseEntity {
  errors: Array<ValidationError> = []

  async validate(): Promise<this> {
    this.errors = await validate(this)
    return this
  }

  async save(options?: SaveOptions): Promise<this> {
    await this.validate()

    if (this.errors.length <= 0) {
      await super.save(options)
    }

    return this
  }
}
