import { v7 as uuidv7 } from 'uuid';

import { AggregateRoot } from '@/libs/domain';

export enum EmployeeStatus {
  ACTIVE = 'active',
  ON_LEAVE = 'on-leave',
  TERMINATED = 'terminated',
}
export enum EmployeePosition {
  MANAGER = 'Manager',
  SENIOR = 'Senior',
  MID_LEVEL = 'Mid-Level',
  JUNIOR = 'Junior',
  INTERN = 'Intern',
}

interface EmployeeProps {
  name: string;
  email: string;
  phone: string;
  position: EmployeePosition;
  role: string;
  status: EmployeeStatus;
  joinDate: Date;
  salary: number;
  departmentId?: string;
  avatar?: string;
}

interface EmployeeCreateProps {
  name: string;
  email: string;
  phone: string;
  position: EmployeePosition;
  role: string;
  joinDate: Date;
  salary: number;
  departmentId?: string;
  avatar?: string;
}

export class EmployeeEntity extends AggregateRoot<EmployeeProps> {
  static create(props: EmployeeCreateProps): EmployeeEntity {
    return new EmployeeEntity({
      id: uuidv7(),
      props: {
        ...props,
        status: EmployeeStatus.ACTIVE,
      },
    });
  }

  // Business logic methods
  updateContactInfo(email: string, phone: string): void {
    this.props.email = email;
    this.props.phone = phone;
    this.validate();
  }

  updatePosition(position: EmployeePosition): void {
    this.props.position = position;
    this.validate();
  }

  updateRole(role: string): void {
    this.props.role = role;
    this.validate();
  }

  updateSalary(salary: number): void {
    if (salary <= 0) {
      throw new Error('Salary must be greater than 0');
    }
    this.props.salary = salary;
    this.validate();
  }

  assignToDepartment(departmentId: string): void {
    this.props.departmentId = departmentId;
    this.validate();
  }

  removeDepartment(): void {
    this.props.departmentId = undefined;
    this.validate();
  }

  activate(): void {
    this.props.status = EmployeeStatus.ACTIVE;
    this.validate();
  }

  putOnLeave(): void {
    this.props.status = EmployeeStatus.ON_LEAVE;
    this.validate();
  }

  terminate(): void {
    this.props.status = EmployeeStatus.TERMINATED;
    this.validate();
  }

  updateAvatar(avatar: string): void {
    this.props.avatar = avatar;
    this.validate();
  }

  isActive(): boolean {
    return this.props.status === EmployeeStatus.ACTIVE;
  }

  isOnLeave(): boolean {
    return this.props.status === EmployeeStatus.ON_LEAVE;
  }

  isTerminated(): boolean {
    return this.props.status === EmployeeStatus.TERMINATED;
  }

  validate(): void {
    // Add validation rules
    if (!this.props.name || this.props.name.trim().length === 0) {
      throw new Error('Employee name is required');
    }
    if (!this.props.email || !this.isValidEmail(this.props.email)) {
      throw new Error('Valid employee email is required');
    }
    if (!this.props.phone || this.props.phone.trim().length === 0) {
      throw new Error('Employee phone is required');
    }
    if (this.props.salary <= 0) {
      throw new Error('Salary must be greater than 0');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
