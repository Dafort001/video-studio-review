export type MotionTestPrompt = {
  id: string;
  title: string;
  firstPass: boolean;
  prompt: string;
};

const BASE_MANNEQUIN_PROMPT = [
  "A simple faceless gender-neutral matte-white 3D presenter mannequin, not a real human actor.",
  "The mannequin has a smooth neutral body shape with no skin texture, no hair, no facial features, no clothing, and no visible gender markers.",
  "The background is a seamless matte light gray studio cyclorama, not pure white, with a faint floor contact shadow so the feet remain readable.",
  "Full-body shot, the entire figure remains visible from head to toe during the whole clip.",
  "Static camera, eye-level perspective, no camera movement, no zoom, no pan, no cut.",
  "Soft neutral lighting.",
  "Calm, professional, natural movement, like a real estate presenter explaining a room.",
  "The mannequin has no facial details, no logos, no accessories, no costume, no dramatic styling.",
  "Movement is slow, controlled, and easy to understand.",
].join(" ");

export const MANNEQUIN_MOTION_NEGATIVE_PROMPT = [
  "Do not crop the body.",
  "Do not show only the upper body.",
  "Do not move the camera.",
  "Do not zoom.",
  "Do not pan.",
  "Do not add cuts.",
  "Do not add extra people.",
  "Do not add furniture.",
  "Do not add a busy background.",
  "Do not create a realistic celebrity or recognizable person.",
  "Do not create a fashion model walk.",
  "Do not create a dance movement.",
  "Do not create a combat pose.",
  "Do not create an action pose.",
  "Do not make the mannequin run.",
  "Do not exaggerate hand gestures.",
  "Do not use pointing fingers unless explicitly requested.",
  "Do not change the character during the clip.",
  "Do not change clothing or body shape during the clip.",
  "Do not let the character leave the frame.",
  "Do not crop the head, hands, feet, or legs.",
].join(" ");

function prompt(movement: string) {
  return `${BASE_MANNEQUIN_PROMPT} ${movement}`;
}

