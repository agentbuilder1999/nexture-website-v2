#!/usr/bin/env bash
# Usage: download-datasets.sh [small|large|all]
MODE=${1:-small}
BASE="$HOME/.openclaw/workspace-shared/datasets"
mkdir -p $BASE

if [[ "$MODE" == "small" || "$MODE" == "all" ]]; then
  echo "Downloading Kvasir-SEG (~46MB)..."
  wget -q --show-progress -O $BASE/kvasir-seg.zip \
    https://datasets.simula.no/downloads/kvasir-seg.zip
  
  echo "Downloading CVC-ClinicDB info..."
  echo "Manual: https://polyp.grand-challenge.org/CVCClinicDB/" > $BASE/cvc-clinicdb.txt
fi

if [[ "$MODE" == "large" || "$MODE" == "all" ]]; then
  echo "Downloading Kvasir v2 (~3.5GB)..."
  wget -q --show-progress -O $BASE/kvasir-v2.zip \
    https://datasets.simula.no/downloads/kvasir/kvasir-dataset-v2.zip
  
  echo "WCEbleedGen requires manual: https://zenodo.org/record/7789108"
fi
