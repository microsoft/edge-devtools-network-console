// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import {
    CommandBar,
    Pivot,
    PivotItem,
    MessageBar,
    MessageBarType,
    Link,
} from '@fluentui/react';
import { useDispatch, connect } from 'react-redux';
import { ControlledEditor as MonacoEditor } from '@monaco-editor/react';
import { Map as ImmutableMap } from 'immutable';
import { StyleAttribute } from 'glamor';
import { HttpVerb, INetConsoleParameter } from 'network-console-shared';

import * as Styles from './styles';
import NoBody from './NoBody';
import EditorGrid from 'ui/EditorGrid';
import {
    editBodyTextAction,
    setBodyTypeAction,
    BodyType,
    addBodyDataItemAction,
    editBodyDataItemAction,
    editBodyFormDataFileParams,
    removeBodyDataItemAction,
    setBodyTextTypeAction,
} from 'actions/request/body';
import { IView, IActiveEnvironmentState } from 'store';
import { getKnownVerbDef } from 'data';
import { AppHost } from 'store/host';
import { THEME_TYPE, THEME_OVERRIDE } from 'themes/vscode-theme';
import { ID_DIV_FORM_DATA, ID_DIV_FORM_URLENCODED } from 'reducers/request/id-manager';

export interface IOwnProps {
    requestId: string;
}
interface IConnectedProps {
    selectedVerb: HttpVerb;
    theme: THEME_TYPE;

    rawTextBody: {
        text: string;
        contentType: string;
    };
    formData: ImmutableMap<string, INetConsoleParameter>;
    xWwwFormUrlencoded: ImmutableMap<string, INetConsoleParameter>;
    bodySelection: 'none' | 'form-data' | 'x-www-form-urlencoded' | 'raw';

    options: {
        showDescriptionFields: boolean;
    };

    environment: IActiveEnvironmentState;
}
export type IRequestBodyEditorProps = IOwnProps & IConnectedProps;
const ROOT_CMD_BAR_ITEM = {
    key: 'change-request-body-type',
    text: '',
    subMenuProps: {
        items: [
            {
                key: 'text/plain',
                text: 'Plain text (text/plain)',
                iconProps: { iconName: 'TextDocument' },
            },
            {
                key: 'application/json',
                text: 'JSON (application/json)',
                iconProps: { iconName: 'Script' },
            },
            {
                key: 'text/xml',
                text: 'XML (text/xml)',
                iconProps: { iconName: 'ChevronLeftMed' },
            },
            {
                key: 'application/xml',
                text: 'XML (application/xml)',
                iconProps: { iconName: 'ChevronRightMed' },
            },
            {
                key: 'text/html',
                text: 'HTML (text/html)',
                iconProps: { iconName: 'FileHTML' },
            },
            {
                key: 'application/javascript',
                text: 'JavaScript (application/javascript)',
                iconProps: { iconName: 'JavaScriptLanguage' },
            },
        ],
    },
};

