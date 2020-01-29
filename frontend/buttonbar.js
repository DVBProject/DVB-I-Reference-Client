

/***
	Class ButtonBar
	
	Public methods:
		<<Constructor>> ButtonBar( buttons, labels ):
			buttons : a list of button codes to add into corresponding buttons into bar (in order), e.g. [VK_RED, VK_BACK]
			labels : an object containing labels for button codes, e.g. { VK_RED : "Exit", VK_ENTER : "Select" }
		ButtonBar.label( code, label ): set label for button code
		ButtonBar.show( code, label ): Show named button and set new label for button code if given
		ButtonBar.show(): Shows Button Bar
		ButtonBar.hide( code ): Hides one button
		ButtonBar.hide(): Hides Button Bar
		ButtonBar.saveState(): Saves button bar state to be restored later
		ButtonBar.restoreState(): restores previous button state
		
		
	Usage:
		Init:
			var buttonbar = new ButtonBar([VK_RED, VK_BACK]); // default labels
			var buttonbar = new ButtonBar([VK_RED, VK_BACK], { VK_RED : "Quit", VK_BACK : "Previous" } ); // custom labels
		Interact:
			buttonbar.show(VK_ENTER, "Select"); // add OK/ENTER button with label Select
			buttonbar.hide(VK_BACK); // hides Back Button
			buttonbar.hide(); Hides whole bar
		
***/

function ButtonBar( buttons, labels, element_id ){
	var self = this;
	this.buttons = buttons;
	this.labels = labels;
	var bb_count = $(".buttonbar").length;
	this.bb_number = bb_count;
	this.bar = $('<div id="'+ (element_id || ("buttonbar"+this.bb_number)) +'"></div>');
	this.bar.addClass("buttonbar");
	
	this.config = {};
	this.config[VK_BACK] = 	{ name : "back", 	label : "Back" 	};
	this.config[VK_ENTER] = 	{ name : "ok", 		label : "Tune to channel"};
	this.config[VK_RED] = 	{ name : "red", 	label : "Exit" 	};
	this.config[VK_GREEN] = 	{ name : "green", 	label : "" 		};
	this.config[VK_YELLOW] = { name : "yellow", 	label : "" 		};
	this.config[VK_BLUE] = 	{ name : "blue", 	label : "" 		};
	this.config[VK_DOWN] = 	{ name : "down", 	label : "" 		};
	var buttonOrder = [ VK_ENTER, VK_BACK, VK_RED, VK_GREEN, VK_YELLOW, VK_BLUE, VK_DOWN];
	this.previousState = [];
	
	if( labels )
	{
		$.each( labels, function( code, label ){
			if( window[code] && self.config[window[code]] ){
				self.config[ window[code] ].label = label;
			}
		});
	}
	
	$.each( buttonOrder, function( i, code ){
		self.addButton( code, ( typeof( self.buttons ) == "object" && $.inArray(code, self.buttons) > -1? true : false ) );
	});
}

// Set label for button
ButtonBar.prototype.label = function( code, label ){
	this.config[ code ].label = label;
	this.bar.find( "." + this.config[ code ].name + ".bb_label" ).html( label );
};

ButtonBar.prototype.show = function( code, label )
{
	var self = this;
	if( code && label )
		self.label( code, label );
	if( code ){
		if( $("#" + this.bar.attr("id") + " ." + this.config[ code ].name + "b" )[0] ){
			$("#" + this.bar.attr("id") + " ." + this.config[ code ].name + "b" ).show();
			this.config[ code ].visible = true;
		}
	}
	else
		self.bar.show();
};

ButtonBar.prototype.hide = function( code )
{
	var self = this;
	if( code ){
		$("#" + this.bar.attr("id") + " ." + this.config[ code ].name + "b" ).hide(); // hide one
		this.config[ code ].visible = false;
	}
	else
		self.bar.hide(); // hide all
};

ButtonBar.prototype.hideButtons = function()
{
	var self = this;
	self.bar.find( ".btn" ).hide(); // hide all buttons
};

ButtonBar.prototype.saveState = function(){
	this.previousState.push( $.extend(true, {}, this.config) ); // deep copy
	console.log("saved buttonbar state ", this.config);
};
ButtonBar.prototype.restoreState = function(){
	var self = this;
	if( this.previousState == null || !this.previousState.length )
	{
		return;
	}
	this.config = this.previousState.pop();
	console.log("restore buttonbar state ", this.config);
	self.hideButtons();
	$.each( this.config, function(code, state){
		if( state.visible )
			self.show( code, state.label );
	} );
};


ButtonBar.prototype.addButton = function( buttonCode, visible ){
	var self = this;
	visible = ( typeof( visible ) == "undefined"? true : visible );
	var button = document.createElement("div");
	button.addClass(this.config[ buttonCode ].name +'b'); 
	button.addClass("btn");
	var icon = document.createElement("span");
	icon.className = "icon "+ this.config[ buttonCode ].name;
	var label = document.createElement("span");
	label.addClass(this.config[ buttonCode ].name);
	label.addClass("bb_label");
	label.innerHTML = this.config[ buttonCode ].label;
	button.appendChild(icon);
	button.appendChild(label);
	self.bar.append($(button));
	this.config[ buttonCode ].visible = visible;
	if( !visible )
		$(button).hide();
}

function titleScroll(element, duration){
	$(element).delay(1000).animate(
		{scrollLeft: $(element).find(".programText").outerWidth() - $(element).outerWidth()}, 
		{
			duration: duration, 
			easing: "linear", 
			complete: function(){
				$(element).delay(3000).animate(
					{scrollLeft: 0}, 
					{
						duration: duration, 
						easing: "linear", 
						complete: function(){
							titleScroll(element, duration);
						}
					}
				);
			}
		}
	);
}








