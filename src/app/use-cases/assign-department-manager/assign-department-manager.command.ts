import { Command, CommandProps } from '@/libs/domain';

export class AssignDepartmentManagerCommand extends Command {
  readonly departmentId: string;
  readonly employeeId: string;

  constructor(props: CommandProps<AssignDepartmentManagerCommand>) {
    super(props);
    this.departmentId = props.departmentId;
    this.employeeId = props.employeeId;
  }
}
