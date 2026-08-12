#!/usr/bin/env python3
"""Render the canonical PixImmo 9:16 motion-demo library from one still image."""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import subprocess
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageOps


@dataclass(frozen=True)
class Frame:
    center_x: float
    center_y: float
    scale: float
    rotation: float = 0


@dataclass(frozen=True)
class Motion:
    motion_id: str
    start: Frame
    end: Frame
    easing: str = "smooth"


MOTIONS = (
    Motion("PAN_LEFT", Frame(.58, .50, 1.16), Frame(.42, .50, 1.16)),
    Motion("PAN_RIGHT", Frame(.42, .50, 1.16), Frame(.58, .50, 1.16)),
    Motion("TILT_UP", Frame(.50, .58, 1.16), Frame(.50, .42, 1.16)),
    Motion("TILT_DOWN", Frame(.50, .42, 1.16), Frame(.50, .58, 1.16)),
    Motion("DIAGONAL_UP_LEFT", Frame(.58, .58, 1.18), Frame(.42, .42, 1.18)),
    Motion("DIAGONAL_UP_RIGHT", Frame(.42, .58, 1.18), Frame(.58, .42, 1.18)),
    Motion("DIAGONAL_DOWN_LEFT", Frame(.58, .42, 1.18), Frame(.42, .58, 1.18)),
    Motion("DIAGONAL_DOWN_RIGHT", Frame(.42, .42, 1.18), Frame(.58, .58, 1.18)),
    Motion("ZOOM_IN", Frame(.50, .50, 1.00), Frame(.50, .50, 1.28)),
    Motion("ZOOM_OUT", Frame(.50, .50, 1.28), Frame(.50, .50, 1.00)),
    Motion("PUSH_IN_2D", Frame(.46, .49, 1.00), Frame(.54, .51, 1.28)),
    Motion("PULL_OUT_2D", Frame(.54, .51, 1.28), Frame(.46, .49, 1.00)),
    Motion("CRASH_ZOOM_IN", Frame(.50, .50, 1.00), Frame(.50, .50, 1.55), "crash"),
    Motion("CRASH_ZOOM_OUT", Frame(.50, .50, 1.55), Frame(.50, .50, 1.00), "crash"),
    Motion("KEN_BURNS", Frame(.43, .47, 1.05), Frame(.55, .53, 1.25)),
    Motion("ROLL_CLOCKWISE", Frame(.50, .50, 1.25, 0), Frame(.50, .50, 1.25, 6)),
    Motion("ROLL_COUNTERCLOCKWISE", Frame(.50, .50, 1.25, 0), Frame(.50, .50, 1.25, -6)),
    Motion("DUTCH_ANGLE_IN", Frame(.50, .50, 1.25, 0), Frame(.50, .50, 1.25, -5)),
    Motion("DUTCH_ANGLE_OUT", Frame(.50, .50, 1.25, -5), Frame(.50, .50, 1.25, 0)),
    Motion("DRIFT", Frame(.47, .50, 1.14), Frame(.53, .50, 1.14)),
    Motion("FLOAT", Frame(.48, .53, 1.14), Frame(.52, .47, 1.14)),
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--frame-guide", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--duration", type=float, default=1.5)
    parser.add_argument("--fps", type=int, default=60)
    parser.add_argument("--width", type=int, default=540)
    return parser.parse_args()


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def validate_frame_guide(path: Path) -> tuple[int, int]:
    guide = Image.open(path).convert("RGBA")
    width, height = guide.size
    if width * 16 != height * 9:
        raise ValueError(f"Frame guide must be exactly 9:16, got {width}x{height}")
    if guide.getpixel((width // 2, height // 2))[3] != 0:
        raise ValueError("Frame guide center must be transparent")
    return width, height


def ease(value: float, kind: str) -> float:
    if kind == "crash":
        return 1 - (1 - value) ** 3
    return value * value * (3 - 2 * value)


def interpolate(start: float, end: float, amount: float) -> float:
    return start + (end - start) * amount


def crop_box(image_w: int, image_h: int, output_aspect: float, frame: Frame) -> tuple[int, int, int, int]:
    source_aspect = image_w / image_h
    if source_aspect >= output_aspect:
        crop_h = image_h / frame.scale
        crop_w = crop_h * output_aspect
    else:
        crop_w = image_w / frame.scale
        crop_h = crop_w / output_aspect
    center_x = frame.center_x * image_w
    center_y = frame.center_y * image_h
    left = max(0, min(image_w - crop_w, center_x - crop_w / 2))
    top = max(0, min(image_h - crop_h, center_y - crop_h / 2))
    return round(left), round(top), round(left + crop_w), round(top + crop_h)


def render_frame(source: Image.Image, frame: Frame, width: int, height: int) -> Image.Image:
    source_w, source_h = source.size
    if abs(frame.rotation) < .001:
        box = crop_box(source_w, source_h, width / height, frame)
        return source.crop(box).resize((width, height), Image.Resampling.LANCZOS)

    # Rotation needs source pixels beyond the final portrait canvas. The guide's
    # 9:16 aperture remains the final crop; overscan only prevents dark corners.
    overscan = 1.25
    base_frame = Frame(frame.center_x, frame.center_y, max(1, frame.scale / overscan))
    box = crop_box(source_w, source_h, width / height, base_frame)
    large_w, large_h = round(width * overscan), round(height * overscan)
    large = source.crop(box).resize((large_w, large_h), Image.Resampling.LANCZOS)
    rotated = large.rotate(-frame.rotation, resample=Image.Resampling.BICUBIC, expand=False)
    left = (large_w - width) // 2
    top = (large_h - height) // 2
    return rotated.crop((left, top, left + width, top + height))


def render_motion(
    source: Image.Image,
    motion: Motion,
    destination: Path,
    duration: float,
    fps: int,
    width: int,
    height: int,
) -> None:
    frame_count = round(duration * fps)
    command = [
        "ffmpeg", "-y", "-loglevel", "error",
        "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{width}x{height}", "-r", str(fps), "-i", "-",
        "-an", "-t", f"{duration:.3f}", "-c:v", "libx264", "-preset", "fast", "-crf", "22",
        "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(destination),
    ]
    process = subprocess.Popen(command, stdin=subprocess.PIPE)
    try:
        for index in range(frame_count):
            amount = ease(index / max(1, frame_count - 1), motion.easing)
            frame = Frame(
                interpolate(motion.start.center_x, motion.end.center_x, amount),
                interpolate(motion.start.center_y, motion.end.center_y, amount),
                interpolate(motion.start.scale, motion.end.scale, amount),
                interpolate(motion.start.rotation, motion.end.rotation, amount),
            )
            rendered = render_frame(source, frame, width, height)
            assert process.stdin is not None
            process.stdin.write(rendered.tobytes())
    finally:
        if process.stdin:
            process.stdin.close()
        return_code = process.wait()
    if return_code != 0:
        raise RuntimeError(f"Render failed for {motion.motion_id}")


def main() -> None:
    args = parse_args()
    guide_width, guide_height = validate_frame_guide(args.frame_guide)
    if args.width % 2:
        raise ValueError("Output width must be even for H.264")
    height = round(args.width * guide_height / guide_width)
    if height % 2:
        height += 1
    if not math.isclose(args.duration, 1.5):
        raise ValueError("The canonical motion-library duration is 1.5 seconds")

    source = ImageOps.exif_transpose(Image.open(args.source)).convert("RGB")
    args.output.mkdir(parents=True, exist_ok=True)
    for motion in MOTIONS:
        destination = args.output / f"{motion.motion_id.lower().replace('_', '-')}.mp4"
        render_motion(source, motion, destination, args.duration, args.fps, args.width, height)
        print(destination)

    manifest = {
        "version": 1,
        "source": {"filename": args.source.name, "sha256": sha256(args.source), "size": list(source.size)},
        "frameGuide": {"filename": args.frame_guide.name, "sha256": sha256(args.frame_guide), "size": [guide_width, guide_height]},
        "durationSeconds": args.duration,
        "fps": args.fps,
        "outputSize": [args.width, height],
        "motions": [motion.motion_id for motion in MOTIONS],
    }
    (args.output / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
