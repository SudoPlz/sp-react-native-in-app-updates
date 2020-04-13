#!/bin/sh

INPUT_DIR=$1
OUTPUT_DIR=$2

cp -a $INPUT_DIR/android $OUTPUT_DIR
cp -a $INPUT_DIR/ios $OUTPUT_DIR
cp $INPUT_DIR/index.js $OUTPUT_DIR/index.js
cp -a $INPUT_DIR/lib $OUTPUT_DIR
cp $INPUT_DIR/sp-react-native-in-app-updates.podspec $OUTPUT_DIR/sp-react-native-in-app-updates.podspec
cp $INPUT_DIR/README.md $OUTPUT_DIR/README.md


echo "Copied android, ios, index.js, lib from $INPUT_DIR to $OUTPUT_DIR"
