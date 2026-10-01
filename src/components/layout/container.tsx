import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Single source of truth for page width, horizontal padding, and vertical rhythm.
// Pages compose this instead of repeating "mx-auto max-w-* px-* mt-*" everywhere.
const containerVariants = cva(
    // Base: always centered, full width up to the max, consistent responsive side padding.
    'mx-auto w-full px-4 sm:px-6',
    {
        variants: {
            // Width scale — the ONLY place these max-widths are defined.
            size: {
                sm: 'max-w-lg',   // narrow forms (profile, new service)
                md: 'max-w-2xl',  // comfortable reading width (service list / detail text)
                lg: 'max-w-4xl',
                xl: 'max-w-6xl',  // wide app pages (dashboard) — matches the Header width
            },
            // Vertical rhythm. Use PADDING (not margin-top) to avoid margin-collapse bugs.
            gutter: {
                none: '',
                md: 'py-10',
                lg: 'py-14',
            },
            defaultVariants: {
                size: 'md',
                gutter: 'md',
            },
        }
    }
);

type ContainerProps = React.ComponentProps<'div'> & VariantProps<typeof containerVariants>;

export function Container({ className, size, gutter, ...props }: ContainerProps) {
    // `className` is merged LAST so a page can still override in a one-off case.
    return <div className={cn(containerVariants({ size, gutter }), className)} {...props} />;
}