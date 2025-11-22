import { Command, CommandProps } from '@/libs/domain';

export class RetireEmployeeFromDepartmentCommand extends Command {
  readonly employeeId: string;
  readonly departmentId: string;

  constructor(props: CommandProps<RetireEmployeeFromDepartmentCommand>) {
    super(props);
    this.employeeId = props.employeeId;
    this.departmentId = props.departmentId;
  }
}
