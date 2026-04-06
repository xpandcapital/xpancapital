// Notion API Integration
// https://developers.notion.com/

export interface NotionDatabaseConfig {
  apiKey: string;
  databaseId: string;
}

export interface NotionLeadData {
  nombre: string;
  email?: string;
  telefono?: string;
  whatsapp?: string;
  ciudad?: string;
  presupuesto?: string;
  interes?: string;
  mensaje?: string;
  origen?: string;
  campana?: string;
  asesor?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

export async function createNotionPage(
  config: NotionDatabaseConfig,
  data: NotionLeadData
): Promise<{ success: boolean; pageId?: string; error?: string }> {
  try {
    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify({
        parent: {
          database_id: config.databaseId
        },
        properties: {
          // Mapear propiedades según tu base de datos en Notion
          // Los nombres deben coincidir con los de tu base de datos
          'Nombre': {
            title: [
              {
                text: {
                  content: data.nombre
                }
              }
            ]
          },
          'Email': data.email ? {
            email: data.email
          } : undefined,
          'Teléfono': data.telefono ? {
            phone_number: data.telefono
          } : undefined,
          'WhatsApp': data.whatsapp ? {
            phone_number: data.whatsapp
          } : undefined,
          'Ciudad': data.ciudad ? {
            rich_text: [
              {
                text: {
                  content: data.ciudad
                }
              }
            ]
          } : undefined,
          'Presupuesto': data.presupuesto ? {
            select: {
              name: data.presupuesto
            }
          } : undefined,
          'Interés': data.interes ? {
            rich_text: [
              {
                text: {
                  content: data.interes
                }
              }
            ]
          } : undefined,
          'Mensaje': data.mensaje ? {
            rich_text: [
              {
                text: {
                  content: data.mensaje.substring(0, 2000) // Notion limit
                }
              }
            ]
          } : undefined,
          'Origen': data.origen ? {
            select: {
              name: data.origen
            }
          } : undefined,
          'Campaña': data.campana ? {
            rich_text: [
              {
                text: {
                  content: data.campana
                }
              }
            ]
          } : undefined,
          'Asesor': data.asesor ? {
            rich_text: [
              {
                text: {
                  content: data.asesor
                }
              }
            ]
          } : undefined,
          'Estado': {
            select: {
              name: 'Nuevo'
            }
          },
          'Fecha de Creación': {
            date: {
              start: new Date().toISOString()
            }
          }
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[Notion API Error]', error);
      return { 
        success: false, 
        error: error.message || 'Error al crear página en Notion' 
      };
    }

    const result = await response.json();
    return { 
      success: true, 
      pageId: result.id 
    };

  } catch (error) {
    console.error('[Notion Integration Error]', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    };
  }
}

// Obtener propiedades de una base de datos de Notion
export async function getNotionDatabaseSchema(
  config: NotionDatabaseConfig
): Promise<{ success: boolean; properties?: any; error?: string }> {
  try {
    const response = await fetch(
      `https://api.notion.com/v1/databases/${config.databaseId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Notion-Version': '2022-06-28'
        }
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return { 
        success: false, 
        error: error.message || 'Error al obtener schema' 
      };
    }

    const result = await response.json();
    return { 
      success: true, 
      properties: result.properties 
    };

  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    };
  }
}

// Buscar bases de datos de Notion
export async function searchNotionDatabases(
  apiKey: string
): Promise<{ success: boolean; databases?: any[]; error?: string }> {
  try {
    const response = await fetch('https://api.notion.com/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify({
        filter: {
          property: 'object',
          value: 'database'
        },
        sort: {
          direction: 'descending',
          timestamp: 'last_edited_time'
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      return { 
        success: false, 
        error: error.message || 'Error al buscar bases de datos' 
      };
    }

    const result = await response.json();
    return { 
      success: true, 
      databases: result.results 
    };

  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    };
  }
}