const path = require('path');
const fs = require('fs');

/**
 * Champion Matchup E2E Test Suite Runner
 */

const ANSI = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

class TestContext {
  constructor() {
    this.suites = [];
    this.currentSuite = null;
    this.totalTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;
    this.skippedTests = 0;
    this.resultsByTier = {
      1: { name: 'Tier 1: Feature Coverage (F1 to F15)', total: 0, passed: 0, failed: 0, tests: [] },
      2: { name: 'Tier 2: Boundary & Corner Cases', total: 0, passed: 0, failed: 0, tests: [] },
      3: { name: 'Tier 3: Cross-Feature Combinations', total: 0, passed: 0, failed: 0, tests: [] },
      4: { name: 'Tier 4: Real-World Application Scenarios', total: 0, passed: 0, failed: 0, tests: [] }
    };
    this.currentTier = 1;
  }

  setTier(tierNum) {
    this.currentTier = tierNum;
  }

  describe(name, fn) {
    const suite = {
      name,
      tier: this.currentTier,
      tests: [],
      beforeAllFns: [],
      afterAllFns: [],
      beforeEachFns: [],
      afterEachFns: []
    };
    const prevSuite = this.currentSuite;
    this.currentSuite = suite;
    this.suites.push(suite);

    try {
      fn();
    } finally {
      this.currentSuite = prevSuite;
    }
  }

  test(name, fn) {
    if (!this.currentSuite) {
      this.describe('Default Suite', () => {});
    }
    this.currentSuite.tests.push({
      name,
      tier: this.currentSuite.tier,
      fn,
      suite: this.currentSuite,
      status: 'pending',
      error: null,
      durationMs: 0
    });
  }

  it(name, fn) {
    this.test(name, fn);
  }

  beforeEach(fn) {
    if (this.currentSuite) {
      this.currentSuite.beforeEachFns.push(fn);
    }
  }

  afterEach(fn) {
    if (this.currentSuite) {
      this.currentSuite.afterEachFns.push(fn);
    }
  }

  beforeAll(fn) {
    if (this.currentSuite) {
      this.currentSuite.beforeAllFns.push(fn);
    }
  }

  afterAll(fn) {
    if (this.currentSuite) {
      this.currentSuite.afterAllFns.push(fn);
    }
  }

  async runAll(filterTier = null) {
    const startTime = Date.now();
    console.log(`\n${ANSI.bright}${ANSI.cyan}========================================================================${ANSI.reset}`);
    console.log(`${ANSI.bright}${ANSI.cyan}   CHAMPION MATCHUP: OPAQUE-BOX E2E TEST SUITE (TIERS 1 TO 4)${ANSI.reset}`);
    console.log(`${ANSI.bright}${ANSI.cyan}========================================================================${ANSI.reset}\n`);

    for (const suite of this.suites) {
      if (filterTier && suite.tier !== filterTier) {
        continue;
      }

      console.log(`${ANSI.bright}${ANSI.yellow}[Tier ${suite.tier}] ${suite.name}${ANSI.reset}`);

      // Run beforeAll
      for (const bAll of suite.beforeAllFns) {
        const res = bAll();
        if (res instanceof Promise) await res;
      }

      for (const t of suite.tests) {
        this.totalTests++;
        this.resultsByTier[suite.tier].total++;
        const testStart = process.hrtime();

        try {
          // Run beforeEach
          for (const bEach of suite.beforeEachFns) {
            const bRes = bEach();
            if (bRes instanceof Promise) await bRes;
          }

          const res = t.fn();
          if (res instanceof Promise) {
            await res;
          }

          // Run afterEach
          for (const aEach of suite.afterEachFns) {
            const aRes = aEach();
            if (aRes instanceof Promise) await aRes;
          }

          const elapsed = process.hrtime(testStart);
          t.durationMs = (elapsed[0] * 1000) + (elapsed[1] / 1000000);
          t.status = 'passed';
          this.passedTests++;
          this.resultsByTier[suite.tier].passed++;
          this.resultsByTier[suite.tier].tests.push({ name: t.name, status: 'passed', durationMs: t.durationMs });

          console.log(`  ${ANSI.green}✓${ANSI.reset} ${t.name} ${ANSI.dim}(${t.durationMs.toFixed(1)}ms)${ANSI.reset}`);
        } catch (err) {
          const elapsed = process.hrtime(testStart);
          t.durationMs = (elapsed[0] * 1000) + (elapsed[1] / 1000000);
          t.status = 'failed';
          t.error = err;
          this.failedTests++;
          this.resultsByTier[suite.tier].failed++;
          this.resultsByTier[suite.tier].tests.push({ name: t.name, status: 'failed', error: err.message, durationMs: t.durationMs });

          console.log(`  ${ANSI.red}✗${ANSI.reset} ${t.name} ${ANSI.dim}(${t.durationMs.toFixed(1)}ms)${ANSI.reset}`);
          console.log(`    ${ANSI.red}${err.name}: ${err.message}${ANSI.reset}`);
          if (err.stack) {
            const stackLines = err.stack.split('\n').slice(1, 4).join('\n    ');
            console.log(`    ${ANSI.dim}${stackLines}${ANSI.reset}`);
          }
        }
      }

      // Run afterAll
      for (const aAll of suite.afterAllFns) {
        const res = aAll();
        if (res instanceof Promise) await res;
      }

      console.log('');
    }

    const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`${ANSI.bright}${ANSI.cyan}========================================================================${ANSI.reset}`);
    console.log(`${ANSI.bright}${ANSI.cyan}   TEST EXECUTION SUMMARY BY TIER${ANSI.reset}`);
    console.log(`${ANSI.bright}${ANSI.cyan}========================================================================${ANSI.reset}`);

