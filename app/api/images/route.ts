import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/utils/logger';
import { getAuthUser } from '@/lib/supabase/api-auth';
import { getApiKeys as getApiKeysWithFallback } from '@/lib/api-keys';
import { createClient as createSupabaseClient } from '@/lib/supabase/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============ OBTENER API KEYS ============

async function getApiKeys(request: NextRequest) {
  const auth = await getAuthUser(request);
  if (!auth) {
    logger.warn('Usuario no autenticado en /api/images, usando keys globales');
    // Fallback a lectura directa sin filtro (comportamiento anterior)
    const { data: keys, error } = await supabase
      .from('api_keys')
      .select('key_name, key_value');

    if (error) {
      logger.error('Error fetching API keys:', error);
    }

    const apiKeys: Record<string, string> = {};
    keys?.forEach((k: any) => {
      apiKeys[k.key_name] = k.key_value || '';
    });

    return {
      unsplash: apiKeys.unsplash_access_key || apiKeys.unsplash_api_key || '',
      pexels: apiKeys.pexels_api_key || '',
      pixabay: apiKeys.pixabay_api_key || '',
      freepik: apiKeys.freepik_key || apiKeys.freepik_api_key || '',
      envato: apiKeys.envato_personal_token || apiKeys.envato_api_key || '',
      openai: apiKeys.openai_key || '',
      gemini: apiKeys.gemini_key || '',
      stability: apiKeys.stability_key || apiKeys.stability_api_key || '',
      replicate: apiKeys.replicate_key || apiKeys.replicate_api_key || '',
      xai: apiKeys.xai_api_key || '',
      brandfetch: apiKeys.brandfetch_api_key || ''
    };
  }

  // Usar helper con fallback personal → global
  const supabaseClient = createSupabaseClient();
  const keyNames = [
    'unsplash_access_key', 'unsplash_api_key', 'pexels_api_key', 'pixabay_api_key',
    'freepik_key', 'freepik_api_key', 'envato_personal_token', 'envato_api_key',
    'openai_key', 'gemini_key', 'stability_key', 'stability_api_key',
    'replicate_key', 'replicate_api_key', 'xai_api_key', 'brandfetch_api_key'
  ];

  const apiKeys = await getApiKeysWithFallback(supabaseClient, keyNames, auth.userId, auth.empresaId);

  return {
    unsplash: apiKeys.unsplash_access_key || apiKeys.unsplash_api_key || '',
    pexels: apiKeys.pexels_api_key || '',
    pixabay: apiKeys.pixabay_api_key || '',
    freepik: apiKeys.freepik_key || apiKeys.freepik_api_key || '',
    envato: apiKeys.envato_personal_token || apiKeys.envato_api_key || '',
    openai: apiKeys.openai_key || '',
    gemini: apiKeys.gemini_key || '',
    stability: apiKeys.stability_key || apiKeys.stability_api_key || '',
    replicate: apiKeys.replicate_key || apiKeys.replicate_api_key || '',
    xai: apiKeys.xai_api_key || '',
    brandfetch: apiKeys.brandfetch_api_key || ''
  };
}

// ============ BUSCAR IMÁGENES ============

// Unsplash
async function searchUnsplash(query: string, apiKey: string, page: number = 1) {
  try {
    if (!apiKey) return [];
    
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=20&orientation=landscape`,
      { headers: { 'Authorization': `Client-ID ${apiKey}` } }
    );

    if (!response.ok) return [];
    const data = await response.json();
    
    return data.results?.map((item: any) => ({
      id: `unsplash-${item.id}`,
      type: 'photo',
      title: item.alt_description || 'Photo',
      thumbnail: item.urls?.thumb,
      preview: item.urls?.regular,
      full: item.urls?.full,
      source: 'unsplash',
      author: item.user?.name
    })) || [];
  } catch (error) {
    logger.error('Unsplash error:', error);
    return [];
  }
}

// Pexels
async function searchPexels(query: string, apiKey: string, page: number = 1) {
  try {
    if (!apiKey) return [];
    
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&page=${page}&per_page=20&orientation=landscape`,
      { headers: { 'Authorization': apiKey } }
    );

    if (!response.ok) return [];
    const data = await response.json();
    
    return data.photos?.map((item: any) => ({
      id: `pexels-${item.id}`,
      type: 'photo',
      title: item.alt || 'Photo',
      thumbnail: item.src?.tiny,
      preview: item.src?.large,
      full: item.src?.original,
      source: 'pexels',
      author: item.photographer
    })) || [];
  } catch (error) {
    logger.error('Pexels error:', error);
    return [];
  }
}

