import React from "react";
import { AllReleases } from "./components/all-releases";
import { Separator } from "@repo/ui/components/separator";
import { Button } from "@repo/ui/components/button";
import { PlusCircledIcon } from "@radix-ui/react-icons";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/tabs";
import prisma from "@/lib/db";
import SheetWrapper from "./components/sheet-wrapper";
import Link from "next/link";
import InitiationForm from "./components/initiation-form";

async function Page({
  params: { projectId },
  searchParams,
}: {
  params: {
    projectId: string;
  };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const upcoming = await prisma.initiation.findMany({
    where: { projectId },
    include: { highLevelRequirements: true },
  });
  const drafts = await prisma.initiationDraft.findMany({
    where: { projectId },
    include: { highLevelRequirements: true },
  });

  const isDraftFlow = searchParams?.draftId as string;
  const openedTab = (searchParams?.tab as string) || "saved";
  let draft = null;
  if (isDraftFlow) {
    draft = await prisma.initiationDraft.findUnique({
      where: { id: isDraftFlow },
      select: {
        highLevelRequirements: true,
        description: true,
        name: true,
        id: true,
      },
    });
  }
  console.log(isDraftFlow, draft, "sDID");
  return (
    <SheetWrapper projectId={projectId}>
      <div className="flex w-full gap-4 h-full">
        <div className="w-[50%]">
          <Tabs value={openedTab} className="h-full space-y-6">
            <div className="space-between flex items-center">
              <TabsList>
                {["saved", "drafts"].map((tab, index) => (
                  <Link href={`?tab=${tab}`} key={index}>
                    <TabsTrigger value={tab} className="capitalize">
                      {tab}
                    </TabsTrigger>
                  </Link>
                ))}
              </TabsList>
              <div className="ml-auto">
                <Link href={`?tab=${openedTab}&create=true`}>
                  <Button className="ml-auto h-9 mr-4" variant="outline">
                    <PlusCircledIcon className="mr-2 h-4 w-4" />
                    Create
                  </Button>
                </Link>
              </div>
            </div>
            <TabsContent value="saved">
              <AllReleases data={upcoming} type="saved" projectId={projectId} />
            </TabsContent>
            <TabsContent value="drafts">
              <AllReleases data={drafts} type="drafts" projectId={projectId} />
            </TabsContent>
          </Tabs>
        </div>
        <Separator orientation="vertical" className="mx-3" />
        <div className="w-[50%] space-x-2">
          <h5 className="text-lg font-semibold tracking-tight">Details</h5>
        </div>
      </div>
      <InitiationForm projectId={projectId} draft={draft as any} />
    </SheetWrapper>
  );
}

export default Page;
