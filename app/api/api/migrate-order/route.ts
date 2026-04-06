import { NextResponse } from 'next/server';

const supabaseUrl = 'https://srjhrhiesienkofisvnv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyamhyaGllc2llbmtvZmlzdm52Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDEwODM4OSwiZXhwIjoyMDg5Njg0Mzg5fQ.OB-MHB9z6sIDxXC_c3yWYdxhVUCFOwa7zcxaYzqlhdY';

export async function GET() {
  try {
    // Intentar crear la columna usando PostgREST
    // Nota: Esto probablemente fallará por permisos, pero lo intentamos
    await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql: 'ALTER TABLE projects ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;' })
    }).catch(() => null);
    
    // Obtener proyectos actuales
    const projectsResponse = await fetch(`${supabaseUrl}/rest/v1/projects?select=id,name,created_at&order=created_at.asc`, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
      }
    });
    
    const projects = await projectsResponse.json();
    
    if (!Array.isArray(projects)) {
      return NextResponse.json({ error: 'Error obteniendo proyectos', detail: projects }, { status: 400 });
    }
    
    // Intentar actualizar cada proyecto con su order_index
    const results = [];
    for (let i = 0; i < projects.length; i++) {
      const updateResponse = await fetch(`${supabaseUrl}/rest/v1/projects?id=eq.${projects[i].id}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ order_index: i })
      });
      
      const updateResult = await updateResponse.json();
      results.push({ 
        id: projects[i].id, 
        name: projects[i].name, 
        order_index: i, 
        success: updateResponse.ok,
        response: updateResult 
      });
    }
    
    // Verificar resultado final
    const verifyResponse = await fetch(`${supabaseUrl}/rest/v1/projects?select=id,name,order_index&order=order_index.asc`, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
      }
    });
    
    const finalProjects = await verifyResponse.json();
    
    // Contar éxitos y fallos
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    
    return NextResponse.json({ 
      message: failCount === 0 ? 'Migración completada exitosamente!' : 'Migración parcial - algunos proyectos fallaron',
      projectsUpdated: successCount,
      projectsFailed: failCount,
      results,
      finalOrder: finalProjects,
      instruction: failCount > 0 
        ? '⚠️ Necesitas ejecutar este SQL en Supabase SQL Editor: ALTER TABLE projects ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;' 
        : null
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message,
      instruction: 'Ejecuta este SQL en Supabase SQL Editor: ALTER TABLE projects ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;'
    }, { status: 500 });
  }
}