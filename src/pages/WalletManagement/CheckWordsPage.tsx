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
import { motion, PanInfo } from 'framer-motion'
import { throttle } from 'lodash'
import { AlertTriangle, ThumbsUp } from 'lucide-react'
import { useRef, useState } from 'react'
import styled from 'styled-components'
import tinycolor from 'tinycolor2'

import Button from '../../components/Button'
import InfoBox from '../../components/InfoBox'
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

interface WordKey {
  word: string
  key: string // Used to build layout and ensure anims are working when duplicates exist
}

const CheckWordsPage = () => {
  const { mnemonic, plainWallet, password, walletName } = useWalletContext()
  const { onButtonBack, onButtonNext } = useStepsContext()
  const { setSnackbarMessage } = useGlobalContext()

  const { setWallet } = useGlobalContext()
  const splitMnemonic = mnemonic.split(' ')

  const wordList = useRef<WordKey[]>(
    getAlphabeticallyOrderedList(splitMnemonic).map((wordString, i) => ({
      word: wordString,
      key: `${wordString}-${i}`
    }))
  )

  const [selectedWords, setSelectedWords] = useState<WordKey[]>([])
  const selectedElements = useRef<{ [wordKey: string]: Element | null }>(
    splitMnemonic.reduce((p, c) => ({ ...p, [c]: null }), {})
  )

  // === Drag interaction ===
  const [isDragging, setIsDragging] = useState(false)
  const [closestWordKey, setClosestWordKey] = useState<string>('')

  // === Actions ===
  // ===============
  const handleSelectedWordRemove = (w: WordKey) => {
    if (isDragging) {
      setIsDragging(false)
      return
    }
    setSelectedWords(selectedWords.filter((word) => w.key !== word.key))

    // Remove from element list
    selectedElements.current[w.key] = null
  }

  const handleSelectedWordDrag = throttle(
    (
      event: MouseEvent | TouchEvent | PointerEvent,
      info: PanInfo,
      word: WordKey,
      currentSelectedElements: typeof selectedElements.current
    ) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [word.key]: _currentElement, ...otherElements } = currentSelectedElements
      const closestElement = Object.values(otherElements).reduce(
        (p, c, i) => {
          // Distance
          let returnedObject

          if (c) {
            const rect = c.getBoundingClientRect()
            const distance = Math.hypot(rect.x - info.point.x, rect.y - info.point.y)

            if (p.distance === 0) {
              returnedObject = {
                wordKey: Object.keys(otherElements)[i],
                element: c,
                distance: distance
              }
            } else if (distance < p.distance) {
              returnedObject = {
                wordKey: Object.keys(otherElements)[i],
                element: c,
                distance: distance
              }
            } else {
              returnedObject = p
            }
          } else {
            returnedObject = p
          }

          return returnedObject
        },
        {
          wordKey: '',
          element: null as Element | null,
          distance: 0
        }
      )

      setClosestWordKey(closestElement.wordKey)
    },
    300
  )

  const handleSelectedWordDragEnd = (word: WordKey, newNeighbourWordKey: string) => {
    // Find neighbour index
    if (closestWordKey) {
      const currentIndex = selectedWords.findIndex((w) => w.key === word.key)
      let newIndex = selectedWords.findIndex((w) => w.key === newNeighbourWordKey)
      if (currentIndex < newIndex) {
        newIndex -= 1
      }

      const filteredWords = selectedWords.filter((w) => w.key !== word.key)
      setSelectedWords([...filteredWords.slice(0, newIndex), word, ...filteredWords.slice(newIndex)])
      setClosestWordKey('')
    }
  }

  // === Renders

  const renderRemainingWords = () => {
    return wordList.current
      .filter((w) => !selectedWords?.includes(w))
      .map((w) => (
        <RemainingWord onClick={() => setSelectedWords([...selectedWords, w])} key={w.key} layoutId={w.key}>
          {w.word}
        </RemainingWord>
      ))
  }

  const renderSelectedWords = () => {
    return selectedWords?.map((w) => (
      <SelectedWord
        onPointerUp={() => handleSelectedWordRemove(w)}
        key={w.key}
        layoutId={w.key}
        drag
        ref={(element) => {
          if (selectedElements.current && element) selectedElements.current[w.key] = element
        }}
        onDragStart={() => setIsDragging(true)}
        onDrag={(e, info) => handleSelectedWordDrag(e, info, w, selectedElements.current)}
        onDragEnd={() => handleSelectedWordDragEnd(w, closestWordKey)}
      >
        {isDragging && closestWordKey === w.key && <DragCursor layoutId="cursor" />}
        {w.word}
      </SelectedWord>
    ))
  }

  const areWordsValid = selectedWords.map((w) => w.word).toString() == splitMnemonic.toString()

  const createEncryptedWallet = () => {
    if (areWordsValid && plainWallet) {
      const walletEncrypted = plainWallet.encrypt(password)
      Storage.save(walletName, walletEncrypted)
      setWallet(plainWallet)
      return true
    }
  }

  const handleButtonNext = () => {
    const success = createEncryptedWallet()
    if (success) onButtonNext()
    else {
      setSnackbarMessage({ text: 'Something went wrong when creating encrypted wallet.', type: 'alert' })
    }
  }

  return (
    <FloatingPanel enforceMinHeight>
      <PanelTitle color="primary" onBackButtonClick={onButtonBack} smaller>
        Security Check
      </PanelTitle>
      <PanelContentContainer>
        <Section>
          <Paragraph>Select the words in the right order.</Paragraph>
          <SelectedWordList
            className={selectedWords.length === wordList.current.length ? (areWordsValid ? 'valid' : 'error') : ''}
          >
            {renderSelectedWords()}
          </SelectedWordList>
          <RemainingWordList>{renderRemainingWords()}</RemainingWordList>
        </Section>
      </PanelContentContainer>
      {selectedWords.length === wordList.current.length ? (
        !areWordsValid ? (
          <InfoBox
            Icon={AlertTriangle}
            importance="alert"
            text="It seems like you made a mistake in the words' order. But don't worry, you can reorder the words by dragging them around."
          />
        ) : (
          <InfoBox small Icon={ThumbsUp} importance="accent" text="Great job! Remember to keep those words safe." />
        )
      ) : null}
      {selectedWords.length === wordList.current.length && (
        <FooterActionsContainer>
          <Button secondary onClick={onButtonBack}>
            Cancel
          </Button>
          <Button onClick={handleButtonNext} disabled={!areWordsValid} submit>
            Continue
          </Button>
        </FooterActionsContainer>
      )}
    </FloatingPanel>
  )
}

