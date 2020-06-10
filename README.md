# Introduction
Network Console (working title) is an experimental component for Chromium-based DevTools for making synthetic
network requests over HTTP. It can be used during the dev-test loop for web APIs.

As part of this effort, we want to meet our customers where they are. We know that Network Console isn't
going to be feature-complete with our initial pass; we want to have the flexibility to iterate rapidly,
experiment in the open, and get great ideas for what will be going into Network Console in the future.

This project is new, and while the first iteration is going to be rolling into Microsoft Edge DevTools behind
an experiment flag, we're not sure what the right long-term vision for it is; for example, will it be better to
package it into a browser extension rather than a built-in tool? We're not sure yet; this is a relatively fresh
canvas for us to start from. Please keep that in mind if you consider contributing.

## Structure of Network Console

Network Console is constructed in a monorepo style. It presently has two packages:

* `devtools-network-console` is the primary front-end of the UI. It is presently built in React bootstrapped from
create-react-app, and wherever  it makes sense, we're using off-the-shelf components to try to go fast.
* `network-console-shared` contains file parsing logic which needs to be shared with the host, as well as
interfaces which define the host-frontend communication channel. This allows our messages to be type-checked
in the host and frontend.

The "Host" is responsible for a number of tasks:

* *File system*: Reading, saving, and managing API collections and environment settings
* *Executing requests*: By separating out the concern of constructing the request from actually
executing the request, it allows for "special considerations" to be applied. For example, when
hosted within Edge, requests made by Network Console are issued in the context of the page being
debugged.

Some parts of the UI as seen in Microsoft Edge are part of the actual DevTools code. These parts
include the tab frame and the tree lists presenting the API collections view.

Host communication occurs over a `postMessage` message channel. For details about what a host needs
to implement, please see the
[Host protocol documentation](./packages/devtools-network-console/src/host/host-protocol.md).

## Developing

After obtaining the source tree, run:

- `npm install`
- `npm run install-children`

Then, depending on which task you want to do:

### Developing for Chromium DevTools

1. Determine the path to devtools-frontend/src in your
[devtools-frontend](https://chromium.googlesource.com/devtools/devtools-frontend/) enlistment. For
example, from a root Chromium developer enlistment, this path will be something like
`f:\chromium\src\third_party\devtools-frontend\src` or `~/chromium/src/third_party/devtools-frontend/src`.
1. Optional: Set the environment variable `NETCONSOLE_DEVTOOLS_SRC_PATH` to the devtools-frontend
path of your Chromium enlistment. (If you omit this step, you'll need to include a command line
parameter later).
1. From the root of the Network Console enlistment, run `npm run build`. Optionally, you can pass in
parameters here using `-- --devtools_src_path` parameters (more info below).

The outputs from this will be:

* In `packages/network-console-shared/dist`, a `global.js` file which contains a number of components
injected into the global namespace `NCShared` in Chromium/Edge.
* In the same folder, two .d.ts files (`network-console-shared.d.ts` and `index.d.ts` which describe
the global namespace `NCShared`).
* In `packages/devtools-network-console/build`, the staged files output from the
default `create-react-app` build.
* In `dist`, these files are all scaffolded for ingestion into Chromium.

If the `NETCONSOLE_DEVTOOLS_SRC_PATH` environment variable was set, or `--devtools_src_path`
parameter specified, the build script will also update the scaffolded version of Network Console
in the target Chromium enlistment. This is referred to as "rolling Network Console," and should
be done in a clean destination directory (because Chromium's presubmit checks verify that
changes to `third_party` are isolated from other changes).

### Building and running locally

If you just want to run Network Console in a local browser instance, first ensure that you have built
the `network-console-shared` project by running `npm run build` from that folder. Then, you should
be able to run the Network Console frontend in a browser by changing to the `devtools-network-console`
folder and running `npm run start`. Bear in mind that updates to the `network-console-shared` project
will require a new build of that project to be triggered; however, running `tsc --watch` in that
folder should generally be adequate while in the build-test loop.

When running the Network Console frontend in a web browser, it uses the
[Web Application Host](./packages/devtools-network-console/src/host/web-application-host.ts)
implementation, which stubs much of the functionality and doesn't actually do much, although
you can generally interact with it via the DevTools console, and most of the UI should be
accessible.

Bear in mind that when you use Network Console from the Web Application Host, because it
simply executes [Fetch requests](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
from the hosting web page, those requests are subject to
[CORS](https://developer.mozilla.org/en-US/docs/Glossary/CORS) browser security restrictions.
Generally this means that outgoing requests will be subject to cross-origin preflight
requirements.

## NPM Commands

- `npm run clean`: Deletes the `/dist` folder from the root repository
- `npm run install-children`: runs `npm install` on child folders under `/packages`
- `npm run build-locally`: Runs production build of both shared component and frontend
- `npm run install-and-build`: Single step to `npm install` and build (suitable for CI)
- `npm run deploy -- --devtools_src_path <path>`: After running one of the build steps,
will deploy the build output to the Chromium enlistment. See notes above about how
to determine the path to pass into this command, or how to configure the
`NETCONSOLE_DEVTOOLS_SRC_PATH` environment variable.
- `npm run start`: Runs the frontend in development mode (equivalent to running the
same command in the `packages/devtools-network-console` path)

# Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## Notices

- **Data Collection**. The software may collect information about you and your use of the software and send it to Microsoft. Microsoft may use this information to provide services and improve our products and services. You may turn off the telemetry as described in the repository. There are also some features in the software that may enable you and Microsoft to collect data from users of your applications. If you use these features, you must comply with applicable law, including providing appropriate notices to users of your applications together with a copy of Microsoft's privacy statement. Our privacy statement is located at https://go.microsoft.com/fwlink/?LinkID=824704. You can learn more about data collection and use in the help documentation and our privacy statement. Your use of the software operates as your consent to these practices.
