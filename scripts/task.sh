#!/usr/bin/env bash
# Nexture task management CLI
DB="$HOME/.openclaw/workspace-shared/task-board.db"
CMD=$1; shift

case "$CMD" in
  push)   sqlite3 "$DB" "INSERT INTO tasks(agent,title,detail,priority,type) VALUES('$1','$2','$3','${4:-medium}','${5:-heavy}'); SELECT last_insert_rowid();" ;;
  done)   sqlite3 "$DB" "UPDATE tasks SET status='done',updated=CURRENT_TIMESTAMP WHERE id=$1;" ;;
  fail)   sqlite3 "$DB" "UPDATE tasks SET status='failed',updated=CURRENT_TIMESTAMP WHERE id=$1;" ;;
  active) sqlite3 "$DB" "UPDATE tasks SET status='active',session='$2',updated=CURRENT_TIMESTAMP WHERE id=$1;" ;;
  count)  sqlite3 "$DB" "SELECT COUNT(*) FROM tasks WHERE status='${1:-active}';" ;;
  next)   sqlite3 "$DB" "SELECT id,agent,title,type FROM tasks WHERE status='queued' ORDER BY CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END, id LIMIT 1;" ;;
  list)   sqlite3 -column -header "$DB" "SELECT id,agent,title,status,priority,type,substr(created,1,16) FROM tasks ORDER BY id DESC LIMIT ${1:-20};" ;;
  *)      echo "Usage: task.sh push|done|fail|active|count|next|list" ;;
esac
