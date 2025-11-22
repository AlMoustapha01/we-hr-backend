import {
  ARGUMENT_INVALID,
  ARGUMENT_NOT_PROVIDED,
  ARGUMENT_OUT_OF_RANGE,
  BAD_REQUEST,
  CONFLICT,
  FORBIDDEN,
  GATEWAY_TIMEOUT,
  INTERNAL_SERVER_ERROR,
  LOCKED,
  NETWORK_AUTHENTICATION_REQUIRED,
  NOT_ACCEPTABLE,
  NOT_EXTENDED,
  NOT_FOUND,
  NOT_IMPLEMENTED,
  NOT_MODIFIED,
  NOT_SUPPORTED,
  PAYLOAD_TOO_LARGE,
  PRECONDITION_FAILED,
  PROXY_AUTHENTICATION_REQUIRED,
  RANGE_NOT_SATISFIABLE,
  REQUEST_HEADER_FIELDS_TOO_LARGE,
  REQUEST_TIMEOUT,
  SERVICE_UNAVAILABLE,
  TOO_MANY_REQUESTS,
  UNAUTHORIZED,
  UNSUPPORTED_MEDIA_TYPE,
  USE_PROXY,
} from './exceptions.codes';
import { ExceptionBase } from './exceptions.base';

/**
 * Used to indicate that an incorrect argument was provided to a method/function/class constructor
 *
 * @class ArgumentInvalidException
 * @extends {ExceptionBase}
 */
export class ArgumentInvalidException extends ExceptionBase {
  readonly code = ARGUMENT_INVALID;
}

/**
 * Used to indicate that an argument was not provided (is empty object/array, null of undefined).
 *
 * @class ArgumentNotProvidedException
 * @extends {ExceptionBase}
 */
export class ArgumentNotProvidedException extends ExceptionBase {
  readonly code = ARGUMENT_NOT_PROVIDED;
}

/**
 * Used to indicate that an argument is out of allowed range
 * (for example: incorrect string/array length, number not in allowed min/max range etc)
 *
 * @class ArgumentOutOfRangeException
 * @extends {ExceptionBase}
 */
export class ArgumentOutOfRangeException extends ExceptionBase {
  readonly code = ARGUMENT_OUT_OF_RANGE;
}

/**
 * Used to indicate conflicting entities (usually in the database)
 *
 * @class ConflictException
 * @extends {ExceptionBase}
 */
export class ConflictException extends ExceptionBase {
  readonly code = CONFLICT;
}
/**
 * Used to indicate that entity is not found
 *
 * @class NotFoundException
 * @extends {ExceptionBase}
 */
export class NotFoundException extends ExceptionBase {
  static readonly message = 'Not found';

  constructor(message: string, cause?: Error, metadata?: unknown) {
    super(message, cause, metadata);
  }

  readonly code = NOT_FOUND;
}

/**
 * Used to indicate an internal server error that does not fall under all other errors
 *
 * @class InternalServerErrorException
 * @extends {ExceptionBase}
 */
export class InternalServerErrorException extends ExceptionBase {
  readonly code = INTERNAL_SERVER_ERROR;
}

/**
 * Used when a service is temporarily unavailable
 * (e.g., server overload or down for maintenance)
 *
 * @class ServiceUnavailableException
 * @extends {ExceptionBase}
 */
export class ServiceUnavailableException extends ExceptionBase {
  readonly code = SERVICE_UNAVAILABLE;
}

/**
 * Used when the server cannot process the request due to client error
 * (e.g., malformed request syntax, invalid request parameters)
 *
 * @class BadRequestException
 * @extends {ExceptionBase}
 */
export class BadRequestException extends ExceptionBase {
  readonly code = BAD_REQUEST;
}

/**
 * Used when authentication is required but has not been provided
 * or the provided authentication is invalid
 *
 * @class UnauthorizedException
 * @extends {ExceptionBase}
 */
export class UnauthorizedException extends ExceptionBase {
  readonly code = UNAUTHORIZED;
}

/**
 * Used when the server understood the request but refuses to authorize it
 * (e.g., user doesn't have necessary permissions for a resource)
 *
 * @class ForbiddenException
 * @extends {ExceptionBase}
 */
export class ForbiddenException extends ExceptionBase {
  readonly code = FORBIDDEN;
}

/**
 * Used when the server does not support the functionality required to fulfill the request
 * (e.g., an API endpoint that is planned but not yet implemented)
 *
 * @class NotImplementedException
 * @extends {ExceptionBase}
 */
export class NotImplementedException extends ExceptionBase {
  readonly code = NOT_IMPLEMENTED;
}

/**
 * Used when the server, while acting as a gateway or proxy, did not receive a timely response
 * from an upstream server it needed to access in order to complete the request
 *
 * @class GatewayTimeoutException
 * @extends {ExceptionBase}
 */
export class GatewayTimeoutException extends ExceptionBase {
  readonly code = GATEWAY_TIMEOUT;
}

