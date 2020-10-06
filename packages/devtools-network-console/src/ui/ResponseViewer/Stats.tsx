// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { ms } from 'network-console-shared';
import { 
    Typography, 
    TypographySize, 
    LightweightButton,
} from '@microsoft/fast-components-react-msft';

import Size from 'ui/generic/Size';
import { useDispatch } from 'react-redux';
import { downloadResponse } from 'actions/combined';
import LocText from 'ui/LocText';
import * as Styles from './styles';

export interface IStatsProps {
    statusCode: number;
    statusText: string;
    duration: ms;
    size: number;
    requestId: string;
}

export default function Stats(props: IStatsProps) {
    const dispatch = useDispatch();
    return (
        <dl className="response-stats">
            <Definition
                termKey="ResponseStats.status"
                value={`${props.statusCode} ${props.statusText}`}
                />
            <Definition
                termKey="ResponseStats.time"
                value={`${props.duration}ms`}
                />
            <Definition
                termKey="ResponseStats.size"
                value={<Size size={props.size} />}
                />
            <dd>
                {(props.statusCode === 200 ? (
                    <LightweightButton
                        onClick={e => {
                            e.preventDefault();
                            dispatch(downloadResponse(props.requestId));
                        }}
                        >
                        <LocText textKey="ResponseStats.download" />
                    </LightweightButton>) 
                    : 
                    (<span><LocText textKey="ResponseStats.downloadUnavailable" /></span>)
                )}
            </dd>
        </dl>
    );
}

interface IDefinitionProps {
    termKey: string;
    value: React.ReactNode | string;
}

function Definition({ termKey, value }: IDefinitionProps) {
    return (
        <>
            <dt {...Styles.VERTICALLY_CENTERED}>
                <Typography size={TypographySize._7}>
                    <LocText textKey={termKey} />:
                </Typography>
            </dt>
            <dd {...Styles.VERTICALLY_CENTERED}>
                <Typography size={TypographySize._7}>{value}</Typography>
            </dd>
        </>
    );
}