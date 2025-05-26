export interface User {
    id: string
    name: string
    email: string
    avatar?: string
  }
  
  export interface ApiResponse<T = any> {
    data: T
    message: string
    success: boolean
  }
  
  export type Theme = 'light' | 'dark'
  
  export interface ComponentProps {
    className?: string
    children?: React.ReactNode
  }