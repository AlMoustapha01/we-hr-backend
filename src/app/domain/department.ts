import { v7 as uuidv7 } from 'uuid';

import { BaseEntity, Slug } from '@/libs/domain';
import { EmployeeAssignmentEntity } from './employee-assignment';

interface DepartmentProps {
  name: string;
  slug: string;
  description: string;
  managerId: string | null;
}

interface DepartmentCreateProps {
  name: string;
  description: string;
  managerId?: string | null;
}

export class DepartmentEntity extends BaseEntity<DepartmentProps> {
  static create(props: DepartmentCreateProps): DepartmentEntity {
    const slug = new Slug({ value: props.name });
    const slugValue: string = slug.unpack();

    return new DepartmentEntity({
      id: uuidv7(),
      props: {
        slug: slugValue,
        name: props.name,
        description: props.description,
        managerId: props.managerId ?? null,
      },
    });
  }

  // Business logic methods
  updateName(name: string): void {
    this.props.name = name;
    const slug = new Slug({ value: name });
    this.props.slug = slug.unpack();
    this.validate();
  }

  updateDescription(description: string): void {
    this.props.description = description;
    this.validate();
  }

  assignManager(managerId: string | null): void {
    this.props.managerId = managerId;
    this.validate();
  }

  removeManager(): void {
    this.props.managerId = null;
    this.validate();
  }

  get managerId(): string | null {
    return this.props.managerId;
  }

  // Employee management methods
  addEmployee(employeeId: string, notes?: string): EmployeeAssignmentEntity {
    if (!employeeId || employeeId.trim().length === 0) {
      throw new Error('Employee ID is required to add to department');
    }

    // Create and return a new employee assignment
    return EmployeeAssignmentEntity.create({
      employeeId,
      departmentId: this.id,
      notes,
    });
  }

  retireEmployee(
    assignment: EmployeeAssignmentEntity,
  ): EmployeeAssignmentEntity {
    if (!assignment) {
      throw new Error(
        'Assignment is required to retire employee from department',
      );
    }

    // Unassign the employee
    assignment.unassign();

    return assignment;
  }

  validate(): void {
    if (!this.props.name || this.props.name.trim().length === 0) {
      throw new Error('Department name is required');
    }
    if (!this.props.description || this.props.description.trim().length === 0) {
      throw new Error('Department description is required');
    }
    // Manager is now optional, so no validation needed
  }
}
