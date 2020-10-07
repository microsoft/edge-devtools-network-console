// Copyright (c) Microsoft Corporation
// Licensed under the MIT License

import * as React from 'react';
import { ChoiceGroup, IChoiceGroupOption, IChoiceGroupProps } from '@fluentui/react';
import { getText, LocalizationContext } from 'utility/loc-context';

export interface IDescribedChoiceGroupOption extends IChoiceGroupOption {
    description: string;
    suffix: string;
    i18nKey: string;
}

export interface IDescribedChoiceGroupProps extends IChoiceGroupProps {
    options: IDescribedChoiceGroupOption[];
}

export default function DescribedChoiceGroup(props: IDescribedChoiceGroupProps) {
    const locale = React.useContext(LocalizationContext);
    const mappedProps: IChoiceGroupProps = React.useMemo(() => {
        return {
            ...props,
            options: (props.options).map(opt => {
                return {
                    ...opt,
                    ariaLabel: opt.ariaLabel || opt.description,
                    onRenderField: (props?: IChoiceGroupOption, render?: (props?: IChoiceGroupOption) => JSX.Element | null) => {
                        const definiteProps = props as IDescribedChoiceGroupOption;
                        const mainChoiceProps: IChoiceGroupOption = {
                            ...definiteProps,
                            text: getText(definiteProps.i18nKey + '.label', { locale }) + ` (${definiteProps.suffix})`,
                        };
                        const descriptionText = getText(definiteProps.i18nKey + '.description', { locale });
                        return (
                            <div>
                                {render!(mainChoiceProps)}
                                <div style={{margin: '0 0 0 26px'}}>{descriptionText}</div>
                            </div>
                        );
                    },
                };
            }),
        };
    }, [props, locale]);

    return (
        <div style={{margin: '0 20px 15px'}}>
            <ChoiceGroup
                {...mappedProps}
                className="described-choices"
                />
        </div>
    );
}
