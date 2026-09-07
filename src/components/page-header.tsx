import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  className?: string;
  align?: "left" | "center";
}

export function PageHeader({ title, description, className, align = "center" }: PageHeaderProps) {
  return (
    <div className={cn(description ? "mb-8" : "mb-6 md:mb-8", align === "center" && "text-center", className)}>
      <h1 className={cn("text-4xl md:text-5xl font-bold tracking-tight text-foreground", description ? "mb-4" : "mb-0")}>
        {title}
      </h1>
      {description && (
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {description}
        </p>
      )}
    </div>
  );
}
