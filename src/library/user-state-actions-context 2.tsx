import * as React from 'react'

import {EarningsEnum, EarningsRecord, PensionEnum, UserProfile} from './user-state-context'

export interface UserStateActions {
  setBirthDate: (date: Date) => void
  setRetireDate: (date: Date) => void
  setYear62: (year: number) => void
  setHaveEarnings: (hasEarnings: boolean) => void
  setEarnings: (earnings: EarningsRecord) => void
  setEarningsFormat: (format: EarningsEnum) => void
  setHaveSSAAccount: (hasSSAAccount: boolean) => void
  setIsEmploymentCovered: (isCovered: boolean) => void
  setPensionOrRetirementAccount: (value: PensionEnum) => void
  setPensionAmount: (amount: number) => void
  setPensionDateAwarded: (date: Date) => void
  setUserProfile: (profile: UserProfile) => void
}

const UserStateActionsContext = React.createContext<UserStateActions | null>(null)

export const UserStateActionsContextProvider = UserStateActionsContext.Provider

export function useUserStateActions(): UserStateActions {
  const actions = React.useContext(UserStateActionsContext)
  if (!actions) {
    throw new Error('Cannot access user state actions outside of a `<UserStateManager>`.')
  }
  return actions
}
