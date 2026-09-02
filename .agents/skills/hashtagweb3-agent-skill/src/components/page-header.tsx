import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  className?: string;
  align?: "left" | "center";
}

export function PageHeader({ title, description, className, align = "center" }: PageHeaderProps) {
  return (
    <div className={cn("mb-8", align === "center" && "text-center", className)}>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
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
