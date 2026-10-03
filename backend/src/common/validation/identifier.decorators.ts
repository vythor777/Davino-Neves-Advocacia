import { registerDecorator, type ValidationOptions } from 'class-validator';
import { isValidCpfCnpj, isValidCnj } from './identifiers.js';
function identifier(name: string, validate: (value: string) => boolean, options?: ValidationOptions) {
  return (object: object, propertyName: string) => registerDecorator({ name, target: object.constructor, propertyName, options,
    validator: { validate: (value: unknown) => typeof value === 'string' && validate(value) } });
}
export const IsCpfCnpj = (options?: ValidationOptions) => identifier('isCpfCnpj', isValidCpfCnpj, options);
export const IsCnj = (options?: ValidationOptions) => identifier('isCnj', isValidCnj, options);
