/**
 * Adding a `code` string with a custom status code for every
 * exception is a good practice, since when that exception
 * is transferred to another process `instanceof` check
 * cannot be performed anymore so a `code` string is used instead.
 * code constants can be stored in a separate file so they
 * can be shared and reused on a receiving side (code sharing is
 * useful when developing fullstack apps or microservices)
 */
export const ARGUMENT_INVALID = 'GENERIC.ARGUMENT_INVALID';
export const ARGUMENT_OUT_OF_RANGE = 'GENERIC.ARGUMENT_OUT_OF_RANGE';
export const ARGUMENT_NOT_PROVIDED = 'GENERIC.ARGUMENT_NOT_PROVIDED';
export const NOT_FOUND = 'GENERIC.NOT_FOUND';
export const CONFLICT = 'GENERIC.CONFLICT';
export const INTERNAL_SERVER_ERROR = 'GENERIC.INTERNAL_SERVER_ERROR';
export const SERVICE_UNAVAILABLE = 'GENERIC.SERVICE_UNAVAILABLE';
export const BAD_REQUEST = 'GENERIC.BAD_REQUEST';
export const UNAUTHORIZED = 'GENERIC.UNAUTHORIZED';
export const FORBIDDEN = 'GENERIC.FORBIDDEN';
export const NOT_IMPLEMENTED = 'GENERIC.NOT_IMPLEMENTED';
export const GATEWAY_TIMEOUT = 'GENERIC.GATEWAY_TIMEOUT';
export const PAYLOAD_TOO_LARGE = 'GENERIC.PAYLOAD_TOO_LARGE';
export const UNSUPPORTED_MEDIA_TYPE = 'GENERIC.UNSUPPORTED_MEDIA_TYPE';
export const TOO_MANY_REQUESTS = 'GENERIC.TOO_MANY_REQUESTS';
export const LOCKED = 'GENERIC.LOCKED';
export const NOT_EXTENDED = 'GENERIC.NOT_EXTENDED';
export const NETWORK_AUTHENTICATION_REQUIRED =
  'GENERIC.NETWORK_AUTHENTICATION_REQUIRED';
export const NOT_ACCEPTABLE = 'GENERIC.NOT_ACCEPTABLE';
export const NOT_MODIFIED = 'GENERIC.NOT_MODIFIED';
export const NOT_SUPPORTED = 'GENERIC.NOT_SUPPORTED';
export const PAYMENT_REQUIRED = 'GENERIC.PAYMENT_REQUIRED';
export const PRECONDITION_FAILED = 'GENERIC.PRECONDITION_FAILED';
export const PROXY_AUTHENTICATION_REQUIRED =
  'GENERIC.PROXY_AUTHENTICATION_REQUIRED';
export const RANGE_NOT_SATISFIABLE = 'GENERIC.RANGE_NOT_SATISFIABLE';
export const REQUEST_HEADER_FIELDS_TOO_LARGE =
  'GENERIC.REQUEST_HEADER_FIELDS_TOO_LARGE';
export const REQUEST_TIMEOUT = 'GENERIC.REQUEST_TIMEOUT';
export const USE_PROXY = 'GENERIC.USE_PROXY';
