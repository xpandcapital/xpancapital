declare module 'potrace' {
  interface TraceOptions {
    turnPolicy?: string
    turdSize?: number
    alphaMax?: number
    optCurve?: boolean
    optTolerance?: number
    threshold?: number | 'auto'
    blackOnWhite?: boolean
    color?: string
    background?: string
    width?: number
    height?: number
    steps?: number
    rangeDistribution?: 'auto' | 'equal'
  }

  export function trace(
    filename: string | Buffer,
    callback: (err: Error | null, svg: string) => void
  ): void

  export function trace(
    filename: string | Buffer,
    options: TraceOptions,
    callback: (err: Error | null, svg: string) => void
  ): void

  export class Potrace {
    constructor(options?: TraceOptions)
    loadImage(filename: string | Buffer, callback: (err: Error | null) => void): void
    getSVG(): string
    getPathTag(): string
  }
}
