import {useMemo} from 'react';

import {useAppSelector} from '@redux/hooks';
import {registeredKindHandlersSelector} from '@redux/selectors';

import {TitleBar} from '@molecules';

const CrdsPane: React.FC = () => {
  const kindHandlers = useAppSelector(registeredKindHandlersSelector);
  const crdKindHandlers = useMemo(() => kindHandlers.filter(kh => kh.isCustom), [kindHandlers]);

  return (
    <div>
      <TitleBar title="Custom Resource Definitions" closable />
      <ul>
        {crdKindHandlers.map(c => (
          <li>
            {c.clusterApiVersion} - {c.kind}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CrdsPane;
