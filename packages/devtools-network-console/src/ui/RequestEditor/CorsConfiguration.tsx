// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { useDispatch } from 'react-redux';
import { CorsMode, CredentialsMode, CacheMode, RedirectMode } from 'network-console-shared';

import DescribedChoiceGroup, { IDescribedChoiceGroupOption } from 'ui/generic/OptionGroupWithDescriptions';
import CommonStyles from 'ui/common-styles';
import {
    fetchSetCacheModeAction,
    fetchSetCorsModeAction,
    fetchSetCredentialsModeAction,
    fetchSetRedirectModeAction,
} from 'actions/request/fetch';
import { getText, LocalizationContext } from 'utility/loc-context';

export interface ICorsConfigurationProps {
    requestId: string;

    selectedCorsMode: CorsMode;
    selectedCredentialsMode: CredentialsMode;
    selectedCacheMode: CacheMode;
    selectedRedirectMode: RedirectMode;
}

export default function CorsConfiguration(props: ICorsConfigurationProps) {
    const dispatch = useDispatch();
    const locale = React.useContext(LocalizationContext);

    const corsModeOptions: IDescribedChoiceGroupOption[] = [
        {
            key: 'cors',
            suffix: 'cors',
            text: 'Cross-origin enabled with CORS protocol (cors)',
            description: 'Allows cross-origin requests, for example to access various APIs offered by 3rd party vendors. These are expected to adhere to the CORS protocol. Only a limited set of headers are exposed in the Response, but the body is readable.',
            i18nKey: 'Cors.Mode.cors',
        },
        {
            key: 'no-cors',
            suffix: 'no-cors',
            text: 'CORS protocol disabled (no-cors)',
            description: 'Prevents the method from being anything other than HEAD, GET or POST, and the headers from being anything other than simple headers. In addition, JavaScript may not access any properties of the resulting Response. This ensures that ServiceWorkers do not affect the semantics of the Web and prevents security and privacy issues arising from leaking data across domains.',
            i18nKey: 'Cors.Mode.no-cors',
        },
        {
            key: 'same-origin',
            suffix: 'same-origin',
            text: 'Cross-origin requests disallowed (same-origin)',
            description: 'If a request is made to another origin with this mode set, the result is simply an error. You could use this to ensure that a request is always being made to your origin.',
            i18nKey: 'Cors.Mode.same-origin',
        },
    ];

    const credentialsModeOptions: IDescribedChoiceGroupOption[] = [
        {
            key: 'same-origin',
            suffix: 'same-origin',
            text: 'Include for requests to the same origin (same-origin)',
            description: 'Send user credentials (cookies, basic http auth, etc..) if the URL is on the same origin as the page being inspected.',
            i18nKey: 'Cors.Credentials.same-origin',
        },
        {
            key: 'include',
            suffix: 'include',
            text: 'Include for all requests (include)',
            description: 'Always send user credentials (cookies, basic http auth, etc..), even for cross-origin calls. Requests will be blocked if the cross-origin header negotiation for CORS omits the Access-Control-Allow-Credentials header.',
            i18nKey: 'Cors.Credentials.include',
        },
        {
            key: 'omit',
            suffix: 'omit',
            text: 'Do not include for any requests (omit)',
            description: 'Never send or receive cookies or basic HTTP authorization except what is specifically configured by the Authorization tab or for the collection to which this request belongs.',
            i18nKey: 'Cors.Credentials.omit',
        },
    ];

    const cacheModeOptions: IDescribedChoiceGroupOption[] = [
        {
            key: 'no-store',
            suffix: 'no-store',
            text: 'Unconditionally make the request and do not cache the result (no-store)',
            description: 'The browser fetches the resource from the remote server without first looking in the cache, and will not update the cache with the downloaded resource.',
            i18nKey: 'Cors.Cache.no-store',
        },
        {
            key: 'default',
            suffix: 'default',
            text: 'Standard HTTP request behavior (Fetch parameter value: default)',
            description: 'The browser looks for a matching request in its HTTP cache. Behavior depends on whether the match is fresh or stale, and an updated result will cause the browser cache to be updated.',
            i18nKey: 'Cors.Cache.default',
        },
        {
            key: 'reload',
            suffix: 'reload',
            text: 'Unconditionally request and update the cache (reload)',
            description: 'The browser fetches the resource from the remote server without first looking in the cache, but then will update the cache with the downloaded resource.',
            i18nKey: 'Cors.Cache.reload',
        },
        {
            key: 'no-cache',
            suffix: 'no-cache',
            text: 'Always make at least a conditional request (no-cache)',
            description: 'The browser looks for a matching request in its HTTP cache. If there is a match, the browser will issue a conditional request, and return the cached content if the server indicates that the content is unchanged; otherwise the resource will be retrieved.',
            i18nKey: 'Cors.Cache.no-cache',
        },
        {
            key: 'force-cache',
            suffix: 'force-cache',
            text: 'Always return cached content if available (force-cache)',
            description: 'If the resource has been cached, the cached content is returned. Otherwise, the browser will make a normal request, and update the cache.',
            i18nKey: 'Cors.Cache.force-cache',
        },
        {
            key: 'only-if-cached',
            suffix: 'only-if-cached',
            text: 'Only return content if the content exists in the cache (only-if-cached)',
            description: 'If the resource has been cached, the cached content is returned. Otherwise, the browser will respond with a 504 Gateway Timeout status.',
            i18nKey: 'Cors.Cache.only-if-cached'
        },
    ];

    const redirectModeOptions: IDescribedChoiceGroupOption[] = [
        {
            key: 'follow',
            suffix: 'follow',
            text: 'Transparently follow 301/302 redirect responses (follow)',
            description: 'Follow all redirects incurred when fetching a resource.',
            i18nKey: 'Cors.Redirect.follow',
        },
        {
            key: 'error',
            suffix: 'error',
            text: 'Return a network error when a request is met with a redirect (error)',
            description: 'If a response results in a redirect response, the result will appear to be a network error.',
            i18nKey: 'Cors.Redirect.error',
        },
    ];

    const corsModeTitle = getText('Cors.groupTitle.corsMode', { locale });
    const credentialsModeTitle = getText('Cors.groupTitle.credentialsMode', { locale });
    const cacheModeTitle = getText('Cors.groupTitle.cacheMode', { locale });
    const redirectModeTitle = getText('Cors.groupTitle.redirectMode', { locale });
    return (
        <div {...CommonStyles.SCROLLABLE_STYLE}>
            <DescribedChoiceGroup
                title={corsModeTitle}
                label={corsModeTitle}
                selectedKey={props.selectedCorsMode}
                options={corsModeOptions}
                onChange={(_ev, option) => {
                    if (!option) {
                        return;
                    }
                    dispatch(fetchSetCorsModeAction(props.requestId, option.key as CorsMode));
                }}
                />
            <DescribedChoiceGroup
                title={credentialsModeTitle}
                label={credentialsModeTitle}
                selectedKey={props.selectedCredentialsMode}
                options={credentialsModeOptions}
                onChange={(_ev, option) => {
                    if (!option) {
                        return;
                    }
                    dispatch(fetchSetCredentialsModeAction(props.requestId, option.key as CredentialsMode));
                }}
                />
            <DescribedChoiceGroup
                title={cacheModeTitle}
                label={cacheModeTitle}
                selectedKey={props.selectedCacheMode}
                options={cacheModeOptions}
                onChange={(_ev, option) => {
                    if (!option) {
                        return;
                    }
                    dispatch(fetchSetCacheModeAction(props.requestId, option.key as CacheMode));
                }}
                />
            <DescribedChoiceGroup
                title={redirectModeTitle}
                label={redirectModeTitle}
                selectedKey={props.selectedRedirectMode}
                options={redirectModeOptions}
                onChange={(_ev, option) => {
                    if (!option) {
                        return;
                    }
                    dispatch(fetchSetRedirectModeAction(props.requestId, option.key as RedirectMode));
                }}
                />
        </div>
    );
}
