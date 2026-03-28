import {createContext, useContext, useMemo} from 'react'
import type {ReactNode} from 'react'

interface FormKitContext {
  isLoading: boolean
}

const FormDetails = createContext<FormKitContext>({
  isLoading: false,
})

interface FormProviderProps {
  children: ReactNode
  isLoading: boolean
}

export function FormDetailsProvider({children, isLoading}: FormProviderProps) {
  const value = useMemo(() => {
    return {isLoading}
  }, [isLoading])

  return <FormDetails.Provider value={value}>{children}</FormDetails.Provider>
}

export function useFormDetails() {
  const context = useContext(FormDetails)

  if (!context) {
    throw new Error('useFormKitContext should be wrapped in FormProvider')
  }

  return context
}
