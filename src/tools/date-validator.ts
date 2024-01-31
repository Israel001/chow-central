import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import * as DateFNS from 'date-fns';

// Accepts: YYYY-MM-DD
@ValidatorConstraint()
class IsValidDateConstraint implements ValidatorConstraintInterface {
  validate(value: any) {
    if (typeof value !== 'string') return false;
    return DateFNS.isValid(DateFNS.parseISO(value));
  }

  defaultMessage(args?: ValidationArguments): string {
    return `${args.property} must be a valid date in this format: YYYY-MM-DD`;
  }
}

export const IsValidDate = (validationOptions?: ValidationOptions) => {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsValidDateConstraint,
    });
  };
};
