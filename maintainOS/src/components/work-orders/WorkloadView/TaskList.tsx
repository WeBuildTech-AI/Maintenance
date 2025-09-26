import { memo } from "react";

interface TaskListProps {
  tasks: { id: string; title: string }[];
}

export const TaskList = memo(function TaskList({ tasks }: TaskListProps) {
  return (
    <div className="w-full space-y-1">
      {tasks.slice(0, 2).map((t) => (
        <div
          key={t.id}
          className="truncate rounded bg-primary/10 px-2 py-1 text-xs text-primary"
          title={t.title}
        >
          {t.title.length > 18 ? `${t.title.slice(0, 18)}…` : t.title}
        </div>
      ))}
      {tasks.length > 2 && (
        <div className="rounded bg-muted px-2 py-1 text-center text-xs text-muted-foreground">
          +{tasks.length - 2} more
        </div>
      )}
    </div>
  );
});
