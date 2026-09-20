// The "no results yet" block was already being hand-copied on the home page
// and the services page with the same dashed-border markup. One component now
// owns that pattern, so every empty list across the app looks and behaves the same.
type EmptyStateProps = {
    title: string;
    description?: string;
    action?: React.ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
    return (
        <div className="rounded-xl border border-dashed border-border-strong p-14 text-center">
            <p className="font-medium text-foreground">{title}</p>
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}
