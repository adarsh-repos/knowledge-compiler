"""
Detect map/figure embedded text labels that should not become paragraph blocks.
"""

from __future__ import annotations

import re

from backend.pipeline.models import Coordinates, LayoutBlock, PageLayout

_CAPTION_RE = re.compile(r"^(Fig\.?|Figure|Map)\s*\d", re.I)
_MIN_IMAGE_SIDE = 120


def _overlap_ratio(inner: Coordinates, outer: Coordinates) -> float:
    x0 = max(inner.x0, outer.x0)
    y0 = max(inner.y0, outer.y0)
    x1 = min(inner.x1, outer.x1)
    y1 = min(inner.y1, outer.y1)
    if x1 <= x0 or y1 <= y0:
        return 0.0
    inter = (x1 - x0) * (y1 - y0)
    inner_area = max((inner.x1 - inner.x0) * (inner.y1 - inner.y0), 1.0)
    return inter / inner_area


def large_image_regions(page: PageLayout) -> list[Coordinates]:
    regions: list[Coordinates] = []
    for block in page.blocks:
        if block.type != "image":
            continue
        w = block.coordinates.x1 - block.coordinates.x0
        h = block.coordinates.y1 - block.coordinates.y0
        if w >= _MIN_IMAGE_SIDE and h >= _MIN_IMAGE_SIDE:
            regions.append(block.coordinates)
    return regions


def is_caption_text(text: str) -> bool:
    return bool(_CAPTION_RE.search((text or "").strip()))


def is_map_embedded_text(text: str) -> bool:
    """Geographic labels like FRANCE, ICELAND(DENMARK), ATLANTIC SEA."""
    t = (text or "").strip()
    if not t or is_caption_text(t):
        return False
    if len(t) > 90:
        return False
    letters = [c for c in t if c.isalpha()]
    if len(letters) < 2:
        return False
    upper_ratio = sum(1 for c in letters if c.isupper()) / len(letters)
    if upper_ratio < 0.6:
        return False
    # Real sentences below maps have lowercase words and punctuation
    if any(ch in t for ch in ".?!;") and len(t) > 30:
        return False
    words = t.split()
    if len(words) >= 4 and any(w[0].islower() for w in words if w):
        return False
    return True


def text_embedded_in_image(
    coords: Coordinates,
    image_regions: list[Coordinates],
    *,
    overlap_threshold: float = 0.3,
) -> bool:
    for region in image_regions:
        if _overlap_ratio(coords, region) >= overlap_threshold:
            return True
    return False


def should_skip_map_label(
    layout: LayoutBlock,
    image_regions: list[Coordinates],
) -> bool:
    """True when text is part of a map/figure image, not standalone body text."""
    if layout.type != "text":
        return False
    text = (layout.text or "").strip()
    if not text or is_caption_text(text):
        return False
    if not image_regions:
        return False
    if not text_embedded_in_image(layout.coordinates, image_regions):
        return False
    return is_map_embedded_text(text) or _overlap_ratio(
        layout.coordinates, image_regions[0]
    ) >= 0.5
