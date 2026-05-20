declare module 'react-simple-maps' {
  import { FC, ReactNode } from 'react'

  interface ComposableMapProps {
    projection?: string
    projectionConfig?: { scale?: number; center?: [number, number]; rotate?: [number, number, number] }
    className?: string
    children?: ReactNode
  }

  interface ZoomableGroupProps {
    center?: [number, number]
    zoom?: number
    disablePanning?: boolean
    disableZooming?: boolean
    children?: ReactNode
  }

  interface GeographiesProps {
    geography: string | object
    children: (data: { geographies: GeographyType[] }) => ReactNode
  }

  interface GeographyType {
    rsmKey: string
    properties?: Record<string, unknown>
    [key: string]: unknown
  }

  interface GeographyProps {
    geography: GeographyType
    fill?: string
    stroke?: string
    strokeWidth?: number
    style?: {
      default?: Record<string, unknown>
      hover?: Record<string, unknown>
      pressed?: Record<string, unknown>
    }
  }

  interface MarkerProps {
    coordinates: [number, number]
    children?: ReactNode
  }

  export const ComposableMap: FC<ComposableMapProps>
  export const ZoomableGroup: FC<ZoomableGroupProps>
  export const Geographies: FC<GeographiesProps>
  export const Geography: FC<GeographyProps>
  export const Marker: FC<MarkerProps>
}
