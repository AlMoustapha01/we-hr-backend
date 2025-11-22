import { Injectable, Logger, Inject } from '@nestjs/common';
import { RetireEmployeeFromDepartmentCommand } from './retire-employee-from-department.command';
import { DepartmentRepositoryPort } from '@/app/domain/department.repository.port';
import { EmployeeAssignmentRepositoryPort } from '@/app/domain/employee-assignment.repository.port';
import { Err, Ok, Result } from 'oxide.ts';
import { AggregateID } from '@/libs/domain';
import { DepartmentNotFoundError } from '@/app/domain/department.errors';
import {
  DEPARTMENT_REPOSITORY,
  EMPLOYEE_ASSIGNMENT_REPOSITORY,
} from '@/app/app.di-tokens';

export class AssignmentNotFoundError extends Error {
  constructor() {
    super('No active assignment found for this employee in this department');
    this.name = 'AssignmentNotFoundError';
  }
}

@Injectable()
export class RetireEmployeeFromDepartmentHandler {
  private readonly logger = new Logger(
    RetireEmployeeFromDepartmentHandler.name,
  );

  constructor(
    @Inject(DEPARTMENT_REPOSITORY)
    private readonly departmentRepository: DepartmentRepositoryPort,
    @Inject(EMPLOYEE_ASSIGNMENT_REPOSITORY)
    private readonly assignmentRepository: EmployeeAssignmentRepositoryPort,
  ) {}

  async execute(
    command: RetireEmployeeFromDepartmentCommand,
  ): Promise<Result<AggregateID, Error>> {
    this.logger.log(
      `Retiring employee ${command.employeeId} from department ${command.departmentId}`,
    );

    // Check if department exists
    const departmentOption = await this.departmentRepository.findOneById(
      command.departmentId,
    );
    if (departmentOption.isNone()) {
      return Err(new DepartmentNotFoundError());
    }

    // Find active assignment
    const assignmentOption =
      await this.assignmentRepository.findActiveAssignment(
        command.employeeId,
        command.departmentId,
      );
    if (assignmentOption.isNone()) {
      return Err(new AssignmentNotFoundError());
    }

    const department = departmentOption.unwrap();
    const assignment = assignmentOption.unwrap();

    // Retire employee using domain method
    const updatedAssignment = department.retireEmployee(assignment);

    try {
      // Persist updated assignment to database
      await this.assignmentRepository.transaction(async () =>
        this.assignmentRepository.save(updatedAssignment),
      );

      this.logger.log(
        `Employee ${command.employeeId} retired from department ${command.departmentId} successfully`,
      );

      return Ok(updatedAssignment.id);
    } catch (error: any) {
      this.logger.error(
        `Failed to retire employee from department: ${(error as Error).message}`,
      );
      throw error;
    }
  }
}