// Pixabay
async function searchPixabay(query: string, apiKey: string, page: number = 1) {
  try {
    if (!apiKey) return [];
    
    const response = await fetch(
      `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(query)}&page=${page}&per_page=20&image_type=photo&orientation=horizontal`
    );

    if (!response.ok) return [];
    const data = await response.json();
    
    return data.hits?.map((item: any) => ({
      id: `pixabay-${item.id}`,
      type: 'photo',
      title: item.tags,
      thumbnail: item.previewURL,
      preview: item.webformatURL,
      full: item.largeImageURL,
      source: 'pixabay',
      author: item.user
    })) || [];
  } catch (error) {
    logger.error('Pixabay error:', error);
    return [];
  }
}

// Freepik
async function searchFreepik(query: string, apiKey: string, page: number = 1) {
  try {
    if (!apiKey) {
      logger.debug('Freepik: No API key');
      return [];
    }
    
    logger.debug('Freepik: Searching...', query);
    
    const response = await fetch(
      `https://api.freepik.com/v1/resources?term=${encodeURIComponent(query)}&page=${page}&limit=20&filters[content_type][photo]=1`,
      {
        headers: {
          'x-freepik-api-key': apiKey,
          'Accept': 'application/json'
        }
      }
    );

    logger.debug('Freepik status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      logger.error('Freepik error:', response.status, errorText);
      return [];
    }

    const data = await response.json();
    logger.debug('Freepik results:', data.data?.length || 0);
    
    const items = data.data || [];
    
    return items.map((item: any) => {
      const thumbnailUrl = item.image?.source?.url || item.thumbnail_url || '';
      const fullUrl = item.image?.source?.url || thumbnailUrl;
      
      return{
        id: `freepik-${item.id}`,
        type: item.image?.type || 'photo',
        title: item.title || 'Freepik Photo',
        thumbnail: thumbnailUrl,
        preview: fullUrl,
        full: fullUrl,
        source: 'freepik',
        author: item.author?.name || 'Freepik',
        freepikId: item.id
      };
    });
  } catch (error) {
    logger.error('Freepik error:', error);
    return [];
  }
}

