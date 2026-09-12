import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const QATEST_DIR = path.join(ROOT_DIR, '.qatest');

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

class CDP {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.pending = new Map();
  }

  async init() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (e) => reject(e);
      this.ws.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data.id && this.pending.has(data.id)) {
          const { resolve, reject } = this.pending.get(data.id);
          this.pending.delete(data.id);
          if (data.error) reject(new Error(JSON.stringify(data.error)));
          else resolve(data.result);
        }
      };
    });
  }

  async call(method, params = {}) {
    const id = this.id++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function run() {
  console.log('🚀 Iniciando Browser CDP com interações reais...');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const port = 9444;
  const userDir = path.join(ROOT_DIR, '.temp-browser-qa2');

  const chromeProc = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    '--window-size=1920,1080',
    '--disable-gpu',
    '--no-first-run',
    '--user-data-dir=' + userDir,
    'http://localhost:1420'
  ], { stdio: 'ignore' });

  try {
    let pageWsUrl = null;
    for (let i = 0; i < 30; i++) {
      try {
        const res = await fetch(`http://localhost:${port}/json/list`);
        const list = await res.json();
        const page = list.find((t) => t.type === 'page');
        if (page && page.webSocketDebuggerUrl) {
          pageWsUrl = page.webSocketDebuggerUrl;
          break;
        }
      } catch (e) {
        await sleep(200);
      }
    }

    if (!pageWsUrl) throw new Error('Não encontrou página no CDP!');
    const cdp = new CDP(pageWsUrl);
    await cdp.init();

    await cdp.call('Page.enable');
    await cdp.call('Runtime.enable');
    await cdp.call('DOM.enable');
    await cdp.call('Input.setIgnoreInputEvents', { ignore: false });
    await cdp.call('Emulation.setDeviceMetricsOverride', {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      mobile: false
    });

    await sleep(2500);

    async function take(name) {
      const res = await cdp.call('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: false
      });
      const filePath = path.join(QATEST_DIR, name);
      fs.writeFileSync(filePath, Buffer.from(res.data, 'base64'));
      console.log(`✅ [OK] Salvo: ${name} (${(res.data.length * 0.75 / 1024).toFixed(1)} KB)`);
    }

    async function exec(code) {
      const res = await cdp.call('Runtime.evaluate', {
        expression: code,
        returnByValue: true,
        awaitPromise: true
      });
      return res.result ? res.result.value : null;
    }

    // 1. Screenshot 1: Sidebar 170 campeões
    console.log('📸 1/5: 01_sidebar_170_champions.png...');
    await take('01_sidebar_170_champions.png');

    // 2. Screenshot 2: Busca Instantânea com digitação real + filtro de dificuldade
    console.log('📸 2/5: 02_instant_search_filter.png (digitando "Dar")...');
    // Focar no input
    await exec(`
      const input = document.querySelector('aside input[type="text"]');
      if (input) {
        input.focus();
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeInputValueSetter.call(input, 'Dar');
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    `);
    await sleep(600);
    await take('02_instant_search_filter.png');

    // 3. Screenshot 3: Selecionar Darius e visualizar matchup
    console.log('📸 3/5: 03_matchup_detail_view.png (Darius selecionado)...');
    await exec(`
      const dariusCard = Array.from(document.querySelectorAll('aside .group')).find(el => el.textContent.includes('Darius'));
      if (dariusCard) dariusCard.click();
    `);
    await sleep(600);
    // Abrir aba de Dicas Passo-a-Passo
    await exec(`
      const tabs = Array.from(document.querySelectorAll('.lol-card button'));
      const tipsTab = tabs.find(b => b.textContent.includes('Dicas Passo-a-Passo'));
      if (tipsTab) tipsTab.click();
    `);
    await sleep(600);
    await take('03_matchup_detail_view.png');

    // 4. Screenshot 4: 04_general_guides_modal.png
    console.log('📸 4/5: 04_general_guides_modal.png...');
    await exec(`
      const guidesBtn = Array.from(document.querySelectorAll('header button')).find(b => b.textContent.includes('8 Guias Mestres'));
      if (guidesBtn) guidesBtn.click();
    `);
    await sleep(800);
    await take('04_general_guides_modal.png');

    // Fechar modal
    await exec(`
      const closeBtn = document.querySelector('.fixed button[title*="Fechar"]');
      if (closeBtn) closeBtn.click();
    `);
    await sleep(500);

    // 5. Screenshot 5: 05_post_game_notes_system.png
    console.log('📸 5/5: 05_post_game_notes_system.png (Modo Pós-Jogo e visualizador de dados)...');
    // Selecionar cenário Pós-Jogo
    await exec(`
      const simBtn = Array.from(document.querySelectorAll('header button')).find(b => b.textContent.includes('Cenários'));
      if (simBtn) simBtn.click();
    `);
    await sleep(400);
    await exec(`
      const postGameBtn = Array.from(document.querySelectorAll('header div button')).find(b => b.textContent.includes('Pós-Jogo') || b.textContent.includes('POST'));
      if (postGameBtn) postGameBtn.click();
    `);
    await sleep(600);
    // Clicar na aba de Gerenciamento de Fúria para mostrar mais profundidade tática
    await exec(`
      const tabs = Array.from(document.querySelectorAll('.lol-card button'));
      const furyTab = tabs.find(b => b.textContent.includes('Gerenciamento de Fúria'));
      if (furyTab) furyTab.click();
    `);
    await sleep(600);
    await take('05_post_game_notes_system.png');

    cdp.close();
    console.log('✨ Capturas finais concluídas!');
  } finally {
    chromeProc.kill();
  }
}

run().catch((e) => {
  console.error('❌ Erro:', e);
  process.exit(1);
});