const getAlphabeticallyOrderedList = (arr: string[]) => {
  return arr.slice().sort()
}

const RemainingWordList = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin: var(--spacing-4) 0;
  flex: 1;
  align-items: flex-start;
  justify-content: flex-start;
  align-content: flex-start;
`

const SelectedWord = styled(motion.div)`
  padding: 6px var(--spacing-2);
  border-radius: 5px;
  background-color: ${({ theme }) => theme.global.accent};
  color: ${({ theme }) => theme.font.contrastPrimary};
  font-weight: var(--fontWeight-medium);
  text-align: center;
  margin-bottom: var(--spacing-2);
  position: relative;
  cursor: pointer;

  &:not(:last-child) {
    margin-right: var(--spacing-2);
  }

  &:hover {
    background-color: ${({ theme }) => tinycolor(theme.global.accent).setAlpha(0.8).toString()};
  }
`

const DragCursor = styled(motion.div)`
  position: absolute;
  left: -7px;
  top: 0;
  bottom: 0;
  width: 4px;
  background-color: ${({ theme }) => theme.global.accent};
  z-index: 100;
`

const SelectedWordList = styled.div`
  width: 100%;
  padding: var(--spacing-4);
  min-height: 200px;
  border-radius: var(--radius-big);
  border: 1px solid ${({ theme }) => theme.border.primary};
  background-color: ${({ theme }) => theme.bg.secondary};
  margin-bottom: var(--spacing-4);

  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: flex-start;
  align-content: flex-start;

  &.valid {
    ${SelectedWord} {
      background-color: ${({ theme }) => theme.global.valid};
    }
  }

  &.error {
    ${SelectedWord} {
      background-color: ${({ theme }) => theme.global.alert};
    }
  }
`

const RemainingWord = styled(SelectedWord)`
  background-color: ${({ theme }) => theme.global.accent};
  background-color: ${({ theme }) => tinycolor(theme.global.accent).setAlpha(0.1).toString()};
  color: ${({ theme }) => theme.global.accent};

  &:hover {
    background-color: ${({ theme }) => tinycolor(theme.global.accent).setAlpha(0.3).toString()};
  }
`

export default CheckWordsPage
