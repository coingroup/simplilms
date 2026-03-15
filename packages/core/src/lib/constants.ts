import type { UserRole } from "@simplilms/database";
import {
  LayoutDashboard,
  Users,
  FileText,
  GraduationCap,
  UserCheck,
  BookOpen,
  MessageSquare,
  BarChart3,
  Settings,
  ClipboardList,
  DollarSign,
  Calendar,
  User,
  Building2,
  Award,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

/**
 * Sidebar navigation items per role.
 */
export const SIDEBAR_NAV: Record<UserRole, NavItem[]> = {
  super_admin: [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Prospects", href: "/admin/prospects", icon: Users },
    { label: "Applications", href: "/admin/applications", icon: FileText },
    { label: "Enrollments", href: "/admin/enrollments", icon: GraduationCap },
    { label: "Students", href: "/admin/students", icon: UserCheck },
    { label: "Instructors", href: "/admin/instructors", icon: BookOpen },
    { label: "Courses", href: "/admin/courses", icon: BookOpen },
    { label: "Certificates", href: "/admin/certificates", icon: Award },
    { label: "Classes", href: "/admin/classes", icon: Calendar },
    { label: "Messages", href: "/admin/messages", icon: MessageSquare },
    { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { label: "Tenants", href: "/admin/tenants", icon: Building2 },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ],
  school_rep: [
    { label: "Dashboard", href: "/rep", icon: LayoutDashboard },
    { label: "Prospects", href: "/rep/prospects", icon: Users },
    { label: "Applications", href: "/rep/applications", icon: FileText },
    { label: "Messages", href: "/rep/messages", icon: MessageSquare },
  ],
  teacher_paid: [
    { label: "Dashboard", href: "/teacher", icon: LayoutDashboard },
    { label: "Courses", href: "/teacher/courses", icon: GraduationCap },
    { label: "Classes", href: "/teacher/classes", icon: BookOpen },
    { label: "Attendance", href: "/teacher/attendance", icon: ClipboardList },
    { label: "Earnings", href: "/teacher/earnings", icon: DollarSign },
    { label: "Messages", href: "/teacher/messages", icon: MessageSquare },
  ],
  teacher_unpaid: [
    { label: "Dashboard", href: "/teacher", icon: LayoutDashboard },
    { label: "Courses", href: "/teacher/courses", icon: GraduationCap },
    { label: "Classes", href: "/teacher/classes", icon: BookOpen },
    { label: "Attendance", href: "/teacher/attendance", icon: ClipboardList },
    { label: "Messages", href: "/teacher/messages", icon: MessageSquare },
  ],
  student: [
    { label: "Dashboard", href: "/student", icon: LayoutDashboard },
    { label: "Profile", href: "/profile", icon: User },
    { label: "Courses", href: "/student/courses", icon: GraduationCap },
    { label: "Certificates", href: "/student/certificates", icon: Award },
    { label: "Payments", href: "/student/payments", icon: DollarSign },
    { label: "Messages", href: "/student/messages", icon: MessageSquare },
    { label: "Classes", href: "/student/classes", icon: BookOpen },
  ],
};
