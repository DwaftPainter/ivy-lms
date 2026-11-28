import { IvyAgent } from "@/components/layout/ivy-agent";

export function AppBottom() {
    return (
        <footer className="hidden pb-[env(safe-area-inset-bottom)] md:col-start-2 md:row-start-2 md:mr-2 md:block">
            <div className="flex h-8 justify-end">
                <IvyAgent />
            </div>
        </footer>
    );
}
