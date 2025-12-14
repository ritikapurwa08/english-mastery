"use client";

import { ArchitecturalSidebar } from "@/components/ArchitecturalSidebar";

interface SidebarProps {
    isOpen?: boolean;
    setIsOpen?: (open: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
    // The old Sidebar accepted generic props.
    // The new ArchitecturalSidebar handles its own state or is sticky.
    // For mobile props (isOpen, setIsOpen), we might need to wrap it specifically if ArchitecturalSidebar doesn't handle them yet.
    // The ArchitecturalSidebar provided has a 'md:hidden' section in dashboard but internally is just 'aside'.
    // To make it backward compatible with old Layouts that toggle it via mobile, we should adapt.

    // HOWEVER, the Architectural spec implies a sticky desktop sidebar.
    // Mobile behavior logic was: Sheet/Overlay.
    // Let's just render ArchitecturalSidebar and ignore props for now to enforce the visual change,
    // OR we can wrap it in a mobile conditional if necessary.
    // Given "Overwrite whole application", let's force the new one.

    return (
        <>
            <div className="hidden md:block">
                 <ArchitecturalSidebar />
            </div>
             {/* Mobile compatibility hack: If 'isOpen' is true, show it as an overlay?
                 Or just rely on pages to render it properly.
                 Most existing pages render <Sidebar /> then content.
                 If we just return <ArchitecturalSidebar />, it will be visible.
                 But architectural sidebar is sticky h-screen.
                 Existing layouts might break if they expect a fixed sidebar.
                 Let's wrap it to ensure it occupies space correctly.
             */}
             <div className="md:hidden">
                 {/* For mobile, if we want to reuse the same component, fine. */}
                 {isOpen && (
                     <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" onClick={() => setIsOpen?.(false)}>
                         <div className="w-64 h-full" onClick={(e) => e.stopPropagation()}>
                             <ArchitecturalSidebar />
                         </div>
                     </div>
                 )}
             </div>
        </>
    );
}
