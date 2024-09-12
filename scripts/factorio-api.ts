import https from 'node:https';

import fs from 'fs';
import handlebars from 'handlebars';

import * as M from './factorio-api.models';

interface Data {
  app: string;
  appVersion: string;
  apiVersion: number;
  stage: string;
  interfaces: Interface[];
  types: DataType[];
}

interface Interface {
  name: string;
  description: string;
  export: boolean;
  extends?: string;
  typeName?: string;
  props: Property[];
  isTypeFunction?: string;
}

interface Property {
  name: string;
  description: string;
  optional: boolean;
  type: string;
}

interface DataType {
  name: string;
  description: string;
  value: string;
}

const API_PATH = 'https://lua-api.factorio.com/latest/prototype-api.json';

function getPrototypeApi(): Promise<M.PrototypeApi> {
  return new Promise((resolve, reject) => {
    https
      .get(API_PATH, (res) => {
        let data = '';

        res.on('data', (chunk: string) => {
          data += chunk;
        });

        res.on('end', () => {
          const api = JSON.parse(data) as M.PrototypeApi;
          resolve(api);
        });
      })
      .on('error', (err) => {
        reject(err);
      });
  });
}

function parseType(type: M.DataType, structName?: string): string {
  if (typeof type === 'string') {
    // Handle known built-in types
    switch (type) {
      case 'bool':
        return 'boolean';
      case 'double':
      case 'float':
      case 'int8':
      case 'int16':
      case 'int32':
      case 'uint8':
      case 'uint16':
      case 'uint32':
      case 'uint64':
        return 'number';
      case 'string':
        return 'string';
      case 'DataExtendMethod':
        return '() => void';
      default:
        return type;
    }
  }

  switch (type.complex_type) {
    case 'array':
      return `${parseType(type.value, structName)}[]`;
    case 'dictionary':
      return `Record<${parseType(type.key, structName)}, ${parseType(
        type.value,
        structName,
      )}>`;
    case 'literal': {
      if (typeof type.value === 'string') {
        return `'${type.value}'`;
      } else {
        return type.value.toString();
      }
    }
    case 'struct':
      if (structName == null)
        throw new Error(
          'Unexpected struct: use properties on parent or pass a struct name to use',
        );

      return structName;
    case 'tuple':
      return `[${type.values.map((v) => parseType(v, structName)).join(', ')}]`;
    case 'type':
      return parseType(type.value, structName);
    case 'union':
      return `(${type.options
        .map((o) => parseType(o, structName))
        .join(' | ')})`;
  }
}

function parseProperty(prop: M.Property): Property {
  return {
    name: prop.name,
    description: prop.description,
    optional: prop.optional,
    type: parseType(prop.type),
  };
}

function getTypePropertyValue(props: M.Property[]): string | undefined {
  const typeProp = props.find((p) => p.name === 'type');
  if (
    typeProp &&
    typeof typeProp.type !== 'string' &&
    typeProp.type.complex_type === 'literal' &&
    typeof typeProp.type.value === 'string'
  ) {
    return typeProp.type.value;
  }

  return undefined;
}

function parsePrototypeApi(api: M.PrototypeApi): Data {
  const data: Data = {
    app: api.application,
    appVersion: api.application_version,
    apiVersion: api.api_version,
    stage: api.stage,
    interfaces: [],
    types: [],
  };

  api.prototypes.forEach((p) => {
    const int: Interface = {
      name: p.name,
      description: p.description,
      export: p.parent == null,
      extends: p.parent,
      props: p.properties.map((p) => parseProperty(p)),
    };

    const typePropValue = getTypePropertyValue(p.properties);
    if (typePropValue != null) {
      int.isTypeFunction = typePropValue;
    } else if (p.typename) {
      int.typeName = p.typename;
      int.isTypeFunction = p.typename;
    }

    data.interfaces.push(int);
  });

  api.types.forEach((t) => {
    if (typeof t.type === 'string') {
      if (t.type !== 'builtin') {
        const dataType: DataType = {
          name: t.name,
          description: t.description,
          value: parseType(t.type),
        };

        data.types.push(dataType);
      }
    } else if (t.type.complex_type === 'struct') {
      const int: Interface = {
        name: t.name,
        description: t.description,
        export: t.parent == null,
        extends: t.parent,
        props: [],
      };

      if (t.properties) {
        int.props = t.properties.map((p) => parseProperty(p));

        int.isTypeFunction = getTypePropertyValue(t.properties);
      }

      data.interfaces.push(int);
    } else {
      let structName: string | undefined;

      if (t.properties) {
        structName = `_${t.name}`;
        const int: Interface = {
          name: structName,
          description: t.description,
          export: false,
          extends: t.parent,
          props: t.properties.map((p) => parseProperty(p)),
        };

        data.interfaces.push(int);
      }

      const dataType: DataType = {
        name: t.name,
        description: t.description,
        value: parseType(t.type, structName),
      };

      data.types.push(dataType);
    }
  });

  return data;
}

const generate = async function (): Promise<void> {
  console.log(`Regenerating Factorio prototype models from ${API_PATH}...`);

  const api = await getPrototypeApi();
  const data = parsePrototypeApi(api);
  const modelsSource = `/** Generated file, do not edit. See scripts/factorio-api.ts for generator. */

/**
 * Application: {{app}}
 * Version: {{appVersion}}
 * API Version: {{apiVersion}}
 */

{{#interfaces}}
{{#if description}}
/** {{{description}}} */
{{/if}}
{{#unless props.length}}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
{{/unless}}
{{#if export}}export {{/if}}interface {{#if extends}}_{{/if}}{{name}} {
  {{#if typeName}}
  type: '{{typeName}}';
  {{/if}}
  {{#props}}
  {{#if description}}
  /** {{{description}}} */
  {{/if}}
  {{name}}{{#if optional}}?{{/if}}: {{{type}}};
  {{/props}}
}
{{#if extends}}

export type {{name}} = _{{name}} & Omit<{{extends}}, keyof _{{name}}>;
{{/if}}
{{#if isTypeFunction}}

export function is{{name}}(value: unknown): value is {{name}} {
  return (value as { type: string }).type === '{{isTypeFunction}}';
}

{{/if}}
{{/interfaces}}
{{#types}}

{{#if description}}
/** {{{description}}} */
{{/if}}
export type {{name}} = {{{value}}};

{{/types}}`;

  const modelsTemplate = handlebars.compile(modelsSource);
  const result = modelsTemplate(data);

  fs.writeFileSync('scripts/factorio.models.ts', result);
  console.log(`Generated ${api.prototypes.length.toString()} models`);
};

void generate();
