#!/usr/bin/env bash
# Usage: download-models.sh [core|all]
MODE=${1:-core}
BASE="$HOME/.openclaw/workspace-shared/models"
mkdir -p $BASE

if [[ "$MODE" == "core" || "$MODE" == "all" ]]; then
  echo "Downloading SAM2 tiny (~150MB)..."
  wget -q --show-progress -O $BASE/sam2.1_hiera_tiny.pt \
    https://dl.fbaipublicfiles.com/segment_anything_2/092824/sam2.1_hiera_tiny.pt
  
  echo "YOLOv11n auto-downloads on first use via ultralytics"
  echo "DINOv2 auto-downloads via timm/huggingface"
fi
