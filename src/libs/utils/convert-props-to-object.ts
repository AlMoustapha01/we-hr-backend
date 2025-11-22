import { BaseEntity } from '../domain/entity.base';
import { ValueObject } from '../domain/value-object.base';

function isEntity(obj: unknown): obj is BaseEntity<unknown> {
  /**
   * 'instanceof BaseEntity' causes error here for some reason.
   * Probably creates some circular dependency. This is a workaround
   * until I find a solution :)
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return (
    Object.prototype.hasOwnProperty.call(obj, 'toObject') &&
    Object.prototype.hasOwnProperty.call(obj, 'id') &&
    ValueObject.isValueObject((obj as BaseEntity<unknown>).id)
  );
}

function convertToPlainObject(item: any): any {
  if (ValueObject.isValueObject(item)) {
    return item.unpack();
  }
  if (isEntity(item)) {
    return item.toObject();
  }
  return item;
}

/**
 * Converts Entity/Value Objects props to a plain object.
 * Useful for testing and debugging.
 * @param props
 */
export function convertPropsToObject(props: any): any {
  const propsCopy = structuredClone(props);

  for (const prop in propsCopy) {
    if (!Object.prototype.hasOwnProperty.call(propsCopy, prop)) continue;

    if (Array.isArray(propsCopy[prop])) {
      propsCopy[prop] = (propsCopy[prop] as Array<unknown>).map((item) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return convertToPlainObject(item);
      });
    }
    propsCopy[prop] = convertToPlainObject(propsCopy[prop]);
  }

  return propsCopy;
}
