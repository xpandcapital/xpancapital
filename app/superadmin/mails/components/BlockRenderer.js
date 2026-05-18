import React, { memo } from 'react';

const SOCIAL_CONFIG = {
  facebook: { iconName: 'facebook-f', defaultBg: '#1877F2', label: 'Facebook' },
  twitter: { iconName: 'twitterx--v1', defaultBg: '#000000', label: 'X (Twitter)' },
  instagram: { iconName: 'instagram-new', defaultBg: '#E1306C', label: 'Instagram' },
  linkedin: { iconName: 'linkedin', defaultBg: '#0177B5', label: 'LinkedIn' },
  youtube: { iconName: 'youtube-play', defaultBg: '#FF0000', label: 'YouTube' },
  tiktok: { iconName: 'tiktok', defaultBg: '#000000', label: 'TikTok' },
  whatsapp: { iconName: 'whatsapp', defaultBg: '#25D366', label: 'WhatsApp' },
  telegram: { iconName: 'telegram-app', defaultBg: '#0088CC', label: 'Telegram' }
};

const getBgStyle = (content) => {
  const style = {
    backgroundColor: content.bgColor || 'transparent'
  };
  if (content.bgImageUrl) {
    style.backgroundImage = `url('${content.bgImageUrl}')`;
    style.backgroundSize = content.bgSize || 'cover';
    style.backgroundPosition = content.bgPosition || 'center';
    style.backgroundRepeat = 'no-repeat';
  }
  return style;
};

