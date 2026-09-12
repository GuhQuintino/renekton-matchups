/**
 * QA Visual Capture Harness via Chrome DevTools Protocol (CDP)
 * Autônomo, resiliente e determinístico.
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const QATEST_DIR = path.join(ROOT_DIR, '.qatest');

if (!fs.existsSync(QATEST_DIR)) {
  fs.mkdirSync(QATEST_DIR, { recursive: true });
}

// Locate Chrome or Edge binary
function getBrowserPath() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  if (fs.existsSync(chromePath)) return chromePath;
  if (fs.existsSync(edgePath)) return edgePath;
  throw new Error('No browser executable found!');
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// CDP Client using native Node WebSocket
class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.callbacks = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const { resolve, reject } = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) reject(new Error(msg.error.message));
          else resolve(msg.result);
        }
      };
    });
  }

  async send(method, params = {}) {
    const id = this.id++;
    return new Promise((resolve, reject) => {
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

async function main() {
  console.log('🚀 Iniciando Browser Harness para QA Visual...');
  const browserPath = getBrowserPath();
  const remotePort = 9222;

  // Launch browser with remote debugging
  const browserProcess = spawn(
    browserPath,
    [
      '--headless=new',
      `--remote-debugging-port=${remotePort}`,
      '--window-size=1920,1080',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      '--user-data-dir=' + path.join(ROOT_DIR, '.browser-profile')
    ],
    { stdio: 'ignore' }
  );

  try {
    // Wait for CDP to be ready
    let targetWsUrl = null;
    for (let i = 0; i < 20; i++) {
      try {
        const res = await fetch(`http://localhost:${remotePort}/json/list`);
        const targets = await res.json();
        if (targets.length > 0 && targets[0].webSocketDebuggerUrl) {
          targetWsUrl = targets[0].webSocketDebuggerUrl;
          break;
        }
      } catch (e) {
        await sleep(300);
      }
    }

    if (!targetWsUrl) {
      throw new Error('Não foi possível conectar ao endpoint CDP do navegador.');
    }

    console.log('🔗 Conectado ao CDP:', targetWsUrl);
    const client = new CDPClient(targetWsUrl);
    await client.connect();

    // Enable required domains
    await client.send('Page.enable');
    await client.send('DOM.enable');
    await client.send('Runtime.enable');
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      mobile: false
    });

    // Helper for screenshot
    async function captureScreenshot(filename) {
      const res = await client.send('Page.captureScreenshot', { format: 'png' });
      const buffer = Buffer.from(res.data, 'base64');
      const outPath = path.join(QATEST_DIR, filename);
      fs.writeFileSync(outPath, buffer);
      console.log(`📸 Screenshot salvo: ${outPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
      return outPath;
    }

    // Helper for evaluating JS
    async function evalJs(expr) {
      const res = await client.send('Runtime.evaluate', {
        expression: expr,
        returnByValue: true,
        awaitPromise: true
      });
      return res.result ? res.result.value : null;
    }

    // 1. Navigate to App
    console.log('🌐 Navegando para http://localhost:1420...');
    await client.send('Page.navigate', { url: 'http://localhost:1420' });
    await sleep(2000);

    // Verify initial DOM
    const title = await evalJs('document.title');
    const championCount = await evalJs(`document.querySelectorAll('aside .group').length`);
    console.log(`✅ Página carregada. Título: "${title}", Campeões renderizados na sidebar: ${championCount}`);

    // --- SCREENSHOT 1: Sidebar com 170 campeões e visão padrão ---
    console.log('📸 Capturando 01_sidebar_170_champions.png...');
    await captureScreenshot('01_sidebar_170_champions.png');

    // --- SCREENSHOT 2: Busca instantânea e filtros de dificuldade ---
    console.log('🔍 Executando busca instantânea por "Darius" e filtro...');
    await evalJs(`
      const input = document.querySelector('aside input[type="text"]');
      if (input) {
        input.value = 'Darius';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    `);
    await sleep(600);
    console.log('📸 Capturando 02_instant_search_filter.png...');
    await captureScreenshot('02_instant_search_filter.png');

    // --- SCREENSHOT 3: Matchup View com Dicas Detalhadas Passo-a-Passo ---
    console.log('📋 Selecionando Darius e abrindo aba de Dicas Passo-a-Passo...');
    await evalJs(`
      const champItem = document.querySelector('aside .group');
      if (champItem) champItem.click();
    `);
    await sleep(600);

    // Clicar na aba de Dicas Passo-a-Passo
    await evalJs(`
      const tabs = Array.from(document.querySelectorAll('.lol-card button'));
      const tipsTab = tabs.find(b => b.textContent.includes('Dicas Passo-a-Passo'));
      if (tipsTab) tipsTab.click();
    `);
    await sleep(600);
    console.log('📸 Capturando 03_matchup_detail_view.png...');
    await captureScreenshot('03_matchup_detail_view.png');

    // --- SCREENSHOT 4: Modal de 8 Guias Gerais ---
    console.log('📖 Abrindo Modal de 8 Guias Mestres...');
    await evalJs(`
      const guidesBtn = Array.from(document.querySelectorAll('header button')).find(b => b.textContent.includes('8 Guias Mestres'));
      if (guidesBtn) guidesBtn.click();
    `);
    await sleep(800);
    console.log('📸 Capturando 04_general_guides_modal.png...');
    await captureScreenshot('04_general_guides_modal.png');

    // Fechar modal
    await evalJs(`
      const closeBtn = document.querySelector('.fixed button[title*="Fechar"]');
      if (closeBtn) closeBtn.click();
    `);
    await sleep(500);

    // --- SCREENSHOT 5: Sistema de Anotações Pós-Partida / Pós-Jogo ---
    console.log('⚡ Testando Cenário de Pós-Jogo no Simulador...');
    // Abrir dropdown de cenários no Header e selecionar Pós-Jogo ou mudar cenário
    await evalJs(`
      const simBtn = Array.from(document.querySelectorAll('header button')).find(b => b.textContent.includes('Cenários'));
      if (simBtn) simBtn.click();
    `);
    await sleep(400);

    await evalJs(`
      const postGameBtn = Array.from(document.querySelectorAll('header button')).find(b => b.textContent.includes('Pós-Jogo') || b.textContent.includes('POST'));
      if (postGameBtn) postGameBtn.click();
    `);
    await sleep(800);

    console.log('📸 Capturando 05_post_game_notes_system.png...');
    await captureScreenshot('05_post_game_notes_system.png');

    client.close();
    console.log('🎉 Todas as 5 capturas foram concluídas com sucesso!');
  } finally {
    browserProcess.kill();
  }
}

main().catch((err) => {
  console.error('❌ Erro no script de QA:', err);
  process.exit(1);
});
