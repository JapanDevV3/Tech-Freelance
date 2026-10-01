// Minimal shell for auth pages (login, register): centered, no app Header.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return <div className="flex min-h-screen items-center justify-center p-4">{children}</div>;
}