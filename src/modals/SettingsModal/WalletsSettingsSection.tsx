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
import { Trash } from 'lucide-react'
import { useState } from 'react'
import styled from 'styled-components'

import Button from '../../components/Button'
import InfoBox from '../../components/InfoBox'
import HorizontalDivider from '../../components/PageComponents/HorizontalDivider'
import { BoxContainer, Section } from '../../components/PageComponents/PageContainers'
import { useGlobalContext } from '../../contexts/global'
import { deleteStoredAddressMetadataOfWallet } from '../../utils/addresses'
import SecretPhraseModal from '../SecretPhraseModal'
import WalletRemovalModal from '../WalletRemovalModal'

const Storage = getStorage()

const WalletsSettingsSection = () => {
  const { activeWalletName, wallet, lockWallet } = useGlobalContext()
  const [isDisplayingSecretModal, setIsDisplayingSecretModal] = useState(false)
  const [walletToRemove, setWalletToRemove] = useState<string>('')

  const openRemoveWalletModal = (walletName: string) => setWalletToRemove(walletName)
  const openSecretPhraseModal = () => setIsDisplayingSecretModal(true)
  const closeSecretPhraseModal = () => setIsDisplayingSecretModal(false)

  const handleRemoveWallet = (walletName: string) => {
    Storage.remove(walletName)
    deleteStoredAddressMetadataOfWallet(walletName)

    walletName === activeWalletName ? lockWallet() : setWalletToRemove('')
  }

  const walletNames = Storage.list()

  return (
    <>
      {isDisplayingSecretModal && <SecretPhraseModal onClose={closeSecretPhraseModal} />}

      {walletToRemove && (
        <WalletRemovalModal
          walletName={walletToRemove}
          onClose={() => setWalletToRemove('')}
          onWalletRemove={() => handleRemoveWallet(walletToRemove)}
        />
      )}
      <Section align="flex-start">
        <h2>Wallet list ({walletNames.length})</h2>
        <BoxContainer>
          {walletNames.map((n) => {
            return (
              <WalletItem
                key={n}
                walletName={n}
                isCurrent={n === activeWalletName}
                onWalletDelete={(name) => setWalletToRemove(name)}
              />
            )
          })}
        </BoxContainer>
      </Section>
      {wallet && (
        <>
          <HorizontalDivider />
          <Section align="flex-start">
            <h2>Current wallet</h2>
            <InfoBox label="Wallet name" text={activeWalletName} />
          </Section>
          <Section>
            <Button secondary onClick={lockWallet}>
              Lock current wallet
            </Button>
            <Button secondary alert onClick={openSecretPhraseModal}>
              Show your secret phrase
            </Button>
            <Button alert onClick={() => openRemoveWalletModal(activeWalletName)}>
              Remove current wallet
            </Button>
          </Section>
        </>
      )}
    </>
  )
}

interface WalletItemProps {
  walletName: string
  isCurrent: boolean
  onWalletDelete: (walletName: string) => void
}

const WalletItem = ({ walletName, isCurrent, onWalletDelete }: WalletItemProps) => {
  const [isShowingDeleteButton, setIsShowingDeleteButton] = useState(false)

  return (
    <WalletItemContainer
      onMouseEnter={() => setIsShowingDeleteButton(true)}
      onMouseLeave={() => setIsShowingDeleteButton(false)}
    >
      <WalletName>
        {walletName}
        {isCurrent && <CurrentWalletLabel> (current)</CurrentWalletLabel>}
      </WalletName>
      {isShowingDeleteButton && (
        <WalletDeleteButton squared transparent onClick={() => onWalletDelete(walletName)}>
          <Trash size={15} />
        </WalletDeleteButton>
      )}
    </WalletItemContainer>
  )
}

export default WalletsSettingsSection

const WalletItemContainer = styled.div`
  display: flex;
  align-items: center;
  height: var(--inputHeight);
  padding: 0 var(--spacing-2);

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.border.primary};
  }
`

const WalletName = styled.div`
  flex: 1;
`

const CurrentWalletLabel = styled.span`
  color: ${({ theme }) => theme.font.secondary};
`

const WalletDeleteButton = styled(Button)``
