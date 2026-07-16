declare module 'fluent-ffmpeg' {
  interface FfmpegCommand {
    setFfmpegPath(path: string): void
    screenshots(options: {
      timestamps: (string | number)[]
      filename: string
      folder: string
      size?: string
    }): FfmpegCommand
    outputOptions(options: string[]): FfmpegCommand
    output(target: string): FfmpegCommand
    on(event: 'end', listener: () => void): FfmpegCommand
    on(event: 'error', listener: (err: Error) => void): FfmpegCommand
    on(event: string, listener: (...args: unknown[]) => void): FfmpegCommand
    run(): void
  }

  interface FfmpegStatic {
    (input?: string): FfmpegCommand
    setFfmpegPath(path: string): void
  }

  const ffmpeg: FfmpegStatic
  export default ffmpeg
}

declare module '@ffmpeg-installer/ffmpeg' {
  const installer: { path: string; version: string; url: string }
  export default installer
  export const path: string
  export const version: string
  export const url: string
}
