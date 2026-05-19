declare module 'react-world-flags' {
  import { FC } from 'react'

  interface FlagProps {
    code: string
    height?: string | number
    width?: string | number
    className?: string
    style?: React.CSSProperties
    fallback?: React.ReactNode
  }

  const Flag: FC<FlagProps>
  export default Flag
}
