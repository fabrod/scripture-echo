#!/usr/bin/env bash
set -euo pipefail

maestro_bin="$(command -v maestro || true)"
if [[ -z "$maestro_bin" && -x "$HOME/.maestro/bin/maestro" ]]; then
  maestro_bin="$HOME/.maestro/bin/maestro"
fi

if [[ -z "$maestro_bin" ]]; then
  echo "Maestro is not installed. See https://docs.maestro.dev/maestro-cli/how-to-install-maestro-cli" >&2
  exit 1
fi

if [[ -z "${JAVA_HOME:-}" ]]; then
  java_17_home="$(/usr/libexec/java_home -v 17 2>/dev/null || true)"
  if [[ -z "$java_17_home" && -x "$HOME/.local/share/scripture-echo-jdk/Contents/Home/bin/java" ]]; then
    java_17_home="$HOME/.local/share/scripture-echo-jdk/Contents/Home"
  fi
  if [[ -z "$java_17_home" ]]; then
    echo "Java 17 or newer is required to run Maestro." >&2
    exit 1
  fi
  export JAVA_HOME="$java_17_home"
fi

export MAESTRO_CLI_NO_ANALYTICS=1
export MAESTRO_CLI_ANALYSIS_NOTIFICATION_DISABLED=true

exec "$maestro_bin" test .maestro
