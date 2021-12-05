# VSCode Typescript JSON Schema

Allows validating JSON with a Typespcript type inside the workspace with a custom scheme protocol handler.

## Usage

This extension will work when a JSON file defines a `$schema` property with `tsschema` protocol in the format `tsschema://<FILE_PATH>#<TYPE_NAME>.

For example:

```jsonc
{
  "$schema": "tsschema://./src/types/person.ts#Person",
  ...
}
```

A JSON file like above will validate the `Person` type from `./src/types/person.ts` file.

If the path starts with a dot, it will be resolved relative to the JSON file. Otherwise it will be relative to the current workspace folder.
