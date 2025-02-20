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

import { motion } from 'framer-motion'
import { FC } from 'react'
import styled from 'styled-components'

import ModalContainer, { ModalContainerProps } from './ModalContainer'

const SideModal: FC<ModalContainerProps> = ({ onClose, children }) => (
  <ModalContainer onClose={onClose}>
    <Sidebar
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {children}
    </Sidebar>
  </ModalContainer>
)

export default SideModal

const Sidebar = styled(motion.div)`
  display: flex;
  flex-direction: column;
  margin-left: auto;
  width: 100%;
  max-width: 476px;
  height: 100vh;
  background-color: ${({ theme }) => theme.bg.primary};
  z-index: 1;
  position: relative;
  overflow: auto;
`
