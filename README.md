Beginning Versal gadget development
===================================

###### H6 are items to be edited before releasing this document.

Overview and concepts
---------

A course in the Versal platform consists of lessons. Each lesson can show all kinds of content - from text, images, and videos, to rich interactive elements programmed in HTML5 and JavaScript. In a Versal lesson, all these elements of content are shown by pieces of HTML/JS code, called **gadgets**.

Some gadgets are very simple - just showing a paragraph of text or an image. Other gadgets may show rich interactive graphics or present a quiz to the learner (and score it right away). Because gadgets are custom programmed, there is no limit on what you can do as a gadget developer. You can use any JS libraries and frameworks, communicate with any third-party Web servers, and use the Versal platform services to access image assets and other data.

The Versal platform provides an authoring environment as well as a learning environment. So each gadget needs to have the **authoring mode** and the **learner mode**. The appearance and interactive functionality of gadgets may be quite different in these two modes. As a gadget developer, you will design and implement the learner's experience as well as the author's experience with your gadget.

### Example: the "word gallery" gadget

Imagine a gadget for learning French words. The gadget shows a gallery of images and the corresponding words. The learner can look at the words and the images one by one, passing to the next or to the previous word.

The author of the course will initially select the images and the words and put them into a certain sequence. Each learner can sign in to Versal.com from any computer and will always see the word selected in their most recent session.

The gadget code needs to provide a UI for the course author as well as for the learners. The Versal platform takes care of persistently storing the gadget configuration and the image assets. The platform also tracks each user's individual selections as the learners interact with the gadget.

Installing the gadget SDK
-------------------------

To begin developing gadgets, you need to install the development software.

Linux and Mac OS are supported as development environments. (Windows may require further installation steps.)

Make sure `git` and `npm` are installed on your development machine.

You will need to have an account on [versal.com](versal.com).

You also need read access to some of Versal's `github` repositories.

###### Remove Versal/player requirement when Versal/sdk finally incorporates the player branch

Check out the repositories `Versal/sdk`, `Versal/player`, and `Versal/iframe-first-gadget`. It would be best to check them out side by side in the same directory.

In the `player` directory, run the commands

```
npm install
grunt
```

This should run tests and start a local HTTP server if everything is successful. You can stop that server (`^C`).

In the `sdk` directory, run the commands

```
npm install
sudo npm link ../player
```

This installs the system-wide command `versal`. With this command, you can test your gadgets and publish them on the Versal platform.

The repository `Versal/iframe-first-gadget` contains a sample Versal gadget. To verify that your installation works, let's test this gadget in a Versal course.

In the `iframe-first-gadget` directory, run the command

```
versal preview
```

This will start a local HTTP server on port `3000`. Open the URL `localhost:3000` in a Web browser. You will see an empty lesson and a test gadget in the gadget tray below. Double-click on that gadget; you will see that the gadget has been added to the lesson. You have now tested the sample gadget!

###### Verify that these repos exist and contain sample code

Further sample gadgets are available in the repositories `Versal/gadget-markov-fu`, `Versal/iframe-timeline`, and `Versal/iframe-quiz`.

The basic layout and the messaging API
------------------------

The Versal platform provides a **player** environment that loads the gadget in the context of a lesson, passes configuration data to the gadget, and receives learner's data from the gadget.

###### assets/index.html will be phased out in favor of ./index.html

Presently, a gadgets is developed as a Web app - that is, as an individual HTML document. The player will first load the gadget's root file, `assets/index.html`. Any JS libraries or frameworks required by the gadget need to be loaded there by usual mechanisms supported by HTML5 (statically or asynchronously). The gadget's JS code should be started from this `index.html`, as in any ordinary Web app.

In addition, each gadget must have an icon, `assets/icon.png`, and a `manifest.json` that specifies the gadget's current version, the Versal user who developed it, and other data. (A minimal gadget can have just three files, `index.html`, `assets/icon.png`, and `manifest.json`.)

The player communicates with the gadget through `postMessage`.

The gadget should listen to messages from the player, for example:

```
window.addEventListener('message', function(messageData) { 
	var data = JSON.parse(messageData); 
	// process the message...
});
```

The gadget posts messages to the player with JSON data content `jsonData`, for example like this:

```
window.parent.postMessage(JSON.stringify(jsonData), '*');
```

###### This API documentation should be in a final state here.

The supported messages and their JSON formats are documented in the file [API.md](./API.md). Here we will describe how gadgets use these messages to communicate with the player.

The gadget lifecycle
====================

Gadget configuration
-------------

