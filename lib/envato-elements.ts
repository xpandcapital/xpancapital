/**
 * Envato Elements Automation
 * Usa Puppeteer para hacer login y buscar/descargar items de Elements
 * ya que Envato Elements no tiene API pública
 */
import puppeteer, { Browser, Page } from 'puppeteer';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Cache del browser para reutilizar sesión
let cachedBrowser: Browser | null = null;
let sessionCookies: any[] = [];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function getCredentials() {
  const { data } = await supabase.from('api_keys').select('key_name, key_value');
  const keys: Record<string, string> = {};
  data?.forEach((k: any) => { keys[k.key_name] = k.key_value || ''; });
  return {
    email: keys.envato_elements_email || keys.envato_email || '',
    password: keys.envato_elements_password || keys.envato_password || '',
  };
}

async function getBrowser(): Promise<Browser> {
  if (cachedBrowser && cachedBrowser.connected) return cachedBrowser;
  cachedBrowser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--window-size=1280,800',
    ],
  });
  return cachedBrowser;
}

async function getLoggedInPage(): Promise<Page> {
  const browser = await getBrowser();
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  // Restaurar cookies si existen
  if (sessionCookies.length > 0) {
    await page.setCookie(...sessionCookies);
    // Verificar si la sesión sigue activa
    await page.goto('https://elements.envato.com', { waitUntil: 'networkidle2', timeout: 30000 });
    const isLoggedIn = await page.$('[data-testid="user-menu"], .user-account, [class*="UserAccount"], [class*="user-avatar"]');
    if (isLoggedIn) return page;
  }

  // Login
  const { email, password } = await getCredentials();
  if (!email || !password) throw new Error('Credenciales de Envato Elements no configuradas. Ve a Configuración → API Keys y agrega envato_elements_email y envato_elements_password.');

  await page.goto('https://account.envato.com/sign_in?to=elements', { waitUntil: 'networkidle2', timeout: 30000 });

  // Rellenar email
  await page.waitForSelector('#user_session_email, input[name="user_session[email]"], input[type="email"]', { timeout: 10000 });
  await page.type('#user_session_email, input[name="user_session[email]"], input[type="email"]', email, { delay: 50 });

  // Rellenar contraseña
  await page.type('#user_session_password, input[name="user_session[password]"], input[type="password"]', password, { delay: 50 });

  // Click en login
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }),
    page.click('input[type="submit"], button[type="submit"], .sign-in-btn'),
  ]);

  // Verificar login exitoso
  const currentUrl = page.url();
  if (currentUrl.includes('sign_in') || currentUrl.includes('login')) {
    throw new Error('Login fallido. Verifica las credenciales de Envato Elements.');
  }

  // Guardar cookies
  sessionCookies = await page.cookies();

  return page;
}

export interface ElementsItem {
  id: string;
  title: string;
  thumbnail: string;
  author: string;
  category: string;
  tags: string[];
  url: string;
  downloadUrl?: string;
}

export async function searchElementsItems(query: string, page: number = 1): Promise<ElementsItem[]> {
  const browserPage = await getLoggedInPage();

  try {
    const searchUrl = `https://elements.envato.com/email-templates?q=${encodeURIComponent(query)}&page=${page}`;
    await browserPage.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });

    // Esperar a que carguen los items
    await browserPage.waitForSelector('[class*="ItemCard"], [class*="item-card"], article[class*="Card"]', { timeout: 15000 }).catch(() => {});

    // Extraer items del DOM
    const items = await browserPage.evaluate(() => {
      const cards = document.querySelectorAll('[class*="ItemCard"], [class*="item-card"], article[class*="Card"], [data-testid*="item"]');
      return Array.from(cards).slice(0, 24).map(card => {
        const link = card.querySelector('a') as HTMLAnchorElement;
        const img = card.querySelector('img') as HTMLImageElement;
        const title = card.querySelector('[class*="title"], h3, h2, [class*="name"]');
        const author = card.querySelector('[class*="author"], [class*="creator"]');
        return {
          id: link?.href?.split('/').pop()?.split('?')[0] || '',
          title: title?.textContent?.trim() || img?.alt || 'Email Template',
          thumbnail: img?.src || img?.dataset?.src || '',
          author: author?.textContent?.trim() || 'Envato',
          category: 'Email Templates',
          tags: [],
          url: link?.href || '',
        };
      });
    });

    await browserPage.close();
    return items.filter(i => i.id && i.title);
  } catch (err) {
    await browserPage.close().catch(() => {});
    throw err;
  }
}

