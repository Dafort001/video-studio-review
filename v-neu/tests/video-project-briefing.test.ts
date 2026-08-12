import assert from "node:assert/strict";
import test from "node:test";

import {
  buildVideoTimelinePlan,
  defaultVideoProjectBriefing,
  inferVideoImageRole,
  videoCandidateIndexForJob,
  videoProjectIdForJob,
  type VideoProjectSourceImage,
} from "../src/lib/video-project-briefing.ts";

function image(index: number, roomLabel: string, altText = ""): VideoProjectSourceImage {
  return {
    id: `image-${index}`,
    filename: `${String(index).padStart(2, "0")}-${roomLabel}.jpg`,
    imageUrl: `https://example.test/${index}.jpg`,
    roomLabel,
    altText,
    width: 3000,
    height: 2000,
    order: index,
  };
}

test("infers exterior scenes from room labels or descriptive text", () => {
  assert.equal(inferVideoImageRole(image(1, "Garten")), "exterior");
  assert.equal(inferVideoImageRole(image(2, "Unklar", "Blick über den See und das grüne Ufer")), "exterior");
  assert.equal(inferVideoImageRole(image(3, "Wohnzimmer")), "interior");
});

test("uses stable project identifiers for the same PixImmo job", () => {
  assert.equal(videoProjectIdForJob("SCQ-NTX9R"), "job-scq-ntx9r-shared-video-project-v1");
  assert.equal(videoCandidateIndexForJob("SCQ-NTX9R"), videoCandidateIndexForJob("SCQ-NTX9R"));
  assert.notEqual(videoCandidateIndexForJob("SCQ-NTX9R"), videoCandidateIndexForJob("ABC-12345"));
});

test("builds a reproducible exterior-focused long timeline with seeded text scenes", () => {
  const images = [
    image(1, "Außenansicht"), image(2, "Garten"), image(3, "Balkon"), image(4, "Park"),
    image(5, "Wohnzimmer"), image(6, "Wohnzimmer"), image(7, "Küche"), image(8, "Schlafzimmer"),
    image(9, "Badezimmer"), image(10, "Flur"), image(11, "Garten"), image(12, "See"),
  ];
  const briefing = defaultVideoProjectBriefing({
    jobId: "SCQ-NTX9R",
    projectName: "SEEBURG",
    locationLabel: "Hamburg",
    images,
  });
  briefing.lengthPreset = "long";
  briefing.targetDurationSeconds = 60;
  briefing.focus = "exterior";
  briefing.exteriorShare = 0.6;
  briefing.texts.opening = { title: "SEEBURG", subtitle: "Hamburg" };
  briefing.texts.exterior = { title: "Direkt am Grün", subtitle: "Außenräume im Mittelpunkt" };

  const plan = buildVideoTimelinePlan({
    projectName: "SEEBURG",
    candidateIndex: 123456,
    images,
    briefing,
    now: "2026-08-08T12:00:00.000Z",
  });

  assert.equal(plan.version, "piximmo_video_timeline_v1");
  assert.equal(plan.timeline[0].scene_type, "exterior");
  assert.equal(plan.timeline.at(-1)?.scene_type, "exterior");
  assert.equal(plan.timeline.reduce((sum, take) => sum + take.duration_seconds, 0), 60);
  assert.deepEqual(plan.text_by_filename[plan.timeline[0].filename], {
    enabled: true,
    presetId: "editorial",
    title: "SEEBURG",
    subtitle: "Hamburg",
  });
  assert.ok(Object.values(plan.text_by_filename).some((text) => text.title === "Direkt am Grün"));
});
