import Link from "next/link";
import { Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

type Path = "home" | "profile" | "studio";

export default function EmptyVideo({
  title = "No Videos Yet",
  path,
  message,
  icon = <Video />,
}: {
  title?: string;
  path: Path;
  message?: string;
  icon?: any;
}) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">{icon}</EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{message}</EmptyDescription>
      </EmptyHeader>
      {path === "home" ||
        (path === "studio" && (
          <EmptyContent className="flex-col justify-center gap-2 md:flex-row">
            <Link
              href="/studio/create"
              className="border-dark/10 cursor-pointer rounded-md border bg-inherit px-7 py-3 text-black transition-colors hover:bg-neutral-900 dark:border-white/10 dark:text-white"
            >
              Upload Video
            </Link>
            <Button
              variant="outline"
              className="!h-auto cursor-pointer bg-[var(--sb)] !px-7 !py-3 transition-colors hover:bg-[var(--sb-hover)]"
            >
              Record Screen
            </Button>
          </EmptyContent>
        ))}
    </Empty>
  );
}
