import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LegacyAdminVideoStudioWorkbench({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const jobReference = single(query?.jobId);
  redirect(
    jobReference
      ? `/dashboard/admin/video-studio?jobId=${encodeURIComponent(jobReference)}&studioSession=central`
      : "/dashboard/admin/video-studio?studioSession=central",
  );
}
