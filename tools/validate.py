"""Validate this dependency-free static portfolio before preview or publishing."""

from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "src"
EXPECTED = {
    "infinity", "lumen", "water-dispenser", "study-table", "pipe-lamp", "ring-necklace"
}


class PortfolioParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids = []
        self.projects = []
        self.dialogs = []
        self.references = []
        self.anchors = []
        self.unlabeled_images = []
        self.videos = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            self.ids.append(attrs["id"])
        if "data-project" in attrs:
            self.projects.append(attrs["data-project"])
        if tag == "dialog":
            self.dialogs.append(attrs["id"])
        if tag == "img" and not attrs.get("alt"):
            self.unlabeled_images.append(attrs.get("src"))
        if tag == "video":
            self.videos.append(attrs)
        for key in ("src", "poster", "href"):
            value = attrs.get(key, "")
            if value.startswith("./"):
                self.references.append(value)
            if value.startswith("#"):
                self.anchors.append(value[1:])


page = PortfolioParser()
page.feed((SOURCE / "index.html").read_text(encoding="utf-8"))
duplicates = [key for key, count in Counter(page.ids).items() if count > 1]
assert not duplicates, f"Duplicate IDs: {duplicates}"
assert set(page.projects) == EXPECTED, f"Wrong project scope: {set(page.projects)}"
assert set(page.dialogs) == {f"project-{name}" for name in EXPECTED}
assert len(page.dialogs) == 6
assert not page.unlabeled_images, f"Unlabeled images: {page.unlabeled_images}"
assert all(anchor in page.ids for anchor in page.anchors), "Broken in-page link"
assert all("controls" in video and video.get("preload") == "none" for video in page.videos)
missing = [ref for ref in page.references if not (SOURCE / unquote(urlsplit(ref).path)).is_file()]
assert not missing, f"Missing local assets: {missing}"

for stylesheet in SOURCE.glob("*.css"):
    css = stylesheet.read_text(encoding="utf-8")
    assert css.count("{") == css.count("}"), f"Unbalanced stylesheet blocks: {stylesheet.name}"
    assert "prefers-reduced-motion" in css, f"Missing motion fallback: {stylesheet.name}"
print(f"PASS: 6 projects, {len(page.ids)} unique IDs, {len(page.references)} local references, {len(page.videos)} user-controlled videos.")
