/*
Copyright 2018 - 2022 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { getStorage } from '@alephium/sdk'
import { AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import styled from 'styled-components'
import zxcvbn from 'zxcvbn'

import Button from '../../components/Button'
import InfoBox from '../../components/InfoBox'
import Input from '../../components/Inputs/Input'
import {
  FloatingPanel,
  FooterActionsContainer,
  PanelContentContainer,
  Section
} from '../../components/PageComponents/PageContainers'
import PanelTitle from '../../components/PageComponents/PanelTitle'
import Paragraph from '../../components/Paragraph'
import { useGlobalContext } from '../../contexts/global'
import { useStepsContext } from '../../contexts/steps'
import { useWalletContext } from '../../contexts/wallet'

const Storage = getStorage()

const CreateWalletPage = ({ isRestoring = false }: { isRestoring?: boolean }) => {
  const { setCurrentWalletName } = useGlobalContext()
  const { setWalletName, setPassword, walletName: existingWalletName, password: existingPassword } = useWalletContext()
  const { onButtonBack, onButtonNext } = useStepsContext()
  const [walletName, setWalletNameState] = useState(existingWalletName)
  const [walletNameError, setWalletNameError] = useState('')
  const [password, setPasswordState] = useState(existingPassword)
  const [passwordError, setPasswordError] = useState('')
  const [passwordCheck, setPasswordCheck] = useState(existingPassword)

  const walletNames = Storage.list()

  const onUpdatePassword = (password: string): void => {
    let passwordError = ''

    if (password.length) {
      const strength = zxcvbn(password)
      if (strength.score < 1) {
        passwordError = 'Password is too weak'
      } else if (strength.score < 3) {
        passwordError = 'Insecure password'
      }
    }
    setPasswordState(password)
    setPasswordError(passwordError)
  }

  const onUpdateWalletName = (walletName: string) => {
    let walletNameError = ''

    if (walletName.length < 3) {
      walletNameError = 'Wallet name is too short'
    } else if (walletNames?.includes(walletName)) {
      walletNameError = 'Wallet name already taken'
    }

    setWalletNameState(walletName)
    setWalletNameError(walletNameError)
  }

  const isNextButtonActive =
    password.length > 0 &&
    passwordError.length === 0 &&
    password === passwordCheck &&
    walletName.length > 0 &&
    walletNameError.length === 0

  const handleNextButtonClick = () => {
    setWalletName(walletName)
    setPassword(password)
    setCurrentWalletName(walletName)
    onButtonNext()
  }

  return (
    <FloatingPanel>
      <PanelTitle color="primary">{isRestoring ? 'Import Wallet' : 'New Wallet'}</PanelTitle>
      <PanelContentContainer>
        <Section inList>
          <Input
            value={walletName}
            label={isRestoring ? 'New wallet name' : 'Wallet name'}
            onChange={(e) => onUpdateWalletName(e.target.value)}
            error={walletNameError}
            isValid={walletName.length > 0 && walletNameError.length === 0}
          />
          <Input
            value={password}
            label={isRestoring ? 'New password' : 'Password'}
            type="password"
            onChange={(e) => onUpdatePassword(e.target.value)}
            error={passwordError}
            isValid={!passwordError && password.length > 0}
          />
          <Input
            value={passwordCheck}
            label="Retype password"
            type="password"
            onChange={(e) => setPasswordCheck(e.target.value)}
            error={passwordCheck && password !== passwordCheck ? 'Passwords are different' : ''}
            isValid={password.length > 0 && password === passwordCheck}
            disabled={!password || passwordError.length > 0}
          />
          <InfoBox
            Icon={AlertTriangle}
            importance="alert"
            text={'Make sure to keep your password secured as it cannot be changed in the future.'}
          />
          <WarningNote>{"Alephium doesn't have access to your wallet.\nYou are the only owner."}</WarningNote>
        </Section>
      </PanelContentContainer>
      <FooterActionsContainer apparitionDelay={0.3}>
        <Button secondary onClick={onButtonBack}>
          Back
        </Button>
        <Button disabled={!isNextButtonActive} onClick={handleNextButtonClick} submit>
          Continue
        </Button>
      </FooterActionsContainer>
    </FloatingPanel>
  )
}

const WarningNote = styled(Paragraph)`
  text-align: center;
  color: ${({ theme }) => theme.font.secondary};
  margin-bottom: 0;
`

export default CreateWalletPage
