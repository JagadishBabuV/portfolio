import { taskSchema } from "@/app/(protected)/project/[projectId]/tasks/data/schema";
import { auth } from "@/auth";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
  const session = await auth();
  const task = await req.json();
  try {
    await prisma.task.update({
      data: { status: task.status },
      where: { id: task.id },
    });
    return NextResponse.json(document);
  } catch (err) {
    return NextResponse.json(
      { error: "Something went wrong!" },
      { status: 500 }
    );
  }
}