const BlockRenderer = memo(function BlockRenderer({ block, settings, isSelected, onClick }) {
  const { type, content } = block;
  const fontFamily = content.fontFamily && content.fontFamily !== 'inherit' ? content.fontFamily : settings.fontFamily || 'Verdana, Geneva, sans-serif';
  
  const renderText = (txt) => txt.split('\n').map((s, i) => <React.Fragment key={i}>{s}{i < txt.split('\n').length - 1 && <br />}</React.Fragment>);

  const paddingStyle = (block) => {
    const p = block.content;
    if (p.paddingTop !== undefined || p.paddingRight !== undefined || p.paddingBottom !== undefined || p.paddingLeft !== undefined) {
      return `${p.paddingTop ?? p.padding ?? 0}px ${p.paddingRight ?? p.padding ?? 0}px ${p.paddingBottom ?? p.padding ?? 0}px ${p.paddingLeft ?? p.padding ?? 0}px`;
    }
    return `${p.padding ?? 0}px`;
  };

  const getStyle = (block) => {
    const base = {
      outline: isSelected ? '2px solid #e11d48' : 'none',
      outlineOffset: '-2px',
      cursor: 'pointer'
    };
    return base;
  };

  if (type === 'header') {
    return (
      <div 
        style={{ 
          ...getBgStyle(content),
          padding: `${content.padding ?? 0}px`, 
          textAlign: content.align || 'center',
          ...getStyle(block)
        }} 
        onClick={onClick}
      >
        {content.logoUrl ? (
          <img
            src={content.logoUrl}
            alt="Logo"
            style={{ width: `${content.logoWidth ?? 600}px`, maxWidth: '100%', display: 'inline-block' }}
          />
        ) : (
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: `${content.logoWidth ?? 150}px`, height: '40px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', border: '1px dashed rgba(255,255,255,0.3)' }}>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontFamily: 'Arial, sans-serif', fontWeight: 700 }}>LOGO</span>
          </div>
        )}
      </div>
    );
  }
  
  if (type === 'text') {
    return (
      <div 
        style={{ 
          ...getBgStyle(content),
          padding: paddingStyle(block),
          textAlign: content.align || 'center',
          ...getStyle(block)
        }} 
        onClick={onClick}
      >
        <p style={{ 
          color: content.textColor || '#333', 
          fontSize: `${content.fontSize ?? 16}px`, 
          fontWeight: content.fontWeight || 'normal',
          fontFamily: fontFamily,
          lineHeight: content.lineHeight || 1.5,
          margin: 0
        }}>
          {renderText(content.text || '')}
        </p>
      </div>
    );
  }
  
  if (type === 'image') {
    return (
      <div 
        style={{ 
          ...getBgStyle(content),
          padding: `${content.padding ?? 0}px`, 
          textAlign: content.align || 'center',
          ...getStyle(block)
        }} 
        onClick={onClick}
      >
        {content.linkUrl ? (
          <a href={content.linkUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
            <img 
              src={content.imageUrl} 
              alt={content.altText || ''} 
              style={{ width: `${content.width ?? 100}%`, borderRadius: `${content.borderRadius ?? 0}px`, maxWidth: '100%' }} 
            />
          </a>
        ) : (
          <img 
            src={content.imageUrl} 
            alt={content.altText || ''} 
            style={{ width: `${content.width ?? 100}%`, borderRadius: `${content.borderRadius ?? 0}px`, maxWidth: '100%' }} 
          />
        )}
      </div>
    );
  }
  
  if (type === 'video') {
    const videoThumb = content.coverUrl || 'https://placehold.co/600x338/181818/ffffff?text=▶+Video';
    return (
      <div 
        style={{ ...getBgStyle(content), padding: `${content.padding ?? 0}px`, ...getStyle(block) }} 
        onClick={onClick}
      >
        <a href={content.videoUrl || '#'} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
          <img 
            src={videoThumb} 
            alt="Video" 
            style={{ width: '100%', borderRadius: `${content.borderRadius ?? 8}px`, display: 'block' }} 
          />
        </a>
      </div>
    );
  }
  
  if (type === 'columns') {
    return (
      <div 
        style={{ 
          ...getBgStyle(content),
          padding: `${content.padding ?? 0}px`,
          display: 'flex',
          alignItems: content.align === 'middle' ? 'center' : content.align === 'bottom' ? 'flex-end' : 'flex-start',
          ...getStyle(block)
        }} 
        onClick={onClick}
      >
        {[...Array(content.colCount ?? 2)].map((_, i) => (
          <div key={i} style={{ flex: 1, minWidth: 0, padding: '0 8px' }}>
            {content.cols?.[i]?.map((child, j) => (
              <BlockRenderer key={child.id || j} block={child} settings={settings} isSelected={false} onClick={() => {}} />
            )) || <div style={{ minHeight: '80px', border: '1px dashed #ccc', borderRadius: '4px' }} />}
          </div>
        ))}
      </div>
    );
  }
  
  if (type === 'button') {
    return (
      <div 
        style={{ 
          ...getBgStyle({ bgColor: content.containerBgColor, bgImageUrl: content.bgImageUrl, bgSize: content.bgSize, bgPosition: content.bgPosition }),
          padding: `${content.padding ?? 0}px`, 
          textAlign: content.align || 'center',
          ...getStyle(block)
        }} 
        onClick={onClick}
      >
        <a 
          href={content.url || '#'} 
          target="_blank" 
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          style={{
            display: 'inline-block',
            padding: `${content.paddingY ?? 15}px ${content.paddingX ?? 0}px`,
            backgroundColor: content.buttonBgColor || '#e11d48',
            color: content.textColor || '#fff',
            fontFamily: fontFamily,
            fontSize: `${content.fontSize ?? 16}px`,
            fontWeight: content.fontWeight || 'bold',
            borderRadius: `${content.borderRadius ?? 6}px`,
            textDecoration: 'none'
          }}
        >
          {content.text || 'Botón'}
        </a>
      </div>
    );
  }
  
  if (type === 'divider') {
    return (
      <div 
        style={{ 
          ...getBgStyle(content),
          padding: `${content.padding ?? 0}px`,
          ...getStyle(block)
        }} 
        onClick={onClick}
      >
        <div style={{ 
          borderTop: `${content.height ?? 1}px ${content.borderStyle || 'solid'} ${content.color || '#e5e7eb'}` 
        }} />
      </div>
    );
  }
  
  if (type === 'spacer') {
    return (
      <div 
        style={{ 
          ...getBgStyle(content),
          height: `${content.height ?? 0}px`,
          ...getStyle(block)
        }} 
        onClick={onClick}
      />
    );
  }
  
  if (type === 'social') {
    return (
      <div 
        style={{ 
          ...getBgStyle(content),
          padding: `${content.padding ?? 0}px`, 
          textAlign: content.align || 'center',
          ...getStyle(block)
        }} 
        onClick={onClick}
      >
        <div style={{ display: 'inline-flex', gap: '8px' }}>
          {(content.networks || []).map((n) => {
            const cfg = SOCIAL_CONFIG[n.network];
            if (!cfg) return null;
            const colorHex = (n.iconColor || '#ffffff').replace('#', '');
            return (
              <a 
                key={n.id} 
                href={n.url || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: `${(content.iconSize ?? 24) + 16}px`,
                  height: `${(content.iconSize ?? 24) + 16}px`,
                  backgroundColor: n.bgColor || cfg.defaultBg,
                  borderRadius: `${content.borderRadius ?? 8}px`
                }}
              >
                <img 
                  src={`https://img.icons8.com/ios-filled/50/${colorHex}/${cfg.iconName}.png`} 
                  alt={cfg.label}
                  style={{ width: `${content.iconSize ?? 24}px`, height: `${content.iconSize ?? 24}px` }}
                />
              </a>
            );
          })}
        </div>
      </div>
    );
  }
  
  if (type === 'html') {
    const sectionName = content._sectionName;
    const hasFullDoc = (content.code || '').includes('<!DOCTYPE') || (content.code || '').includes('<html');
    
    if (hasFullDoc) {
      // Script que inyectamos en el iframe para hacer elementos editables
      const editScript = `
        <script>
        (function() {
          document.body.style.cursor = 'default';
          // Marcar textos editables
          function makeEditable(el) {
            el.style.outline = 'none';
            el.addEventListener('mouseenter', function() {
              if (!this.isContentEditable) this.style.outline = '2px dashed rgba(130,180,64,0.5)';
            });
            el.addEventListener('mouseleave', function() {
              if (!this.isContentEditable) this.style.outline = 'none';
            });
            el.addEventListener('dblclick', function(e) {
              e.stopPropagation();
              this.contentEditable = 'true';
              this.focus();
              this.style.outline = '2px solid #82b440';
              this.style.background = 'rgba(130,180,64,0.05)';
            });
            el.addEventListener('blur', function() {
              this.contentEditable = 'false';
              this.style.outline = 'none';
              this.style.background = '';
              // Notificar cambio al padre
              window.parent.postMessage({ type: 'ENVATO_HTML_CHANGE', html: document.documentElement.outerHTML, blockId: window.BLOCK_ID }, '*');
            });
            el.addEventListener('keydown', function(e) {
              if (e.key === 'Escape') { this.blur(); }
            });
          }

          // Hacer imágenes reemplazables con clic
          function makeImageClickable(img) {
            img.style.cursor = 'pointer';
            img.title = 'Clic para cambiar imagen';
            img.addEventListener('click', function(e) {
              e.stopPropagation();
              const newSrc = prompt('URL de la nueva imagen:', this.src.substring(0, 200));
              if (newSrc && newSrc.trim()) {
                this.src = newSrc.trim();
                window.parent.postMessage({ type: 'ENVATO_HTML_CHANGE', html: document.documentElement.outerHTML, blockId: window.BLOCK_ID }, '*');
              }
            });
          }

          // Aplicar a todos los elementos de texto relevantes
          var textSelectors = 'td, p, span, h1, h2, h3, h4, a';
          document.querySelectorAll(textSelectors).forEach(function(el) {
            // Solo elementos que tienen texto directo (no solo hijos)
            var hasDirectText = Array.from(el.childNodes).some(function(n) {
              return n.nodeType === 3 && n.textContent.trim().length > 0;
            });
            if (hasDirectText) makeEditable(el);
          });

          document.querySelectorAll('img').forEach(makeImageClickable);

          // Mostrar hint
          var hint = document.createElement('div');
          hint.innerHTML = '✏️ Doble clic en texto para editar · Clic en imagen para cambiar';
          hint.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:rgba(0,0,0,0.7);color:#82b440;font-size:9px;padding:3px 8px;text-align:center;font-family:Arial,sans-serif;z-index:9999;pointer-events:none;';
          document.body.appendChild(hint);
          setTimeout(function() { hint.style.opacity = '0'; hint.style.transition = 'opacity 1s'; setTimeout(function() { hint.remove(); }, 1000); }, 3000);
        })();
        <\/script>`;

      // Inyectar script en el HTML
      const codeWithScript = content.code.includes('</body>')
        ? content.code.replace('</body>', editScript + '</body>')
        : content.code + editScript;

      return (
        <div style={{ ...getBgStyle(content), ...getStyle(block), position: 'relative' }} onClick={onClick}>
          {sectionName && (
            <div style={{ background: 'rgba(130,180,64,0.12)', borderBottom: '1px solid rgba(130,180,64,0.3)', padding: '4px 10px', fontSize: '9px', fontWeight: 900, color: '#82b440', fontFamily: 'Arial, sans-serif', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>{sectionName}</span>
              <span style={{ color: '#6b7280', fontWeight: 400, textTransform: 'none' }}>· doble clic para editar texto · clic en imagen para cambiar</span>
            </div>
          )}
          <iframe
            srcDoc={codeWithScript}
            style={{ width: '100%', border: 'none', display: 'block', minHeight: '60px' }}
            scrolling="no"
            onLoad={e => {
              try {
                // Inyectar el blockId en el iframe
                if (e.target.contentWindow) {
                  e.target.contentWindow.BLOCK_ID = block.id;
                }
                const h = e.target.contentDocument?.body?.scrollHeight;
                if (h) e.target.style.height = (h + 10) + 'px';
              } catch {}
            }}
            sandbox="allow-same-origin allow-scripts"
            title={sectionName || 'HTML Section'}
          />
        </div>
      );
    }

    return (
      <div 
        style={{ ...getBgStyle(content), padding: `${content.padding ?? 0}px`, ...getStyle(block) }} 
        onClick={onClick}
        dangerouslySetInnerHTML={{ __html: content.code || '' }}
      />
    );
  }
  
  if (type === 'footer') {
    return (
      <div 
        style={{ 
          ...getBgStyle(content),
          padding: `${content.padding ?? 0}px`, 
          textAlign: content.align || 'center',
          ...getStyle(block)
        }} 
        onClick={onClick}
      >
        <p style={{ 
          color: content.textColor || '#6b7280', 
          fontSize: `${content.fontSize ?? 12}px`,
          fontFamily: fontFamily,
          margin: 0,
          lineHeight: 1.5
        }}>
          {renderText(content.text || '')}
        </p>
      </div>
    );
  }
  
  // ── RECEIPT ──────────────────────────────────────────────────────────────────
  if (type === 'receipt') {
    const rc = content;
    const accent = rc.accentColor || '#4ade80';
    const items = rc.items || [];
    return (
      <div style={{ backgroundColor: rc.bgColor || '#111111', padding: rc.padding || '24px', fontFamily: 'Arial, sans-serif' }} onClick={onClick}>
        {/* Tabla de productos */}
        <table width="100%" cellSpacing="0" cellPadding="0" style={{ borderCollapse: 'collapse', marginBottom: '10px' }}>
          <thead>
            <tr style={{ backgroundColor: rc.headerBg || '#1a1a1a' }}>
              <th style={{ padding: '10px 14px', fontSize: '10px', fontWeight: 900, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '2px', textAlign: 'left', width: '55%' }}>Producto</th>
              <th style={{ padding: '10px 14px', fontSize: '10px', fontWeight: 900, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '2px', textAlign: 'center', width: '15%' }}>Cant.</th>
              <th style={{ padding: '10px 14px', fontSize: '10px', fontWeight: 900, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '2px', textAlign: 'right', width: '30%' }}>Precio</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} style={{ backgroundColor: i % 2 === 0 ? (rc.rowBg1 || '#141414') : (rc.rowBg2 || '#111111') }}>
                <td style={{ padding: '12px 14px', borderTop: '1px solid #222' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {item.imagen && (
                      <img
                        src={item.imagen}
                        alt={item.nombre}
                        style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0, border: '1px solid #333' }}
                      />
                    )}
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', margin: 0 }}>{item.nombre}</div>
                      <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '3px' }}>{item.categoria}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '12px 14px', textAlign: 'center', fontSize: '13px', color: '#9ca3af', borderTop: '1px solid #222' }}>1</td>
                <td style={{ padding: '12px 14px', textAlign: 'right', fontSize: '14px', fontWeight: 900, color: accent, borderTop: '1px solid #222' }}>${item.precio}</td>
              </tr>
            ))}
            {/* Subtotal */}
            <tr style={{ backgroundColor: rc.headerBg || '#1a1a1a' }}>
              <td colSpan="2" style={{ padding: '10px 14px', fontSize: '12px', color: '#6b7280', textAlign: 'right', borderTop: '1px solid #222' }}>Subtotal</td>
              <td style={{ padding: '10px 14px', textAlign: 'right', fontSize: '13px', fontWeight: 700, color: '#9ca3af', borderTop: '1px solid #222' }}>${rc.subtotalVar || '{{subtotal}}'}</td>
            </tr>
            {/* Descuento */}
            {rc.showDiscount && (
              <tr style={{ backgroundColor: rc.headerBg || '#1a1a1a' }}>
                <td colSpan="2" style={{ padding: '4px 14px 10px', fontSize: '12px', color: '#f59e0b', textAlign: 'right' }}>Descuento ({rc.cuponVar || '{{cupon}}'})</td>
                <td style={{ padding: '4px 14px 10px', textAlign: 'right', fontSize: '13px', fontWeight: 700, color: '#f59e0b' }}>-${rc.descuentoVar || '{{descuento_monto}}'}</td>
              </tr>
            )}
            {/* Total */}
            <tr style={{ backgroundColor: rc.totalBg || '#0a1a0f' }}>
              <td colSpan="2" style={{ padding: '14px', fontSize: '11px', fontWeight: 900, color: accent, letterSpacing: '2px', textTransform: 'uppercase', textAlign: 'right' }}>TOTAL PAGADO</td>
              <td style={{ padding: '14px', textAlign: 'right', fontSize: '22px', fontWeight: 900, color: accent }}>${rc.totalVar || '{{total}}'}</td>
            </tr>
          </tbody>
        </table>
        {/* Método + Fecha */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <div style={{ flex: 1, backgroundColor: '#161616', borderRadius: '10px', padding: '12px 14px' }}>
            <div style={{ fontSize: '9px', fontWeight: 900, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '2px' }}>Método de Pago</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', marginTop: '5px' }}>{rc.metodoPagoVar || '{{metodo_pago}}'}</div>
          </div>
          <div style={{ flex: 1, backgroundColor: '#161616', borderRadius: '10px', padding: '12px 14px' }}>
            <div style={{ fontSize: '9px', fontWeight: 900, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '2px' }}>Fecha</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', marginTop: '5px' }}>{rc.fechaVar || '{{fecha}}'}</div>
          </div>
        </div>
      </div>
    );
  }

  return null;
});

export default BlockRenderer;