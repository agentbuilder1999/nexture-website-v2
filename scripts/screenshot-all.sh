#!/bin/bash
# screenshot-all.sh — 截取 desktop/tablet/mobile 三个断点
# 用法: bash screenshot-all.sh <html_file>

HTML_FILE="${1:-~/.openclaw/workspace-shared/index.html}"
SCRIPT="node /Users/dev_team_alpha/.openclaw/workspace/tools/screenshot/screenshot.js"

echo "📸 截图中..."
$SCRIPT "$HTML_FILE" "" 1280 && echo "  ✅ Desktop (1280px)"
$SCRIPT "$HTML_FILE" "" 768  && echo "  ✅ Tablet  (768px)"
$SCRIPT "$HTML_FILE" "" 375  && echo "  ✅ Mobile  (375px)"
echo "📁 保存在: $(dirname $HTML_FILE)/screenshots/"
