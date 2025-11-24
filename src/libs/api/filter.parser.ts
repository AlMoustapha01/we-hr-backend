import { Operator } from '@/libs/domain/repository.port';

/**
 * Strapi-like filter operators mapping
 * Maps Strapi operators ($eq, $ne, etc.) to internal Operator enum
 */
export const OPERATOR_MAP: Record<string, Operator> = {
  $eq: Operator.EQUALS,
  $ne: Operator.NOT_EQUALS,
  $in: Operator.IN,
  $notIn: Operator.NOT_IN,
  $lt: Operator.LESS_THAN,
  $lte: Operator.LESS_THAN_OR_EQUAL,
  $gt: Operator.GREATER_THAN,
  $gte: Operator.GREATER_THAN_OR_EQUAL,
  $contains: Operator.CONTAINS,
  $notContains: Operator.NOT_CONTAINS,
  $startsWith: Operator.STARTS_WITH,
  $endsWith: Operator.ENDS_WITH,
  $null: Operator.NULL,
  $notNull: Operator.NOT_NULL,
  $between: Operator.BETWEEN,
};

export interface FilterObject {
  [field: string]:
    | {
        [operator: string]: unknown;
      }
    | string
    | number
    | boolean
    | null
    | unknown[];
}

export interface ParsedFilter {
  field: string;
  operator: Operator;
  value: unknown;
}

/**
 * Parses filters into internal filter format
 * @param filters - filters object
 * @returns Array of parsed filters
 *
 * @example
 * // Input:
 * {
 *   username: { $eq: 'John' },
 *   age: { $gte: 18 },
 *   status: { $in: ['ACTIVE', 'PENDING'] }
 * }
 *
 * // Output:
 * [
 *   { field: 'username', operator: Operator.EQUALS, value: 'John' },
 *   { field: 'age', operator: Operator.GREATER_THAN_OR_EQUAL, value: 18 },
 *   { field: 'status', operator: Operator.IN, value: ['ACTIVE', 'PENDING'] }
 * ]
 */
export function parseFilters(filters: FilterObject): ParsedFilter[] {
  const parsedFilters: ParsedFilter[] = [];

  if (!filters || typeof filters !== 'object') {
    return parsedFilters;
  }

  for (const [field, filterValue] of Object.entries(filters)) {
    // Skip if filterValue is null or undefined
    if (filterValue === null || filterValue === undefined) {
      continue;
    }

    // If filterValue is an object with operators
    if (typeof filterValue === 'object' && !Array.isArray(filterValue)) {
      for (const [operatorKey, value] of Object.entries(filterValue)) {
        const operator = OPERATOR_MAP[operatorKey];

        if (!operator) {
          // If no operator found, treat as $eq
          parsedFilters.push({
            field,
            operator: Operator.EQUALS,
            value: filterValue,
          });
          break;
        }

        parsedFilters.push({
          field,
          operator,
          value,
        });
      }
    } else {
      // Direct value without operator means $eq
      parsedFilters.push({
        field,
        operator: Operator.EQUALS,
        value: filterValue,
      });
    }
  }

  return parsedFilters;
}

/**
 * Validates if a filter operator is valid
 * @param operator - Operator string to validate
 * @returns true if valid, false otherwise
 */
export function isValidOperator(operator: string): boolean {
  return operator in OPERATOR_MAP;
}
