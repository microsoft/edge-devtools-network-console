// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ThunkAction } from 'redux-thunk';
import {
    binFromB64,
    INetConsoleAuthorization,
    INetConsoleResponse,
} from 'network-console-shared';

import { AppHost } from 'store/host';
import { startRequestAction, stopRequestAction } from './request/basics';
import { beginResponseAction, endResponseAction } from './response/basics';
import downloadFile from 'utility/download';
import { IView } from 'store';
import { INetConsoleRequestInternal } from 'model/NetConsoleRequest';
import { makeWebSocketClearMessagesAction, makeWebSocketDisconnectedAction } from './websocket';

type Thaction = ThunkAction<void, IView, void, any>;
export function executeRequest(requestId: string, request: INetConsoleRequestInternal, isDownloadForResponse: boolean, environmentalAuthorization: INetConsoleAuthorization | null = null): Thaction {
    return async (dispatch, getState) => {
        const state = getState();

        dispatch(startRequestAction(requestId));
        dispatch(beginResponseAction(requestId));
        if (!request.url.startsWith('ws://') && !request.url.startsWith('wss://')) {
            // Clear websocket messages associated with request_id if
            // request url is changed to no longer point to a websocket.
            dispatch(makeWebSocketClearMessagesAction(requestId));
        }

        try {
            const response = await AppHost.makeRequest(request, environmentalAuthorization, state.environment.environment.variables);
            if (isDownloadForResponse) {
                const outcomeResponse: INetConsoleResponse = {
                    ...response,
                    response: {
                        ...response.response,
                        body: {
                            content: '',
                        },
                    },
                };
                dispatch(stopRequestAction(requestId, outcomeResponse));
                dispatch(endResponseAction(requestId, true, 'COMPLETE', outcomeResponse.response));

                const buffer = binFromB64(response.response.body.content);
                downloadFile(buffer, computeFilenameFromRequestAndResponse(request, outcomeResponse));
            }
            else {
                dispatch(stopRequestAction(requestId, response));
                dispatch(endResponseAction(requestId, true, 'COMPLETE', response.response));
            }
        }
        catch {
            dispatch(stopRequestAction(requestId, null));
            dispatch(endResponseAction(requestId, false, 'ERROR_BELOW_APPLICATION_LAYER', null));
        }
    }
}

export function downloadResponse(requestId: string): Thaction {
    return async (_dispatch, getState) => {
        const state = getState();
        const request = state.request.get(requestId);
        const response = state.response.get(requestId);

        if (!request || !response || !response.response) {
            throw new Error('No response data available.');
        }

        const buffer = binFromB64(response.response.body.content);
        downloadFile(buffer, computeFilenameFromRequestAndResponse(request.current, response as INetConsoleResponse));
    }
}

export function executeRequestWithId(requestId: string, isDownloadForResponse: boolean): Thaction {
    return async (dispatch, getState) => {
        const state = getState();
        const request = state.request.get(requestId);
        if (!request) {
            throw new RangeError(`Request "${requestId}" could not be found.`);
        }
        let environmentalAuthorization: INetConsoleAuthorization | null =
            state.environment.authorization.get(requestId)?.values || null;


        dispatch(executeRequest(requestId, request.current, isDownloadForResponse, environmentalAuthorization));
    };
}

function computeFilenameFromRequestAndResponse(request: INetConsoleRequestInternal, response: INetConsoleResponse) {
    let result = request.url.substring(request.url.lastIndexOf('/') + 1);
    const contentDispositionHeader = response.response.headers.find(h => h.key === 'content-disposition');
    if (contentDispositionHeader) {
        const attachment = 'attachment; filename=';
        if (contentDispositionHeader.value.indexOf(attachment) === 0) {
            result = contentDispositionHeader.value.substring(attachment.length);
            result = result.replace('"', '');
            return result;
        }
    }
    const responseContentType = response.response.headers.find(h => h.key === 'content-type');
    if (responseContentType) {
        if (responseContentType.value.indexOf('text/plain') > -1) {
            result += '.txt';
        }
        else if (responseContentType.value.indexOf('text/json') > -1 || responseContentType.value.indexOf('application/json') > -1) {
            result += '.json';
        }
        else if (responseContentType.value.indexOf('text/xml') > -1 || responseContentType.value.indexOf('application/xml') > -1) {
            result += '.png';
        }
        else if (responseContentType.value.indexOf('text/javascript') > -1 || responseContentType.value.indexOf('application/javascript') > -1) {
            result += '.js';
        }
        else if (responseContentType.value.indexOf('application/typescript') > -1) {
            result += '.ts';
        }
        else if (responseContentType.value.indexOf('image/png') > -1) {
            result += '.png';
        }
        else if (responseContentType.value.indexOf('image/jpg') > -1) {
            result += '.jpg';
        }
        else if (responseContentType.value.indexOf('image/gif') > -1) {
            result += '.gif';
        }
        else if (responseContentType.value.indexOf('text/svg') > -1 || responseContentType.value.indexOf('application/svg') > -1) {
            result += '.svg';
        }
    }

    return result;
}
