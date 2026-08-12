import { NextResponse } from "next/server";
import { centralVideoStudioAccountLibrary } from "@/lib/central-video-studio-account-library.server";
import {
  CentralVideoStudioSessionError,
  readCentralVideoStudioSession,
} from "@/lib/central-video-studio-session.server";
import {
  sharedStudioRequest,
  SharedVideoStudioError,
} from "@/lib/shared-video-studio";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Context = { params: Promise<{ projectId: string; action?: string[] }> };

export async function GET(request: Request, context: Context) {
  return proxy(context, "GET", request);
}

export async function PATCH(request: Request, context: Context) {
  return proxy(context, "PATCH", request);
}

export async function PUT(request: Request, context: Context) {
  return proxy(context, "PUT", request);
}

export async function POST(request: Request, context: Context) {
  return proxy(context, "POST", request);
}

async function proxy(context: Context, method: "GET" | "PATCH" | "PUT" | "POST", request?: Request) {
  const { projectId, action = [] } = await context.params;
  if (!/^vsp_[a-f0-9]{32}$/.test(projectId) || !allowedAction(method, action)) {
    return NextResponse.json({ error: "Werkstatt-Route nicht gefunden." }, { status: 404 });
  }
  try {
    const current = await readCentralVideoStudioSession(projectId);
    if (method === "GET" && action.length === 0) {
      return NextResponse.json({ project: current.project });
    }

    const suffix = action.length ? `/${action.map(encodeURIComponent).join("/")}` : "";
    let body = request && method !== "GET" ? await request.text() : undefined;
    if (method === "PUT" && action[0] === "brand-overlay" && body) {
      const value = parseObjectBody(body);
      if (value.enabled === true) {
        const assetId = typeof value.assetId === "string" ? value.assetId : "";
        const asset = await centralVideoStudioAccountLibrary.resolveBrandAsset(
          current.project.product,
          current.actorId,
          assetId,
        );
        if (!asset) {
          return NextResponse.json(
            { error: "Dieses Logo gehört nicht zum freigegebenen Kundenkonto." },
            { status: 403 },
          );
        }
        value.asset = asset;
      }
      delete value.assetId;
      body = JSON.stringify(value);
    }
    const query = method === "GET" && request ? new URL(request.url).search : "";
    const result = await sharedStudioRequest<unknown>(`/v1/video-projects/${projectId}${suffix}${query}`, current.accessToken, {
      method,
      headers: body ? { "content-type": "application/json" } : undefined,
      body,
    });
    return NextResponse.json(result, { status: method === "POST" && ["renders", "analysis"].includes(action[0] ?? "") ? 202 : 200 });
  } catch (error) {
    if (error instanceof CentralVideoStudioSessionError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof SharedVideoStudioError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
    }
    console.error("[shared-video-studio] Central proxy failed", {
      errorName: error instanceof Error ? error.name : "UnknownError",
    });
    return NextResponse.json({ error: "Die Werkstatt-Anfrage konnte nicht verarbeitet werden." }, { status: 500 });
  }
}

function parseObjectBody(body: string) {
  let value: unknown;
  try {
    value = JSON.parse(body);
  } catch {
    throw new SharedVideoStudioError(400, "Die Logo-Einstellung ist ungültig.");
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new SharedVideoStudioError(400, "Die Logo-Einstellung ist ungültig.");
  }
  return value as Record<string, unknown>;
}

function allowedAction(method: string, action: string[]) {
  if (action.some((part) => !/^[A-Za-z0-9:_-]+$/.test(part))) return false;
  if (method === "GET") return action.length === 0
    || (action.length === 1 && action[0] === "scene-spec")
    || (action.length === 2 && action[0] === "jobs")
    || (action.length === 3 && action[0] === "versions" && action[2] === "scene-spec")
    || (action.length === 3 && action[0] === "assets" && action[2] === "analysis");
  if (method === "PATCH") return action.length === 0 || (action.length === 2 && action[0] === "takes");
  if (method === "PUT") return action.length === 1 && (action[0] === "selection" || action[0] === "timeline" || action[0] === "brand-overlay");
  if (method === "POST") return (action.length === 1 && ["direction-review", "renders", "analysis", "applyPattern", "apply-template", "fitToTarget", "versions", "approve"].includes(action[0]))
    || (action.length === 3 && action[0] === "takes" && action[2] === "review");
  return false;
}
