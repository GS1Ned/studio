
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageSquare,
  SearchCheck,
  Replace,
  Blocks,
  FlaskConical,
  Settings2,
  FileText,
  AlertTriangle,
  FilePlus,
  BookOpen,
  Link2,
  Lightbulb,
  ChevronDown,
  ChevronRight,
  Type,
  Sparkles,
  FileSearch2,
  Network, // Added icon
  ShieldCheck, // Added icon
} from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { cn } from "@/lib/utils";

export interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  subItems?: NavItem[];
  isPlaceholder?: boolean;
}

export const navItems: NavItem[] = [
  { href: "/qa", label: "Document Q&A", icon: MessageSquare },
  {
    href: "/analysis", // Parent category, not a direct link
    label: "Analysis",
    icon: SearchCheck,
    subItems: [
      { href: "/analysis/standards", label: "Standards Analysis", icon: FileText, isPlaceholder: false },
      { href: "/analysis/error-detection", label: "Error Detection", icon: AlertTriangle, isPlaceholder: false },
    ],
  },
  {
    href: "/transformation",
    label: "Transformation",
    icon: Replace,
    subItems: [
      { href: "/transformation/nl-to-formal", label: "NL to Formal", icon: Type, isPlaceholder: false },
    ],
  },
  {
    href: "/generation",
    label: "Generation",
    icon: Blocks,
    subItems: [
      { href: "/generation/standards", label: "Standards Generation", icon: FilePlus, isPlaceholder: true },
      { href: "/generation/auto-doc", label: "Auto Documentation", icon: BookOpen, isPlaceholder: true },
    ],
  },
  {
    href: "/validation", // New top-level category
    label: "Validation",
    icon: ShieldCheck,
    subItems: [
      { href: "/validation/identifier", label: "Identifier Validator", icon: ShieldCheck, isPlaceholder: false },
    ],
  },
  { href: "/research", label: "Independent Research", icon: FlaskConical },
  {
    href: "/advanced",
    label: "Advanced Tools",
    icon: Settings2,
    subItems: [
      { href: "/advanced/qa-vector-search", label: "Q&A (Vector Search)", icon: FileSearch2, isPlaceholder: false },
      { href: "/advanced/kg-query-demo", label: "KG Query Demo", icon: Network, isPlaceholder: false },
      { href: "/advanced/semantic-alignment", label: "Semantic Alignment", icon: Sparkles, isPlaceholder: true },
      { href: "/advanced/linking", label: "Standard Linking", icon: Link2, isPlaceholder: true },
      { href: "/advanced/explainability-demo", label: "Explainability Demo", icon: Lightbulb, isPlaceholder: false },
    ],
  },
];

export function SidebarNavItems() {
  const pathname = usePathname();
  const [openCollabsibles, setOpenCollabsibles] = useState<Record<string, boolean>>(() => {
    // Default open the category if a sub-item is active
    const initialOpenState: Record<string, boolean> = {};
    navItems.forEach(item => {
      if (item.subItems) {
        const isActiveParent = item.subItems.some(subItem => pathname === subItem.href || pathname.startsWith(subItem.href + '/'));
        if (isActiveParent) {
          initialOpenState[item.label] = true;
        }
      }
    });
    return initialOpenState;
  });

  const toggleCollapsible = (label: string) => {
    setOpenCollabsibles(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const renderNavItem = (item: NavItem, isSubItem = false) => {
    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + (item.subItems ? '' : '/')));
    
    const buttonContent = (
      <>
        <item.icon className={cn("h-5 w-5", item.isPlaceholder && "opacity-50")} />
        <span className={cn(item.isPlaceholder && "opacity-50")}>{item.label}</span>
      </>
    );

    if (item.subItems) {
      return (
        <Collapsible key={item.label} open={openCollabsibles[item.label]} onOpenChange={() => toggleCollapsible(item.label)} className="w-full">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2 px-2 text-sm",
                isActive && !openCollabsibles[item.label] && "bg-sidebar-accent/50 text-sidebar-accent-foreground" // Highlight parent if active and closed
              )}
            >
              {buttonContent}
              {openCollabsibles[item.label] ? <ChevronDown className="ml-auto h-4 w-4" /> : <ChevronRight className="ml-auto h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.subItems.map((subItem) => (
                <SidebarMenuSubItem key={subItem.href}>
                   <Link href={subItem.isPlaceholder ? "#" : subItem.href} legacyBehavior passHref>
                    <SidebarMenuSubButton
                       isActive={pathname === subItem.href || pathname.startsWith(subItem.href + '/')}
                       className={cn(subItem.isPlaceholder && "cursor-not-allowed text-muted-foreground hover:bg-transparent")}
                       aria-disabled={subItem.isPlaceholder}
                       onClick={(e) => subItem.isPlaceholder && e.preventDefault()}
                    >
                      <subItem.icon className={cn("h-4 w-4", subItem.isPlaceholder && "opacity-50")} />
                      <span className={cn(subItem.isPlaceholder && "opacity-50")}>{subItem.label}</span>
                    </SidebarMenuSubButton>
                  </Link>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </Collapsible>
      );
    }

    return (
      <SidebarMenuItem key={item.href}>
        <Link href={item.isPlaceholder ? "#" : item.href} legacyBehavior passHref>
          <SidebarMenuButton
            isActive={isActive}
            tooltip={item.label}
            className={cn(item.isPlaceholder && "cursor-not-allowed text-muted-foreground hover:bg-transparent")}
            aria-disabled={item.isPlaceholder}
            onClick={(e) => item.isPlaceholder && e.preventDefault()}
          >
            {buttonContent}
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
    );
  };
  
  return (
    <SidebarMenu>
      {navItems.map((item) => renderNavItem(item))}
    </SidebarMenu>
  );
}

