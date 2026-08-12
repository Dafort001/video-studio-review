import { cookies } from "next/headers";
import {
  sharedStudioRequest,
  sharedWorkbenchCookieName,
  SharedVideoStudioError,
  type SharedStudioProject,
} from "./shared-video-studio";

export type CentralVideoStudioSession = {
  project: SharedStudioProject;
  actorId: string;
  accessToken: string;
};

export class CentralVideoStudioSessionError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "CentralVideoStudioSessionError";
    this.status = status;
  }
}

export async function readCentralVideoStudioSession(
  projectId: string,
): Promise<CentralVideoStudioSession> {
  if (!/^vsp_[a-f0-9]{32}$/.test(projectId)) {
    throw new CentralVideoStudioSessionError(404, "Werkstatt-Projekt nicht gefunden.");
  }
  const accessToken = (await cookies()).get(
    sharedWorkbenchCookieName(projectId),
  )?.value;
  if (!accessToken) {
    throw new CentralVideoStudioSessionError(
      401,
      "Die Werkstatt-Sitzung ist abgelaufen. Bitte den Auftrag erneut öffnen.",
    );
  }

  try {
    const current = await sharedStudioRequest<{
      project: SharedStudioProject;
      actorId: string;
    }>(`/v1/video-projects/${encodeURIComponent(projectId)}`, accessToken);
    if (current.project.id !== projectId) {
      throw new CentralVideoStudioSessionError(403, "Werkstatt-Zugriff verweigert.");
    }
    return { ...current, accessToken };
  } catch (error) {
    if (error instanceof CentralVideoStudioSessionError) throw error;
    if (error instanceof SharedVideoStudioError) {
      throw new CentralVideoStudioSessionError(error.status, error.message);
    }
    throw new CentralVideoStudioSessionError(
      502,
      "Die Werkstatt-Sitzung konnte nicht geprüft werden.",
    );
  }
}
