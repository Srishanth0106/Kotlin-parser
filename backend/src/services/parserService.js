const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

const MAX_INPUT_SIZE = 100 * 1024; /* 100 KB max source code */
const TIMEOUT_MS = 5000;            /* 5s timeout */

async function parseKotlinCode(code) {
    if (typeof code !== 'string') {
        throw new Error('Invalid code payload: must be a string.');
    }

    if (code.length > MAX_INPUT_SIZE) {
        throw new Error(`Source code exceeds max length of ${MAX_INPUT_SIZE} bytes.`);
    }

    const tempDir = os.tmpdir();
    const tempFileName = `kotlin_input_${Date.now()}_${Math.random().toString(36).substring(7)}.kt`;
    const tempFilePath = path.join(tempDir, tempFileName);

    const parserDir = path.resolve(__dirname, '../../../parser');
    const exePath = path.join(parserDir, 'kotlin_parser.exe');

    /* Check if native Windows binary exists */
    let useNative = false;
    try {
        await fs.access(exePath);
        useNative = true;
    } catch (_) {
        useNative = false;
    }

    try {
        await fs.writeFile(tempFilePath, code, 'utf8');

        return await new Promise((resolve, reject) => {
            let child;

            if (useNative) {
                child = spawn(exePath, ['--json', tempFilePath], { cwd: parserDir });
            } else {
                const wslTempPath = tempFilePath
                    .replace(/^([A-Za-z]):/, (_, drive) => `/mnt/${drive.toLowerCase()}`)
                    .replace(/\\/g, '/');
                const wslParserDir = parserDir
                    .replace(/^([A-Za-z]):/, (_, drive) => `/mnt/${drive.toLowerCase()}`)
                    .replace(/\\/g, '/');

                child = spawn('wsl', [
                    'bash', '-c',
                    `cd "${wslParserDir}" && ./kotlin_parser --json "${wslTempPath}"`
                ]);
            }

            let stdoutData = '';
            let stderrData = '';
            let isSettled = false;

            const timer = setTimeout(() => {
                if (!isSettled) {
                    isSettled = true;
                    child.kill();
                    reject(new Error(`Parser execution timed out after ${TIMEOUT_MS}ms.`));
                }
            }, TIMEOUT_MS);

            child.stdout.on('data', (chunk) => {
                stdoutData += chunk.toString();
            });

            child.stderr.on('data', (chunk) => {
                stderrData += chunk.toString();
            });

            child.on('error', (err) => {
                if (!isSettled) {
                    isSettled = true;
                    clearTimeout(timer);
                    reject(err);
                }
            });

            child.on('close', (exitCode) => {
                if (isSettled) return;
                isSettled = true;
                clearTimeout(timer);

                try {
                    if (stdoutData.trim()) {
                        const parsedJson = JSON.parse(stdoutData);
                        resolve(parsedJson);
                    } else {
                        resolve({
                            success: false,
                            statistics: { tokenCount: 0, astNodeCount: 0, parseTimeMs: 0 },
                            diagnostics: [{
                                severity: 'ERROR',
                                message: stderrData || `Parser process exited with code ${exitCode}`,
                                line: 1,
                                column: 1
                            }],
                            tokens: [],
                            ast: null
                        });
                    }
                } catch (jsonErr) {
                    reject(new Error(`Failed to parse parser output JSON: ${jsonErr.message}. Output was: ${stdoutData}`));
                }
            });
        });

    } finally {
        try {
            await fs.unlink(tempFilePath);
        } catch (_) {}
    }
}

module.exports = { parseKotlinCode };
