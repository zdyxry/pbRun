#!/usr/bin/env node
/**
 * 自动截取网站截图脚本
 * 使用 Playwright 截取本地或生产环境的页面截图
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 配置
const BASE_URL = process.env.SCREENSHOT_URL || 'http://localhost:3000';
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots');

// iPhone 15 Pro Max 尺寸和 UA
const VIEWPORT = { width: 430, height: 932 };
const USER_AGENT = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

// 确保截图目录存在
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

// 截图配置
const screenshots = [
  {
    name: 'activity-list',
    path: '/list',
    description: '活动列表页面',
    waitFor: 'table, .activity-item, [class*="activity"]', // 等待活动列表加载
    scrollTo: 0,
  },
  {
    name: 'vdot-trend',
    path: '/analysis',
    description: 'VDOT 趋势分析页面',
    waitFor: 'canvas, svg, [class*="chart"]', // 等待图表加载
    scrollTo: 0,
    scrollToElement: null,
  },
  {
    name: 'stats',
    path: '/stats',
    description: '统计数据页面',
    waitFor: 'canvas, svg, [class*="chart"], [class*="stat"]',
    scrollTo: 0,
  },
  {
    name: 'training-paces',
    path: '/daniels',
    description: '训练配速建议页面',
    waitFor: 'table, [class*="pace"]',
    scrollTo: 0,
    optional: true, // 可选页面
  },
];

async function takeScreenshot(page, config) {
  const url = `${BASE_URL}${config.path}`;
  console.log(`\n📸 截取: ${config.description}`);
  console.log(`   URL: ${url}`);

  try {
    // 访问页面
    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // 等待内容加载
    try {
      await page.waitForSelector(config.waitFor, { timeout: 10000 });
    } catch (e) {
      console.log(`   ⚠️  未找到选择器 "${config.waitFor}"，继续截图...`);
    }

    // 额外等待确保渲染完成
    await page.waitForTimeout(2000);

    // 滚动（如果需要）
    if (config.scrollTo > 0) {
      await page.evaluate((scrollY) => {
        window.scrollTo(0, scrollY);
      }, config.scrollTo);
      await page.waitForTimeout(500);
    }

    // 截图
    const screenshotPath = path.join(SCREENSHOTS_DIR, `${config.name}.png`);
    await page.screenshot({
      path: screenshotPath,
      fullPage: true, // 全屏截图
    });

    // 检查文件大小
    const stats = fs.statSync(screenshotPath);
    const fileSizeKB = Math.round(stats.size / 1024);

    console.log(`   ✅ 保存成功: ${config.name}.png (${fileSizeKB} KB)`);

    if (fileSizeKB > 500) {
      console.log(`   ⚠️  文件较大，建议使用 TinyPNG 压缩`);
    }

    return true;
  } catch (error) {
    if (config.optional) {
      console.log(`   ⏭️  跳过可选页面: ${error.message}`);
      return false;
    } else {
      console.error(`   ❌ 截图失败: ${error.message}`);
      throw error;
    }
  }
}

async function main() {
  console.log('🎬 开始截图...');
  console.log(`📍 目标地址: ${BASE_URL}`);
  console.log(`💾 保存目录: ${SCREENSHOTS_DIR}\n`);

  const browser = await chromium.launch({
    headless: true, // 无头模式
  });

  const context = await browser.newContext({
    viewport: VIEWPORT,
    userAgent: USER_AGENT,
    deviceScaleFactor: 3, // iPhone 15 Pro Max 是 3x
    isMobile: true,
    hasTouch: true,
  });

  const page = await context.newPage();

  let successCount = 0;
  let failCount = 0;

  for (const config of screenshots) {
    try {
      const success = await takeScreenshot(page, config);
      if (success) successCount++;
    } catch (error) {
      failCount++;
      if (!config.optional) {
        console.error(`\n❌ 严重错误，停止截图\n`);
        break;
      }
    }
  }

  await browser.close();

  console.log('\n' + '='.repeat(60));
  console.log(`✨ 截图完成！`);
  console.log(`   成功: ${successCount} 个`);
  console.log(`   失败: ${failCount} 个`);
  console.log(`   保存位置: ${SCREENSHOTS_DIR}`);
  console.log('='.repeat(60) + '\n');

  if (successCount > 0) {
    console.log('📝 下一步:');
    console.log('   1. 查看截图: open screenshots/');
    console.log('   2. 使用 TinyPNG 压缩大文件: https://tinypng.com/');
    console.log('   3. 更新 README.md，取消注释图片链接');
    console.log('');
  }
}

// 运行
main().catch((error) => {
  console.error('\n❌ 发生错误:', error);
  process.exit(1);
});
