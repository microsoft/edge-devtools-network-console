# Network Console - Shared component

This project is intended to contain a common component to be used by
Network Console hosts and clients. Because this is a shared component,
version changes might be breaking. This changelog will attempt to
document when breaking changes occur.

## v0.11.1-preview

This change introduces new frontend-to-host messages:

 - `PROMPT_FOR_NEW_COLLECTION`
 - `ARIA_ALERT`

## v0.11.0-preview

This change removes the deprecated Collections and Environments APIs:

 - `Collections.Postman21NativeReader`
 - `Collections.NCNativeReader`
 - `Collections.SwaggerFileFormatReader`
 - `Collections.tryReadCollectionAsync`
 - `Environments.tryReadEnvironmentAsync`
 - `Environments.serializeNativeEnvironmentFormat`
 - `CollectionItemType`, `ICollectionEntryReader`, `ICollectionFolderReader`,
   `ICollectionItemBase`, `ICollectionRootReader`, `ICollectionsReader`
 - `EnvironmentItemType`, `IEnvironment`, `IEnvironmentRoot`

Additionally, this revision introduces the i18n module, powered by the
same component that Google's Lighthouse uses:
https://github.com/GoogleChrome/lighthouse/tree/master/lighthouse-core/lib/i18n

Finally, this change introduces a refactor that produces a new, updated
ES Modules export shape because of changes to Chromium and Edge for how
the ESM engineering systems changes have occurred.

## v0.11.0-preview

This change introduces a new File I/O module. This module is intended
to support both reading and writing of supported file formats. This is
supported via the root export `FileFormats` property `CollectionFormats`,
as well as the interfaces `ICollection[type]Adapter`.

This design will soon be extended to environment file formats. No
additional work will be done to the old Collections and Environments
file parsers, and all APIs within the default exported namespaces
`Collections` and `Environments` will be deprecated, and then removed
in 0.10.0.

These APIs will be annotated with Console warnings indicating use of a
deprecated API.
