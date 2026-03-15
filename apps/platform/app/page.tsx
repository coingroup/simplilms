import { redirect } from "next/navigation";
import { getUser, getDashboardPath } from "@simplilms/auth/server";

/**
 * Root page — redirects to the appropriate dashboard or login.
 */
export default async function RootPage() {
  const { user } = await getUser();

  if (user) {
    redirect(getDashboardPath(user.role));
  }

  redirect("/login");
}
