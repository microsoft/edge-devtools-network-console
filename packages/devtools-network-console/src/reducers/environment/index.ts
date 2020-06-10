// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Map as IMap } from 'immutable';

import { IEnvironmentState } from 'store';
import { EnvironmentAction } from 'actions/environment';
import { AppHost } from 'store/host';

const DEFAULT_ENVIRONMENT: IEnvironmentState = {
    authorization: IMap(),
    environment: {
        id: '',
        name: '',
        variables: [],
    },
};

export default function reduceEnvironment(state: IEnvironmentState = DEFAULT_ENVIRONMENT, action: EnvironmentAction): IEnvironmentState {
    switch (action.type) {
        case 'ENV_SET_AMBIENT_AUTHORIZATION':
            return {
                ...state,
                authorization: state.authorization.set(action.requestId, {
                    from: action.authorizationPath,
                    values: action.authorization,
                }),
            };

        case 'ENV_CLEAR_VARIABLES':
            return {
                ...state,
                environment: {
                    ...DEFAULT_ENVIRONMENT.environment,
                },
            };

        case 'ENV_SET_VARIABLES':
            AppHost.log({ msg: 'Handling ENV_SET_VARIABLES', action });
            return {
                ...state,
                environment: {
                    ...state.environment,
                    id: action.id,
                    name: action.name,
                    variables: action.variables,
                },
            };
    }

    return state;
}
