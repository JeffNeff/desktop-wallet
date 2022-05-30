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

import { ChevronRight } from 'lucide-react'
import { FC } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import styled, { css, useTheme } from 'styled-components'

interface ActionButtonProps {
  Icon: LucideIconType
  label: string
  link?: string
  onClick?: () => void
}

const NavigationButton: FC<ActionButtonProps> = ({ Icon, label, link, children, onClick }) => {
  const theme = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const handleClick = () => {
    if (link) {
      navigate(link)
    } else if (onClick) {
      onClick()
    }
  }

  return (
    <ActionButtonContainer onClick={handleClick} isActive={link !== undefined && location.pathname.startsWith(link)}>
      <ActionContent>
        <ActionIcon>
          <Icon color={theme.font.primary} size={18} />
        </ActionIcon>
        <ActionLabel>{label}</ActionLabel>
        {children && <ChevronRight size={16} />}
      </ActionContent>
      <SubMenuContainer>{children}</SubMenuContainer>
    </ActionButtonContainer>
  )
}

const ActionLabel = styled.label`
  color: ${({ theme }) => theme.font.secondary};
  text-align: center;
  transition: all 0.1s ease-out;
`

const ActionContent = styled.div`
  flex: 1;
  display: flex;
  align-items: center;

  * {
    cursor: pointer;
  }
`

const ActionIcon = styled.div`
  display: flex;
  margin-right: var(--spacing-3);
  opacity: 0.5;
  transition: all 0.1s ease-out;
`

const SubMenuContainer = styled.div`
  position: absolute;
  background-color: ${({ theme }) => theme.bg.primary};
  padding: var(--spacing-3);
  border-radius: var(--radius-medium);
  top: 0;
  transform: translateX(100%);
  opacity: 0;
`

const ActionButtonContainer = styled.div<{ isActive: boolean }>`
  display: flex;
  align-items: stretch;
  width: 100%;
  height: 50px;

  &:hover {
    cursor: pointer;

    ${ActionIcon} {
      opacity: 1;
    }

    ${SubMenuContainer} {
      opacity: 1;
    }
  }

  ${({ isActive }) =>
    isActive &&
    css`
      ${ActionLabel} {
        color: ${({ theme }) => theme.font.primary};
      }

      ${ActionIcon} {
        opacity: 1;
      }
    `}
`

export default NavigationButton
