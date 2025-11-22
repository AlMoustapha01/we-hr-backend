import { v7 as uuidv7 } from 'uuid';
import { BaseEntity } from '@/libs/domain';

interface EmployeeAssignmentProps {
  employeeId: string;
  departmentId: string;
  assignedAt: Date;
  unassignedAt: Date | null;
  isActive: boolean;
  notes: string | null;
}

interface EmployeeAssignmentCreateProps {
  employeeId: string;
  departmentId: string;
  notes?: string;
}

export class EmployeeAssignmentEntity extends BaseEntity<EmployeeAssignmentProps> {
  static create(
    props: EmployeeAssignmentCreateProps,
  ): EmployeeAssignmentEntity {
    return new EmployeeAssignmentEntity({
      id: uuidv7(),
      props: {
        employeeId: props.employeeId,
        departmentId: props.departmentId,
        assignedAt: new Date(),
        unassignedAt: null,
        isActive: true,
        notes: props.notes || null,
      },
    });
  }

  // Business logic methods
  unassign(): void {
    if (!this.props.isActive) {
      throw new Error('Assignment is already inactive');
    }
    this.props.isActive = false;
    this.props.unassignedAt = new Date();
    this.validate();
  }

  reactivate(): void {
    if (this.props.isActive) {
      throw new Error('Assignment is already active');
    }
    this.props.isActive = true;
    this.props.unassignedAt = null;
    this.validate();
  }

  updateNotes(notes: string): void {
    this.props.notes = notes;
    this.validate();
  }

  validate(): void {
    if (!this.props.employeeId || this.props.employeeId.trim().length === 0) {
      throw new Error('Employee ID is required');
    }
    if (
      !this.props.departmentId ||
      this.props.departmentId.trim().length === 0
    ) {
      throw new Error('Department ID is required');
    }
    if (!this.props.assignedAt) {
      throw new Error('Assigned date is required');
    }
  }
}
