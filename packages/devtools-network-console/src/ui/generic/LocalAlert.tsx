// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { Typography, TypographySize } from '@microsoft/fast-components-react-msft';
import { DesignSystemConsumer } from '@microsoft/fast-jss-manager-react';
import { DesignSystem } from '@microsoft/fast-components-styles-msft';

import LocText from 'ui/LocText';
import Stack from './Stack';

const InfoIcon = () => <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 15A7.47 7.47 0 01.27 5.5a7.61 7.61 0 011.92-3.3A7.38 7.38 0 015.5.27a7.47 7.47 0 015.79.75 7.2 7.2 0 012.69 2.7 7.42 7.42 0 01.75 5.78 7.46 7.46 0 01-5.24 5.23c-.63.18-1.3.27-1.99.27zm0-14a6.3 6.3 0 00-3.28.9 6.5 6.5 0 005 11.87A6.55 6.55 0 0014 7.5a6.28 6.28 0 00-.9-3.27 6.42 6.42 0 00-3.88-3A6.28 6.28 0 007.5 1zM7 6h1v5H7V6zm0-2h1v1H7V4z"/></svg>;
const WarningIcon = () => <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M15 15H0L7.5 0 15 15zM1.62 14h11.76L7.5 2.23 1.62 14zM8 6v5H7V6h1zm-1 6h1v1H7v-1z"/></svg>;

/**
 * @fileoverview
 * The purpose of this component is to give us a transitional point away from the 
 * Fluent UI as we pivot away. For now we don't have a replacement, so we'll add
 * a component that will wrap it.
 */

interface ILocalAlertProps {
    type: 'info' | 'severeWarning' | 'error';
    textKey?: string;
    children?: React.ReactNode;
}

function LocalAlert(props: ILocalAlertProps) {
    return (
        <DesignSystemConsumer>
        {system => {
            const designSystem = system as any as DesignSystem;

            let backgroundColor = designSystem.neutralPalette[8];
            if (props.type === 'severeWarning') {
                backgroundColor = 'rgb(254, 217, 204)';
            }
            else if (props.type === 'error') {
                backgroundColor = '#FEBABA';
            }
            
            return (
                <Stack horizontal style={{ userSelect: 'none', margin: '5px', backgroundColor }}>
                    <div style={{ margin: '10px' }}>
                        {props.type === 'info' ? <InfoIcon /> : <WarningIcon />}
                    </div>
                    <div style={{ padding: '5px', display: 'flex', flexDirection: 'column', justifyContent: 'center', color: 'black' }}>
                        {props.children ? props.children : (
                            <Typography size={TypographySize._8} style={{ color: 'black' }}>
                                <LocText textKey={props.textKey!} />
                            </Typography>
                        )}
                    </div>
                </Stack>
            );
        }}
        </DesignSystemConsumer>
    );
}

export default React.memo(LocalAlert);
