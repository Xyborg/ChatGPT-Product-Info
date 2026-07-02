#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
EXT_DIR="$ROOT_DIR/chrome-extension"
DIST_DIR="$ROOT_DIR/dist"
STAGE_DIR="$ROOT_DIR/.tmp-extension-build"

if [[ ! -f "$EXT_DIR/manifest.json" ]]; then
  echo "Missing chrome-extension/manifest.json" >&2
  exit 1
fi

VERSION="$(node -e "const m=require(process.argv[1]); console.log(m.version)" "$EXT_DIR/manifest.json")"
RAW_NAME="$(node -e "const m=require(process.argv[1]); console.log(m.name)" "$EXT_DIR/manifest.json")"
SLUG="$(node -e "const s=process.argv[1].toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); console.log(s)" "$RAW_NAME")"
ZIP_NAME="${SLUG}-v${VERSION}.zip"
ZIP_PATH="$DIST_DIR/$ZIP_NAME"

REQUIRED_FILES=(
  "manifest.json"
  "content-script.js"
  "geo-core.js"
  "geo-ui.js"
  "popup.html"
  "popup.js"
  "styles.css"
  "icons/icon16.png"
  "icons/icon19.png"
  "icons/icon32.png"
  "icons/icon48.png"
  "icons/icon128.png"
  "icons/logobubble.svg"
  "assets/icons-ui/check.svg"
  "assets/icons-ui/error.svg"
  "assets/icons-ui/search.svg"
  "assets/icons-ui/warning.svg"
)

echo "Building $RAW_NAME v$VERSION"

for file in "${REQUIRED_FILES[@]}"; do
  if [[ ! -f "$EXT_DIR/$file" ]]; then
    echo "Missing required extension file: chrome-extension/$file" >&2
    exit 1
  fi
done

rm -rf "$STAGE_DIR"
mkdir -p "$STAGE_DIR" "$DIST_DIR"

for file in "${REQUIRED_FILES[@]}"; do
  mkdir -p "$STAGE_DIR/$(dirname "$file")"
  cp "$EXT_DIR/$file" "$STAGE_DIR/$file"
done

if find "$STAGE_DIR" -name ".DS_Store" -o -name "*.map" -o -name "*.pem" -o -name "*.zip" | grep -q .; then
  echo "Unexpected non-release file in staging directory" >&2
  find "$STAGE_DIR" -name ".DS_Store" -o -name "*.map" -o -name "*.pem" -o -name "*.zip" >&2
  exit 1
fi

rm -f "$ZIP_PATH" "$ZIP_PATH.sha256"

if command -v ditto >/dev/null 2>&1; then
  ditto -c -k --norsrc "$STAGE_DIR" "$ZIP_PATH"
elif command -v zip >/dev/null 2>&1; then
  (
    cd "$STAGE_DIR"
    zip -qr "$ZIP_PATH" .
  )
else
  echo "Neither ditto nor zip is available." >&2
  exit 1
fi

if command -v shasum >/dev/null 2>&1; then
  shasum -a 256 "$ZIP_PATH" > "$ZIP_PATH.sha256"
fi

echo "Created $ZIP_PATH"
if [[ -f "$ZIP_PATH.sha256" ]]; then
  echo "Created $ZIP_PATH.sha256"
fi

rm -rf "$STAGE_DIR"
