// Copyright (c) Microsoft Corporation
// Licensed under the MIT License

import * as React from 'react';
import { Label, Radio, Typography, TypographySize, TypographyTag } from '@microsoft/fast-components-react-msft';
import LocText from 'ui/LocText';
import Stack from 'ui/generic/Stack';

export interface ICorsRadioOption {
    i18nKey: string;
    optionValue: string;
}

export interface ICorsRadioButtonListProps {
    options: ICorsRadioOption[];
    i18nTitleKey: string;
    selectedKey: string;

    onChange?: (event: React.ChangeEvent<HTMLInputElement>, selectedOption: ICorsRadioOption) => void;
}

function CorsRadioButtonList(props: ICorsRadioButtonListProps) {
    return (
        <Stack style={{ margin: '0 0 20px 15px' }}>
            <Typography size={TypographySize._7} tag={TypographyTag.h3}>
                <LocText textKey={props.i18nTitleKey} />
            </Typography>

            <Stack>
                {props.options.map((o, i) => {
                    const inputId = `${props.i18nTitleKey}_${o.i18nKey}`;
                    return (
                        <Stack horizontal key={o.i18nKey}>
                            <Radio
                                inputId={inputId}
                                name={props.i18nTitleKey}
                                checked={props.selectedKey === o.optionValue}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    props.onChange?.(e, o);
                                }}
                                style={{ alignItems: 'flex-start', paddingTop: '12px' }}
                                />
                            <Stack style={{ margin: '8px 0 0px 10px' }}>
                                <Label htmlFor={inputId}><LocText textKey={`${o.i18nKey}.label`} /> (<code>{o.optionValue}</code>)</Label>
                                <Typography size={TypographySize._8}>
                                    <LocText textKey={`${o.i18nKey}.description`} />
                                </Typography>
                            </Stack>
                        </Stack>
                    );
                })}
            </Stack>
        </Stack>
    );
}

export default React.memo(CorsRadioButtonList);
