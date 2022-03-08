import {useCallback, useMemo, useState} from 'react';

import {Button, Input, Select} from 'antd';

import {v4 as uuidv4} from 'uuid';

import {HELM_INSTALL_OPTIONS_DOCS_URL, HELM_TEMPLATE_OPTIONS_DOCS_URL} from '@constants/constants';
import {helmInstallOptions, helmTemplateOptions} from '@constants/helmOptions';

import {HelmPreviewConfiguration} from '@models/appconfig';
import {HelmValuesFile} from '@models/helm';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {updateProjectConfig} from '@redux/reducers/appConfig';
import {closePreviewConfigurationEditor} from '@redux/reducers/main';
import {startPreview} from '@redux/services/preview';

import {KeyValueInput, OrderedList} from '@components/atoms';
import {OrderedListItem} from '@components/atoms/OrderedList';

import * as S from './styled';

const PreviewConfigurationEditor = () => {
  const dispatch = useAppDispatch();
  const helmValuesMap = useAppSelector(state => state.main.helmValuesMap);

  const helmPreviewMode = useAppSelector(
    state => state.config.projectConfig?.settings?.helmPreviewMode || state.config.settings.helmPreviewMode
  );

  const previewConfigurationMap = useAppSelector(
    state => state.config.projectConfig?.helm?.previewConfigurationMap || {}
  );

  const previewConfiguration = useAppSelector(state => {
    const previewConfigurationId = state.main.prevConfEditor.previewConfigurationId;
    if (!previewConfigurationId) {
      return undefined;
    }
    return previewConfigurationMap[previewConfigurationId];
  });

  const helmChart = useAppSelector(state => {
    const helmChartId = state.main.prevConfEditor.helmChartId;
    if (!helmChartId) {
      return undefined;
    }
    return state.main.helmChartMap[helmChartId];
  });

  const [name, setName] = useState<string>(() => previewConfiguration?.name || '');

  const valuesFilesByPath = useAppSelector(
    state =>
      helmChart?.valueFileIds
        .map(id => state.main.helmValuesMap[id])
        .filter((v): v is HelmValuesFile => v !== undefined)
        .reduce((acc: Record<string, HelmValuesFile>, curr: HelmValuesFile) => {
          acc[curr.filePath] = curr;
          return acc;
        }, {}) || {}
  );

  const [valuesFileItems, setValuesFileItems] = useState<OrderedListItem[]>(() => {
    if (!previewConfiguration?.orderedValuesFilePaths) {
      return Object.values(valuesFilesByPath).map(vf => ({id: vf.id, text: vf.name, isChecked: false}));
    }
    return previewConfiguration.orderedValuesFilePaths
      .map(filePath => valuesFilesByPath[filePath])
      .filter((v): v is HelmValuesFile => v !== undefined)
      .map(vf => ({id: vf.id, text: vf.name, isChecked: true}))
      .concat(
        Object.values(valuesFilesByPath)
          .filter(vf => !previewConfiguration.orderedValuesFilePaths.includes(vf.filePath))
          .map(vf => ({id: vf.id, text: vf.name, isChecked: false}))
      );
  });

  const [helmOptions, setHelmOptions] = useState<Record<string, string | null>>(previewConfiguration?.options || {});

  const [helmCommand, setHelmCommand] = useState<'template' | 'install'>(() => {
    if (previewConfiguration) {
      return previewConfiguration.command;
    }
    if (helmPreviewMode) {
      return helmPreviewMode;
    }
    return 'template';
  });

  const keyValueInputSchema = useMemo(
    () => (helmCommand === 'template' ? helmTemplateOptions : helmInstallOptions),
    [helmCommand]
  );

  const helmOptionsDocsUrl = useMemo(
    () => (helmCommand === 'template' ? HELM_TEMPLATE_OPTIONS_DOCS_URL : HELM_INSTALL_OPTIONS_DOCS_URL),
    [helmCommand]
  );

  const onClose = useCallback(() => {
    dispatch(closePreviewConfigurationEditor());
  }, [dispatch]);

  const onSave = useCallback(
    (shouldRunPreview?: boolean) => {
      if (!helmChart) {
        return;
      }
      const orderedValuesFilePaths = valuesFileItems
        .filter(i => i.isChecked)
        .map(v => helmValuesMap[v.id])
        .filter((v): v is HelmValuesFile => v !== undefined)
        .map(v => v.filePath);
      const input: HelmPreviewConfiguration = {
        id: previewConfiguration ? previewConfiguration.id : uuidv4(),
        name,
        helmChartFilePath: helmChart?.filePath,
        command: helmCommand,
        options: helmOptions,
        orderedValuesFilePaths,
      };
      const updatedPreviewConfigurationMap = JSON.parse(JSON.stringify(previewConfigurationMap));
      updatedPreviewConfigurationMap[input.id] = input;

      dispatch(
        updateProjectConfig({
          config: {
            helm: {
              previewConfigurationMap: updatedPreviewConfigurationMap,
            },
          },
          fromConfigFile: false,
        })
      );

      dispatch(closePreviewConfigurationEditor());
      if (shouldRunPreview) {
        startPreview(input.id, 'helm-preview-config', dispatch);
      }
    },
    [
      dispatch,
      name,
      helmCommand,
      helmOptions,
      previewConfigurationMap,
      helmValuesMap,
      previewConfiguration,
      valuesFileItems,
      helmChart,
    ]
  );

  if (!helmChart) {
    return <p>Something went wrong, could not find the helm chart.</p>;
  }

  return (
    <div>
      <S.Field>
        <S.Label>Name your configuration:</S.Label>
        <Input value={name} onChange={e => setName(e.target.value)} placeholder="Enter the configuration name" />
      </S.Field>
      <S.Field>
        <S.Label style={{marginBottom: 0}}>Select which values files to use:</S.Label>
        <S.Description>Drag and drop to specify order</S.Description>
        <OrderedList items={valuesFileItems} onChange={setValuesFileItems} />
      </S.Field>
      <S.Field>
        <S.Label>Select which helm command to use for this Preview:</S.Label>
        <Select value={helmCommand} onChange={setHelmCommand} style={{width: 150}}>
          <Select.Option value="template">Template</Select.Option>
          <Select.Option value="install">Install</Select.Option>
        </Select>
      </S.Field>
      <S.Field>
        <KeyValueInput
          label="Specify options:"
          value={helmOptions}
          schema={keyValueInputSchema}
          availableValuesByKey={{}}
          docsUrl={helmOptionsDocsUrl}
          onChange={setHelmOptions}
        />
      </S.Field>
      <S.ActionsContainer>
        <Button onClick={onClose} type="primary" ghost>
          Discard
        </Button>
        <Button onClick={() => onSave()} type="primary" ghost>
          Save
        </Button>
        <Button onClick={() => onSave(true)} type="primary">
          Save and Preview
        </Button>
      </S.ActionsContainer>
    </div>
  );
};

export default PreviewConfigurationEditor;