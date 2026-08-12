import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getVideoStudioFontMenu } from "@/lib/video-studio-font-menu.server";
import { VideoStudioFontAdmin } from "./VideoStudioFontAdmin";

export const dynamic = "force-dynamic";

export default async function VideoStudioFontsAdminPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/auth/signin");
  return <VideoStudioFontAdmin initialFonts={await getVideoStudioFontMenu()} />;
}
