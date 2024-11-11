import prisma from "@/libs/db";
import React from "react";
import { requireUser } from "../libs/requireUser";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import Image from "next/image";
import { Button } from "@repo/ui/components/button";
import Link from "next/link";
import { EmptyState } from "../components/dashboard/EmptyState";

async function getData(userId: string) {
  const [sites, articles] = await Promise.all([
    prisma.site.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 3,
    }),
    await prisma.post.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 3,
    }),
  ]);
  return { sites, articles };
}

export default async function DashboardIndexPage() {
  const user = await requireUser();
  const { articles, sites } = await getData(user.id);
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-5">Your Sites</h1>
      {sites.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
          {sites.map(
            (item: {
              id: string;
              imageUrl: string | null;
              name: string;
              description: string;
            }) => (
              <Card key={item.id}>
                <Image
                  src={item.imageUrl ?? "/default.png"}
                  alt={item.name}
                  className="rounded-t-lg object-cover w-full h-[200px]"
                  width={400}
                  height={200}
                />
                <CardHeader>
                  <CardTitle className="truncate">{item.name}</CardTitle>
                  <CardDescription className="line-clamp-3">
                    {item.description}
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href={`/dashboard/sites/${item.id}`}>
                      View Articles
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            )
          )}
        </div>
      ) : (
        <EmptyState
          title="You dont have any sites created"
          description="You currently dont have any Sites. Please create some so that you can see them right here."
          href="/dashboard/sites/new"
          buttonText="Create Site"
        />
      )}

      <h1 className="text-2xl mt-10 font-semibold mb-5">Recent Articles</h1>
      {articles.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
          {articles.map(
            (item: {
              id: string;
              image: string | null;
              title: string;
              smallDescription: string;
              siteId: string | null;
            }) => (
              <Card key={item.id}>
                <Image
                  src={item.image ?? "/default.png"}
                  alt={item.title}
                  className="rounded-t-lg object-cover w-full h-[200px]"
                  width={400}
                  height={200}
                />
                <CardHeader>
                  <CardTitle className="truncate">{item.title}</CardTitle>
                  <CardDescription className="line-clamp-3">
                    {item.smallDescription}
                  </CardDescription>
                </CardHeader>

                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href={`/dashboard/sites/${item.siteId}/${item.id}`}>
                      Edit Article
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            )
          )}
        </div>
      ) : (
        <EmptyState
          title="You dont have any articles created"
          description="Your currently dont have any articles created. Please create some so that you can see them right here"
          buttonText="Create Article"
          href="/dashboard/sites"
        />
      )}
    </div>
  );
}
