Beginning Versal gadget development
===================================

###### H6 are items to be edited before releasing this document.

Overview and concepts
---------

A course in the Versal platform consists of lessons. Each lesson can show all kinds of content - from text, images, and videos, to rich interactive elements programmed in HTML5 and JavaScript. In a Versal lesson, all these elements of content are shown by pieces of HTML/JS code, called **gadgets**.

Some gadgets are very simple - just showing a paragraph of text or an image. Other gadgets may show rich interactive graphics or present a quiz to the learner (and score it right away). Because gadgets are custom programmed, there is no limit on what you can do as a gadget developer. You can load any JS libraries and frameworks, communicate with any third-party Web servers, and use the Versal platform services to access image assets and other persistent data.

The Versal platform provides a **course player**, which is a learning environment and at the same time a course authoring environment. So each gadget needs to have the **learner mode** and the **authoring mode**. The appearance and interactive functionality of gadgets may be quite different in these two modes. As a gadget developer, you will design and implement the learner's experience as well as the course author's experience with your gadget.

### How gadgets work

A gadget is an HTML document that lives inside an `iframe`. The `iframe` for each gadget will be created automatically by the Versal  player, whenever a lesson document is opened either by a course author or by a learner.

The gadget communicates with the Versal player through the `postMessage` API, which passes serialized JSON data. Gadgets use this API to perform four basic functions:

* get and set persistent configuration data (created by the course author) and learner-specific data (for the current learner)
* obtain assets (images, videos) uploaded by the course author and stored on the Versal platform
* store question/answer data and perform scoring (for quizzes and other challenges)
* use some predefined visual features of the Versal player ("empty gadget" views, the "property sheets", etc.)

This repository includes a basic "hello, world" gadget for you to get started. You can just open [assets/index.html](./assets/index.html) to see the gadget as viewed by a learner. The code in [assets/main.js](./assets/main.js) demonstrates how to use property sheets, the configuration data, and the learner-specific data.


###### Verify that these repos exist and contain sample code (iframe-timeline and iframe-quiz don't exist yet!)

