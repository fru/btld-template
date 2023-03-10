# Form Generator JSON
This is a loose specification of the form generator json.

## Design Goals
1. Make the json as readable as possible
2. There should be only very rudimentary syntax in string values. E.g. no support for expressions.
3. Keys should not need to be escaped. Use: $_
4. Support two way binding

## Simple 

{
  component: 'bottled-form-group',
  slot: [
    {component: 'bottled-input-text'},
    {component: 'bottled-input-text'}
  ],
  slot_right: [
    {component: 'bottled-tooltip', slot: 'Tooltip Content ....'}
  ]
}

## Templates and interface definitions

{
  $templateKey: '$text',
  component: 'bottled-text-field',
  id: { $type: 'id' },
  minLength: { $type: 'number', $default: 10 },
  name: { $default: './id' },
  value: { $type: 'text', $default: './templateValue'}
}

Accessing template parameters:

{
  $templateKey: '$maxLength',
  maxLength: { $type: 'number', $default: './templateKey_1', $default_fallback: 100 }
}

this can be used as { $text: 'Default Value' , $maxLength_50: '' }

### TODO
Is ./templateKey_1 necessary as one could simply use ./templateValue or even ./templateValue/length
### TODO
Find a way to register $templateKey as a simple JS prop handler. That generates more JS Prop handlers which in turn generate a context (templateKey, templateValue)
### TODO
Find a way to register generic prop transforms. Like: `_fallback` or `_filter`.

## Referencing other elements and Events

There are two ways to reference other elements. Via id with `#` or relativly with the `.` symbol.

Example using on with id during event handling:

```json
{
  $text: 'First name',
  id: 'firstname',
  onKeypressEnter: {
      do: 'setValue',
      on: '#firstname',
      value: '12345' 
  }
}
```

The same effect can be achieved as a relative reference with: `on: '.'`

Even properties can be accessed this way:

```json
{
  $text: 'First name',
  id: 'firstname',
  slot: [{ 
    $button: 'Reset',
    onClick: {
      do: '=',
      on: '../value',
      value: '' 
    }
  }]
}
```

