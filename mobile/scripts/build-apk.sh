#!/usr/bin/env bash
# Installable release-mode preview, signed with Expo's generated debug key.
# Use EAS for a persistent release keystore and store distribution.
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ -z "${ANDROID_HOME:-}" && -z "${ANDROID_SDK_ROOT:-}" ]]; then
  echo 'Set ANDROID_HOME to your Android SDK directory (see mobile/README.md).' >&2
  exit 1
fi
if [[ -z "${JAVA_HOME:-}" ]] && ! command -v java >/dev/null 2>&1; then
  echo 'Install the JDK required by your Expo SDK and set JAVA_HOME.' >&2
  exit 1
fi

npx expo prebuild --platform android --no-install
(
  cd android
  ./gradlew :app:assembleRelease --no-daemon "${@}"
)
mkdir -p artifacts
cp android/app/build/outputs/apk/release/app-release.apk artifacts/BudgetWise-preview.apk
echo "APK created: $(pwd)/artifacts/BudgetWise-preview.apk"