Further sample gadgets are available in the repositories [Versal/highlightr_iframe](https://github.com/Versal/highlightr_iframe), [Versal/challenge-gadget](https://github.com/Versal/challenge-gadget), and [Versal/highlightr_iframe](https://github.com/Versal/highlightr_iframe).

### Conceptual example: a "word gallery" gadget

Imagine a gadget for learning French words. The gadget shows a gallery of images and the corresponding words. The learner can look at the words and the images one by one, passing to the next or to the previous word.

The course author will select the images and the words and put them into a certain sequence. A learner can sign in to Versal.com from any computer and will always see the word last selected during their most recent session.

The gadget code needs to provide a UI for the course author as well as for the learners. The Versal platform takes care of persistently storing the gadget configuration data and the image or video assets. The platform also tracks each user's individual selections as the learners interact with the gadget.

Installing the gadget SDK
-------------------------

To begin developing gadgets, you will need:
- Linux or Mac OS X (Windows may require further installation steps.)
- [git](http://git-scm.com/book/en/Getting-Started-Installing-Git)
- [node/npm](http://nodejs.org/)
- a [Versal.com](http://versal.com) account
- read access to some of [Versal's GitHub repositories](https://github.com/Versal).

###### Remove Versal/player requirement when Versal/sdk finally incorporates the player branch

Check out this repository and the repositories [Versal/sdk](https://github.com/Versal/sdk), [Versal/player](https://github.com/Versal/player). It would help to check them out side by side in the same directory.

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

This repository, `Versal/gadget-dev-intro`, contains a sample Versal gadget. To verify that your installation works, let's test this gadget in a Versal course.

In the `versal-dev-intro` directory, run the command

```
versal preview
```

This will start a local HTTP server on port `3000`. Open the URL [localhost:3000](http://localhost:3000) in a Web browser. You will see an empty lesson and a test gadget in the gadget tray below. Double-click on that gadget; you will see that the gadget has been added to the lesson. You have now tested the sample gadget!


The layout of files
-----------------

The Versal platform provides a **player** environment that loads the gadget in the context of a lesson, passes configuration data to the gadget, and receives learner's data from the gadget.

###### assets/index.html will be phased out in favor of ./index.html

Presently, a gadgets is developed as a Web app - that is, as an individual HTML document. The player will first load the gadget's root file, `assets/index.html`. Any JS libraries or frameworks required by the gadget need to be loaded there by usual mechanisms supported by HTML5 (statically or asynchronously). The gadget's JS code should be started from this `index.html`, as in any ordinary Web app.

In addition, each gadget must have an icon, `assets/icon.png`, and a `manifest.json` that specifies the gadget's current version, the Versal user who developed it, and other data. (A minimal gadget can have just three files, `assets/index.html`, `assets/icon.png`, and `manifest.json`.)

The layout of `manifest.json` is clear from this example (see [manifest.json](./manifest.json) ):

```
{
  "username": "sergei",   // username on Versal.com
  "name": "hello-world",  // short name of gadget
  "version": "0.1.0",   // semantic version
  "title": "Hello, World",
  "description": "Demo gadget showing the basic API",
  "author": "sergei",   // username on Versal.com
  "defaultConfig": {  // default set of attributes for the gadget
    "__launcher": "iframe",  // will be phased out in the future, but necessary for now
    "chosenColor" : "#00cc00",
    "chosenWord" : "green"
    "username": "sergei" // necessary?
  },
  "defaultUserState": {
    "isBold": false
  } // default learner state for the gadget
}
```

###### Is the 'username' necessary in defaultConfig?
###### Can we rename defaultUserState to defaultLearnerState, or vice versa?

Gadget/player messaging
----------------

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

###### Correct? These messages can be sent before receiving `attached`? Seems to work.

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

If your gadget displays images, the author must somehow provide these images when creating the lesson. The Versal platform allows the author to upload images and videos directly through the **asset** API.

The gadget asks the user to upload a new asset by posting a message like this:

```
{ event: 'newAsset',
  data: {
  	messageId: 123,
  	type: 'image'
  }
}
```

Possible asset types are `image` and `video`.

The player displays a UI for uploading an asset. After an upload, the player post a message `setAsset` to the gadget:

```
{ event: 'setAsset',
  data: {
  	messageId: 123,
  	asset: {
  		id: 'a73cb21...",
  		representations: [
  			{ id: '65bb32...',
  			  scale: '800x600',
  			  contentType: 'image/png',
  			  original: false,
  			  available: true
  			}, ...
  		]
  	}
  }
```

A Versal asset contains an array of `representations`. Each element of that array describes an image or a video, which may have been scaled down to a smaller size. One of the representations is tagged as `original:true`; this is the one that has not been scaled down.  (If you upload a small image, it will not be scaled down, and so there will be only one "representation", which will be `original`.)

After getting a new asset, you may want to choose a representation and persist that representation's ID in the gadget's attributes, by posting `setAttributes` to the player.

All uploaded assets are automatically processed (and scaled down if necessary) by the Versal platform. The resulting representations are stored in remote URLs. To display the image, you need to fetch the URL that corresponds to the representation's ID. You post a message `getPath`:

```
{ event: 'getPath',
  data: {
    messageId: 123,
    assetId: '65bb32...' // this is really the representation's ID, not the whole asset's ID.
  }
}
```

The player responds by posting `setPath` to the gadget; this message contains a URL:

```
{ event: 'setPath'
  data: {
    messageId: 123,
    url: 'http://stack.versal.com/api/assets/9a8b7c6d5e430ef...'
  }
}
```

The gadget can now use this URL to set the `img src=...` tag or to display a video player.


Challenges and scoring
-------------------------

Some gadgets show **challenges** to the learner. A challenge is an activity that the learner needs to go through, in order to achieve progress when studying the course. A challenge can be as simple as a multiple-choice question, or as complicated as an interactive game where it is required to achieve a certain score.

A gadget will, in general, show an array of challenges. Examples of this are a quiz (an array of multiple-choice questions) or the music gadget (an array of guess-a-note challenges).

The course author will typically have the following workflow:

* create a new instance of a challenge gadget
* create a set of challenges in the gadget
* later, edit the gadget configuration again and modify some challenge data

Each time the challenge data is newly created or changed by the author, the new data needs to be registered with the Versal platform by sending a `setChallenges` message including an array of challenges in the appropriate format.

If the author has previously already entered some challenge data, the gadget will receive the message `challengesChanged` when soon after the `attached` message.

The body of these messages contains the challenge data in the form

```
event: 'setChallenges'
data:
  challenges: [ {...}, {...}, {...} ]
```

An example of an individual challenge that requires a user to answer a question by typing

```
prompt: 'What color is the sky?',
answers: 'blue',
scoring: 'strict'
```

The only required field is `prompt` and should contain whatever information your gadget needs to display the challenge to a learner. The optional `answers` field can contain whatever data is needed for your code to compute a *score*. Optionally `answers` can be appropriately formatted and scored using a predefind set of scoring functions. To use Versal's scoring your challenge object will declare which function to use in the `scoring` field of a challenge.

A full challenge example

```
event: 'setChallenges'
data:
  challenges: [

    // Strict matching on a textual answer
    {
      prompt: 'Play the middle C on the keyboard',
      answers: 'C4',
      scoring: 'strict'
    },

    // Choose a number in range
    {
      prompt: 'Choose any number between 2 and 5?',
      answers: [2, 5],
      scoring: 'range'
    },

    // Multiple choice
    {
      prompt: {
        question: 'Solve 1 + x2 = 5 for x',
        answers: [1, 2, 3]
      },
      answers: 2,
      scoring: 'strict'
    }
  ]
```

A scoring function is an algorithm that takes the learner's response data and the correct answer data, and returns a number between 0 and 1, for each question. The supported scoring functions are `strict`, `partial`, `subset`, and `range`.

The JSON data formats of the learner's response data and the correct answer data must be chosen to be compatible with the scoring strategies.

* ‘strict’: The score is 1 only if the learner’s response data is exactly equal to the correct answer data, regardless of the structure of that data. Otherwise the score is 0.

* ‘partial’: the learner’s response data is an array, the correct answer data is an array, and the score is the percentage of array items that are exactly equal (and not null).

* ‘subset’: the learner’s response data is an array, the correct answer data is an array, and the score is the percentage of learner’s values that are contained in the correct array.

* ‘range’: the learner’s response data is a number N, the correct answer is an array of two numbers [A, B], and the score is 1 when N is in the range [A,B] and 0 otherwise.

Here are some typical examples of scoring:

Multiple-choice quizzes will use the ‘strict’ scoring when there is only one correct answer, and ‘subset’ scoring when the user needs to check “all answers that apply”.

Example of ‘subset’ scoring: User response is [1,2]. Correct answer is [2,3,4]. Score is 33% because the user selected only 1 out of three correct items.

SAT math questions: “what is one value of N such that …” will be scored using ‘range’.

Quizlet: the user must match several pairs of items. This will use the ‘partial’ scoring.

When the learner has answered the challenge, the gadget will post the message `scoreChallenges`. The data for this message contains the learner's responses in an array corresponding the set of challenges.

After scoring the learner's answers the player posts the message `scoresChanged`. The data for this message contains the total score and an array of individual scores for all challenges, total score, and the user's responses.

```
event: 'scoresChanged'
data:
  scores: [1, 1, 0],
  totalScore: 2,
  responses: ['blue', 'green', 'yellow']
```

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

Power tip: While this HTTP server is running, you can continue changing the gadget's code. Just refresh the browser to see the changes live!

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

Go to the `sdk` directory and run the command `grunt`. It will start a local server at the URL [localhost:3232](http://localhost:3232). Open this URL in your browser. You will see an empty course where you can use your gadget.

Creating a course with your gadget
-----------

Go to [versal.com](http://versal.com), sign in, and create a new course. Click on the "Sandbox" tray in the bottom; you should see your new gadget available. Drag your gadget into the lesson and start using it.

Updating a published gadget
-----------

To update a published gadget, you need to do two things:

- change the gadget version upwards (e.g. from `0.1.3` to `0.1.4`) in the `manifest.json`

- publish the gadget again (`versal publish`)

Suppose you already created some courses that use your gadget version `0.1.3`, and now you published an updated version `0.1.4`. When you do this, the courses do not automatically start using the updated version. To avoid breaking the existing courses, all older gadget versions will be preserved by the platform. The course authors need to agree explicitly to upgrade your gadget to a new version.

Go to the course you created where your gadget has been used. Click on the "Sandbox" tray and you will see that your gadget's icon has a band on it, indicating that an upgrade is available. Click on the band and confirm the upgrade to a new version.

Sample gadget projects
======================

To get you started, here are some sample gadget projects for you to examine.

hello-world gadget
-----------

[Versal/gadget-dev-intro](https://github.com/Versal/gadget-dev-intro)

This gadget shows a "hello, world" message with a custom word and color inserted by the course author. The learner can click this word and toggle the italics and boldface font on the message. The gadget also displays an image uploaded by the course author.

- demonstrates the lifecycle of the gadget
- uses property sheets, attributes, learner states, and asset handling
- all messages (sent and received) are logged to console
- code is commented


highligher gadget
----------

[Versal/highlightr_iframe](https://github.com/Versal/highlightr_iframe)

- the code uses no frameworks
- `grunt` with `stylus` and `mocha` support
- provides a reasonable path for testing the gadgets
- provided a reasonable `postMessage` wrapper
- code is commented

challenge gadget
---------

[Versal/challenge-gadget](https://github.com/Versal/challenge-gadget)

The gadget provides an example of using the challenge/scoring API.
