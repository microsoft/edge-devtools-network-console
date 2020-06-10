// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { useDispatch, connect } from 'react-redux';
import { Modal, Stack, PrimaryButton, ActionButton, Breadcrumb, Text } from '@fluentui/react';

import { IModalState, IView, MODAL_AUTHORIZATION_REQUEST_ID } from 'store';
import { makeDismissAuthorizationModalAction, doSaveCollectionAuthorizationToHost, makeSelectCollectionForSaveAction, makeRemoveEnvVarAction, makeAddEnvVarAction, makeEditEnvVarAction, makeDismissEditEnvironmentAction } from 'actions/modal';
import AuthorizationUI from '../Authorization';
import SaveToCollection from 'ui/SaveToCollection';
import { ICollection } from 'model/collections';
import { saveRequestToHostAction } from 'actions/request/host';
import EditorGrid from 'ui/EditorGrid';
import { saveEnvironmentToHost } from 'actions/environment';

interface IConnectedProps {
    modals: IModalState;
    collections: ICollection[];
    currentRequestId: string;
}

export function ModalManager(props: IConnectedProps) {
    const dispatch = useDispatch();

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

    if (authorization && authorizationCollectionId) {
        ui = <AuthorizationUI
                authorization={authorization}
                requestId={MODAL_AUTHORIZATION_REQUEST_ID}
                />;
        header = <Breadcrumb
                    styles={{ root: { userSelect: 'none' } }}

                    items={authorizationPaths.map((p, i) => {
                        return {
                            text: p,
                            key: String(i),
                        };
                     })}
                    />;
        title = 'Edit Collection Authorization';
        onSave = () => {
            dispatch(doSaveCollectionAuthorizationToHost(authorizationCollectionId, authorization));
        };
        onCancel = () => {
            dispatch(makeDismissAuthorizationModalAction());
        };
    }
    else if (collections.open) {
        ui = <SaveToCollection rootCollections={props.collections} />;
        title = 'Save to Collection';
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
        title = 'Edit Environment';
        header = <Breadcrumb
                    styles={{ root: { userSelect: 'none' } }}

                    items={[
                        { text: `${environment.collectionName} (${environment.fileName})`, key: 'coll' },
                        { text: environment.name, key: 'env' },
                    ]}
                    />;
        onCancel = () => dispatch(makeDismissEditEnvironmentAction());
        onSave = () => {
            const vars = environment.values;
            const id = environment.id;
            dispatch(saveEnvironmentToHost(vars.valueSeq().toArray(), id));
        };
    }
    // else -- other modals

    return (
        <Modal
            styles={{
                main: { width: '75%', maxWidth: '900px', maxHeight: '80%' },
                scrollableContent: { width: '100%', height: '100%' },
            }}
            isOpen={isOpen}
            onDismiss={_e => {
                dispatch(makeDismissAuthorizationModalAction());
            }}
        >
            <Stack
                styles={{ root: { width: '100%' }}}
                tokens={{ padding: 'm' }}
                onKeyDown={e => {
                    if (e.key === 'Enter') {
                        onSave();
                        e.preventDefault();
                        e.stopPropagation();
                    }
                }}
                >
                <Text variant="xLarge" styles={{root: { userSelect: 'none' }}}>{title}</Text>
                {header}
                {ui}
                <Stack
                    horizontal
                    horizontalAlign="end">
                    <PrimaryButton onClick={onSave}>Save</PrimaryButton>
                    <ActionButton onClick={onCancel}>Cancel</ActionButton>
                </Stack>
            </Stack>
        </Modal>
    )
}

function mapStateToProps(state: IView): IConnectedProps {
    return {
        modals: state.modals,
        collections: state.collections,
        currentRequestId: state.viewManager.currentView as string,
    };
}

const ConnectedModalManager = connect(mapStateToProps)(ModalManager);
export default ConnectedModalManager;