// Envato Elements API
async function searchEnvato(query: string, token: string, page: number = 1) {
  try {
    if (!token) {
      logger.debug('Envato: No token configured');
      return [];
    }
    
    logger.debug('Envato: Token length:', token.length, 'Query:', query);
    
    // Buscar en ThemeForest — Email Templates
    // La API de Envato usa el endpoint de búsqueda con site y category_filter
    const searchTerm = query;

    // Intentar con búsqueda en site específico
    const endpoints = [
      // Opción 1: category filter explícito
      `https://api.envato.com/v1/discovery/search/search/item?term=${encodeURIComponent(searchTerm)}&page=${page}&site=themeforest.net&category=site-templates%2Femail-templates`,
      // Opción 2: sin category, solo site
      `https://api.envato.com/v1/discovery/search/search/item?term=${encodeURIComponent(searchTerm + ' email template')}&page=${page}&site=themeforest.net`,
      // Opción 3: endpoint v3 con filtros
      `https://api.envato.com/v3/market/catalog/item?site=themeforest.net&term=${encodeURIComponent(searchTerm)}&category=site-templates%2Femail-templates`,
    ];

    let data: any = null;
    let usedEndpoint = '';

    for (const endpoint of endpoints) {
      logger.debug('Envato trying:', endpoint);
      const response = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      logger.debug('Envato status:', response.status, 'for', endpoint);
      if (response.ok) {
        const json = await response.json();
        if (json.matches?.length > 0 || json.items?.length > 0) {
          data = json;
          usedEndpoint = endpoint;
          break;
        }
        if (!data) data = json; // guardar aunque vacío para debug
      } else {
        const err = await response.text();
        logger.error('Envato error:', response.status, err.substring(0, 200));
      }
    }

    const items = data?.matches || data?.items || [];
    logger.debug('Envato items found:', items.length, 'endpoint:', usedEndpoint);
    
    if (!Array.isArray(items) || items.length === 0) {
      return [];
    }
    
    const results = items.map((item: any) => {
      const previews = item.previews || {};

      // ThemeForest email templates usan landscape_preview
      const landscape = previews.landscape_preview || {};
      const square = previews.icon_with_square_preview || {};

      // Miniatura: landscape_url es la más representativa para email templates
      const thumbnailUrl =
        landscape.landscape_url ||
        landscape.image_urls?.[0]?.url ||
        square.square_url ||
        item.thumbnail_url ||
        square.icon_url ||
        '';

      const previewUrl = thumbnailUrl;

      // Precio
      const price = item.price_cents ? (item.price_cents / 100).toFixed(0) : null;
      const rating = item.rating?.rating ? parseFloat(item.rating.rating).toFixed(1) : null;
      const sales = item.number_of_sales || 0;

      return {
        id: item.id,              // ID numérico real (sin prefijo)
        envatoId: item.id,
        type: 'envato_template',
        title: item.name || 'Email Template',
        thumbnail: thumbnailUrl,
        preview: previewUrl,
        full: previewUrl,
        source: 'envato',
        author: item.author_username || 'Envato',
        price,
        rating,
        sales,
        url: item.url || `https://themeforest.net/item/${item.id}`,
      };
    }).filter((img: any) => img.thumbnail && img.thumbnail.length > 5);
    
    logger.debug('Envato valid results:', results.length);
    return results;
  } catch (error) {
    logger.error('Envato error:', error);
    return [];
  }
}

