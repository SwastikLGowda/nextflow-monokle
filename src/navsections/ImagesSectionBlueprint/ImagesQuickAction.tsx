import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {openReplaceImageModal} from '@redux/reducers/ui';

import {ItemCustomComponentProps} from '@monokle-desktop/shared/models';
import {isInPreviewModeSelector} from '@monokle-desktop/shared/utils/selectors';

import * as S from './ImagesQuickAction.styled';

const ImagesQuickAction: React.FC<ItemCustomComponentProps> = props => {
  const {itemInstance} = props;

  const dispatch = useAppDispatch();
  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);

  const onReplaceHandler = () => {
    if (isInPreviewMode) {
      return;
    }

    dispatch(openReplaceImageModal(itemInstance.id));
  };

  return (
    <S.ReplaceSpan $isDisabled={isInPreviewMode} $isSelected={itemInstance.isSelected} onClick={onReplaceHandler}>
      Replace
    </S.ReplaceSpan>
  );
};

export default ImagesQuickAction;
