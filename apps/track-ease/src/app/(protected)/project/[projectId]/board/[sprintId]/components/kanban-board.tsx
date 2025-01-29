"use client";

import { useReducer, useState } from "react";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { MoveLeft, Plus, ZapIcon, ArrowLeft } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { HoverBorderGradient } from "@repo/ui/components/hover-board-gradient";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/dialog";
import { Input } from "@repo/ui/components/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { Badge } from "@repo/ui/components/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { boardReducer } from "./reducer";
import { Droppable } from "./droppable";
import { TaskCard } from "./task-card";
import { ParentTaskCard } from "./parent-task-card";
import type {
  Board,
  ParentTask,
  ChildTask,
  DevStatus,
  TaskStatus,
} from "./types";
import Link from "next/link";
import { useRouter } from "next/navigation";

const initialBoard: Board = {
  parentTasks: [
    {
      id: "task-1",
      content: "Design System",
      status: "INPROGRESS",
      epic: "UI Modernization",
      devStatus: "pending",
      children: [
        {
          id: "child-1",
          content: "Color Palette",
          parentId: "task-1",
          status: "DONE",
        },
        {
          id: "child-2",
          content: "Typography",
          parentId: "task-1",
          status: "INPROGRESS",
        },
      ],
    },
    {
      id: "task-2",
      content: "User Authentication",
      status: "TODO",
      epic: "Security",
      devStatus: "pending",
      children: [
        {
          id: "child-3",
          content: "Login Page",
          parentId: "task-2",
          status: "TODO",
        },
        {
          id: "child-4",
          content: "Sign Up Flow",
          parentId: "task-2",
          status: "TODO",
        },
      ],
    },
    {
      id: "task-3",
      content: "Project Setup",
      status: "DONE",
      epic: "Infrastructure",
      devStatus: "prodReady",
      children: [
        {
          id: "child-5",
          content: "Repository Creation",
          parentId: "task-3",
          status: "DONE",
        },
        {
          id: "child-6",
          content: "Dependencies Installation",
          parentId: "task-3",
          status: "DONE",
        },
      ],
    },
  ],
  columns: {
    TODO: {
      id: "TODO",
      title: "To Do",
      childTasks: [],
    },
    INPROGRESS: {
      id: "INPROGRESS",
      title: "In Progress",
      childTasks: [],
    },
    DONE: {
      id: "DONE",
      title: "Done",
      childTasks: [],
    },
  },
};

const devStatusConfig = {
  pending: { label: "Pending", color: "secondary" },
  devComplete: { label: "Dev Complete", color: "blue" },
  qaComplete: { label: "QA Complete", color: "yellow" },
  prodReady: { label: "Prod Ready", color: "green" },
} as const;

function getInitialData(initial: any, sprint: any) {
  const parentTasks = sprint.tasks.map((sp: any) => ({
    id: sp.id,
    content: sp.title,
    status: sp.status,
    epic: sp.Epic?.title,
    devStatus: "pending",
    children: sp.childTasks.map((t: any) => ({
      id: t.id,
      content: t.title,
      parentId: sp.id,
      status: t.status,
    })),
  }));
  return { ...initial, parentTasks };
}

export default function KanbanBoard({ sprint }) {
  console.log(sprint);
  const [board, dispatch] = useReducer(
    boardReducer,
    initialBoard,
    (initial) => {
      const data: Board = getInitialData(initial, sprint);
      const initialized = structuredClone(data);
      Object.values(initialized.columns).forEach((column) => {
        column.childTasks = [];
      });
      initialized.parentTasks.forEach((parent) => {
        parent.children.forEach((child) => {
          initialized.columns[child.status].childTasks.push(child);
        });
      });
      return initialized;
    }
  );
  const [selectedTask, setSelectedTask] = useState<ParentTask | null>(null);
  const [newChildTask, setNewChildTask] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [newColumnName, setNewColumnName] = useState("");
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const router = useRouter();

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeData = active.data.current as {
      task: ChildTask;
      status: TaskStatus;
    };
    if (!activeData) return;

    const sourceStatus = activeData.status;
    const destinationStatus = over.id as TaskStatus;

    if (sourceStatus === destinationStatus) return;

    dispatch({
      type: "MOVE_TASK",
      source: sourceStatus,
      destination: destinationStatus,
      taskId: active.id as string,
    });
  };

  const handleAddChildTask = () => {
    if (!selectedTask || !newChildTask.trim()) return;

    dispatch({
      type: "ADD_CHILD_TASK",
      parentId: selectedTask.id,
      content: newChildTask,
    });

    setNewChildTask("");
    setSelectedTask(null);
  };

  const handleDevStatusChange = (taskId: string, status: DevStatus) => {
    dispatch({
      type: "UPDATE_DEV_STATUS",
      taskId,
      status,
    });
  };

  const handleAddColumn = () => {
    if (newColumnName.trim()) {
      dispatch({
        type: "ADD_COLUMN",
        id: newColumnName,
        title: newColumnName,
      });
      setNewColumnName("");
      setIsAddingColumn(false);
    }
  };

  const getTaskProgress = (task: ParentTask) => {
    const total = task.children.length;
    const completed = task.children.filter(
      (child) => child.status === "DONE"
    ).length;
    return { completed, total };
  };

  const canChangeDevStatus = (task: ParentTask): boolean => {
    return task.children.every((child) => child.status === "DONE");
  };

  const activeTask = activeId
    ? Object.values(board.columns)
        .flatMap((col) => col.childTasks)
        .find((task) => task.id === activeId)
    : null;

  const activeParentTask = activeTask
    ? board.parentTasks.find((p) => p.id === activeTask.parentId)
    : null;

  return (
    <div className="p-4 h-screen bg-muted/40">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <ArrowLeft className="cursor-pointer" onClick={() => router.back()} />
          <h1 className="text-xl font-bold">Kanban Board</h1>
        </div>
        <HoverBorderGradient
          containerClassName="rounded-full"
          as="button"
          className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2 p-1 px-2"
        >
          <ZapIcon size="16" />
          <span>{sprint?.name}</span>
        </HoverBorderGradient>
        <div className="flex gap-2 items-center">
          <Link
            href={`/project/${sprint?.projectId}/tasks/create?sprintId=${sprint?.id}`}
          >
            <Button>Add Task</Button>
          </Link>
          <Dialog open={isAddingColumn} onOpenChange={setIsAddingColumn}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Column
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Column</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                <Input
                  placeholder="Enter column name"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                />
                <Button onClick={handleAddColumn}>Add Column</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4">
        {/* Parent Tasks Column */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Parent Tasks</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {board.parentTasks.map((task) => (
                <ParentTaskCard
                  key={task.id}
                  task={task}
                  {...getTaskProgress(task)}
                  devStatusConfig={devStatusConfig}
                  onAddChild={(content) => {
                    dispatch({
                      type: "ADD_CHILD_TASK",
                      parentId: task.id,
                      content,
                    });
                  }}
                  onDevStatusChange={(status) =>
                    handleDevStatusChange(task.id, status)
                  }
                  canChangeDevStatus={canChangeDevStatus(task)}
                />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Child Tasks Columns */}
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.values(board.columns).map((column) => (
              <Droppable
                key={column.id}
                column={column}
                parentTasks={board.parentTasks}
              />
            ))}
          </div>
          <DragOverlay>
            {activeId && activeTask && (
              <div className="transform-gpu">
                <TaskCard task={activeTask} parentTask={activeParentTask} />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
