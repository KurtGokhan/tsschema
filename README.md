# JSON Typescript Virtual Schema for VSCode

Allows validating JSON with a Typespcript type inside the workspace with a custom scheme protocol handler.

## Usage

This extension will work when a JSON file defines a `$schema` property with `tsschema` protocol in the format `tsschema://<FILE_PATH>#<TYPE_NAME>`

For example:

```jsonc
{
  "$schema": "tsschema://./src/types/person.ts#Person",
  ...
}
```

A JSON file like above will validate the `Person` type from `./src/types/person.ts` file.

If the path starts with a dot, it will be resolved relative to the JSON file. Otherwise it will be relative to the current workspace folder.

## Known Issues

This is the initial version. It is good enough for most purposes but there is room for improvement.

This extension uses [ts-json-schema-generator](https://github.com/vega/ts-json-schema-generator) internally. Check out what [its capabilities](https://github.com/vega/ts-json-schema-generator#current-state) are.

## Release Notes

See [Change log](./CHANGELOG.md)
