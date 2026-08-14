import { expect, test } from '@playwright/test';
import axe from 'axe-core';

async function seriousAccessibilityViolations(page) {
  await page.addScriptTag({ content: axe.source });
  const report = await page.evaluate(async () => globalThis.axe.run(document));
  return report.violations.filter(item => ['critical', 'serious'].includes(item.impact));
}

async function disableMotion(page) {
  await page.addStyleTag({
    content: '*,*::before,*::after{animation:none!important;transition:none!important}',
  });
}

async function enterAssessment(page) {
  await page.goto('/');
  await disableMotion(page);
  await page.getByRole('button', { name: 'Iniciar test' }).click();
  const scrollBox = page.locator('.scroll-box').first();
  await scrollBox.evaluate(element => {
    element.scrollTop = element.scrollHeight;
    element.dispatchEvent(new Event('scroll'));
  });
  await page.getByText('Doy mi consentimiento expreso*').click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByText('BLOQUE 1 DE 3')).toBeVisible();
}

async function answerCurrentQuestion(page) {
  const input = page.locator('input').first();
  if (await input.isVisible().catch(() => false)) {
    const type = await input.getAttribute('type');
    await input.fill(type === 'number' ? '20' : 'CENIDET');
  } else if (await page.getByRole('button', { name: 'Valor 1' }).isVisible().catch(() => false)) {
    await page.getByRole('button', { name: 'Valor 1' }).click({ force: true });
  } else {
    const none = page.getByRole('checkbox', { name: 'Ninguno', exact: true });
    const privateOption = page.getByRole('checkbox', { name: 'Prefiero no decirlo', exact: true });
    if (await none.isVisible().catch(() => false)) await none.click({ force: true });
    else if (await privateOption.isVisible().catch(() => false)) await privateOption.click({ force: true });
    else if (await page.getByRole('checkbox').first().isVisible().catch(() => false)) {
      await page.getByRole('checkbox').first().click({ force: true });
    } else {
      await page.getByRole('radio').first().click({ force: true });
    }
  }
  const next = page.getByRole('button', { name: 'Continuar' });
  await expect(next).toBeEnabled();
  await next.click({ force: true });
}

test('[accessibility] bienvenida y privacidad no tienen problemas automáticos serios', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Bienvenido/a' })).toBeVisible();
  const welcomeViolations = await seriousAccessibilityViolations(page);

  await page.getByRole('button', { name: 'Iniciar test' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Aviso de Privacidad' })).toBeVisible();
  const privacyViolations = await seriousAccessibilityViolations(page);
  expect({
    welcome: welcomeViolations.map(item => item.id),
    privacy: privacyViolations.map(item => item.id),
  }).toEqual({ welcome: [], privacy: [] });
});

test('no presenta desplazamiento horizontal en anchos objetivo', async ({ page }) => {
  for (const width of [320, 375, 768, 1024, 1366]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/');
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }));
    expect(dimensions.content, `ancho ${width}`).toBeLessThanOrEqual(dimensions.viewport);
  }
});

test('completa el cuestionario de punta a punta y conserva resultado y folio', async ({ page }) => {
  await enterAssessment(page);
  for (let index = 0; index < 9; index += 1) await answerCurrentQuestion(page);
  await expect(page.getByText('BLOQUE 2 DE 3')).toBeVisible();
  for (let index = 0; index < 21; index += 1) await answerCurrentQuestion(page);
  await expect(page.getByText('BLOQUE 3 DE 3')).toBeVisible();
  for (let index = 0; index < 26; index += 1) await answerCurrentQuestion(page);

  await expect(page.getByRole('heading', { name: 'Fin del cuestionario' })).toBeVisible();
  await expect(page.getByText('FOLIO', { exact: true })).toBeVisible();
  await expect(page.getByText('CÓDIGO PRIVADO', { exact: true })).toBeVisible();
  await expect(page.getByText('0%', { exact: true })).toHaveCount(3);
});
