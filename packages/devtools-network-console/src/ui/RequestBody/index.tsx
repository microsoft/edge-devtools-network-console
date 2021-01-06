// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { Hypertext, Radio, Select, SelectOption } from '@microsoft/fast-components-react-msft';
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
    addBodyDataItemAction,
    editBodyDataItemAction,
    editBodyFormDataFileParams,
    removeBodyDataItemAction,
    setBodyTextTypeAction,
} from 'actions/request/body';
import { IView, IActiveEnvironmentState } from 'store';
import { getKnownVerbDef } from 'data';
import { AppHost } from 'store/host';
import { THEME_TYPE } from 'themes/vscode-theme';
import { ID_DIV_FORM_DATA, ID_DIV_FORM_URLENCODED } from 'reducers/request/id-manager';
import { HideUnless } from 'ui/generic/HideIf';
import { DesignSystemProvider } from '@microsoft/fast-jss-manager-react';
import LocText from 'ui/LocText';
import { getText, LocalizationContext } from 'utility/loc-context';
import LocalAlert from 'ui/generic/LocalAlert';
import { Typography, TypographySize } from '@microsoft/fast-components-react-msft';

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
const BODY_CONTENT_TYPES = [{
    key: 'text/plain',
    text: 'text/plain',
},
{
    key: 'application/json',
    text: 'application/json',
},
{
    key: 'text/xml',
    text: 'text/xml',
},
{
    key: 'application/xml',
    text: 'application/xml',
},
{
    key: 'text/html',
    text: 'text/html',
},
{
    key: 'application/javascript',
    text: 'application/javascript',
}];

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
    const knownVerb = getKnownVerbDef(props.selectedVerb);
    const shouldIncludeBody = !knownVerb || knownVerb.canIncludeBody;
    const locale = React.useContext(LocalizationContext);

    const style: StyleAttribute = props.bodySelection === 'raw' ? Styles.BODY_CONTAINER_STYLE : {};

    return (
        <div {...style}>
            {!shouldIncludeBody && (
                <LocalAlert type="severeWarning">
                    <Typography size={TypographySize._8} style={{ color: 'black' }}>
                        <LocText textKey="RequestBody.bodyWithUnsupportedVerb" />
                        {knownVerb && (<>{ " " }<Hypertext
                                            href={knownVerb.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={e => {
                                                if (AppHost.mustAskToOpenLink() && AppHost.openLink) {
                                                    AppHost.openLink(knownVerb.link);
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                }
                                            }}
                                        >
                                            <LocText textKey="RequestBody.bodyWithUnsupportedVerb.learnMore" />
                                        </Hypertext></>)}
                    </Typography>
                </LocalAlert>
            )}

            <div className="ht100 flxcol">
                <div {...Styles.BODY_SELECT_RBLIST} style={{paddingBottom: '4px'}} role="radiogroup" aria-label={getText('RequestBody.groupLabel', { locale })}>
                    <DesignSystemProvider designSystem={{density: -3}}>
                    <Radio
                        inputId="bodyNone"
                        name="bodyType"
                        value="none"
                        checked={props.bodySelection === 'none'}
                        title="None"
                        label={(cn) => <label {...Styles.BODY_SELECT_LABEL} htmlFor="bodyNone" className={cn}><LocText textKey="RequestEditor.BodyType.none" /></label>}
                        onChange={() => dispatch(setBodyTypeAction(props.requestId, 'none'))}
                        />
                    <Radio
                        inputId="bodyFD"
                        name="bodyType"
                        value="form-data"
                        checked={props.bodySelection === 'form-data'}
                        title="form-data"
                        label={cn => <label {...Styles.BODY_SELECT_LABEL} htmlFor="bodyFD" className={cn}>form-data</label>}
                        onChange={() => dispatch(setBodyTypeAction(props.requestId, 'form-data'))}
                        />
                    <Radio
                        inputId="bodyXWFU"
                        name="bodyType"
                        value="x-www-form-urlencoded"
                        checked={props.bodySelection === 'x-www-form-urlencoded'}
                        title="x-www-form-urlencoded"
                        label={cn => <label {...Styles.BODY_SELECT_LABEL} htmlFor="bodyXWFU" className={cn}>x-www-form-urlencoded</label>}
                        onChange={() => dispatch(setBodyTypeAction(props.requestId, 'x-www-form-urlencoded'))}
                        />
                    <Radio
                        inputId="bodyRaw"
                        name="bodyType"
                        value="Raw text"
                        checked={props.bodySelection === 'raw'}
                        title="raw"
                        label={(cn) => <label {...Styles.BODY_SELECT_LABEL} htmlFor="bodyRaw" className={cn}><LocText textKey="RequestEditor.BodyType.rawText" /></label>}
                        onChange={() => dispatch(setBodyTypeAction(props.requestId, 'raw'))}
                        />

                    <HideUnless test={props.bodySelection} match="raw">
                        {/* <CommandBar items={[cmdBarItem]} /> */}
                        <Select
                            placeholder={getText('RequestEditor.BodyType.contentTypeSelectLabel', { locale })}
                            className="content-type-select"
                            jssStyleSheet={{
                                select: {
                                    width: '155px',
                                },
                                select_menu__open: {
                                    zIndex: '500',
                                    position: 'relative',
                                },
                            }}
                            selectedItems={[props.rawTextBody.contentType]}
                            onMenuSelectionChange={items => {
                                dispatch(setBodyTextTypeAction(props.requestId, items[0]?.id || 'text/plain'));
                            }}>
                            {BODY_CONTENT_TYPES.map(item => {
                                return (
                                    <SelectOption key={item.key} id={item.key} value={item.text} title={item.text} displayString={item.text} />
                                );
                            })}
                        </Select>
                    </HideUnless>
                    </DesignSystemProvider>
                </div>
                <HideUnless test={props.bodySelection} match="none">
                    <NoBody />
                </HideUnless>
                <HideUnless test={props.bodySelection} match="form-data" {...Styles.GRID_CONTANER}>
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
                </HideUnless>
                <HideUnless test={props.bodySelection} match="x-www-form-urlencoded" {...Styles.GRID_CONTANER}>
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
                </HideUnless>
                <HideUnless test={props.bodySelection} match="raw" className="ht100">
                    <div className="ht100 flxcol">
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
                </HideUnless>
            </div>
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

        theme: state.theme.theme,
        options: {
            showDescriptionFields: state.hostCapabilities.shouldShowDescription,
        },

        environment: state.environment.environment,
    };
}

const ConnectedRequestBody = connect(mapStateToProps)(RequestBody);
export default ConnectedRequestBody;
