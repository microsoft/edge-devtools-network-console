// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { useDispatch, connect } from 'react-redux';
import {
    AccentButton,
    Breadcrumb,
    Dialog,
    NeutralButton,
    Typography,
    TypographySize,
} from '@microsoft/fast-components-react-msft';
import { IHostCollection } from 'network-console-shared';

import { IModalState, IView, MODAL_AUTHORIZATION_REQUEST_ID } from 'store';
import { makeDismissAuthorizationModalAction, doSaveCollectionAuthorizationToHost, makeSelectCollectionForSaveAction, makeRemoveEnvVarAction, makeAddEnvVarAction, makeEditEnvVarAction, makeDismissEditEnvironmentAction } from 'actions/modal';
import AuthorizationUI from '../Authorization';
import SaveToCollection from 'ui/SaveToCollection';
import { saveRequestToHostAction } from 'actions/request/host';
import EditorGrid from 'ui/EditorGrid';
import { saveEnvironmentToHost } from 'actions/environment';
import Stack from 'ui/generic/Stack';
import { getText, LocalizationContext } from 'utility/loc-context';
import LocText from 'ui/LocText';
import { FocusRestorer } from 'utility/dom';

// Class name for the modal root (belongs to the <Dialog>).
const MODAL_CLASS_NAME = 'modalManager_modal_root';

interface IConnectedProps {
    modals: IModalState;
    collections: IHostCollection[];
    currentRequestId: string;
}

export function ModalManager(props: IConnectedProps) {
    const dispatch = useDispatch();
    const locale = React.useContext(LocalizationContext);

    const { authorization, authorizationCollectionId, authorizationPaths, collections, environment } = props.modals;
    const isOpen = !!(authorization && authorizationCollectionId) ||
                   collections.open ||
                   !!environment.id ||
                    false;
    let ui: any;
    let header: any;
    let title = '';
    let onCancel: () => void = () => { };
    let onSave: () => void = () => { };
    let wasOpen = React.useRef(false);
    React.useEffect(() => {
        if (!wasOpen.current && isOpen) {
            FocusRestorer.focusInModal(`.${MODAL_CLASS_NAME}`);
            wasOpen.current = true;
        }
        else if (wasOpen.current && !isOpen) {
            FocusRestorer.restoreNext();
            wasOpen.current = false;
        }
    }, [wasOpen, isOpen]);

    if (authorization && authorizationCollectionId) {
        ui = <AuthorizationUI
                authorization={authorization}
                requestId={MODAL_AUTHORIZATION_REQUEST_ID}
                controlIdPrefix="modalEditor"
                />;
        header = <Breadcrumb separator={() => '/'}>
                    {authorizationPaths.map((p, i) => <span key={i}>{p}</span>)}
                 </Breadcrumb>
        title = getText('ModalManager.authorization.title', { locale });
        onSave = () => {
            dispatch(doSaveCollectionAuthorizationToHost(authorizationCollectionId, authorization));
        };
        onCancel = () => {
            dispatch(makeDismissAuthorizationModalAction());
        };
    }
    else if (collections.open) {
        ui = <SaveToCollection
                rootCollections={props.collections}
                selectedCollectionId={props.modals.collections.selectedCollectionId}
                />;
        title = getText('ModalManager.saveAs.title', { locale });
        onCancel = () => {
            dispatch(makeSelectCollectionForSaveAction(null, false));
        };
        onSave = () => {
            dispatch(saveRequestToHostAction(props.currentRequestId, collections.selectedCollectionId));
        }
    }
    else if (environment.id) {
        ui = <EditorGrid
                canHaveFiles={false}
                deleteRow={e => {
                    dispatch(makeRemoveEnvVarAction(e));
                }}
                hideDescriptionField={false}
                idStart="ENV"
                isDeleteAllowed={true}
                isNameFieldReadonly={false}
                rows={environment.values}
                updateRow={(isNew, id, key, val, desc, enabled) => {
                    if (isNew) {
                        dispatch(makeAddEnvVarAction(id, key, val, desc, enabled));
                    }
                    else {
                        dispatch(makeEditEnvVarAction(id, key, val, desc, enabled));
                    }
                }}
                hideAddRow={false}
                previewEnvironmentMerge={false}
                />;
        title = getText('ModalManager.editEnvironment.title', { locale });
        header = <Breadcrumb separator={() => <span> / </span>}>
                    <span>{environment.collectionName} ({environment.fileName})</span>
                    <span>{environment.name}</span>
                 </Breadcrumb>
        onCancel = () => dispatch(makeDismissEditEnvironmentAction());
        onSave = () => {
            const vars = environment.values;
            const id = environment.id;
            dispatch(saveEnvironmentToHost(vars.valueSeq().toArray(), id));
        };
    }
    // else -- other modals

    return (
        <Dialog
            modal
            className={MODAL_CLASS_NAME}
            visible={isOpen}
            onDismiss={() => {
                dispatch(makeDismissAuthorizationModalAction());
            }}
            onKeyDown={e => {
                if (e.key === 'Enter') {
                    onSave();
                    e.preventDefault();
                    e.stopPropagation();
                }
                else if (e.key === 'Escape') {
                    onCancel();
                    e.preventDefault();
                    e.stopPropagation();
                }
            }}
        >
            <Stack style={{ height: '100%' }}>
                <div style={{ margin: '5px' }}>
                    <Typography size={TypographySize._4}>{title}</Typography>
                </div>
                <div style={{ margin: '5px' }}>
                    {header}
                </div>
                <div style={{ width: '100%', height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
                    {ui}
                </div>
                <Stack horizontal style={{ justifyContent: 'flex-end' }}>
                    <AccentButton onClick={onSave} style={{ marginTop: '5px' }}><LocText textKey="ModalManager.save" /></AccentButton>
                    <NeutralButton onClick={onCancel} style={{ margin: '5px' }}><LocText textKey="ModalManager.cancel" /></NeutralButton>
                </Stack>
            </Stack>
        </Dialog>
    );
}

function mapStateToProps(state: IView): IConnectedProps {
    return {
        modals: state.modals,
        collections: state.collections.rootCollections.map(id => state.collections.allCollections.get(id)!),
        currentRequestId: state.viewManager.currentView as string,
    };
}

const ConnectedModalManager = connect(mapStateToProps)(ModalManager);
export default ConnectedModalManager;
