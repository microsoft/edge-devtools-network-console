// Copyright (c) Microsoft Corporation
// Licensed under the MIT License

export { HttpVerb } from './net/verb';
export {
    CacheMode,
    CorsMode,
    CredentialsMode,
    HttpAuthorizationScheme,
    IBasicAuthorization,
    IFetchParams,
    IHttpAuthorization,
    IHttpHeader,
    IHttpRequest,
    IHttpResponse,
    ISerializableHttpBody,
    RedirectMode,
}
from './net/http-base';

export {
    IFormDataParameter,
    INetConsoleAuthorization,
    INetConsoleParameter,
    INetConsoleRequest,
    INetConsoleResponse,
    NetworkConsoleAuthorizationScheme,
    ResponseStatus,
    isFormDataParameter,
    ms,
}
from './net/net-console-http';

export {
    Base64String,
    binFromB64,
    binToB64,
    strFromB64,
    toB64,
}
from './util/base64';

export {
    FrontendMessage,
    IConsoleReadyMessage,
    IExecuteRequestMessage,
    ILogMessage,
    IOpenWebLinkMessage,
    ISaveCollectionAuthorizationMessage,
    ISaveEnvironmentVariablesMessage,
    ISaveRequestMessage,
    IUpdateDirtyFlagMessage,
}
from './hosting/frontend-messages';

export {
    HostMessage,
    isResponseMessage,
    IClearEnvironmentMessage,
    ICloseViewMessage,
    ICssStylesUpdatedMessage,
    IEditCollectionAuthorizationMessage,
    IEditEnvironmentMessage,
    IHostCollection,
    IInitHostMessage,
    ILoadRequestMessage,
    IRequestCompleteMessage,
    ISetPreferencesMessage,
    IShowViewMessage,
    IUpdateCollectionsTreeMessage,
    IUpdateEnvironmentMessage,
}
from './hosting/host-messages';

export {
    ICollectionAdapter,
    ICollectionContainerAdapter,
    ICollectionEntryAdapter,
    ICollectionFormat,
    ICollectionItemAdapter,
    IEnvironmentAdapter,
    IEnvironmentContainerAdapter,
    IEnvironmentFormat,
} from './file_io/interfaces';
export { NetworkConsoleNativeFileFormat } from './file_io/native';

export { 
    serializeRequest,
    serializeAuthorization,
} from './file_io/serialize';
import CollectionFormats, { environmentFormats } from './file_io';

// When the TypeScript compiler emits the properties of FileFormats.Collections, if these
// interfaces are not imported, it emits a `typeof import("...")` type declaration for
// those properties. These types need to be imported here so that the TypeScript compiler
// can name them when the output .d.ts file is generated.
import { ICollectionFormat, IEnvironmentFormat } from './file_io/interfaces';
import { convertFormats, convertEnvironment } from './file_io/convert';
export namespace FileFormats {
    export const Collections = CollectionFormats;
    export const Environments = environmentFormats;

    export const convertCollectionFormat = convertFormats;
    export const convertEnvironmentFormat = convertEnvironment;
}

export { Lazy, default as lazy } from './util/lazy';