// Brandfetch (Logo Search)
async function searchBrandfetch(query: string, apiKey: string) {
  try {
    if (!apiKey) {
      logger.debug('Brandfetch: No API key');
      return [];
    }
    
    logger.debug('Brandfetch: Searching...', query);
    
    const response = await fetch(
      `https://api.brandfetch.io/v2/brands/${encodeURIComponent(query)}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        }
      }
    );

    logger.debug('Brandfetch status:', response.status);
    
    if (!response.ok) return [];
    
    const data = await response.json();
    
    // Brandfetch devuelve logos e iconos
    const logos = data.logos || [];
    const icons = data.icons || [];
    
    const results: any[] = [];
    
    logos.forEach((logo: any, i: number) => {
      results.push({
        id: `brandfetch-logo-${data.domain}-${i}`,
        type: 'logo',
        title: data.name || query,
        thumbnail: logo.formats?.[0]?.src,
        preview: logo.formats?.[0]?.src,
        full: logo.formats?.[0]?.src,
        source: 'brandfetch',
        author: data.name
      });
    });
    
    icons.forEach((icon: any, i: number) => {
      results.push({
        id: `brandfetch-icon-${data.domain}-${i}`,
        type: 'icon',
        title: data.name || query,
        thumbnail: icon.formats?.[0]?.src,
        preview: icon.formats?.[0]?.src,
        full: icon.formats?.[0]?.src,
        source: 'brandfetch',
        author: data.name
      });
    });
    
    return results;
  } catch (error) {
    logger.error('Brandfetch error:', error);
    return [];
  }
}

// ============ GENERAR IMÁGENES CON IA ============

// OpenAI DALL-E 3
async function generateDALLE(prompt: string, apiKey: string, size: string = 'square') {
  try {
    if (!apiKey) return { success: false, error: 'OpenAI API key required' };

    const sizeMap: Record<string, string> = {
      'square': '1024x1024',
      'landscape': '1792x1024',
      'portrait': '1024x1792'
    };

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: `${prompt}. High quality, professional, detailed.`,
        n: 1,
        size: sizeMap[size] || '1024x1024',
        quality: 'standard'
      })
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.error?.message || `DALL-E error: ${response.status}` };
    }

    const data = await response.json();
    
    if (data.data?.[0]?.url) {
      return {
        success: true,
        images: [{
          id: `dalle-${Date.now()}`,
          type: 'ai-generated',
          title: prompt,
          thumbnail: data.data[0].url,
          preview: data.data[0].url,
          full: data.data[0].url,
          source: 'dalle',
          author: 'DALL-E 3'
        }]
      };
    }

    return { success: false, error: 'No image generated' };
  } catch (error) {
    return { success: false, error: 'DALL-E generation failed' };
  }
}

// Gemini (texto, no genera imágenes)
async function generateGemini(prompt: string, apiKey: string) {
  return { 
    success: false, 
    error: 'Gemini no genera imágenes. Usa DALL-E, Stability AI o Replicate.' 
  };
}

// Stability AI
async function generateStability(prompt: string, apiKey: string, size: string = 'square') {
  try {
    if (!apiKey) return { success: false, error: 'Stability API key required' };

    const sizeMap: Record<string, { width: number; height: number }> = {
      'square': { width: 1024, height: 1024 },
      'landscape': { width: 1344, height: 768 },
      'portrait': { width: 768, height: 1344 }
    };

    const { width, height } = sizeMap[size] || { width: 1024, height: 1024 };

    const response = await fetch(
      'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text_prompts: [{ text: prompt }],
          cfg_scale: 7,
          height,
          width,
          steps: 30,
          samples: 1
        })
      }
    );

    if (!response.ok) {
      return { success: false, error: `Stability error: ${response.status}` };
    }

    const data = await response.json();
    
    if (data.artifacts?.[0]?.base64) {
      const imageUrl = `data:image/png;base64,${data.artifacts[0].base64}`;
      return {
        success: true,
        images: [{
          id: `stability-${Date.now()}`,
          type: 'ai-generated',
          title: prompt,
          thumbnail: imageUrl,
          preview: imageUrl,
          full: imageUrl,
          source: 'stability',
          author: 'Stable Diffusion XL'
        }]
      };
    }

    return { success: false, error: 'No image generated' };
  } catch (error) {
    return { success: false, error: 'Stability generation failed' };
  }
}

// Replicate (Flux)
async function generateReplicate(prompt: string, apiKey: string, size: string = 'square') {
  try {
    if (!apiKey) return { success: false, error: 'Replicate API key required' };

    const sizeMap: Record<string, { width: number; height: number }> = {
      'square': { width: 1024, height: 1024 },
      'landscape': { width: 1344, height: 768 },
      'portrait': { width: 768, height: 1344 }
    };

    const { width, height } = sizeMap[size] || { width: 1024, height: 1024 };

    const createResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: 'flux-schnell',
        input: { prompt, width, height }
      })
    });

    if (!createResponse.ok) {
      return { success: false, error: `Replicate error: ${createResponse.status}` };
    }

    const prediction = await createResponse.json();
    
    // Polling
    let result = prediction;
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 1000));
      
      const statusResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${prediction.id}`,
        { headers: { 'Authorization': `Bearer ${apiKey}` } }
      );
      
      result = await statusResponse.json();
      
      if (result.status === 'succeeded' && result.output?.[0]) {
        return {
          success: true,
          images: [{
            id: `replicate-${Date.now()}`,
            type: 'ai-generated',
            title: prompt,
            thumbnail: result.output[0],
            preview: result.output[0],
            full: result.output[0],
            source: 'replicate',
            author: 'Flux Schnell'
          }]
        };
      }
      
      if (result.status === 'failed') {
        return { success: false, error: 'Generation failed' };
      }
    }

    return { success: false, error: 'Timeout' };
  } catch (error) {
    return { success: false, error: 'Replicate failed' };
  }
}

// ============ SUBIR IMAGEN ============

