const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// --- CONFIGURATION ---
const CONFIG = {
    maxCommits: 100,
    pushInterval: 5,
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    ignoreDirs: ['node_modules', '.git', 'dist', 'build', '.next', 'coverage'],
    reownPackage: '@reown/appkit', // Example package to check/install
};

// --- UTILITIES ---
const log = (msg, type = 'INFO') => console.log(`[${type}] ${msg}`);

function runCmd(cmd, cwd = process.cwd()) {
    try {
        execSync(cmd, { cwd, stdio: 'pipe' });
        return true;
    } catch (e) {
        return false;
    }
}

function getFiles(dir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            if (!CONFIG.ignoreDirs.includes(file)) {
                getFiles(filePath, fileList);
            }
        } else {
            if (CONFIG.extensions.includes(path.extname(file))) {
                fileList.push(filePath);
            }
        }
    });
    return fileList;
}

function commitAndPush(filePath, msg, cwd) {
    const relPath = path.relative(cwd, filePath);
    if (runCmd(`git add "${relPath}"`, cwd)) {
        if (runCmd(`git commit -m "${msg}"`, cwd)) {
            log(`✅ Committed: ${msg}`, 'GIT');
            return true;
        }
    }
    return false;
}

// --- MODULE 1: IMPORT STANDARDIZATION ---
function sortImports(content) {
    const lines = content.split('\n');
    const importLines = [];
    const otherLines = [];
    let isImportBlock = true;

    for (const line of lines) {
        if (isImportBlock && (line.startsWith('import ') || line.trim() === '')) {
            if (line.trim() !== '') importLines.push(line);
        } else {
            isImportBlock = false;
            otherLines.push(line);
        }
    }

    if (importLines.length === 0) return null;

    const categories = { builtin: [], external: [], internal: [], style: [] };
    
    importLines.forEach(line => {
        if (line.includes("from 'react'") || line.includes("from 'next'") || line.includes("from '@nestjs")) {
            categories.builtin.push(line);
        } else if (line.match(/^import\s+['"]\./) || line.match(/from\s+['"]\./) || line.includes('@/')) {
            categories.internal.push(line);
        } else if (line.match(/\.(css|scss|sass|less)['"]$/)) {
            categories.style.push(line);
        } else {
            categories.external.push(line);
        }
    });

    Object.values(categories).forEach(arr => arr.sort());

    const sortedBlock = [
        ...categories.builtin,
        ...(categories.builtin.length && categories.external.length ? [''] : []),
        ...categories.external,
        ...(categories.external.length && categories.internal.length ? [''] : []),
        ...categories.internal,
        ...(categories.internal.length && categories.style.length ? [''] : []),
        ...categories.style
    ];

    let body = otherLines.join('\n');
    while (body.startsWith('\n')) body = body.substring(1);
    
    const newContent = sortedBlock.join('\n') + '\n\n' + body;
    return newContent.trim() !== content.trim() ? { content: newContent, type: 'standardize imports' } : null;
}

// --- MODULE 3: ENHANCEMENTS (JSDoc, DisplayName, Modernization) ---

function addJSDoc(content) {
    // Regex to find exported functions without JSDoc immediately before them
    // This is a basic heuristic; it won't catch everything but is safe for many cases.
    const lines = content.split('\n');
    let modified = false;
    const newLines = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Match "export const X = (" or "export function X"
        const funcMatch = line.match(/^export\s+(?:const|function|async function)\s+(\w+)/);
        
        if (funcMatch) {
            const funcName = funcMatch[1];
            // Check previous line for comment end
            const prevLine = i > 0 ? lines[i-1].trim() : '';
            if (!prevLine.endsWith('*/')) {
                // Add JSDoc
                newLines.push(`/**`);
                newLines.push(` * ${funcName} utility function.`);
                newLines.push(` * @param props - Component properties or function arguments.`);
                newLines.push(` * @returns The result of ${funcName}.`);
                newLines.push(` */`);
                modified = true;
            }
        }
        newLines.push(line);
    }

    if (modified) return { content: newLines.join('\n'), type: 'add JSDoc' };
    return null;
}

function addDisplayName(content, filePath) {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.jsx')) return null;
    if (content.includes('.displayName =')) return null;

    // Find main component name (heuristic: export const Name = ...)
    const matches = [...content.matchAll(/export\s+const\s+(\w+)\s+=\s+/g)];
    if (matches.length === 0) return null;

    // Pick the first capitalized export as likely component
    const component = matches.find(m => m[1][0] === m[1][0].toUpperCase());
    if (!component) return null;

    const name = component[1];
    const newContent = content + `\n${name}.displayName = '${name}';\n`;
    return { content: newContent, type: 'add displayName' };
}

function modernizeVar(content) {
    if (!content.includes('var ')) return null;
    // Simple replacement of 'var ' with 'const ' at start of lines or after safe delimiters
    // This is risky without AST, but we can try a safe subset: "var " at start of line
    const regex = /^(\s*)var\s+/gm;
    if (regex.test(content)) {
        const newContent = content.replace(regex, '$1let '); // use let to be safer than const
        return { content: newContent, type: 'modernize var to let' };
    }
    return null;
}

// --- STRATEGY SELECTOR ---
function applyRandomStrategy(content, filePath) {
    const strategies = [
        () => sortImports(content),
        () => addJSDoc(content),
        () => addDisplayName(content, filePath),
        () => modernizeVar(content)
    ];

    // Shuffle strategies to ensure variety
    for (let i = strategies.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [strategies[i], strategies[j]] = [strategies[j], strategies[i]];
    }

    for (const strategy of strategies) {
        const result = strategy();
        if (result) return result;
    }
    return null;
}

// --- MODULE 2: FEATURE INJECTION (Web3/Reown) ---
const WEB3_TEMPLATES = {
    'ConnectButton.tsx': `import React from 'react';
export const ConnectButton = () => {
  return <appkit-button />;
};`,
    'NetworkSwitch.tsx': `import React from 'react';
export const NetworkSwitch = () => {
  return <appkit-network-button />;
};`
};

function injectWeb3Features(cwd) {
    // Detect if frontend
    const isFrontend = fs.existsSync(path.join(cwd, 'package.json')) && 
                       (fs.readFileSync(path.join(cwd, 'package.json')).includes('react') || 
                        fs.readFileSync(path.join(cwd, 'package.json')).includes('next'));
    
    if (!isFrontend) return 0;

    // Find suitable component dir
    const possibleDirs = ['src/components/web3', 'components/web3', 'src/components/ui', 'components/ui'];
    let targetDir = null;

    for (const d of possibleDirs) {
        const fullPath = path.join(cwd, d);
        if (!fs.existsSync(fullPath)) {
            try {
                fs.mkdirSync(fullPath, { recursive: true });
                targetDir = fullPath;
                break;
            } catch (e) {}
        } else {
            targetDir = fullPath;
            break;
        }
    }

    if (!targetDir) return 0;

    let commits = 0;
    for (const [name, content] of Object.entries(WEB3_TEMPLATES)) {
        const filePath = path.join(targetDir, name);
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, content);
            if (commitAndPush(filePath, `feat(ui): add ${name.replace('.tsx', '')} component`, cwd)) {
                commits++;
            }
        }
    }
    return commits;
}

// --- MAIN EXECUTION ---
async function main() {
    const targetCwd = process.cwd(); // Script assumes it's running IN the target directory
    log(`Starting Master Refactor in: ${targetCwd}`);

    let totalCommits = 0;

    // 1. Feature Injection First
    log('Phase 1: Feature Injection');
    totalCommits += injectWeb3Features(targetCwd);

    // 2. Refactoring / Standardization
    log('Phase 2: Standardization');
    const files = getFiles(targetCwd);
    log(`Found ${files.length} files to scan.`);

    for (const file of files) {
        if (totalCommits >= CONFIG.maxCommits) break;

        try {
            const content = fs.readFileSync(file, 'utf8');
            
            // Apply Random Strategy
            const result = applyRandomStrategy(content, file);
            
            if (result) {
                fs.writeFileSync(file, result.content);
                // Use relative path for more descriptive commit messages
                const relativePath = path.relative(targetCwd, file);
                const msg = result.type === 'standardize imports' 
                    ? `refactor(code): standardize imports in ${relativePath}`
                    : result.type === 'add JSDoc'
                        ? `docs: add JSDoc to functions in ${relativePath}`
                    : result.type === 'add displayName'
                        ? `refactor(react): add displayName to ${relativePath}`
                    : `refactor(js): modernize variables in ${relativePath}`;

                if (commitAndPush(file, msg, targetCwd)) {
                    totalCommits++;
                    if (totalCommits % CONFIG.pushInterval === 0) {
                        runCmd('git push', targetCwd);
                        log('🚀 Pushed batch to remote', 'GIT');
                    }
                }
            }
            
        } catch (e) {
            log(`Error processing ${file}: ${e.message}`, 'ERROR');
        }
    }

    // Final Push
    runCmd('git push', targetCwd);
    log(`🎉 Completed. Total commits: ${totalCommits}`);
}

main();

