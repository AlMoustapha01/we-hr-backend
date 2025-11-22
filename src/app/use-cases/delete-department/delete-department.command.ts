import { Command, CommandProps } from '@/libs/domain';

export class DeleteDepartmentCommand extends Command {
  readonly departmentId: string;

  constructor(props: CommandProps<DeleteDepartmentCommand>) {
    super(props);
    this.departmentId = props.departmentId;
  }
}
