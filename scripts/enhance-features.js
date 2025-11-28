const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// --- CONSTANTS & CONFIG ---
const LOG_PREFIX = '🤖 [AutoFeature]';

// --- UTILS ---
function log(msg) {
    console.log(`${LOG_PREFIX} ${msg}`);
}

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        log(`Created directory: ${dirPath}`);
    }
}

function commitAndPush(filePath, message) {
    const relPath = path.relative(process.cwd(), filePath);
    try {
        execSync(`git add "${relPath}"`);
        execSync(`git commit -m "${message}"`);
        log(`✅ Committed: ${message}`);
        try {
            execSync('git push');
            log('🚀 Pushed to remote');
        } catch (err) {
            console.error('Push failed. Continuing...');
        }
    } catch (err) {
        if (!err.message.includes('nothing to commit')) {
            console.error(`Failed to commit ${relPath}:`, err.message);
        }
    }
}

// --- TEMPLATES ---

const TEMPLATE_CONNECT_BUTTON = `import React from 'react'

export const ConnectButton = () => {
  return (
    <div className="flex items-center gap-2">
      {/* @ts-expect-error - Web Component */}
      <appkit-button />
    </div>
  )
}
`;

const TEMPLATE_NETWORK_SWITCH = `import React from 'react'

export const NetworkSwitch = () => {
  return (
    <div className="flex items-center gap-2">
      {/* @ts-expect-error - Web Component */}
      <appkit-network-button />
    </div>
  )
}
`;

// --- GENERATORS ---

function generateUIComponents() {
    // Adjusted path for crypto-payment-widget structure (frontend/src)
    const componentsDir = path.join(process.cwd(), 'frontend', 'src', 'components', 'web3');
    ensureDir(componentsDir);

    const features = [
        { name: 'ConnectButton.tsx', content: TEMPLATE_CONNECT_BUTTON, desc: 'feat(ui): add ConnectButton component' },
        { name: 'NetworkSwitch.tsx', content: TEMPLATE_NETWORK_SWITCH, desc: 'feat(ui): add NetworkSwitch component' }
    ];

    features.forEach(feature => {
        const filePath = path.join(componentsDir, feature.name);
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, feature.content);
            commitAndPush(filePath, feature.desc);
        }
    });
}

function main() {
    log('Starting feature automation for Crypto Payment Widget...');
    generateUIComponents();
    log('Automation complete.');
}

main();
