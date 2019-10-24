# fiskaly KassenSichV client for JavaScript / WebAssembly

The fiskaly KassenSichV client is an HTTP client that is needed<sup>[1](#fn1)</sup> for accessing the [kassensichv.io](https://kassensichv.io) API that implements a cloud-based, virtual **CTSS** (~Certified~ Technical Security System) / **TSE** (Technische Sicherheitseinrichtung) as defined by the German **KassenSichV** ([Kassen­sich­er­ungsver­ord­nung](https://www.bundesfinanzministerium.de/Content/DE/Downloads/Gesetze/2017-10-06-KassenSichV.pdf)).

[<a name="fn1">1</a>] compliance regarding [BSI CC-PP-0105-2019](https://www.bsi.bund.de/SharedDocs/Downloads/DE/BSI/Zertifizierung/Reporte/ReportePP/pp0105b_pdf.pdf?__blob=publicationFile&v=7) which mandates a locally executed SMA component for creating signed log messages. 

## What is this about?

This is a small (proof-of-concept) example, that demonstrates the how the client-side executed, pre-compiled, shared SMA library provided by fiskaly GmbH can be integrated into an JavaScript based Web app.

This **is not** a feature-complete client library (yet)! Instead it should be considered a technical proof-of-concept implementation.

## How to get this example running?

1. go to https://dashboard.fiskaly.com, create an account and generate some test data and an API key + secret
2. run `$ git submodule update --init` to obtain the pre-compiled SMA library
3. run `$ npm install` for installing all build utilities
4. open `src/example.html` and insert appropriate values for `apiKey` and `apiSecret` (obtained in step 1.)
5. run `$ npm start` for building the library and running a local HTTP server for testing
6. open http://localhost:8080/example.html in your Web browser

## Related

- [fiskaly.com](https://fiskaly.com)
- [dashboard.fiskaly.com](https://dashboard.fiskaly.com)
- [kassensichv.io](https://kassensichv.io)
- [kassensichv.net](https://kassensichv.net)
