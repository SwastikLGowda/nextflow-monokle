import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const Container = styled.div<{$status: 'active' | 'inactive'}>`
  ${({$status}) => `
    color: ${$status === 'active' ? Colors.grey8 : Colors.grey6};
`}

  display: flex;
  align-items: center;
  gap: 5px;
  margin-left: 10px;
  cursor: pointer;
`;
