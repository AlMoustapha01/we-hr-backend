import { Injectable, Logger, Inject } from '@nestjs/common';
import { DeleteEmployeeCommand } from './delete-employee.command';
import { EmployeeRepositoryPort } from '@/app/domain/employee.repository.port';
import { DepartmentRepositoryPort } from '@/app/domain/department.repository.port';
import { Err, Ok, Result } from 'oxide.ts';
import { EmployeeNotFoundError } from '@/app/domain/employee.errors';
import {
  DEPARTMENT_REPOSITORY,
  EMPLOYEE_REPOSITORY,
} from '@/app/app.di-tokens';
import { ConflictException } from '@/libs/exceptions';

export class EmployeeIsManagerError extends Error {
  constructor(public readonly departmentCount: number) {
    super(
      `Cannot delete employee who is managing ${departmentCount} department(s). Please reassign manager first.`,
    );
    this.name = 'EmployeeIsManagerError';
  }
}

@Injectable()
export class DeleteEmployeeHandler {
  private readonly logger = new Logger(DeleteEmployeeHandler.name);

  constructor(
    @Inject(EMPLOYEE_REPOSITORY)
    private readonly employeeRepository: EmployeeRepositoryPort,
    @Inject(DEPARTMENT_REPOSITORY)
    private readonly departmentRepository: DepartmentRepositoryPort,
  ) {}

  async execute(
    command: DeleteEmployeeCommand,
  ): Promise<Result<boolean, Error>> {
    this.logger.log(`Deleting employee: ${command.employeeId}`);

    // Check if employee exists
    const employeeOption = await this.employeeRepository.findOneById(
      command.employeeId,
    );
    if (employeeOption.isNone()) {
      return Err(new EmployeeNotFoundError());
    }

    const employee = employeeOption.unwrap();

    // Check if employee is managing any departments
    const departments = await this.departmentRepository.findByManagerId(
      command.employeeId,
    );

    if (departments.length > 0) {
      return Err(new EmployeeIsManagerError(departments.length));
    }

    try {
      // Delete employee
      await this.employeeRepository.transaction(async () =>
        this.employeeRepository.delete(employee),
      );

      this.logger.log(`Employee deleted successfully: ${employee.id}`);

      return Ok(true);
    } catch (error: any) {
      if (error instanceof ConflictException) {
        return Err(new EmployeeIsManagerError(0));
      }
      this.logger.error(
        `Failed to delete employee: ${(error as Error).message}`,
      );
      throw error;
    }
  }
}
