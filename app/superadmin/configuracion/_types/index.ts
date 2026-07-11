export interface SiteConfig {
  id: string
  site_name: string
  site_tagline: string
  logo_horizontal: string
  logo_vertical: string
  logo_horizontal_light: string
  logo_vertical_light: string
  favicon: string
  primary_color: string
  secondary_color: string
  background_color: string
  text_color: string
  accent_color: string
  meta_title: string
  meta_description: string
  meta_keywords: string[]
  og_image: string
  social_instagram: string
  social_facebook: string
  social_youtube: string
  social_tiktok: string
  social_linkedin: string
  social_twitter: string
  social_whatsapp: string
  footer_description: string
  footer_copyright: string
  footer_vip_title: string
  footer_vip_description: string
  footer_vip_placeholder: string
  footer_vip_button: string
  footer_projects_title: string
  footer_legal_title: string
  footer_location_text: string
  footer_show_projects: boolean
  contact_email: string
  contact_phone: string
  contact_address: string
}

export const defaultConfig: SiteConfig = {
  id: '',
  site_name: 'Xpand Capital',
  site_tagline: 'Luxury Tech Real Estate',
  logo_horizontal: '',
  logo_vertical: '',
  logo_horizontal_light: '',
  logo_vertical_light: '',
  favicon: '',
  primary_color: '#a89a00',
  secondary_color: '#10B981',
  background_color: '#000000',
  text_color: '#FFFFFF',
  accent_color: '#a89a00',
  meta_title: '',
  meta_description: '',
  meta_keywords: [],
  og_image: '',
  social_instagram: '',
  social_facebook: '',
  social_youtube: '',
  social_tiktok: '',
  social_linkedin: '',
  social_twitter: '',
  social_whatsapp: '',
  footer_description: '',
  footer_copyright: '© 2026 Xpand Capital. Todos los derechos reservados.',
  footer_vip_title: 'Acceso VIP',
  footer_vip_description: 'Únete a la lista de inversores selectos para recibir análisis de mercado y oportunidades antes del lanzamiento público.',
  footer_vip_placeholder: 'Tu correo corporativo',
  footer_vip_button: 'Suscribirme',
  footer_projects_title: 'Proyectos',
  footer_legal_title: 'Legal',
  footer_location_text: 'Diseñado con visión en 🇪🇨 Ecuador · 🇵🇪 Perú',
  footer_show_projects: true,
  contact_email: '',
  contact_phone: '',
  contact_address: ''
}

