#!/bin/bash
# screenshot.sh — 截取 HTML 文件渲染效果
# 用法: bash screenshot.sh <html_file> [width=1280|375|768]
# 输出: workspace-shared/screenshots/<name>-<width>px.png

HTML_FILE="${1:-~/.openclaw/workspace-shared/index.html}"
WIDTH="${2:-1280}"

node /Users/dev_team_alpha/.openclaw/workspace/tools/screenshot/screenshot.js \
  "$HTML_FILE" "" "$WIDTH"
