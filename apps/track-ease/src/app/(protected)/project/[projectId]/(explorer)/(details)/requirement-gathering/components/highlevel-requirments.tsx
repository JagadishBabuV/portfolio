"use client";
import { getHighLevelRequirements } from "@/app/actions";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@repo/ui/components/skeleton";
import React from "react";
import { InboxIcon } from "lucide-react";

function HighLevelRequirements({
  useCase,
  type,
  id,
}: {
  useCase: "epics" | "requirements";
  type: "saved" | "drafts";
  id: string;
}) {
  const { data, isPending, isLoading, isError, error } = useQuery({
    queryKey: [id, type],
    queryFn: async () => {
      return await getHighLevelRequirements(useCase, type, id);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    );
  }

  if (isError) {
    return <div>Something went wrong!</div>;
  }

  if (!data?.highLevelRequirements.length) {
    return (
      <div className="flex items-center">
        <InboxIcon className="w-5 h-5 mr-1" />
        No epics mapped
      </div>
    );
  }

  return (
    <ul className="list-disc pl-6 space-y-2">
      {data?.highLevelRequirements.map((data: any) => (
        <li
          className="break-all"
          key={data?.id}
        >{`#P${data.priority} ${data?.requirement}`}</li>
      ))}
    </ul>
  );
}

export default HighLevelRequirements;
