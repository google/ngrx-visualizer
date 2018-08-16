# NgRx Visualizer

Visualize your ngrx code as a state machine.

## Disclaimer

This is not an officially supported Google product.

## Purpose

NgRx is composed of actions, events, and reducers. This tool scans the Typescript AST of your codebase and extracts these connections into a graph.

## Analyzer Usage

Install the dependencies.

```
> cd analyzer
> npm install
```

Using the analyzer CLI, run an analysis on existing an existing ngrx project.

```
> cd analyzer
> npm start -- -h
> Usage: analyzer.ts [options] <folder>

  Options:

    -V, --version          output the version number
    -c, --classic          use classic module resolution instead of node
    -e, --empty-ref        output references without any usages
    -s, --save <file>      save results to a file
    -r, --remove <regex>   erase part of file path with regex
    -a, --actions <regex>  filter action files with regex
    -x, --exclude <regex>  exclude files from analysis with regex
    -h, --help             output usage information

> npm start -- <somepath>/example-app/ -s example.json --remove <somepath> --exclude "\.d\.ts"
```

### Viewer Usage

Use the precompiled viewer at viewer/bin or compile it yourself by running "npm install; npm run-script build" inside viewer.

If you are developing, you can run a local server and watch for changes using "npm start".

You can either open an analysis file using the file button on the right side of the viewer, or host the viewer and use url query params.

## Available Params

load=file.json - Download a graph from the server.

cache=float - Number of days to cache this graph (when expired, graph is redownloaded).

show=path1|path2|... - Show a specific path or paths when the graph is opened.

scale=float - Set the scale of the graph manually.

translate=x,y - Set the translation of the graph manually.

reducerLength=int - Set the number of folders to show for the name of a reducer.

A sample url for a server running with an example.json in the same folder as the viewer:
http://server/viewer/bin/index.html?load=example.json&show=example-app/app/books|example-app/app/core&reducerLength=2

## Display Modes

The viewer offers three display modes: split reducers, reducers, and no reducers. Split reducers is the default.

In split reducers mode, reducers are removed from the graph. Actions (red) which used to be connected to these reducers (blue), are now converted to blue action nodes. This means that red actions are not in a reducer, and blue actions are. This is the default mode because graphs for larger applications tend to get crowded around reducers.

In reducers mode, no nodes are changed. The reducers are blue, actions red, methods brown, and effects yellow.

In no reducers mode, reducers are removed. The actions are not colored blue like split reducers mode.

## Contributing

Contributors are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md).

## License

See [LICENSE](LICENSE) file.
