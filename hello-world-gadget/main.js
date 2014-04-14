var player = new VersalPlayerAPI({
  debug: true,
  // Temporary workaround
  assetUrlTemplate: 'http://localhost:3000/api/assets/'
});

var Gadget = function(options) {
  this.model = {};
  this.el = document.body;

  player.on('editableChanged', this.setModelAttribute.bind(this, 'editable'));
  player.on('attributesChanged', this.setModelAttributes.bind(this));
  player.on('learnerStateChanged', this.setModelAttributes.bind(this));
  player.on('assetSelected', this.assetSelected.bind(this));
  player.on('attached', this.render.bind(this));

  player.setHeight(320);
  player.connect();
};

Gadget.prototype.render = function(){
  this.vm = new Vue({
    el: this.el,
    data: this.model,

    computed: {
      src: function(){
        if(this.imageid) {
          return player.assetUrl(this.imageid);
        } else {
          return null;
        }
      },

      buttonLabel: function(){
        return this.imageid ? 'Replace image' : 'Set image';
      }
    },

    methods: {
      requestAsset: function(e){
        player.requestAsset({ type: 'image' });
      },

      toggleFontStyle: function(){
        if(this.editable) { return; }
        this.fontstyle = (this.fontstyle == 'italic') ? 'normal': 'italic';
      },

      imageLoaded: function(e){
        player.setHeight(e.target.scrollHeight);
      }
    }
  });

  this.vm.$watch('word', player.setAttribute.bind(player, 'word'));
  this.vm.$watch('fontstyle', player.setLearnerAttribute.bind(player, 'fontstyle'));
};


Gadget.prototype.setModelAttribute = function(key, value) {
  var attr = {};
  attr[key] = value;
  this.setModelAttributes(attr);
};

Gadget.prototype.setModelAttributes = function(attrs){
  Object.keys(attrs).forEach(function(key){
    this.model[key] = attrs[key];
  }.bind(this));
};

Gadget.prototype.assetSelected = function(data){
  var imageid = data.asset.representations[0].id;
  player.setAttribute('imageid', imageid);
};

player.setPropertySheetAttributes({
  color: { type: 'Color' },
  word: { type: 'Text' }
});

new Gadget();
