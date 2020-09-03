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
} from './file_io/interfaces';
export { NetworkConsoleNativeFileFormat } from './file_io/native';

import { ICollectionFormat } from './file_io/interfaces';
export { serializeRequest } from './file_io/serialize';
import CollectionFormats, { environmentFormats } from './file_io';
export namespace FileFormats {
    export const Collections = CollectionFormats;
    export const Environments = environmentFormats;
}

export { Lazy, default as lazy } from './util/lazy';

import { Postman21NativeReader as P21NativeReader } from './collections/postman/v2.1/postman-2.1-file-format';
import { NCNativeReader as NCReader } from './collections/native/native-file-format';
import { default as SwaggerReader } from './collections/openapi/openapi-file-format';
import { tryReadCollection } from './collections/shared/reader';

import { tryReadEnvironment } from './environments';
import { serializeNativeEnvironment } from './environments/native/native-env-format';

export namespace Collections {
    export const Postman21NativeReader = P21NativeReader;
    export const NCNativeReader = NCReader;
    export const SwaggerFileFormatReader = SwaggerReader;
    export const tryReadCollectionAsync = tryReadCollection;
}

export namespace Environments {
    export const tryReadEnvironmentAsync = tryReadEnvironment;
    export const serializeNativeEnvironmentFormat = serializeNativeEnvironment;
}

export {
    CollectionItemType,
    ICollectionEntryReader,
    ICollectionFolderReader,
    ICollectionItemBase,
    ICollectionRootReader,
    ICollectionsReader,
} from './collections/shared/reader';

export {
    EnvironmentItemType,
    IEnvironment,
    IEnvironmentRoot,
} from './environments';
