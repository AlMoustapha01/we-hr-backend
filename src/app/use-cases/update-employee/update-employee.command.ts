import { Command, CommandProps } from '@/libs/domain';
import { EmployeePosition } from '@/app/domain/employee';

export class UpdateEmployeeCommand extends Command {
  readonly employeeId: string;
  readonly name?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly position?: EmployeePosition;
  readonly role?: string;
  readonly salary?: number;
  readonly departmentId?: string | null;
  readonly avatar?: string;

  constructor(props: CommandProps<UpdateEmployeeCommand>) {
    super(props);
    this.employeeId = props.employeeId;
    this.name = props.name;
    this.email = props.email;
    this.phone = props.phone;
    this.position = props.position;
    this.role = props.role;
    this.salary = props.salary;
    this.departmentId = props.departmentId;
    this.avatar = props.avatar;
  }
}
