import { ExceptionBase } from '@/libs/exceptions';

export class DepartmentAlreadyExistsError extends ExceptionBase {
  static readonly message = 'Department already exists';

  public readonly code = 'DEPARTMENT.ALREADY_EXISTS';

  constructor(cause?: Error, metadata?: unknown) {
    super(DepartmentAlreadyExistsError.message, cause, metadata);
  }
}

export class DepartmentNotFoundError extends ExceptionBase {
  static readonly message = 'Department not found';

  public readonly code = 'DEPARTMENT.NOT_FOUND';

  constructor(cause?: Error, metadata?: unknown) {
    super(DepartmentNotFoundError.message, cause, metadata);
  }
}

export class ManagerNotFoundError extends ExceptionBase {
  static readonly message = 'Manager not found';

  public readonly code = 'DEPARTMENT.MANAGER_NOT_FOUND';

  constructor(cause?: Error, metadata?: unknown) {
    super(ManagerNotFoundError.message, cause, metadata);
  }
}

export class EmployeeNotEligibleForManagerError extends ExceptionBase {
  static readonly message =
    'Employee must be at least Senior level to be a manager';

  public readonly code = 'DEPARTMENT.EMPLOYEE_NOT_ELIGIBLE_FOR_MANAGER';

  constructor(cause?: Error, metadata?: unknown) {
    super(EmployeeNotEligibleForManagerError.message, cause, metadata);
  }
}

export class AssignmentNotFoundError extends ExceptionBase {
  static readonly message =
    'No active assignment found for this employee in this department';

  public readonly code = 'DEPARTMENT.ASSIGNMENT_NOT_FOUND';

  constructor(cause?: Error, metadata?: unknown) {
    super(AssignmentNotFoundError.message, cause, metadata);
  }
}
