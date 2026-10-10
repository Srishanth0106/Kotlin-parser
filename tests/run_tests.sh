#!/bin/bash
PARSER="./kotlin_parser"

if [ ! -f "$PARSER" ]; then
    echo "Parser binary $PARSER not found! Run make first."
    exit 1
fi

PASSED=0
FAILED=0

echo "----------------------------------------"
echo "Testing Valid Kotlin Subset Samples..."
echo "----------------------------------------"

for f in ../tests/valid/*.kt; do
    [ -e "$f" ] || continue
    $PARSER --json "$f" > /dev/null 2>&1
    STATUS=$?
    if [ $STATUS -eq 0 ]; then
        echo "[PASS] $f parsed successfully."
        PASSED=$((PASSED+1))
    else
        echo "[FAIL] $f should have parsed successfully, but failed with status $STATUS."
        FAILED=$((FAILED+1))
    fi
done

echo ""
echo "----------------------------------------"
echo "Testing Invalid Kotlin Subset Samples..."
echo "----------------------------------------"

for f in ../tests/invalid/*.kt; do
    [ -e "$f" ] || continue
    $PARSER --json "$f" > /dev/null 2>&1
    STATUS=$?
    if [ $STATUS -ne 0 ]; then
        echo "[PASS] $f rejected as expected."
        PASSED=$((PASSED+1))
    else
        echo "[FAIL] $f should have failed syntax analysis, but succeeded."
        FAILED=$((FAILED+1))
    fi
done

echo ""
echo "========================================"
echo "Test Summary: $PASSED Passed, $FAILED Failed"
echo "========================================"

if [ $FAILED -gt 0 ]; then
    exit 1
else
    exit 0
fi
