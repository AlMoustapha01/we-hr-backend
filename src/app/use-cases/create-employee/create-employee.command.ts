import { Command, CommandProps } from '@/libs/domain';
import { EmployeePosition } from '@/app/domain/employee';

export class CreateEmployeeCommand extends Command {
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly position: EmployeePosition;
  readonly role: string;
  readonly joinDate: Date;
  readonly salary: number;
  readonly departmentId?: string;
  readonly avatar?: string;

  constructor(props: CommandProps<CreateEmployeeCommand>) {
    super(props);
    this.name = props.name;
    this.email = props.email;
    this.phone = props.phone;
    this.position = props.position;
    this.role = props.role;
    this.joinDate = props.joinDate;
    this.salary = props.salary;
    this.departmentId = props.departmentId;
    this.avatar = props.avatar;
  }
}
