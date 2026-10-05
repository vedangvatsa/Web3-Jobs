import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  className?: string;
  align?: "left" | "center";
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, className, align = "center", actions }: PageHeaderProps) {
  const heading = (
    <>
      <h1 className={cn(
        "text-3xl font-bold tracking-tight text-foreground break-words sm:text-4xl md:text-5xl",
        description ? "mb-4" : "mb-0",
      )}>
        {title}
      </h1>
      {description && (
        <p className={cn("text-lg text-muted-foreground max-w-2xl", align === "center" && "mx-auto")}>
          {description}
        </p>
      )}
    </>
  );
  return (
    <div data-page-header className={cn(
      "mb-8 min-w-0",
      align === "center" && "text-center",
      actions && "flex flex-col gap-3",
      actions && align === "left" && "sm:flex-row sm:items-end sm:justify-between",
      className,
    )}>
      {actions ? <div className="min-w-0">{heading}</div> : heading}
      {actions && <div className={cn("flex shrink-0 flex-wrap gap-2", align === "center" ? "justify-center" : "sm:justify-end")}>{actions}</div>}
    </div>
  );
}
