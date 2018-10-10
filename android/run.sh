#!/bin/bash

./gradlew ${1:-installDevMinSdkDevKernelDebug} --stacktrace && adb shell am start -n korman.weather.test/host.exp.exponent.MainActivity