const KeyToMap = new Map<string, string>([
    ['text/plain', 'text'],
    ['application/json', 'json'],
    ['text/xml', 'xml'],
    ['application/xml', 'xml'],
    ['text/html', 'html'],
    ['application/javascript', 'javascript'],
]);
export function RequestBody(props: IRequestBodyEditorProps) {
    const dispatch = useDispatch();
    const cmdBarItem = {
        ...ROOT_CMD_BAR_ITEM,
        text: `Content type: ${props.rawTextBody.contentType}`,
        subMenuProps: {
            ...ROOT_CMD_BAR_ITEM.subMenuProps,
            items: ROOT_CMD_BAR_ITEM.subMenuProps.items.map((item) => {
                return {
                    ...item,
                    onClick: () => {
                        dispatch(setBodyTextTypeAction(props.requestId, item.key));
                    },
                };
            }),
        },
    };
    const knownVerb = getKnownVerbDef(props.selectedVerb);
    const shouldIncludeBody = !knownVerb || knownVerb.canIncludeBody;
    function calculateSelectedIndex(bodySelection: 'none' | 'form-data' | 'x-www-form-urlencoded' | 'raw'): number {
        return {
            none: 0,
            'form-data': 1,
            'x-www-form-urlencoded': 2,
            raw: 3,
        }[bodySelection];
    }

    const style: StyleAttribute = props.bodySelection === 'raw' ? Styles.BODY_CONTAINER_STYLE : {};

    return (
        <div {...style}>
            {!shouldIncludeBody && <MessageBar
                                        messageBarType={MessageBarType.severeWarning}
                                        isMultiline
                                        messageBarIconProps={{ iconName: 'Warning' }}
                                        styles={{root: { userSelect: 'none' }, text: { userSelect: 'none'}}}
                                   >
                                       Sending a body entity as part of a {props.selectedVerb} request is
                                       not part of the standard and may result in undefined behavior. Consider
                                       choosing a verb such as POST or PUT for this endpoint.
                                       {knownVerb && <>(For more information,
                                       see <Link href={knownVerb.link}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              onClick={e => {
                                                  if (AppHost.mustAskToOpenLink()) {
                                                      AppHost.openLink?.(knownVerb.link);
                                                      e.preventDefault();
                                                      e.stopPropagation();
                                                  }
                                              }}
                                              >
                                           the relevant standards information
                                       </Link>.)</>}
                                   </MessageBar>}
            <Pivot
                className="ht100 flxcol"
                initialSelectedIndex={calculateSelectedIndex(props.bodySelection)}
                onLinkClick={(pivotItem) => {
                    if (pivotItem) {
                        // TODO: Improve this hack
                        const key = ((pivotItem as any).key as string).substr(2) as BodyType;
                        dispatch(setBodyTypeAction(props.requestId, key));
                    }
                }}
                styles={{
                    root: THEME_OVERRIDE.smallPivotRoot,
                    link: THEME_OVERRIDE.smallPivotButtons,
                    linkContent: THEME_OVERRIDE.smallPivotButtons,
                }}
                >
                <PivotItem headerText="No body" key="none">
                    <NoBody />
                </PivotItem>
                <PivotItem headerText="form-data" key="form-data">
                    <EditorGrid
                        canHaveFiles={true}
                        updateRowFileInfo={(id, type, fileName, contents) => {
                            dispatch(editBodyFormDataFileParams(props.requestId, id, fileName, contents, type));
                        }}
                        rows={ImmutableMap(props.formData)}
                        updateRow={(isNew, id, key, value, description, enabled) => {
                            if (isNew) {
                                dispatch(addBodyDataItemAction(
                                    props.requestId,
                                    'form-data',
                                    id,
                                    key,
                                    value,
                                    description,
                                    enabled
                                ));
                            }
                            else {
                                dispatch(editBodyDataItemAction(
                                    props.requestId,
                                    'form-data',
                                    id,
                                    key,
                                    value,
                                    description,
                                    enabled,
                                ));
                            }
                        }}
                        idStart={props.requestId + ID_DIV_FORM_DATA}
                        isNameFieldReadonly={false}
                        hideDescriptionField={!props.options.showDescriptionFields}
                        isDeleteAllowed={true}
                        deleteRow={id => {
                            dispatch(removeBodyDataItemAction(props.requestId, 'form-data', id));
                        }}
                        previewEnvironmentMerge={true}
                        environmentVariables={props.environment.variables}
                        />
                </PivotItem>
                <PivotItem headerText="x-www-form-urlencoded" key="x-www-form-urlencoded">
                    <EditorGrid
                        canHaveFiles={false}
                        rows={props.xWwwFormUrlencoded}
                        updateRow={(isNew, id, key, value, description, enabled) => {
                            if (isNew) {
                                dispatch(addBodyDataItemAction(
                                    props.requestId,
                                    'x-www-form-urlencoded',
                                    id,
                                    key,
                                    value,
                                    description,
                                    enabled
                                ));
                            }
                            else {
                                dispatch(editBodyDataItemAction(
                                    props.requestId,
                                    'x-www-form-urlencoded',
                                    id,
                                    key,
                                    value,
                                    description,
                                    enabled,
                                ));
                            }
                        }}
                        idStart={props.requestId + ID_DIV_FORM_URLENCODED}
                        isNameFieldReadonly={false}
                        hideDescriptionField={!props.options.showDescriptionFields}
                        isDeleteAllowed={true}
                        deleteRow={id => {
                            dispatch(removeBodyDataItemAction(props.requestId, 'x-www-form-urlencoded', id));
                        }}
                        previewEnvironmentMerge={true}
                        environmentVariables={props.environment.variables}
                        />
                </PivotItem>

                <PivotItem headerText="Raw text" className="ht100" key="raw">
                    <div className="ht100 flxcol">
                        <CommandBar items={[cmdBarItem]} />
                        <div style={{flexGrow: 1}}>
                            <MonacoEditor
                                language={KeyToMap.get(props.rawTextBody.contentType)}
                                theme={props.theme}
                                options={{automaticLayout: true}}
                                value={props.rawTextBody.text}
                                onChange={(_e, newValue) => {
                                    dispatch(editBodyTextAction(props.requestId, newValue as string));
                                }}
                                />
                        </div>
                    </div>
                </PivotItem>
            </Pivot>
        </div>
    )
}

function mapStateToProps(state: IView, ownProps: IOwnProps): IConnectedProps {
    const request = state.request.get(ownProps.requestId);
    if (!request) {
        throw new RangeError('Invalid requestId');
    }
    const bc = request.current.bodyComponents;
    return {
        bodySelection: bc.bodySelection,
        formData: bc.formData,
        rawTextBody: bc.rawTextBody,
        selectedVerb: request.current.verb,
        xWwwFormUrlencoded: bc.xWwwFormUrlencoded,

        theme: state.theme,
        options: {
            showDescriptionFields: state.hostCapabilities.shouldShowDescription,
        },

        environment: state.environment.environment,
    };
}

const ConnectedRequestBody = connect(mapStateToProps)(RequestBody);
export default ConnectedRequestBody;