    for (const [tierNum, data] of Object.entries(this.resultsByTier)) {
      if (filterTier && parseInt(tierNum, 10) !== filterTier) continue;
      const statusColor = data.failed === 0 ? ANSI.green : ANSI.red;
      console.log(`  ${ANSI.bright}Tier ${tierNum}${ANSI.reset} - ${data.name}:`);
      console.log(`    Passed: ${statusColor}${data.passed}/${data.total}${ANSI.reset} (${data.total > 0 ? ((data.passed/data.total)*100).toFixed(1) : 0}%)`);
    }

    console.log(`------------------------------------------------------------------------`);
    const finalColor = this.failedTests === 0 ? ANSI.green : ANSI.red;
    console.log(`${ANSI.bright}Total Tests Executed: ${this.totalTests}${ANSI.reset}`);
    console.log(`${ANSI.bright}Passed: ${finalColor}${this.passedTests}${ANSI.reset} | ${ANSI.bright}Failed: ${this.failedTests > 0 ? ANSI.red : ANSI.dim}${this.failedTests}${ANSI.reset} | Duration: ${totalDuration}s`);
    console.log(`${ANSI.bright}${ANSI.cyan}========================================================================${ANSI.reset}\n`);

    if (this.failedTests > 0) {
      process.exitCode = 1;
    } else {
      process.exitCode = 0;
    }

    return {
      total: this.totalTests,
      passed: this.passedTests,
      failed: this.failedTests,
      durationSeconds: totalDuration,
      resultsByTier: this.resultsByTier
    };
  }
}

const runner = new TestContext();

global.describe = runner.describe.bind(runner);
global.test = runner.test.bind(runner);
global.it = runner.it.bind(runner);
global.beforeEach = runner.beforeEach.bind(runner);
global.afterEach = runner.afterEach.bind(runner);
global.beforeAll = runner.beforeAll.bind(runner);
global.afterAll = runner.afterAll.bind(runner);

// Auto-discover and load test files if executed directly
if (require.main === module) {
  const args = process.argv.slice(2);
  let filterTier = null;
  const tierIdx = args.indexOf('--tier');
  if (tierIdx !== -1 && args[tierIdx + 1]) {
    filterTier = parseInt(args[tierIdx + 1], 10);
  }

  const testsDir = path.join(__dirname);
  const tierDirs = [
    { tier: 1, dir: path.join(testsDir, 'tier1_feature_coverage') },
    { tier: 2, dir: path.join(testsDir, 'tier2_boundary_corner') },
    { tier: 3, dir: path.join(testsDir, 'tier3_cross_feature') },
    { tier: 4, dir: path.join(testsDir, 'tier4_real_world_scenarios') }
  ];

  for (const { tier, dir } of tierDirs) {
    if (fs.existsSync(dir)) {
      runner.setTier(tier);
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.test.js') || f.endsWith('.spec.js'));
      for (const file of files) {
        require(path.join(dir, file));
      }
    }
  }

  runner.runAll(filterTier);
}

module.exports = {
  runner,
  TestContext
};
