declare module 'archiver' {
  import { Transform } from 'stream'

  interface ArchiverOptions {
    zlib?: { level?: number }
    store?: boolean
  }

  interface EntryData {
    name: string
    prefix?: string
    date?: Date | string
    mode?: number
  }

  interface Archiver extends Transform {
    append(source: Buffer | NodeJS.ReadableStream | string, data?: EntryData): this
    directory(dirpath: string, destpath: string | false): this
    file(filepath: string, data?: EntryData): this
    finalize(): Promise<void>
    pointer(): number
    abort(): this
  }

  function archiver(format: 'zip' | 'tar', options?: ArchiverOptions): Archiver

  export default archiver
}