/**
 * Used when the request entity is larger than limits defined by server
 * (e.g., when uploading a file that exceeds the maximum allowed size)
 *
 * @class PayloadTooLargeException
 * @extends {ExceptionBase}
 */
export class PayloadTooLargeException extends ExceptionBase {
  readonly code = PAYLOAD_TOO_LARGE;
}

/**
 * Used when the request entity has a media type which the server or resource does not support
 * (e.g., when a client uploads an image in an unsupported format)
 *
 * @class UnsupportedMediaTypeException
 * @extends {ExceptionBase}
 */
export class UnsupportedMediaTypeException extends ExceptionBase {
  readonly code = UNSUPPORTED_MEDIA_TYPE;
}

/**
 * Used when a user has sent too many requests in a given amount of time ("rate limiting")
 * (e.g., when a client is making too many API calls in a short period)
 *
 * @class TooManyRequestsException
 * @extends {ExceptionBase}
 */
export class TooManyRequestsException extends ExceptionBase {
  readonly code = TOO_MANY_REQUESTS;
}

/**
 * Used when the resource that is being accessed is locked
 * (e.g., when trying to modify a file that is currently being edited by another user)
 *
 * @class LockedException
 * @extends {ExceptionBase}
 */
export class LockedException extends ExceptionBase {
  readonly code = LOCKED;
}

/**
 * Used when further extensions to the request are required for the server to fulfill it
 * (e.g., when additional processing is needed before the server can handle the request)
 *
 * @class NotExtendedException
 * @extends {ExceptionBase}
 */
export class NotExtendedException extends ExceptionBase {
  readonly code = NOT_EXTENDED;
}

/**
 * Used when the client needs to authenticate to gain network access
 * (e.g., when a user must authenticate with a captive portal before accessing the internet)
 *
 * @class NetworkAuthenticationRequiredException
 * @extends {ExceptionBase}
 */
export class NetworkAuthenticationRequiredException extends ExceptionBase {
  readonly code = NETWORK_AUTHENTICATION_REQUIRED;
}

/**
 * Used when the server cannot produce a response matching the list of acceptable values
 * defined in the request's headers (e.g., when a client requests a specific media type that the server cannot provide)
 *
 * @class NotAcceptableException
 * @extends {ExceptionBase}
 */
export class NotAcceptableException extends ExceptionBase {
  readonly code = NOT_ACCEPTABLE;
}

/**
 * Used when the resource has not been modified since the version specified by the request headers
 * (e.g., when a client makes a conditional GET request with If-Modified-Since header)
 *
 * @class NotModifiedException
 * @extends {ExceptionBase}
 */
export class NotModifiedException extends ExceptionBase {
  readonly code = NOT_MODIFIED;
}

/**
 * Used when the requested operation or resource is not supported by the server
 * (e.g., when a client attempts to use a feature that is not available in the current version)
 *
 * @class NotSupportedException
 * @extends {ExceptionBase}
 */
export class NotSupportedException extends ExceptionBase {
  readonly code = NOT_SUPPORTED;
}

/**
 * Used when a precondition given in the request header evaluated to false on the server
 * (e.g., when using If-Unmodified-Since header and the resource has been modified)
 *
 * @class PreconditionFailedException
 * @extends {ExceptionBase}
 */
export class PreconditionFailedException extends ExceptionBase {
  readonly code = PRECONDITION_FAILED;
}

/**
 * Used when the client must first authenticate itself with the proxy
 * (e.g., when accessing a resource through a proxy that requires authentication)
 *
 * @class ProxyAuthenticationRequiredException
 * @extends {ExceptionBase}
 */
export class ProxyAuthenticationRequiredException extends ExceptionBase {
  readonly code = PROXY_AUTHENTICATION_REQUIRED;
}

/**
 * Used when the server cannot serve the requested ranges
 * (e.g., when a client requests a range of bytes that is outside the size of the resource)
 *
 * @class RangeNotSatisfiableException
 * @extends {ExceptionBase}
 */
export class RangeNotSatisfiableException extends ExceptionBase {
  readonly code = RANGE_NOT_SATISFIABLE;
}

/**
 * Used when the server refuses to process the request because the header fields are too large
 * (e.g., when a client sends headers that exceed the server's configured limit)
 *
 * @class RequestHeaderFieldsTooLargeException
 * @extends {ExceptionBase}
 */
export class RequestHeaderFieldsTooLargeException extends ExceptionBase {
  readonly code = REQUEST_HEADER_FIELDS_TOO_LARGE;
}

/**
 * Used when the server timed out waiting for the request
 * (e.g., when a client takes too long to send the complete request)
 *
 * @class RequestTimeoutException
 * @extends {ExceptionBase}
 */
export class RequestTimeoutException extends ExceptionBase {
  readonly code = REQUEST_TIMEOUT;
}

/**
 * Used when the requested resource is only available through a proxy
 * (e.g., when a resource can only be accessed via a specific proxy server)
 *
 * @class UseProxyException
 * @extends {ExceptionBase}
 */
export class UseProxyException extends ExceptionBase {
  readonly code = USE_PROXY;
}
