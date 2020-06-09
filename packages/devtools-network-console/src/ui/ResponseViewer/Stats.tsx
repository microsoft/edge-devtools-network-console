// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { ms } from 'network-console-shared';

import Size from 'ui/generic/Size';
import { useDispatch } from 'react-redux';
import { downloadResponse } from 'actions/combined';
import { Text, Link } from 'office-ui-fabric-react';

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
                term="Status:"
                value={`${props.statusCode} ${props.statusText}`}
                />
            <Definition
                term="Time:"
                value={`${props.duration}ms`}
                />
            <Definition
                term="Size:"
                value={<Size size={props.size} />}
                />
            <Definition
                term="Download:"
                value={(props.statusCode === 200 ? (
                    <Link href="#download"
                        onClick={e => {
                            e.preventDefault();
                            dispatch(downloadResponse(props.requestId));
                        }}
                    >Click here</Link>) : (
                        <span>Not available</span>
                    ))}
                />
        </dl>
    );
}

interface IDefinitionProps {
    term: string;
    value: React.ReactNode | string;
}

function Definition({ term, value }: IDefinitionProps) {
    return (
        <>
            <dt>
                <Text variant="smallPlus">{term}</Text>
            </dt>
            <dd>
                <Text variant="smallPlus">{value}</Text>
            </dd>
        </>
    );
}