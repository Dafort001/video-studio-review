import type { SharedStudioProject } from "./shared-video-studio";

export type StudioAccountProduct = SharedStudioProject["product"];

export type StudioAccountBrandAsset = {
  id: string;
  filename: string;
  mimeType: string;
  width: number;
  height: number;
  sizeBytes: number;
  isActive: boolean;
  previewUrl: string;
};

export type StudioAccountPreset = {
  id: string;
  name: string;
  kind: "rhythm" | "cut_sequence";
  definition: unknown;
};

export type StudioAccountFontAsset = {
  assetId: string;
  displayName: string;
  filename: string;
  mimeType: "font/ttf" | "font/otf" | "font/woff2";
  sizeBytes: number;
  rightsConfirmedAt: string;
  licenseReference?: string;
};

export type StudioInternalFontAsset = StudioAccountFontAsset & { storageKey: string };
export type StudioFontAssetBytes = StudioAccountFontAsset & { data: Uint8Array };

export type StudioInternalBrandAsset = Omit<
  StudioAccountBrandAsset,
  "isActive" | "previewUrl"
> & { storageKey: string };

export interface StudioAccountLibraryAdapter {
  readLibrary(actorId: string): Promise<{
    brandAssets: StudioAccountBrandAsset[];
    presets: StudioAccountPreset[];
    fontAssets: StudioAccountFontAsset[];
  }>;
  registerBrandAsset(
    actorId: string,
    input: {
      id: string;
      filename: string;
      data: Uint8Array;
      width: number;
      height: number;
    },
  ): Promise<StudioAccountBrandAsset>;
  savePreset(
    actorId: string,
    input: {
      name: string;
      kind: StudioAccountPreset["kind"];
      definition: Record<string, unknown>;
    },
  ): Promise<{ preset: StudioAccountPreset; created: boolean }>;
  resolveBrandAsset(
    actorId: string,
    assetId: string,
  ): Promise<StudioInternalBrandAsset | null>;
  registerFontAsset(
    actorId: string,
    input: Omit<StudioInternalFontAsset, "storageKey" | "rightsConfirmedAt" | "sizeBytes"> & {
      data: Uint8Array;
      rightsConfirmedAt: Date;
    },
  ): Promise<StudioInternalFontAsset>;
  readFontAsset(
    actorId: string,
    assetId: string,
  ): Promise<StudioFontAssetBytes | null>;
  resolveFontAsset(
    actorId: string,
    assetId: string,
  ): Promise<StudioInternalFontAsset | null>;
}

export class CentralVideoStudioAccountLibrary {
  readonly #adapterFor: (
    product: StudioAccountProduct,
  ) => StudioAccountLibraryAdapter;

  constructor(
    adapterFor: (
      product: StudioAccountProduct,
    ) => StudioAccountLibraryAdapter,
  ) {
    this.#adapterFor = adapterFor;
  }

  readLibrary(product: StudioAccountProduct, actorId: string) {
    const boundActorId = requiredActorId(actorId);
    return this.#adapterFor(product).readLibrary(boundActorId);
  }

  registerBrandAsset(
    product: StudioAccountProduct,
    actorId: string,
    input: Parameters<StudioAccountLibraryAdapter["registerBrandAsset"]>[1],
  ) {
    const boundActorId = requiredActorId(actorId);
    return this.#adapterFor(product).registerBrandAsset(
      boundActorId,
      input,
    );
  }

  savePreset(
    product: StudioAccountProduct,
    actorId: string,
    value: unknown,
  ) {
    const raw =
      value && typeof value === "object" && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : {};
    const name =
      typeof raw.name === "string"
        ? raw.name.trim().replace(/\s+/g, " ").slice(0, 60)
        : "";
    const kind =
      raw.kind === "rhythm" || raw.kind === "cut_sequence" ? raw.kind : null;
    const definition =
      raw.definition &&
      typeof raw.definition === "object" &&
      !Array.isArray(raw.definition)
        ? (raw.definition as Record<string, unknown>)
        : null;
    if (!name || !kind || !definition) {
      throw new StudioAccountLibraryInputError(
        400,
        "Name, Typ und Vorlagendaten sind erforderlich.",
      );
    }
    if (Buffer.byteLength(JSON.stringify(definition), "utf8") > 64 * 1024) {
      throw new StudioAccountLibraryInputError(
        413,
        "Die Vorlage ist zu groß.",
      );
    }
    const boundActorId = requiredActorId(actorId);
    return this.#adapterFor(product).savePreset(boundActorId, {
      name,
      kind,
      definition,
    });
  }

  resolveBrandAsset(
    product: StudioAccountProduct,
    actorId: string,
    assetId: string,
  ) {
    if (!/^vsb_[A-Za-z0-9-]{16,80}$/.test(assetId)) return null;
    const boundActorId = requiredActorId(actorId);
    return this.#adapterFor(product).resolveBrandAsset(
      boundActorId,
      assetId,
    );
  }

  registerFontAsset(
    product: StudioAccountProduct,
    actorId: string,
    input: Parameters<StudioAccountLibraryAdapter["registerFontAsset"]>[1],
  ) {
    return this.#adapterFor(product).registerFontAsset(requiredActorId(actorId), input);
  }

  readFontAsset(product: StudioAccountProduct, actorId: string, assetId: string) {
    if (!/^vsf_[A-Za-z0-9-]{16,80}$/.test(assetId)) return null;
    return this.#adapterFor(product).readFontAsset(requiredActorId(actorId), assetId);
  }

  resolveFontAsset(product: StudioAccountProduct, actorId: string, assetId: string) {
    if (!/^vsf_[A-Za-z0-9-]{16,80}$/.test(assetId)) return null;
    return this.#adapterFor(product).resolveFontAsset(requiredActorId(actorId), assetId);
  }
}

export class StudioAccountLibraryInputError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "StudioAccountLibraryInputError";
    this.status = status;
  }
}

export function validateCentralStudioR2Endpoint(
  value: string,
  accountId: string,
) {
  if (!/^[a-f0-9]{32}$/i.test(accountId)) {
    throw new Error("Central Video Studio R2 account is invalid");
  }
  const url = new URL(value);
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname !== "/" ||
    url.hostname.toLowerCase() !==
      `${accountId.toLowerCase()}.r2.cloudflarestorage.com`
  ) {
    throw new Error("Central Video Studio R2 endpoint is invalid");
  }
  return url.origin;
}

export async function persistBrandAssetUpload<T>(input: {
  storageKey: string;
  data: Uint8Array;
  upload: (storageKey: string, data: Uint8Array) => Promise<void>;
  register: (storageKey: string) => Promise<T>;
  remove: (storageKey: string) => Promise<void>;
}) {
  await input.upload(input.storageKey, input.data);
  try {
    return await input.register(input.storageKey);
  } catch (error) {
    await input.remove(input.storageKey).catch(() => undefined);
    throw error;
  }
}

function requiredActorId(actorId: string) {
  const value = actorId.trim();
  if (!/^[A-Za-z0-9:_-]{1,160}$/.test(value)) {
    throw new StudioAccountLibraryInputError(
      401,
      "Die Werkstatt-Sitzung ist unvollständig.",
    );
  }
  return value;
}