export const MOTION_TEST_PROMPTS: MotionTestPrompt[] = [
  {
    id: "walk_straight_toward_camera",
    title: "Walking straight toward the camera",
    firstPass: true,
    prompt: prompt([
      "Subtle natural hand movement only.",
      "No exaggerated gestures, no dancing, no fashion runway pose, no combat pose, no athletic movement.",
      "The mannequin slowly walks straight toward the camera while facing the camera.",
      "The mannequin starts far enough away and stops before getting too close, so the full body remains visible from head to toe at all times.",
      "The mannequin never gets cropped and never leaves the frame.",
    ].join(" ")),
  },
  {
    id: "walk_toward_camera_gesture_right",
    title: "Walking toward the camera with right-side indicating gesture",
    firstPass: false,
    prompt: prompt([
      "The mannequin slowly walks straight toward the camera while facing the camera.",
      "During the movement, the mannequin makes one subtle open-hand gesture toward the right side of the frame, as if calmly indicating a room feature.",
      "The gesture is restrained, natural, and professional.",
      "No pointing finger, no wide arm swing.",
      "The mannequin starts far enough away and stops before getting too close, so the full body remains visible from head to toe at all times.",
    ].join(" ")),
  },
  {
    id: "walk_toward_camera_gesture_left",
    title: "Walking toward the camera with left-side indicating gesture",
    firstPass: false,
    prompt: prompt([
      "The mannequin slowly walks straight toward the camera while facing the camera.",
      "During the movement, the mannequin makes one subtle open-hand gesture toward the left side of the frame, as if calmly indicating a room feature.",
      "The gesture is restrained, natural, and professional.",
      "No pointing finger, no wide arm swing.",
      "The mannequin starts far enough away and stops before getting too close, so the full body remains visible from head to toe at all times.",
    ].join(" ")),
  },
  {
    id: "turn_45_left",
    title: "Turning about 45 degrees to the left",
    firstPass: false,
    prompt: prompt([
      "The mannequin stands facing the camera, then slowly turns the body about 45 degrees to the left in a calm and natural way, as if preparing to present something beside them.",
      "Minimal hand movement only.",
      "The full body remains visible from head to toe at all times.",
      "The mannequin never gets cropped and never leaves the frame.",
    ].join(" ")),
  },
  {
    id: "turn_45_right",
    title: "Turning about 45 degrees to the right",
    firstPass: false,
    prompt: prompt([
      "The mannequin stands facing the camera, then slowly turns the body about 45 degrees to the right in a calm and natural way, as if preparing to present something beside them.",
      "Minimal hand movement only.",
      "The full body remains visible from head to toe at all times.",
      "The mannequin never gets cropped and never leaves the frame.",
    ].join(" ")),
  },
  {
    id: "walk_left_to_right",
    title: "Walking from left to right across the frame",
    firstPass: true,
    prompt: prompt([
      "Subtle natural hand movement only.",
      "No exaggerated gestures, no dancing, no fashion runway pose, no combat pose, no athletic movement.",
      "The mannequin slowly walks from the left side of the frame to the right side of the frame while keeping the head and torso slightly oriented toward the camera, as if maintaining calm eye contact.",
      "Minimal natural hand movement only.",
      "The mannequin stays fully visible from head to toe, stays centered vertically in the frame, and never leaves the frame.",
    ].join(" ")),
  },
  {
    id: "walk_right_to_left",
    title: "Walking from right to left across the frame",
    firstPass: false,
    prompt: prompt([
      "Subtle natural hand movement only.",
      "No exaggerated gestures, no dancing, no fashion runway pose, no combat pose, no athletic movement.",
      "The mannequin slowly walks from the right side of the frame to the left side of the frame while keeping the head and torso slightly oriented toward the camera, as if maintaining calm eye contact.",
      "Minimal natural hand movement only.",
      "The mannequin stays fully visible from head to toe, stays centered vertically in the frame, and never leaves the frame.",
    ].join(" ")),
  },
  {
    id: "walk_diagonal_from_left",
    title: "Walking diagonally toward the camera from the left",
    firstPass: false,
    prompt: prompt([
      "Subtle natural hand movement only.",
      "No exaggerated gestures, no dancing, no fashion runway pose, no combat pose, no athletic movement.",
      "The mannequin starts on the left side of the frame and slowly walks diagonally toward the camera at approximately a 30-degree angle while facing the camera.",
      "Minimal natural hand movement only.",
      "The mannequin starts far enough away and stops before getting too close, so the full body remains visible from head to toe at all times.",
      "The mannequin never gets cropped and never leaves the frame.",
    ].join(" ")),
  },
  {
    id: "walk_diagonal_from_right",
    title: "Walking diagonally toward the camera from the right",
    firstPass: false,
    prompt: prompt([
      "Subtle natural hand movement only.",
      "No exaggerated gestures, no dancing, no fashion runway pose, no combat pose, no athletic movement.",
      "The mannequin starts on the right side of the frame and slowly walks diagonally toward the camera at approximately a 30-degree angle while facing the camera.",
      "Minimal natural hand movement only.",
      "The mannequin starts far enough away and stops before getting too close, so the full body remains visible from head to toe at all times.",
      "The mannequin never gets cropped and never leaves the frame.",
    ].join(" ")),
  },
  {
    id: "stand_gesture_right",
    title: "Standing and gesturing to the right",
    firstPass: true,
    prompt: prompt([
      "No exaggerated gestures, no dancing, no fashion runway pose, no combat pose, no athletic movement.",
      "The mannequin stands facing the camera, then makes one subtle open-hand gesture toward the right side of the frame, as if calmly indicating a room feature.",
      "The gesture is restrained, natural, and professional.",
      "No pointing finger, no wide arm swing.",
      "The full body remains visible from head to toe at all times.",
    ].join(" ")),
  },
];
