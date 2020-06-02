// Copyright (c) Microsoft Corporation
// Licensed under the MIT License

import * as React from 'react';
import { ChoiceGroup, IChoiceGroupOption, IChoiceGroupProps } from 'office-ui-fabric-react';

export interface IDescribedChoiceGroupOption extends IChoiceGroupOption {
    description: string;
}

export interface IDescribedChoiceGroupProps extends IChoiceGroupProps {
    options: IDescribedChoiceGroupOption[];
}

export default function DescribedChoiceGroup(props: IDescribedChoiceGroupProps) {
    const mappedProps: IChoiceGroupProps = React.useMemo(() => {
        return {
            ...props,
            options: (props.options).map(opt => {
                return {
                    ...opt,
                    ariaLabel: opt.ariaLabel || opt.description,
                    onRenderField: (props?: IChoiceGroupOption, render?: (props?: IChoiceGroupOption) => JSX.Element | null) => {
                        return (
                            <div>
                                {render!(props)}
                                <div style={{margin: '0 0 0 26px'}}>{(props as IDescribedChoiceGroupOption).description}</div>
                            </div>
                        );
                    },
                };
            }),
        };
    }, [props]);

    return (
        <div style={{margin: '0 20px 15px'}}>
            <ChoiceGroup
                {...mappedProps}
                className="described-choices"
                />
        </div>
    )
}