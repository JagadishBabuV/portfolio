export type DevStatus = "pending" | "devComplete" | "qaComplete" | "prodReady";
export type TaskStatus = "TODO" | "INPROGRESS" | "DONE";

export interface ChildTask {
  id: string;
  content: string;
  parentId: string;
  assignee: string;
  storyPoints: number;
  status: TaskStatus;
}

export interface ParentTask {
  id: string;
  content: string;
  status: TaskStatus;
  epic: string;
  epicId: string;
  assignee: string;
  storyPoints: number;
  devStatus: DevStatus;
  children: ChildTask[];
}

export interface Column {
  id: TaskStatus;
  title: string;
  childTasks: ChildTask[];
}

export interface Board {
  parentTasks: ParentTask[];
  columns: {
    [K in TaskStatus]: Column;
  };
}

export type Action =
  | {
      type: "MOVE_TASK";
      source: TaskStatus;
      destination: TaskStatus;
      taskId: string;
    }
  | { type: "ADD_CHILD_TASK"; parentId: string; content: string; id: number }
  | { type: "UPDATE_DEV_STATUS"; taskId: string; status: DevStatus }
  | { type: "ADD_COLUMN"; id: string; title: string };
