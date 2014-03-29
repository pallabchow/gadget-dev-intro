(function(){
    // Declare a gadget class.
    var Gadget = function(options) {
        // object's properties

        // the main DOM element for attaching
        this.el = options.el;
        // the selected word
        this.wordEl = this.el.querySelector('span.adjective');

        // the gadget's internal state, including the default values of all attributes and learner state.
        this.config = {
            isEditable: false,
            authorState: {
                chosenColor: 'green',
                chosenWord: 'green'
            },
            learnerState: {
                isBold: false       // whether the learner has made the chosen word bold.
            }
        };

        this.initialize();
    };

    // Declare some methods of this class.

    // Simple helper functions: marshalling/unmarshalling for JSON messages.
    Gadget.prototype.receiveMessage = function (messageString) {

        // message has the structure { event: 'eventName', data: { ... } }
        var messageJson = JSON.parse(messageString.data);

        console.log({
            direction: 'received',
            event: messageJson.event,
            data: messageJson.data
        });

        // We will call the gadget's method named by the event, if this method exists.
        if (this[messageJson.event]) {
            this[messageJson.event](messageJson.data);
        }
    };

    Gadget.prototype.sendMessage = function (messageJson) {
        var messageString = JSON.stringify(messageJson);

        console.log({
            direction: 'sent',
            event: messageJson.event,
            data: messageJson.data
        });

        window.parent.postMessage(messageString, '*');
    };


    // Need to configure the property sheet after attaching.
    Gadget.prototype.setupPropertySheet = function() {
        // set up a property sheet for word and color selection.
        this.sendMessage({
            event: 'setPropertySheetAttributes',
            data: {
                chosenColor: { type: 'Color' },
                chosenWord: { type: 'Text' }
            }
        });
    };

    // Initialize: before the gadget is attached to the lesson's DOM.
    Gadget.prototype.initialize = function() {

        // subscribe to player events.
        window.addEventListener('message', this.receiveMessage.bind(this));

        this.setupPropertySheet();

        // add click listener to toggle bold font.
        this.wordEl.onclick = this.toggleBoldWord.bind(this);

        // add click listener to upload new asset.
        this.el.querySelector('.button-upload-image').onclick = this.requestUpload.bind(this);

        // set gadget height.
        this.sendMessage({
            event: 'setHeight',
            data: {
                pixels: 400
            }
        });

        // initially the gadget is empty, let's set this state.
//        this.setEmpty();
    };

    Gadget.prototype.requestUpload = function() {
        this.sendMessage({
            event: 'newAsset',
            data: {
                messageId: 1,
                type: 'image'
            }
        });
    };

    // Methods that respond to some player events. Other events will be ignored by this gadget.

    Gadget.prototype.setEditable = function(jsonData) {
        this.config.isEditable = jsonData.editable;

        // some elements have class 'authoring-only' and need to be hidden when we are in non-editable mode.
        var visibilityForAuthor = this.config.isEditable ? 'visible' : 'hidden';

        // set visibility on all such elements.
        var elementsAuthoringOnly = document.getElementsByClassName('authoring-only');
        for (var i = 0; i < elementsAuthoringOnly.length; ++i) {
            var item = elementsAuthoringOnly[i];
            item.setAttribute('style', 'visibility: ' + visibilityForAuthor + ';');
        }
    };

    Gadget.prototype.setEmpty = function () {
        this.sendMessage({
            event: 'setEmpty'
        });
    };

    Gadget.prototype.setAsset = function (data) {
        this.config.asset = data.asset;
        this.config.asset.messageId = data.messageId;
        this.setAttributes({
            asset: this.config.asset
        });

        if (this.el.innerHTML !== '') {
            this.render(true);
        }
    };

    Gadget.prototype.attributesChanged = function(jsonData) {

        // we expect only the attributes 'chosenColor', 'chosenWord', 'imageId'.
        if (jsonData['chosenColor']) {
            this.config.authorState.chosenColor = jsonData.chosenColor;
            this.wordEl.setAttribute('style', 'color: ' + this.config.authorState.chosenColor);
        }
        if (jsonData['chosenWord']) {
            this.config.authorState.chosenWord = jsonData.chosenWord;
            this.wordEl.innerHTML = this.config.authorState.chosenWord;
        }
        if (jsonData['imageId']) {
            this.config.authorState.imageId = jsonData.imageId;
            this.requestImageUrl();
        }

    };

    Gadget.prototype.learnerStateChanged = function(jsonData) {
        // we expect only the attribute 'isBold'.
        if (jsonData['isBold']) {
            this.config.learnerState.isBold = jsonData.isBold;
            this.updateBoldWord();
        }
    };

    Gadget.prototype.updateBoldWord = function() {
        if (this.config.learnerState.isBold) {
            AddClassToElement(this.el, 'setBold');
        } else {
            RemoveClassFromElement(this.el, 'setBold');
        }
    };

    Gadget.prototype.toggleBoldWord = function() {
        this.config.learnerState.isBold = ! this.config.learnerState.isBold;
        this.sendMessage({
            event: 'setLearnerState',
            data: {
                isBold: this.config.learnerState.isBold
            }
        });
        this.updateBoldWord();
    };

    // Finished with defining the gadget class.

    // Instantiate the gadget, pass the DOM element, start listening to events.
    // This gadget instance will remain active because it has added itself as a listener to the window.
    new Gadget({ el: document.querySelector('.main-container')});

})();