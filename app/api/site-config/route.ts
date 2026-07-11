export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function GET() {
  try {
    const supabase = getSupabase()
    
    const { data, error } = await supabase
      .from('site_config')
      .select('*')
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .single()

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ success: false, error: 'Error del servidor' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()

    const {
      site_name,
      site_tagline,
      logo_horizontal,
      logo_vertical,
      logo_horizontal_light,
      logo_vertical_light,
      favicon,
      primary_color,
      secondary_color,
      background_color,
      text_color,
      accent_color,
      meta_title,
      meta_description,
      meta_keywords,
      og_image,
      social_instagram,
      social_facebook,
      social_youtube,
      social_tiktok,
      social_linkedin,
      social_twitter,
      social_whatsapp,
      footer_description,
      footer_copyright,
      footer_vip_title,
      footer_vip_description,
      footer_vip_placeholder,
      footer_vip_button,
      footer_projects_title,
      footer_legal_title,
      footer_location_text,
      footer_show_projects,
      contact_email,
      contact_phone,
      contact_address
    } = body

    const updateData: Record<string, unknown> = {
      actualizado_en: new Date().toISOString()
    }

    if (site_name !== undefined) updateData.site_name = site_name
    if (site_tagline !== undefined) updateData.site_tagline = site_tagline
    if (logo_horizontal !== undefined) updateData.logo_horizontal = logo_horizontal
    if (logo_vertical !== undefined) updateData.logo_vertical = logo_vertical
    if (logo_horizontal_light !== undefined) updateData.logo_horizontal_light = logo_horizontal_light
    if (logo_vertical_light !== undefined) updateData.logo_vertical_light = logo_vertical_light
    if (favicon !== undefined) updateData.favicon = favicon
    if (primary_color !== undefined) updateData.primary_color = primary_color
    if (secondary_color !== undefined) updateData.secondary_color = secondary_color
    if (background_color !== undefined) updateData.background_color = background_color
    if (text_color !== undefined) updateData.text_color = text_color
    if (accent_color !== undefined) updateData.accent_color = accent_color
    if (meta_title !== undefined) updateData.meta_title = meta_title
    if (meta_description !== undefined) updateData.meta_description = meta_description
    if (meta_keywords !== undefined) updateData.meta_keywords = meta_keywords
    if (og_image !== undefined) updateData.og_image = og_image
    if (social_instagram !== undefined) updateData.social_instagram = social_instagram
    if (social_facebook !== undefined) updateData.social_facebook = social_facebook
    if (social_youtube !== undefined) updateData.social_youtube = social_youtube
    if (social_tiktok !== undefined) updateData.social_tiktok = social_tiktok
    if (social_linkedin !== undefined) updateData.social_linkedin = social_linkedin
    if (social_twitter !== undefined) updateData.social_twitter = social_twitter
    if (social_whatsapp !== undefined) updateData.social_whatsapp = social_whatsapp
    if (footer_description !== undefined) updateData.footer_description = footer_description
    if (footer_copyright !== undefined) updateData.footer_copyright = footer_copyright
    if (footer_vip_title !== undefined) updateData.footer_vip_title = footer_vip_title
    if (footer_vip_description !== undefined) updateData.footer_vip_description = footer_vip_description
    if (footer_vip_placeholder !== undefined) updateData.footer_vip_placeholder = footer_vip_placeholder
    if (footer_vip_button !== undefined) updateData.footer_vip_button = footer_vip_button
    if (footer_projects_title !== undefined) updateData.footer_projects_title = footer_projects_title
    if (footer_legal_title !== undefined) updateData.footer_legal_title = footer_legal_title
    if (footer_location_text !== undefined) updateData.footer_location_text = footer_location_text
    if (footer_show_projects !== undefined) updateData.footer_show_projects = footer_show_projects
    if (contact_email !== undefined) updateData.contact_email = contact_email
    if (contact_phone !== undefined) updateData.contact_phone = contact_phone
    if (contact_address !== undefined) updateData.contact_address = contact_address

    // Check if config exists
    const { data: existing } = await supabase
      .from('site_config')
      .select('id')
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .single()

    let data
    if (existing) {
      const { data: updated, error } = await supabase
        .from('site_config')
        .update(updateData)
        .eq('empresa_id', DEFAULT_EMPRESA_ID)
        .select()
        .single()
      
      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      }
      data = updated
    } else {
      const { data: created, error } = await supabase
        .from('site_config')
        .insert({ ...updateData, empresa_id: DEFAULT_EMPRESA_ID })
        .select()
        .single()
      
      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      }
      data = created
    }

    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ success: false, error: 'Error del servidor' }, { status: 500 })
  }
}
