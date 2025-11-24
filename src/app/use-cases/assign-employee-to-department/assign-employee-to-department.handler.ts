import { Injectable, Logger, Inject } from '@nestjs/common';
import { AssignEmployeeToDepartmentCommand } from './assign-employee-to-department.command';
import { DepartmentRepositoryPort } from '@/app/domain/department.repository.port';
import { EmployeeRepositoryPort } from '@/app/domain/employee.repository.port';
import { EmployeeAssignmentRepositoryPort } from '@/app/domain/employee-assignment.repository.port';
import { Err, Ok, Result } from 'oxide.ts';
import { AggregateID } from '@/libs/domain';
import { DepartmentNotFoundError } from '@/app/domain/department.errors';
import {
  EmployeeNotFoundError,
  EmployeeAlreadyAssignedError,
} from '@/app/domain/employee.errors';
import {
  DEPARTMENT_REPOSITORY,
  EMPLOYEE_REPOSITORY,
  EMPLOYEE_ASSIGNMENT_REPOSITORY,
} from '@/app/app.di-tokens';

@Injectable()
export class AssignEmployeeToDepartmentHandler {
  private readonly logger = new Logger(AssignEmployeeToDepartmentHandler.name);

  constructor(
    @Inject(DEPARTMENT_REPOSITORY)
    private readonly departmentRepository: DepartmentRepositoryPort,
    @Inject(EMPLOYEE_REPOSITORY)
    private readonly employeeRepository: EmployeeRepositoryPort,
    @Inject(EMPLOYEE_ASSIGNMENT_REPOSITORY)
    private readonly assignmentRepository: EmployeeAssignmentRepositoryPort,
  ) {}

  async execute(
    command: AssignEmployeeToDepartmentCommand,
  ): Promise<Result<AggregateID, Error>> {
    this.logger.log(
      `Assigning employee ${command.employeeId} to department ${command.departmentId}`,
    );

    // Check if department exists
    const departmentOption = await this.departmentRepository.findOneById(
      command.departmentId,
    );
    if (departmentOption.isNone()) {
      return Err(new DepartmentNotFoundError());
    }

    // Check if employee exists
    const employeeOption = await this.employeeRepository.findOneById(
      command.employeeId,
    );
    if (employeeOption.isNone()) {
      return Err(new EmployeeNotFoundError());
    }

    // Check if employee is already assigned to this department
    const existingAssignment =
      await this.assignmentRepository.findActiveAssignment(
        command.employeeId,
        command.departmentId,
      );
    if (existingAssignment.isSome()) {
      return Err(new EmployeeAlreadyAssignedError());
    }

    const department = departmentOption.unwrap();

    // Create assignment using domain method
    const assignment = department.addEmployee(
      command.employeeId,
      command.notes,
    );

    try {
      // Persist assignment to database
      await this.assignmentRepository.transaction(async () =>
        this.assignmentRepository.insert(assignment),
      );

      this.logger.log(
        `Employee ${command.employeeId} assigned to department ${command.departmentId} successfully`,
      );

      return Ok(assignment.id);
    } catch (error: any) {
      this.logger.error(
        `Failed to assign employee to department: ${(error as Error).message}`,
      );
      throw error;
    }
  }
}
