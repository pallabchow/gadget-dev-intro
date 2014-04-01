# Gadget API

  1. [Player Events](#player-events)
  1. [Gadget Events](#gadget-events)
  1. [Two-way Events](#two-way-events)

Optional APIs

  1. [Challenges](challenges/README.md)

## Player Events

Events triggered by the Player

<table>
<tr><th>Event</th> <th>Description</th></tr>
<tr>
  <td><pre>{
  event: 'attributesChanged'
  data: {
    foo: 'bar'
    baz: 2
  }
}</pre></td>
  <td>Delivering the initial or updated set of attributes (PATCH)</td>
</tr>

<tr>
  <td><pre>{
  event: 'learnerStateChanged'
  data: {
    foo: 'bar'
    baz: 2
  }
}</pre></td>
  <td>Delivering the initial or updated learner state (PATCH)</td>
</tr>

<tr>
  <td><pre>{
  event: 'attached'
}</pre></td>
  <td>Ready to render - sent after all 'bootstrapping' attribute events</td>
</tr>

<tr>
  <td><pre>{
  event: 'setEditable'
  data: {
    editable: true
  }
}</pre></td>
  <td>Indicate changed editability of the gadget</td>
</tr>

<tr>
  <td><pre>{
  event: 'detached'
}</pre></td>
  <td>Gadget has been removed from the DOM</td>
</tr>

</table>

## Gadget Events

Events triggered by Gadgets

<table>
<tr><th>Event</th> <th>Description</th></tr>

<tr>
  <td><pre>{
  event: 'setAttributes'
  data: {
    foo: 'bar'
    baz: 2
  }
}</pre></td>
  <td>Persisting an updated set of attributes (PATCH). Player replies with the confirmation message `attributesChanged`</td>
</tr>

<tr>
  <td><pre>{
  event: 'setLearnerState'
  data: {
    foo: 'bar'
    baz: 2
  }
}</pre></td>
  <td>Persisting an updated set of learner attributes (PATCH). Player replies with the confirmation message `learnerStateChanged`</td>
</tr>

<tr>
  <td><pre>{
  event: 'setHeight'
  data: {
    pixels: 1337
  }
}</pre></td>
  <td>Adjust the height of the gadget</td>
</tr>

<tr>
  <td><pre>{
  event: 'setPropertySheetAttributes'
  data: {
    selectAmount: {
      type: 'Range',
      min: 100,
      max: 500,
      step: 20
    },
    chooseDay: {
      type: 'Select',
      options: ['Monday', 'Wednesday', 'Friday', 'Any day']
    }
  }
}</pre></td>
  <td>Define an updated property sheet schema</td>
</tr>

<tr>
  <td><pre>{
  event: 'setEmpty'
  data: {
    empty: true
  }
}</pre></td>
  <td>Set the emptiness (placeholder) status of the gadget</td>
</tr>

<tr>
  <td><pre>{
  event: 'track'
  data: {
    @type: 'video-load-time'
    duration: 1234
  }
}</pre></td>
  <td>
    Send analytics and tracking information.<br>
    @type (required) is the name of the tracking event.
  </td>
</tr>

<tr>
  <td><pre>{
  event: 'error'
  data: {
    message: 'Everything broke!'
    stacktrace: 'Line 123: ...'
  }
}</pre></td>
  <td>Throw a rendering-time error</td>
</tr>

<tr>
  <td><pre>{
  event: 'changeBlocking'
}</pre></td>
  <td>Indicate a potential change in lesson blocked-ness (e.g. after an assessment is submitted)</td>
</tr>

<tr>
  <td><pre>{
  event: 'requestAsset'
  data: {
    type: 'image'
    attribute: 'myImage'
  }
}</pre></td>
  <td>Request a new asset from a user. When delivered, it will be saved in the field given by the `attribute` property, and a corresponding `attributesChanged` event will be fired.</td>
</tr>
</table>

## Two-way Events

Events triggered by Gadgets, that require a response from the Player

<table>
<tr><th>Type</th> <th>Event</th> <th>Description</th></tr>

<tr>
  <td>Request</td>
  <td><pre>{
  event: 'getPath'
  data: {
    messageId: 123
    assetId: 1234
  }
}</pre></td>
  <td>Give an asset ID</td>
</tr>

<tr>
  <td>Response</td>
  <td><pre>{
  event: 'setPath'
  data: {
    messageId: 123
    url: 'http://stack.versal.com/123123-4567-567'
  }
}</pre></td>
  <td>Receive a fully qualified asset URL in return</td>
</tr>

</table>
