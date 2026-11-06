#!/bin/sh
# java-migration: 1コンテナ内で HSQLDB 1.8 サーバ + Tomcat を起動する。
# jdbc.url=jdbc:hsqldb:hsql://localhost:9002 なので同一コンテナ localhost で接続できる。
set -e

rm -f /hsqldb-db/jpetstore.lck 2>/dev/null || true

echo "[entrypoint] starting HSQLDB 1.8 server on :9002 (db=jpetstore, preloaded script)"
# dbname.0 は空エイリアスにする。アプリの jdbc.url=hsql://localhost:9002 は
# エイリアス無し(=デフォルト空文字)で接続するため、ここを空にして一致させる。
java -cp /opt/hsqldb.jar org.hsqldb.Server \
  -database.0 file:/hsqldb-db/jpetstore \
  -dbname.0 "" \
  -port 9002 \
  -no_system_exit true &

# HSQLDB が接続を受けるまで少し待つ
sleep 6
echo "[entrypoint] HSQLDB up. starting Tomcat ..."
exec catalina.sh run
