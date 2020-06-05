// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { INetConsoleParameter } from 'network-console-shared';

import { INetConsoleRequestInternal } from 'model/NetConsoleRequest';
import * as Styles from './styles';
import { mergeString } from 'utility/environment-merge';
import { substituteRouteParameters, concatenateQuery } from 'utility/http-compose';
import { Text } from 'office-ui-fabric-react';

export interface ICalculatedAddressProps {
    request: INetConsoleRequestInternal;
    environmentVariables: INetConsoleParameter[];
}

export default function CalculatedAddress(props: ICalculatedAddressProps) {
    let calculated = mergeString(props.request.url, props.environmentVariables).value;
    calculated = substituteRouteParameters(calculated, props.request.routeParameters, props.environmentVariables);
    if (props.request.queryParameters.size > 0) {
        calculated += '?' + concatenateQuery(props.request.queryParameters.valueSeq().toArray(), props.environmentVariables);
    }
    return (
        <div {...Styles.CALC_ADDRESS_DIV_STYLE}>

            <Text variant="smallPlus">
                <span {...Styles.NOSELECT}>Computed URL: </span>{calculated}
            </Text>
        </div>
    );
}
