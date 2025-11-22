import { Injectable } from '@nestjs/common';
import { EmployeeEntity, EmployeePosition, EmployeeStatus } from './employee';
import { EmployeeNotEligibleForManagerError } from './department.errors';

@Injectable()
export class DepartmentDomainService {
  /**
   * Validates if an employee is eligible to be a department manager
   * @param employee - The employee to validate
   * @throws EmployeeNotEligibleForManagerError if employee is not eligible
   */
  validateManagerEligibility(employee: EmployeeEntity): void {
    const employeeProps = employee.getProps();

    // Check if employee has minimum Senior level position
    const eligiblePositions = [
      EmployeePosition.MANAGER,
      EmployeePosition.SENIOR,
    ];

    if (!eligiblePositions.includes(employeeProps.position)) {
      throw new EmployeeNotEligibleForManagerError(
        undefined,
        `Employee must be at least Senior level to be a manager. Current position: ${employeeProps.position}`,
      );
    }

    // Check if employee is active
    if (employeeProps.status !== EmployeeStatus.ACTIVE) {
      throw new EmployeeNotEligibleForManagerError(
        undefined,
        `Employee must be active to be assigned as manager. Current status: ${employeeProps.status}`,
      );
    }
  }

  /**
   * Checks if an employee can be a manager (returns boolean instead of throwing)
   * @param employee - The employee to check
   * @returns true if employee is eligible, false otherwise
   */
  canBeManager(employee: EmployeeEntity): boolean {
    const employeeProps = employee.getProps();

    const eligiblePositions = [
      EmployeePosition.MANAGER,
      EmployeePosition.SENIOR,
    ];

    return (
      eligiblePositions.includes(employeeProps.position) &&
      employeeProps.status === EmployeeStatus.ACTIVE
    );
  }
}