async function downloadAndUpload(imageUrl: string, filename: string) {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error('Download failed');
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const { error } = await supabase.storage
      .from('cms')
      .upload(`blog/${filename}`, buffer, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (error) throw error;

    const { data: publicUrl } = supabase.storage
      .from('cms')
      .getPublicUrl(`blog/${filename}`);

    return { success: true, url: publicUrl.publicUrl };
  } catch (error) {
    logger.error('Upload error:', error);
    return { success: false, error: 'Failed to upload' };
  }
}

// ============ ENDPOINT PRINCIPAL ============

export async function GET(request: NextRequest) {
  logger.debug('=== IMAGES API CALLED ===');
  
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');
    const query = searchParams.get('query') || '';
    const prompt = searchParams.get('prompt') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const source = searchParams.get('source') || 'all';
    const generator = searchParams.get('generator') || 'auto';
    const size = searchParams.get('size') || 'square';

    const apiKeys = await getApiKeys(request);

    // STATUS
    if (action === 'status') {
      return NextResponse.json({
        success: true,
        keys: {
          unsplash: !!apiKeys.unsplash,
          pexels: !!apiKeys.pexels,
          pixabay: !!apiKeys.pixabay,
          freepik: !!apiKeys.freepik,
          envato: !!apiKeys.envato,
          brandfetch: !!apiKeys.brandfetch,
          openai: !!apiKeys.openai,
          gemini: !!apiKeys.gemini,
          stability: !!apiKeys.stability,
          replicate: !!apiKeys.replicate
        }
      });
    }

    // SEARCH
    if (action === 'search') {
      const results: any[] = [];
      logger.debug('Search:', query, 'Source:', source);

      if (source === 'all' || source === 'unsplash') {
        results.push(...await searchUnsplash(query, apiKeys.unsplash, page));
      }
      if (source === 'all' || source === 'pexels') {
        results.push(...await searchPexels(query, apiKeys.pexels, page));
      }
      if (source === 'all' || source === 'pixabay') {
        results.push(...await searchPixabay(query, apiKeys.pixabay, page));
      }
      if (source === 'all' || source === 'freepik') {
        results.push(...await searchFreepik(query, apiKeys.freepik, page));
      }
      if (source === 'all' || source === 'envato') {
        results.push(...await searchEnvato(query, apiKeys.envato, page));
      }
      if (source === 'all' || source === 'brandfetch') {
        results.push(...await searchBrandfetch(query, apiKeys.brandfetch));
      }

      logger.debug('Total results:', results.length);
      return NextResponse.json({ success: true, results, total: results.length });
    }

    // GENERATE
    if (action === 'generate') {
      if (!prompt) return NextResponse.json({ success: false, error: 'Prompt required' }, { status: 400 });

      let result;
      
      if (generator === 'dalle' || (generator === 'auto' && apiKeys.openai)) {
        result = await generateDALLE(prompt, apiKeys.openai, size);
      } else if (generator === 'stability' || (generator === 'auto' && apiKeys.stability)) {
        result = await generateStability(prompt, apiKeys.stability, size);
      } else if (generator === 'replicate' || (generator === 'auto' && apiKeys.replicate)) {
        result = await generateReplicate(prompt, apiKeys.replicate, size);
      } else {
        result = { success: false, error: 'No AI API key configured' };
      }

      return NextResponse.json(result);
    }

    // DOWNLOAD
    if (action === 'download') {
      const imageUrl = searchParams.get('url');
      const filename = searchParams.get('filename') || `image-${Date.now()}.jpg`;

      if (!imageUrl) return NextResponse.json({ success: false, error: 'URL required' }, { status: 400 });

      const result = await downloadAndUpload(imageUrl, filename);
      return NextResponse.json(result);
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    logger.error('API Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const empresaId = formData.get('empresa_id') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `email-media/${empresaId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await supabase.storage
      .from('cms')
      .upload(fileName, buffer, {
        contentType: file.type || 'image/jpeg',
        upsert: true
      });

    if (error) {
      logger.error('Upload error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: publicUrl } = supabase.storage
      .from('cms')
      .getPublicUrl(fileName);

    return NextResponse.json({ 
      success: true, 
      url: publicUrl.publicUrl,
      path: data?.path
    });
  } catch (error) {
    logger.error('POST error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Upload failed' 
    }, { status: 500 });
  }
}