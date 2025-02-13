"use client";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import React, { FormEvent } from "react";
import Editor from "../components/editor";
import {
  createTask,
  getEpicDetails,
  getMembers,
  getSprintDetails,
  getUserStoriesForSprint,
  Task,
} from "@/app/actions";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { ScrollArea } from "@repo/ui/components/scroll-area";
import { Button } from "@repo/ui/components/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@repo/ui/lib/utils";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Scrollbar } from "@radix-ui/react-scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/popover";
import { ArrowLeft, CalendarIcon } from "lucide-react";
import { Calendar } from "@repo/ui/components/calendar";
import { format } from "date-fns";
import { toast } from "@repo/ui/hooks/use-toast";
import { ToastAction } from "@repo/ui/components/toast";
import { Badge } from "@repo/ui/components/badge";
import BackButton from "../../components/back-button";
import { taskFormSchema } from "./types/tasks";

export type TaskFormValues = z.infer<typeof taskFormSchema>;

// This can come from your database or API.
const defaultValues: Partial<TaskFormValues> = {
  title: "",
  description: '{"a":"a"}',
  userId: "",
  reporterId: "",
  label: "",
  priority: "",
  status: "",
};

function CreateTask() {
  const params = useParams<{ projectId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  console.log(searchParams.get("epicId"));
  //members in project.
  const {
    data: members,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["members"],
    queryFn: async () => await getMembers(params.projectId),
  });

  const sprintType = searchParams.get("sprintId") && "SPRINT";
  const epicType = searchParams.get("epicId") && "EPIC";

  const {
    data: parentData,
    isPending: parentIsPending,
    isError: parentIsError,
    error: parentError,
  } = useQuery({
    queryKey: ["parentLink"],
    queryFn: async () => {
      const id = searchParams.get("epicId");
      const sprintId = searchParams.get("sprintId");
      return await getEpicDetails(params.projectId, id, sprintId);
    },
  });

  const {
    data: parentUserStoriesData,
    isPending: parentUserStoriesPending,
    isError: parentUserStoriesIsError,
    error: parentUserStoriesError,
  } = useQuery({
    queryKey: ["parentUserStoriesLink"],
    queryFn: async () => {
      const sprintId = searchParams.get("sprintId");
      if (sprintId) {
        const data = await getUserStoriesForSprint(sprintId);
        console.log(data);
        return data;
      }
      return [];
    },
  });

  const {
    data: sprintData,
    isPending: sprintIsPending,
    isError: sprintIsError,
    error: sprintError,
  } = useQuery({
    queryKey: ["sprintLink"],
    queryFn: async () => {
      const id = searchParams.get("sprintId");
      if (id) {
        return await getSprintDetails(id);
      }
      return { name: "" };
    },
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
    reset,
    watch,
    getValues,
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      ...defaultValues,
      projectId: params.projectId,
      discussions: [
        {
          content: '{"a":"a"}',
        },
        {
          content: '{"a":"a"}',
        },
      ],
    },
  });
  console.log(errors, "ERRORS");
  const watchIssueType = watch("issueType", "");

  console.log(
    parentData,
    parentUserStoriesError,
    "parent",
    getValues("issueType")
  );

  const { fields, append, remove, update } = useFieldArray({
    name: "discussions",
    control: control,
  });

  const goToTasks = () => {
    if (sprintType) {
      router.push(
        `/project/${params.projectId}/board/${searchParams.get("sprintId")}`
      );
      return;
    }
    router.push(`/project/${params.projectId}/tasks`);
  };

  const mutation = useMutation({
    mutationFn: (newTask: z.infer<typeof taskFormSchema>) => {
      console.log("PUT TASK", newTask);
      return fetch("/api/v1/tasks", {
        method: "POST",
        body: JSON.stringify({
          ...newTask,
          ...(searchParams.get("epicId") && {
            epicId: searchParams.get("epicId"),
          }),
          sprintId: searchParams.get("sprintId"),
        }),
      });
    },
    onSuccess() {
      toast({
        title: "Your changes are saved!",
        description: "Your task created successfully.",
        action: (
          <ToastAction altText="Go to tasks" onClick={goToTasks}>
            {sprintType ? "Go to board" : "Go to tasks"}
          </ToastAction>
        ),
      });
      reset();
    },
    onError(error, variables, context) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request.",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
    },
  });

  console.log(errors, "pd");

  if (isPending || parentIsPending || sprintIsPending) {
    return <span>Loading...</span>;
  }

  if (isError) {
    return <span>Error: {error.message}</span>;
  }

  function onSubmit(values: z.infer<typeof taskFormSchema>) {
    console.log(values);
    mutation.mutate(values);
  }

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="m-8 border p-8 border-1 grid md:grid-cols-[1.1fr_1fr] gap-x-8 gap-y-4 items-start rounded-md">
          <div className="col-span-2 font-bold flex justify-between items-center border-b pb-6">
            <div className="flex gap-2 items-center">
              <BackButton />
              <h2 className="text-xl font-bold tracking-tight">Create Task</h2>
              {sprintType ? (
                <Badge>{`Adding task to ${sprintData?.name}`} </Badge>
              ) : epicType ? (
                <Badge>{`Adding User Story to ${(parentData as any)?.title} epic`}</Badge>
              ) : (
                ""
              )}
            </div>
            <div>
              <Button
                size="sm"
                className="px-6"
                type="submit"
                disabled={!isValid}
              >
                Save
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="grid items-center col-span-2 gap-2">
              <Label htmlFor="title" className="text-left">
                Title
              </Label>
              <Input
                placeholder="Title of the task"
                className="resize-none"
                {...register("title")}
              />
            </div>
            <div className="grid gap-2">
              <div className="grid grid-rows-2 items-center">
                <Label htmlFor="issueType" className="text-left">
                  Issue type
                </Label>
                {!searchParams?.get("epicId") ? (
                  <Controller
                    control={control}
                    {...register("issueType")}
                    render={({ field }) => (
                      <Select
                        {...field}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Issue type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USERSTORY">User Story</SelectItem>
                          <SelectItem value="TASK">Task</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                ) : (
                  <Input
                    value={`USERSTORY`}
                    {...register("issueType")}
                    readOnly
                  ></Input>
                )}
              </div>
              <div className="grid grid-rows-2 items-center">
                <Label htmlFor="userId" className="text-left">
                  Assignee
                </Label>
                <Controller
                  control={control}
                  {...register("userId")}
                  render={({ field }) => (
                    <Select
                      {...field}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Assignee" />
                      </SelectTrigger>
                      <SelectContent>
                        {members?.map((member) => (
                          <SelectItem
                            value={member?.user?.id}
                            key={member.user?.email}
                          >
                            {member?.user?.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="grid grid-rows-2 items-center">
                <Label htmlFor="reporterId" className="text-left">
                  Reporter
                </Label>
                <Controller
                  control={control}
                  {...register("reporterId")}
                  render={({ field }) => (
                    <Select
                      {...field}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Reporter" />
                      </SelectTrigger>
                      <SelectContent>
                        {members?.map((member) => (
                          <SelectItem
                            value={member?.user?.id}
                            key={member.user?.email}
                          >
                            {member?.user?.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="grid grid-rows-2 items-center">
                <Label htmlFor="label" className="text-left">
                  Label
                </Label>
                <Controller
                  control={control}
                  {...register("label")}
                  render={({ field }) => (
                    <Select
                      {...field}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Label" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DOCUMENTATION">
                          Documentation
                        </SelectItem>
                        <SelectItem value="FEATURE">Feature</SelectItem>
                        <SelectItem value="BUG">Bug</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="grid grid-rows-2 items-center">
                <Label htmlFor="priority" className="text-left">
                  Priority
                </Label>
                <Controller
                  control={control}
                  {...register("priority")}
                  render={({ field }) => (
                    <Select
                      {...field}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="LOW">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <div className="grid grid-rows-2 items-center">
                <Label htmlFor="parentTaskId" className="text-left">
                  Parent Issue
                </Label>
                <div>
                  {(watchIssueType === "USERSTORY" || watchIssueType === "") &&
                    Array.isArray(parentData) && (
                      <Controller
                        control={control}
                        {...register("epicId")}
                        render={({ field }) => (
                          <Select
                            {...field}
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Parent" />
                            </SelectTrigger>
                            <SelectContent>
                              {parentData?.map((item) => (
                                <SelectItem key={item.id} value={item.id}>
                                  {`${item?.title} - #${item?.id}`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    )}
                  {!Array.isArray(parentData) &&
                    searchParams.get("epicId") !== null && (
                      <Input
                        readOnly
                        value={`${parentData?.title} - #${parentData?.id.slice(
                          -5
                        )}`}
                        {...register("epicId")}
                      ></Input>
                    )}
                  {watchIssueType === "TASK" &&
                    Array.isArray(parentUserStoriesData) && (
                      <Controller
                        control={control}
                        {...register("parentTaskId")}
                        render={({ field }) => (
                          <Select
                            {...field}
                            onValueChange={field.onChange}
                            defaultValue={field.value?.toString()}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Parent" />
                            </SelectTrigger>
                            <SelectContent>
                              {parentUserStoriesData?.map((item) => (
                                <SelectItem
                                  key={item.id}
                                  value={item.id.toString()}
                                >
                                  {`${item?.title} - #${item?.id}`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    )}
                </div>
              </div>
              <div className="grid grid-rows-2 items-center">
                <Label htmlFor="status" className="text-left">
                  Status
                </Label>
                <Controller
                  control={control}
                  {...register("status")}
                  render={({ field }) => (
                    <Select
                      {...field}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TODO">Todo</SelectItem>
                        <SelectItem value="INPROGRESS">In Progress</SelectItem>
                        <SelectItem value="DONE">Done</SelectItem>
                        <SelectItem value="BACKLOG">Backlog</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="grid grid-rows-2 items-center">
                <Label htmlFor="storyPoints" className="text-left">
                  Story points
                </Label>
                <Controller
                  control={control}
                  {...register("storyPoints")}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Provide story point"
                      type="number"
                      onChange={field.onChange}
                      defaultValue={field.value}
                    />
                  )}
                />
              </div>
              <div className="grid grid-rows-2 items-center">
                <Label htmlFor="startDate" className="text-left">
                  Start date
                </Label>
                <Controller
                  control={control}
                  {...register("startDate")}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] justify-start text-left font-normal gap-2",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="w-4 h-4" />
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
              </div>
              <div className="grid grid-rows-2 items-center">
                <Label htmlFor="endDate" className="text-left">
                  End date
                </Label>
                <Controller
                  control={control}
                  {...register("endDate")}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] justify-start text-left font-normal gap-2",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="w-4 h-4" />
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
              </div>
            </div>
          </div>
          <div className="grid items-start">
            <div className="grid gap-3 mt-4">
              <Label htmlFor="description" className="text-left">
                Description
              </Label>
              <Controller
                control={control}
                {...register("description")}
                render={({ field }) => (
                  <Editor
                    label={"Description"}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
            <div className="grid gap-3 items-start">
              <Label>Discussions</Label>
              <ScrollArea className="h-[340px] w-full">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 w-full">
                    <Avatar className="mt-1">
                      <AvatarImage
                        src="https://github.com/shadcn.png"
                        alt="@shadcn"
                      />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Controller
                        control={control}
                        name={`discussions.${index}`}
                        render={({ field }) => (
                          <Editor
                            label={"Discussions"}
                            data={{
                              id: new Date().toString(),
                              name: "Jagadish V",
                              date: new Date().toString(),
                            }}
                            value={field.value.content}
                            onChange={(data: any) =>
                              field.onChange({
                                content: data,
                              })
                            }
                          />
                        )}
                      />
                    </div>
                  </div>
                ))}
                <Scrollbar orientation="vertical" />
              </ScrollArea>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CreateTask;
