import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SharedVideoStudioPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const jobReference = single(query?.jobId);
  if (!jobReference) redirect("/dashboard/video-studio/setup");
  redirect(
    `/dashboard/video-studio/setup?jobId=${encodeURIComponent(jobReference)}&studioSession=central`,
  );
}
