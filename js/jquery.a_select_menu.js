(function( $ ) {
  var options = {};
  var defaultOptions = {
    debugging: false,
    showHeader: true,
    multiselect: false,
    hidePopupOnSelect: false,
    showApplyButton: false,
    showClearButton: false,
  };

  var setupASelectMenu = function($el) {
    var asMenu = $el.data("as_menu");

    if (!(asMenu instanceof ASelectMenu)) {
      asMenu = new ASelectMenu($el, options);
    }

    return asMenu;
  }

  var methods = {
    init: function(_options) {
      options = $.extend(defaultOptions, _options);

      $(this).each(function () {
        setupASelectMenu( $(this) );
      });
    }
  };

  $.fn.aSelectMenu = function(method) {
    // Method calling logic
    if ( methods[method] ) {
      return methods[ method ].apply(this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jquery.zenti.amButton' );
    }    
  };
})( jQuery );


function ASelectMenu(_$el, _options) {

  // private instance variables

  var list, popup, listContainer, bContainer;
  var $el = _$el;
  var options = _options;
  var debugging = options.debugging;
  

  // private methods

  var initialize = function() {
    var id = $el.attr("id");
    list = $("[data-for="+id+"]");

    if (list.length == 0) {
      $.error("No list found for the advanced select menu "+id);
    }

    setupHtml();
    setupEvents();
  }

  var setupEvents = function() {
    // hide popup on click outside
    $('html').click(function() {
      popup.hide();
    });

    // items select
    list.find("li").click(function() {
      onListItemClick.call(this, list);
    });

    // setup popup show on button click
    $el.click(function(evt) {
      evt.preventDefault();
      popup.toggle();
    });

    // close on click outside of bContainer
    bContainer.click(function(evt) {
      evt.stopPropagation();
    });

    $el.find("li").click(function(evt) {
      evt.stopPropagation();
      evt.preventDefault();
      $(this).toggleClass("selected");
    });
  }

  var onListItemClick = function() {
    if (!options.multiselect) list.find("li.selected").removeClass("selected");

    $(this).toggleClass("selected");

    // hide popup on single select
    if (!options.multiselect && 
        options.hidePopupOnSelect && 
        list.find("li.selected").size() > 0) {
      list.parents(".as_popup").hide();
    }

    trigger( "select_item", {selected: getSelectedItems()} );
  }

  var trigger = function(event_name, obj) {
    $el.trigger("am:"+event_name, obj);
    dlog("- triggered \""+event_name+"\" with param: "+JSON.stringify(obj));

    var event_method = options["on_"+event_name];

    if (typeof event_method == "function") {
      event_method.call($el, obj);
    }
  }

  var clearSelection = function() {
    list.find("li.selected").removeClass("selected");
    trigger("clear");
  }

  var apply = function() {
    trigger( "apply", {selected: getSelectedItems()} );
  }

  var getSelectedItems = function() {
    var selItems = [];

    if (!options.multiselect) {
      selItems = list.find("li.selected").data("value");
    }
    else {
      list.find("li.selected").each(function() {
        selItems.push($(this).data("value"));
      });
    }

    return selItems;
  }

  var setupHtml = function() {
    $el.addClass("as_menu");

    // create popup
    popup = $("<div class='as_popup' style='display:none'>");

    // list container
    listContainer = $("<div class='as_list_container'>");
    listContainer.append(list);
    list.show();
    popup.append(listContainer);

    // foother buttons
    if (options.showApplyButton || options.showClearButton) {
      var fButtonsContainer = $("<div class='as_action_buttons_container'>");
      if (options.showApplyButton) {
        var applyButton = $("<button>").text("Apply");
        fButtonsContainer.append(applyButton);
        applyButton.click(apply);
      }
      if (options.showClearButton) {
        var clearButton = $("<button class='clear'>").text("Clear");
        fButtonsContainer.append(clearButton);
        clearButton.click(clearSelection);
      }
      listContainer.append(fButtonsContainer);
    }

    // create button container
    bContainer = $("<div class='as_menu_container'>");
    bContainer.insertAfter($el);
    bContainer.append($el, popup);

    // add header
    if (options.showHeader) {
      var hText = $("<span>").text("Select an option");
      var closeButton = $("<a href='#'>").html("&times;");
      var header = $("<div class='as_header'>").append(hText, closeButton);
      listContainer.before(header);
      closeButton.click(function(evt) {
        evt.preventDefault();
        popup.hide();
      });
    }
  }

  var dlog = function(mssg) {
    if (debugging) console.log(mssg);
  }

  initialize();
}