// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { useDispatch } from 'react-redux';
import { CorsMode, CredentialsMode, CacheMode, RedirectMode } from 'network-console-shared';

import CommonStyles from 'ui/common-styles';
import {
    fetchSetCacheModeAction,
    fetchSetCorsModeAction,
    fetchSetCredentialsModeAction,
    fetchSetRedirectModeAction,
} from 'actions/request/fetch';
import CorsRadioButtonList, { ICorsRadioOption } from './CorsRadioButtonList';

export interface ICorsConfigurationProps {
    requestId: string;

    selectedCorsMode: CorsMode;
    selectedCredentialsMode: CredentialsMode;
    selectedCacheMode: CacheMode;
    selectedRedirectMode: RedirectMode;
}

export default function CorsConfiguration(props: ICorsConfigurationProps) {
    const dispatch = useDispatch();

    const corsModeOptions: ICorsRadioOption[] = [
        {
            optionValue: 'cors',
            i18nKey: 'Cors.Mode.cors',
        },
        {
            optionValue: 'no-cors',
            i18nKey: 'Cors.Mode.no-cors',
        },
        {
            optionValue: 'same-origin',
            i18nKey: 'Cors.Mode.same-origin',
        },
    ];

    const credentialsModeOptions: ICorsRadioOption[] = [
        {
            optionValue: 'same-origin',
            i18nKey: 'Cors.Credentials.same-origin',
        },
        {
            optionValue: 'include',
            i18nKey: 'Cors.Credentials.include',
        },
        {
            optionValue: 'omit',
            i18nKey: 'Cors.Credentials.omit',
        },
    ];

    const cacheModeOptions: ICorsRadioOption[] = [
        {
            optionValue: 'no-store',
            i18nKey: 'Cors.Cache.no-store',
        },
        {
            optionValue: 'default',
            i18nKey: 'Cors.Cache.default',
        },
        {
            optionValue: 'reload',
            i18nKey: 'Cors.Cache.reload',
        },
        {
            optionValue: 'no-cache',
            i18nKey: 'Cors.Cache.no-cache',
        },
        {
            optionValue: 'force-cache',
            i18nKey: 'Cors.Cache.force-cache',
        },
        {
            optionValue: 'only-if-cached',
            i18nKey: 'Cors.Cache.only-if-cached'
        },
    ];

    const redirectModeOptions: ICorsRadioOption[] = [
        {
            optionValue: 'follow',
            i18nKey: 'Cors.Redirect.follow',
        },
        {
            optionValue: 'error',
            i18nKey: 'Cors.Redirect.error',
        },
    ];

    return (
        <div {...CommonStyles.SCROLLABLE_STYLE}>
            <CorsRadioButtonList
                i18nTitleKey="Cors.groupTitle.corsMode"
                selectedKey={props.selectedCorsMode}
                onChange={(_ev, option) => {
                    dispatch(fetchSetCorsModeAction(props.requestId, option.optionValue as CorsMode));
                }}
                options={corsModeOptions}
                />
            <CorsRadioButtonList
                i18nTitleKey="Cors.groupTitle.credentialsMode"
                selectedKey={props.selectedCredentialsMode}
                onChange={(_ev, option) => {
                    dispatch(fetchSetCredentialsModeAction(props.requestId, option.optionValue as CredentialsMode));
                }}
                options={credentialsModeOptions}
                />
            <CorsRadioButtonList
                i18nTitleKey="Cors.groupTitle.cacheMode"
                selectedKey={props.selectedCacheMode}
                onChange={(_ev, option) => {
                    dispatch(fetchSetCacheModeAction(props.requestId, option.optionValue as CacheMode));
                }}
                options={cacheModeOptions}
                />
            <CorsRadioButtonList
                i18nTitleKey="Cors.groupTitle.redirectMode"
                selectedKey={props.selectedRedirectMode}
                onChange={(_ev, option) => {
                    dispatch(fetchSetRedirectModeAction(props.requestId, option.optionValue as RedirectMode));
                }}
                options={redirectModeOptions}
                />
        </div>
    );
}
