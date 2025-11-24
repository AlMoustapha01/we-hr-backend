import { ExceptionBase } from '@/libs/exceptions';

export class EmployeeAlreadyExistsError extends ExceptionBase {
  static readonly message = 'Employee already exists';

  public readonly code = 'EMPLOYEE.ALREADY_EXISTS';

  constructor(cause?: Error, metadata?: unknown) {
    super(EmployeeAlreadyExistsError.message, cause, metadata);
  }
}

export class EmployeeNotFoundError extends ExceptionBase {
  static readonly message = 'Employee not found';

  public readonly code = 'EMPLOYEE.NOT_FOUND';

  constructor(cause?: Error, metadata?: unknown) {
    super(EmployeeNotFoundError.message, cause, metadata);
  }
}

export class EmployeeDepartmentNotFoundError extends ExceptionBase {
  static readonly message = 'Department not found';

  public readonly code = 'EMPLOYEE.DEPARTMENT_NOT_FOUND';

  constructor(cause?: Error, metadata?: unknown) {
    super(EmployeeDepartmentNotFoundError.message, cause, metadata);
  }
}

export class EmployeeAlreadyAssignedError extends ExceptionBase {
  static readonly message = 'Employee is already assigned to this department';

  public readonly code = 'EMPLOYEE.ALREADY_ASSIGNED';

  constructor(cause?: Error, metadata?: unknown) {
    super(EmployeeAlreadyAssignedError.message, cause, metadata);
  }
}