When the gadget code is first loaded, the gadget is not yet attached to a DOM node in the lesson document. At this point, the gadget should prepare to configure itself. The first messages arriving from the player will give the gadget its latest configuration data.

Keep in mind that the Versal platform will use _the same gadget code_ in the learner mode and in the authoring mode. For this reason, the gadget configuration data has two main parts: the gadget's **attributes** and the **learner state**.

The "attributes" are parameters of the gadget as configured by the course author. The "learner state" describes the particular learner's interaction with the gadget.

For the "word gallery" gadget, the attributes describe the array of words and images, as chosen by the course author. The learner state is the number of the last viewed item.

Note that the learner state depends on the particular signed-in Versal user and is not available in the authoring mode.

When the gadget is in the authoring mode, its attributes may be changed by the course author, but the learner's state is not available and cannot be changed. When the gadget is in the learner mode, its attributes remain fixed, but its learner state may be changed through the interaction with the learner.

How does the gadget receive its configuration data? Shortly after loading the gadget's `index.html`, the player posts a series of messages to the gadget: the `attributesChanged` and/or `learnerStateChanged` messages. These messages carry the attributes and the learner state for the gadget.

The configuration data always consists of a set of attributes; an attribute is just a key-value pair. As an example, the attributes for the "French word gallery" gadget might contain an array, such as

```
{ words: 
	[
	   { imageId : "a123fc", word : "soupçon" },
	   { imageId : "4cb834", word : "parapluie" },
	   { imageId : "7ad23c", word : "gants" }
	]
}
```

while the learner state may be just a single attribute, say `{index: 1}`, storing the index of the word last viewed by the learner. As a developer, you are free to organize your data structures as you see fit.

The gadget may also receive a `setEditable` message that indicates whether the gadget is in the authoring or in the learner mode.

The gadget code must always react to these messages by adjusting the UI elements and/or storing the values internally. For example, the `setEditable` message can come at any time as the author switches between the editable and non-editable modes of the gadget. The same holds for `attributesChanged` and `learnerStateChanged`.

Attached / detached
------------------

When the gadget has been attached to a DOM element in the lesson, the player posts the message `attached` to the gadget. The gadget should refresh its UI at this time.

###### Correct?

_After_ the gadget was removed from the lesson DOM, the player posts the `detached` message.

Initial visual state
-------------

###### Correct? These messages can be sent before receiving `attached`?

At this early stage, when the gadget has not yet been attached to the lesson document, the gadget may also post the messages `setEmpty`, `setHeight`, and `setPropertySheetAttributes` to the player. These messages will configure some visual aspects of the gadget that are provided by the Versal platform.

The `setEmpty` message is relevant in the authoring mode; it tells the player to display a gadget placeholder. The author will see right away that the gadget is "empty" and cannot show any useful content yet. For instance, images need to be uploaded, or other content needs to be configured, before the gadget can show anything. Here is how an empty gadget looks:

![empty gadget](./empty_gadget.png "Empty gadget")

The `setHeight` message specifies the desired pixel height of the gadget's window. The width of the window is fixed, equal to the total width of the lesson window. (In the Web browser, this is 724 px).

The `setPropertySheetAttributes` message will declare the types and the names of the attributes displayed in the gadget's **property sheet**. This is a simple UI provided by the Versal player, which allows the author to configure some parameters of the gadget.

Persisting the attributes and the learner state
--------------------

The gadget can use property sheets for simple attributes such as text, numbers, or checkboxes. The property sheet is toggled through the "cogwheel" icon.

The Versal player will automatically persist all attributes defined on the property sheet. When the author changes any values in the property sheet, the gadget will receive an `attributesChanged` message and can react to it normally.

Property sheets automatically specify titles for the data attributes. The `setPropertySheetAttributes` message specifies all titles and types of the attributes. Presently the player supports the following data types in property sheets:

*	`Text`, `Number`, `TextArea`, `Checkbox`, `Color`: these types need no options.

Example: `{ type: 'TextArea' }`

*   `Checkboxes`, `Radio`, `Select`: these types take an array of `options`, representing the possible selection items. The `Select` type is a drop-down listbox.

Example: `{ type: 'Radio', options : ['Green', 'Yellow', 'Red' ] }`

*      `Date`, a date picker

Example: `{ type: 'Date', yearStart: 1990, yearEnd : 2038 }`

*      `DateTime`, a date/time picker

Example: `{ type: 'Datetime', 'yearStart : 1990, yearEnd : 2038, minsInterval : 60 }`

*      `Range`, a slider with a given range and step

Example: `{ type: 'Range', min: 100, max: 200, step: 10 }`