export async function downloadElementsItem(itemUrl: string): Promise<Buffer> {
  const browserPage = await getLoggedInPage();

  try {
    await browserPage.goto(itemUrl, { waitUntil: 'networkidle2', timeout: 30000 });

    // Hacer click en el botón de descarga
    const downloadBtn = await browserPage.$('[class*="download"], button[class*="Download"], a[class*="download"], [data-testid*="download"]');
    if (!downloadBtn) throw new Error('No se encontró el botón de descarga. Verifica que tienes una suscripción activa de Envato Elements.');

    // Interceptar la descarga del ZIP
    const client = await browserPage.createCDPSession();
    await client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: '/tmp/envato-downloads',
    });

    // Configurar interceptor de red para capturar el ZIP
    let zipBuffer: Buffer | null = null;
    const zipPromise = new Promise<Buffer>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Timeout esperando descarga del ZIP')), 60000);
      
      browserPage.on('response', async (response) => {
        const url = response.url();
        const contentType = response.headers()['content-type'] || '';
        if (url.includes('.zip') || contentType.includes('zip') || contentType.includes('octet-stream')) {
          clearTimeout(timeout);
          const buffer = await response.buffer();
          resolve(Buffer.from(buffer));
        }
      });
    });

    await downloadBtn.click();

    // Manejar posibles modales de confirmación
    await delay(2000);
    const confirmBtn = await browserPage.$('[class*="confirm"], [class*="Confirm"], [class*="proceed"]');
    if (confirmBtn) await confirmBtn.click();

    zipBuffer = await zipPromise;
    await browserPage.close();

    if (!zipBuffer) throw new Error('No se pudo descargar el ZIP');
    return zipBuffer;
  } catch (err) {
    await browserPage.close().catch(() => {});
    throw err;
  }
}

// Función auxiliar — la página de Puppeteer no tiene .on en el scope correcto
// Reescribir con request interception
export async function downloadElementsItemV2(itemUrl: string): Promise<ArrayBuffer> {
  const browser = await getBrowser();
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  // Restaurar sesión
  if (sessionCookies.length > 0) await page.setCookie(...sessionCookies);

  try {
    // Navegar al item
    await page.goto(itemUrl, { waitUntil: 'networkidle2', timeout: 30000 });

    // Buscar y hacer click en descargar
    const downloadButton = await page.waitForSelector(
      '[class*="DownloadButton"], [class*="download-btn"], button[class*="download"], a[href*="download"]',
      { timeout: 10000 }
    );

    if (!downloadButton) throw new Error('Botón de descarga no encontrado');

    // Interceptar la respuesta ZIP
    const zipBuffer = await new Promise<ArrayBuffer>(async (resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Timeout: no se descargó el ZIP en 60s')), 60000);

      // Escuchar respuestas de red
      page.on('response', async (response) => {
        const url = response.url();
        const ct = response.headers()['content-type'] || '';
        const cd = response.headers()['content-disposition'] || '';
        if (
          ct.includes('zip') || ct.includes('octet-stream') ||
          cd.includes('.zip') || url.includes('/download')
        ) {
          try {
            clearTimeout(timeout);
            const buf = await response.buffer();
            resolve(buf.buffer as ArrayBuffer);
          } catch (e) {
            reject(e);
          }
        }
      });

      // Click en el botón
      await downloadButton.click().catch(reject);

      // Si hay modal de confirmación
      setTimeout(async () => {
        const modal = await page.$('[class*="Modal"] button, [role="dialog"] button[class*="primary"]');
        if (modal) await modal.click().catch(() => {});
      }, 2000);
    });

    await page.close();
    sessionCookies = await (await getBrowser().then(b => b.pages()))[0]?.cookies() || sessionCookies;

    return zipBuffer;
  } catch (err) {
    await page.close().catch(() => {});
    throw err;
  }
}
