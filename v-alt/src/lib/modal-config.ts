export type ModalPipelineContract =
  | "capture-v2"
  | "legacy-v1"
  | "processed-image-analysis"
  | "room-dimensions"
  | "exposee-v3-semantic-package"
  | "object-video-render";

export type ModalPipelineTarget = {
  contract: ModalPipelineContract;
  envKey: string;
  url: string;
  label: string;
};

type ModalTriggerResponse = Record<string, unknown>;

const ACTIVE_CAPTURE_V2_MODAL_URL =
  "https://dafort001--pix-gateway-fastapi-app.modal.run/pixcapture/v2/trigger";
const ACTIVE_OBJECT_VIDEO_RENDER_MODAL_URL =
  "https://dafort001--pix-social-video-social-video-api.modal.run";

const CONTRACT_ENV_KEYS: Record<ModalPipelineContract, string> = {
  "capture-v2": "MODAL_PIPELINE_URL",
  "legacy-v1": "MODAL_LEGACY_PIPELINE_URL",
  "processed-image-analysis": "MODAL_PROCESSED_IMAGE_ANALYSIS_URL",
  "room-dimensions": "MODAL_ROOM_DIMENSIONS_URL",
  "exposee-v3-semantic-package": "MODAL_EXPOSEE_V3_URL",
  "object-video-render": "MODAL_OBJECT_VIDEO_RENDER_URL",
};

const BLOCKED_ENDPOINT_MARKERS: Array<{
  marker: string;
  reason: string;
  contracts: ModalPipelineContract[];
}> = [
  {
    marker: "archiviz-pipeline-2026",
    reason: "old filename/phone worker that does not understand portal payloads",
    contracts: ["capture-v2", "legacy-v1"],
  },
  {
    marker: "pix-pipeline-trigger-pipeline",
    reason: "stopped legacy trigger worker that no longer serves portal payloads",
    contracts: ["capture-v2", "legacy-v1"],
  },
];

function getContractHint(contract: ModalPipelineContract) {
  if (contract === "capture-v2") {
    return "Set MODAL_PIPELINE_URL to the active V2 gateway endpoint, or leave it empty to use the shared active gateway.";
  }
  if (contract === "processed-image-analysis") {
    return "Set MODAL_PROCESSED_IMAGE_ANALYSIS_URL to the active worker that accepts ProcessedImage R2-key analysis jobs.";
  }
  if (contract === "room-dimensions") {
    return "Set MODAL_ROOM_DIMENSIONS_URL to the isolated DA3METRIC-LARGE worker endpoint for lab-only room dimension tests.";
  }
  if (contract === "exposee-v3-semantic-package") {
    return "Set MODAL_EXPOSEE_V3_URL to the shared Modal Exposee V3 semantic-package endpoint used by PixImmo and PixCapture.";
  }
  if (contract === "object-video-render") {
    return "Set MODAL_OBJECT_VIDEO_RENDER_URL to the Modal object-video renderer. Vercel must only orchestrate this worker, never render MP4s itself.";
  }
  if (contract === "legacy-v1") {
    return "Set MODAL_LEGACY_PIPELINE_URL only if you still operate a real V1 completion webhook worker.";
  }

  return "Set the matching Modal endpoint only for an active PixImmo contract.";
}

export function getModalPipelineTarget(contract: ModalPipelineContract): ModalPipelineTarget {
  const envKey = CONTRACT_ENV_KEYS[contract];
  const configuredUrl = process.env[envKey]?.trim();
  const blockedConfig = configuredUrl
    ? BLOCKED_ENDPOINT_MARKERS.find(
        (entry) => entry.contracts.includes(contract) && configuredUrl.includes(entry.marker),
      )
    : null;
  const rawUrl =
    contract === "capture-v2" && (!configuredUrl || blockedConfig)
      ? ACTIVE_CAPTURE_V2_MODAL_URL
      : contract === "object-video-render" && !configuredUrl
        ? ACTIVE_OBJECT_VIDEO_RENDER_MODAL_URL
      : configuredUrl;

  if (!rawUrl) {
    throw new Error(`Modal ${contract} endpoint is not configured. ${getContractHint(contract)}`);
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error(`${envKey} is not a valid URL: ${rawUrl}`);
  }

  if (parsed.protocol !== "https:") {
    throw new Error(`${envKey} must use https: ${rawUrl}`);
  }

  if (!parsed.hostname.endsWith(".modal.run")) {
    throw new Error(`${envKey} must point to a modal.run host: ${rawUrl}`);
  }

  const blocked = BLOCKED_ENDPOINT_MARKERS.find(
    (entry) => entry.contracts.includes(contract) && rawUrl.includes(entry.marker),
  );
  if (blocked) {
    throw new Error(`${envKey} points to a blocked endpoint (${blocked.reason}): ${rawUrl}`);
  }

  return {
    contract,
    envKey,
    url: parsed.toString(),
    label: `${envKey}${blockedConfig ? " fallback" : ""} -> ${parsed.hostname}${parsed.pathname}`,
  };
}

export async function parseModalTriggerResponse(
  response: Response,
  target: ModalPipelineTarget,
): Promise<ModalTriggerResponse> {
  const responseText = await response.text();

  if (!responseText.trim()) {
    return {};
  }

  let data: unknown;
  try {
    data = JSON.parse(responseText);
  } catch {
    throw new Error(`${target.label} returned non-JSON: ${responseText.slice(0, 240)}`);
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error(`${target.label} returned an unexpected response payload.`);
  }

  const modalData = data as ModalTriggerResponse;
  const message = typeof modalData.message === "string" ? modalData.message : "";
  const status = typeof modalData.status === "string" ? modalData.status : "";

  if (message.includes("Pipeline started for None")) {
    throw new Error(
      `${target.label} behaved like the deprecated filename/phone trigger ("Pipeline started for None").`,
    );
  }

  if (!status && modalData.ok !== true) {
    throw new Error(`${target.label} returned no usable trigger status.`);
  }

  return modalData;
}