*      `Tags`, a selection of user-supplied tags

Example: 

```
{ type : 'Tags',
  options: ['music', 'movies', 'study', 'family', 'pets'],
  lowercase: true,
  duplicates: false,
  minLength: 3,
  maxLength: 20,
  updateAutoComplete: true 
}
```

Here is an example property sheet, showing a slider for a numerical value ("number of words") and a drop-down selection box ("chosen author"):

![property sheet](./property_sheet_1.png "Property sheet")

The property sheet in this screenshot was configured by the following message:

```
{ event : 'setPropertySheetAttributes',
  data: {
     numberOfWords:  { type: 'Range', min: 100, max: 500, step: 20 },
     chosenAuthor: { type: 'Select',
                      options: ['Shakespeare', 'Hegel', 'Dickens', 'Lao Tzu'] 
                   }
         }
}
```

If the property sheets are not powerful enough for configuring your gadget, you can implement your own custom UI for the authoring mode. Your gadget should post the message `setAttributes` whenever you need to persist some changed attributes.

For the learner state, there is no property sheet option. Use the message `setLearnerState` to persist any changes in the user state.

Assets
------

If your gadget displays images, the author must somehow provide these images when creating the lesson. The Versal platform allows the author to upload images and videos directly through the **asset** interface.

The gadget asks the user to upload a new asset by posting a message like this:

```
{ event: 'newAsset',
  data: {
  	messageId: 123,
  	type: 'image'
  }
}
```

Possible types are `image` and `video`.

The player displays a UI for uploading an asset. After an upload, the player post a message `setAsset` to the gadget:

```
{ event: 'setAsset',
  data: {
  	messageId: 123,
  	asset: {
  		id: 'a73cb21...",
  		representations: [
  			{ location: 'http://amazon/bucket/some/image.png', ...
  			...
  		]
  	}
  }
```

The structure of Versal assets is an array of `representations`, each item containing an image or a video at a certain resolution.

###### Need more documentation here: what is precisely the semantics of various fields in the asset JSON?

After receiving a new asset, the gadget may want to persist the asset data in its attributes by posting `setAttributes`.

###### What is the semantics of `newPath` and `setPath`? Where does the asset ID come from, for these messages?

Challenges and scoring
-------------------------



Deploying the gadget
===============

After you create the HTML and JS files for your gadget, you will want to test your gadget visually and then publish it. The deployment cycle looks like this:

* Test the gadget locally on your development machine
* Deploy the gadget in a "sandbox" on Versal.com
* Create a course that uses your gadget
* Develop, test, and deploy an updated version of the gadget
* Update the gadget in the course(s) using it

Testing locally
------------

Go to the gadget directory (where `manifest.json` is located) and run the command 

```
versal preview
```

This command starts a local HTTP server on port 3000. Open the URL [localhost:3000](http://localhost:3000) in a browser. You will see an empty lesson page and your gadget's icon in the bottom tray. Double-click on the gadget icon to insert the gadget into the lesson. This is how a course author will start using your gadget in a new course. You can now interact with your gadget, both in authoring mode and in learner mode. (Click the "cogwheel" icon to switch between these modes.)

Deploying in sandbox
-----------

If you have never deployed your gadget yet, make sure that you sign in to Versal:

```
versal signin
```

Go to the gadget directory and run the command

```
versal publish
```

The gadget will be published to the Versal platform. However, this gadget is published in a "sandbox": it is not approved for the entire world to see, and will be visible only in courses authored by yourself. 

Testing the gadget in a course
----------

###### This requires some local configuration??

Go to the `sdk` directory and run the command `grunt`. It will start a local server at the URL [localhost:3232](localhost:3232). Open this URL in your browser. You will see an empty course where you can use your gadget.

Creating a course with your gadget
-----------

Go to [versal.com](versal.com), sign in, and create a new course. Click on the "Sandbox" tray in the bottom; you should see your new gadget available. Drag your gadget into the lesson and start using it.

Updating the gadget
-----------

To update the gadget, you need to do two things:

- change the gadget version upwards (e.g. from `0.1.3` to `0.1.4`)

- publish the gadget again

Suppose you already created some courses that use your gadget version `0.1.3`, and now you published an updated version `0.1.4`. When you do this, the courses do not automatically start using the updated version. To avoid breaking the existing courses, all older gadget versions will be preserved by the platform. The course authors need to agree explicitly to upgrade your gadget to a new version.

Go to the course you created where your gadget has been used. Click on the "Sandbox" tray and you will see that your gadget's icon has a band on it, indicating that an upgrade is available. Click on the band and confirm the upgrade to a new version.

