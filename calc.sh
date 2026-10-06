#!/bin/bash
# Kalkulator lokal — start/stop server
PORT=8765
DIR="$(cd "$(dirname "$0")" && pwd)"

case "$1" in
  start)
    if lsof -nP -iTCP:$PORT -sTCP:LISTEN >/dev/null 2>&1; then
      echo "Server sudah jalan di http://127.0.0.1:$PORT/"
    else
      cd "$DIR" && nohup python3 -m http.server $PORT --bind 127.0.0.1 > server.log 2>&1 &
      sleep 1
      echo "Server jalan (PID $!) di http://127.0.0.1:$PORT/"
    fi
    open "http://127.0.0.1:$PORT/"
    ;;
  stop)
    PID=$(lsof -nP -iTCP:$PORT -sTCP:LISTEN -t 2>/dev/null)
    if [ -n "$PID" ]; then kill $PID && echo "Server (PID $PID) dihentikan."; else echo "Server tidak jalan."; fi
    ;;
  status)
    lsof -nP -iTCP:$PORT -sTCP:LISTEN >/dev/null 2>&1 \
      && echo "AKTIF — http://127.0.0.1:$PORT/" || echo "MATI"
    ;;
  test)
    cd "$DIR" && node test.mjs
    ;;
  *)
    echo "Pakai: $0 {start|stop|status|test}"
    ;;
esac
