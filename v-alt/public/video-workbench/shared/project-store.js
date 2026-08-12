(function () {
  const currentScript = document.currentScript;
  const projectId = currentScript?.dataset?.projectId || "candidate-10-shared-video-project-v1";
  const configuredSourceProduct = currentScript?.dataset?.sourceProduct || "workbench";
  const localKey = `video-workbench.project.${projectId}`;
  let saveTimer = null;

  function sourceProductFromMeta(meta) {
    const sourceProduct = meta?.sourceProduct || configuredSourceProduct;
    return sourceProduct === "workbench" ? configuredSourceProduct : sourceProduct;
  }

  function readLocalProject() {
    try {
      return JSON.parse(localStorage.getItem(localKey) || "null");
    } catch {
      return null;
    }
  }

  function writeLocalSection(section, data, meta) {
    const now = new Date().toISOString();
    const current = readLocalProject() || {
      schemaVersion: "video_project_v1",
      id: projectId,
      title: "Kandidat 10 - gemeinsames Video-Projekt",
      candidateIndex: 10,
      candidateLabel: "Stadtfassade mit Strasse",
      ownerProducts: ["piximmo", "pixcapture"],
      createdAt: now,
      revision: 0,
      sections: {},
    };
    current.updatedAt = now;
    current.revision = Number(current.revision || 0) + 1;
    current.sections = current.sections || {};
    current.sections[section] = { savedAt: now, data };
    current.lastWriter = {
      page: meta?.page || null,
      sourceProduct: sourceProductFromMeta(meta),
      savedAt: now,
    };
    localStorage.setItem(localKey, JSON.stringify(current));
    return current;
  }

  async function loadProject() {
    try {
      const response = await fetch(`/api/video-workbench/projects/${projectId}`, {
        credentials: "same-origin",
        cache: "no-store",
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json();
      if (payload?.project) {
        localStorage.setItem(localKey, JSON.stringify(payload.project));
        return payload.project;
      }
    } catch (error) {
      console.warn("[video-workbench] Server-Projekt konnte nicht geladen werden.", error);
    }
    return readLocalProject();
  }

  async function saveSectionNow(section, data, meta) {
    const localProject = writeLocalSection(section, data, meta);
    try {
      const response = await fetch(`/api/video-workbench/projects/${projectId}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section,
          data,
          page: meta?.page || null,
          sourceProduct: sourceProductFromMeta(meta),
        }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json();
      if (payload?.project) {
        localStorage.setItem(localKey, JSON.stringify(payload.project));
        return payload.project;
      }
    } catch (error) {
      console.warn("[video-workbench] Server-Speicherung nicht verfuegbar, lokale Kopie bleibt erhalten.", error);
    }
    return localProject;
  }

  function saveSection(section, data, meta) {
    return saveSectionNow(section, data, meta);
  }

  function saveSectionDebounced(section, dataFactory, meta, delayMs) {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      const data = typeof dataFactory === "function" ? dataFactory() : dataFactory;
      saveSectionNow(section, data, meta);
    }, delayMs || 350);
  }

  window.VideoWorkbenchProject = {
    projectId,
    sourceProduct: configuredSourceProduct,
    loadProject,
    saveSection,
    saveSectionDebounced,
    readLocalProject,
  };

  loadProject();
})();
