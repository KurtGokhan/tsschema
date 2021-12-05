# JSON Typescript Virtual Schema for VSCode

Allows validating JSON with a Typespcript type inside the workspace with a custom scheme protocol handler.

## Usage

This extension will work when a JSON file defines a `$schema` property with `tsschema` protocol in one of the following formats:


### `tsschema://<FILE_PATH>#<TYPE_NAME>`

```jsonc
{
  "$schema": "tsschema://./src/types/person.ts#Person",
  ...
}
```

A JSON file like above will validate the `Person` type from `./src/types/person.ts` file.

If the path starts with a dot, it will be resolved relative to the JSON file. Otherwise it will be relative to the current workspace folder.

### `tsschema:///#<TYPE_NAME>`

```jsonc
{
  "$schema": "tsschema:///#Person",
  ...
}
```

A JSON file like above will validate the `Person` type found in the project. A `tsconfig.json` file must exist for this method to work. The behavior is undefined when this type name is not unique.

### Specifying options

In addition to the above formats, options can be provided to the [ts-json-schema-generator](https://github.com/vega/ts-json-schema-generator) with query parameters.

```jsonc
{
  "$schema": "tsschema://src/types/person.ts?noExtraProps&defaultNumberType=integer#Person",
  ...
}
```

A JSON file like above will pass `{ defaultNumberType: 'integer', noExtraProps: true }` to [ts-json-schema-generator](https://github.com/vega/ts-json-schema-generator).

## Known Issues

This is the initial version. It is good enough for most purposes but there is room for improvement.

This extension uses [ts-json-schema-generator](https://github.com/vega/ts-json-schema-generator) internally. Check out what [its capabilities](https://github.com/vega/ts-json-schema-generator#current-state) are.

## Release Notes

See [Change log](./CHANGELOG.md)
