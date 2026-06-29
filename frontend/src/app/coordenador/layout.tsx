import type { ReactNode } from "react";
import { CoordinatorLayout } from "@/components/coordenador/CoordinatorLayout";

interface CoordinatorRouteLayoutProps {
  children: ReactNode;
}

export default function CoordinatorRouteLayout({
  children,
}: CoordinatorRouteLayoutProps) {
  return <CoordinatorLayout>{children}</CoordinatorLayout>;
}
