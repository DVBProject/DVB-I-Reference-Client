
/******************************
	DIALOG Functions
*******************************/
var dialog = { open : false };

function showDialog( q, buttons, _checked, _focused, callback, cancel,keyHandler,header)
{
	console.log("showDialog");
	dialog.open = true;
  dialog.keyHandler = keyHandler;
	dialog.callback = callback;
	dialog.cancel = cancel;
	dialog.visibleItems = 10;
	dialog.focused = (_focused!=null)? _focused : 0;
	dialog.options = buttons.length;
	dialog.checked = (_checked!=null)? _checked : -1;
    if(dialog.cancel) {
	    dialog.buttonbar = new ButtonBar( [VK_ENTER , VK_BACK], { VK_ENTER: "Select", VK_BACK: "Back" }, "buttonbar_dialog");
    }
    else {
	    dialog.buttonbar = new ButtonBar( [VK_ENTER], { VK_ENTER: "Select" }, "buttonbar_dialog");
    }
	

	var wrapper = document.createElement("div");
  if(q) {
    var title = document.createElement("h2");
    title.innerHTML = q;
    wrapper.appendChild(title);
  }
	wrapper.addClass("wrapper");
	wrapper.setAttribute("id", "dialogWrapper");
	

	// Arrows
	var up_arrow 	= document.createElement("div");
	var down_arrow 	= document.createElement("div");
	up_arrow.setAttribute("id", "dialog_up_arrow");
	down_arrow.setAttribute("id", "dialog_down_arrow");
	up_arrow.addClass("dialog_arrow");
	down_arrow.addClass("dialog_arrow");
	up_arrow.addClass("hide");
	down_arrow.addClass("hide");

	var dialogButtons = document.createElement("div");
	dialogButtons.setAttribute("id", "dialogButtons");
	wrapper.appendChild(dialogButtons);

	if(buttons.length > 0){
    dialog.buttonLabels =  [];
		$.each( buttons, function(i, label){
			var dialogButton = document.createElement("div");
			dialogButton.addClass("dialogButton");
      var labelElement = document.createElement("span");
      $(labelElement).text(label);
      dialogButton.appendChild(labelElement);
      dialog.buttonLabels.push(labelElement);
			var checkmark = document.createElement("div");
			checkmark.addClass("checkmark");
			dialogButton.appendChild(checkmark);
			if(i == dialog.focused){ dialogButton.addClass("focused"); }
			if(i == dialog.checked){ 
				dialogButton.addClass("checked");
			}
			dialogButtons.appendChild(dialogButton);
		});

		var buttonElems = $(dialogButtons);
		var firstvisible = buttonElems[0].children[0];
		var lastvisible = null;
		var firstvisibleIdx = 0;
		if(dialog.focused >= dialog.visibleItems){
			$.each( buttonElems, function(i, elem){
				if(i == dialog.focused || i == buttonElems.length - dialog.visibleItems){
					firstvisible = elem;
					firstvisibleIdx = i;
					return false;
				}
			});
		}
		buttonElems[0].children[firstvisibleIdx].addClass("firstvisible");
		lastvisible = buttonElems[0].children[Math.min(buttonElems.length-1, firstvisibleIdx + dialog.visibleItems-1)];
		lastvisible.addClass("lastvisible");
		
		var scrolltop = (($(".dialogButton:eq("+ dialog.focused +")").outerHeight(true)) * firstvisibleIdx);
		console.log("scrolltop: ", scrolltop);
		$("#dialogWrapper").scrollTop(scrolltop);
	}
  if(!header) {
     header = "Settings";
  }
   
	$("#dialog").html("<h1>"+header + "</h1>");
	$("#dialog").append(dialog.buttonbar.bar);
  document.getElementById("dialog").appendChild(up_arrow);
	document.getElementById("dialog").appendChild(down_arrow);
  document.getElementById("dialog").appendChild(wrapper);
	$("#dialog").addClass("show");
  $("#dialog").removeClass("hide");

	handleDialogArrows();
}

function handleDialogArrows(){
	var up_arrow = document.getElementById("dialog_up_arrow");
	var down_arrow = document.getElementById("dialog_down_arrow");
	if($("#dialogWrapper").scrollTop() > 0){
		up_arrow.removeClass("hide");
	}
	else{
		up_arrow.addClass("hide");
	}
	if($("#dialogWrapper").scrollTop() < $("#dialogWrapper")[0].scrollHeight - $("#dialogWrapper")[0].offsetHeight){
		down_arrow.removeClass("hide");
	}
	else{
		down_arrow.addClass("hide");
	}
}

function navigateDialog( keyCode )
{
	console.log( "dialog.js: navigate dialog" );
	if(!animating){
		switch(keyCode)
		{
			case VK_DOWN:
			case VK_UP:
				if( keyCode == VK_UP && dialog.focused ){
					if($(".dialogButton:eq("+ dialog.focused +")").hasClass("firstvisible") && dialog.focused > 0){
						animating = true;
						$(".dialogButton:eq("+ dialog.focused +")").removeClass("firstvisible");
						$(".dialogButton:eq("+ dialog.focused +")").prev().addClass("firstvisible");
						var lastvisible = $(".dialogButton.lastvisible");
						lastvisible.removeClass("lastvisible");
						lastvisible.prev().addClass("lastvisible");
						animating = true;
						$("#dialogWrapper").animate(
							{scrollTop: $("#dialogWrapper").scrollTop() - $(".dialogButton:eq("+ dialog.focused +")").outerHeight(true)},
							{
								duration:250,
								easing:"linear",
								complete:function(){
									animating = false;
									handleDialogArrows();
								},
								fail: function(){
									animating = false;
								}
							}
						);
					}
					dialog.focused--;
				}
				else if( keyCode == VK_DOWN && dialog.focused < dialog.options-1 ){
					if($(".dialogButton:eq("+ dialog.focused +")").hasClass("lastvisible") && dialog.focused+1 < dialog.options){
						animating = true;
						$(".dialogButton:eq("+ dialog.focused +")").removeClass("lastvisible");
						$(".dialogButton:eq("+ dialog.focused +")").next().addClass("lastvisible");
						var firstvisible = $(".dialogButton.firstvisible");
						firstvisible.removeClass("firstvisible");
						firstvisible.next().addClass("firstvisible");
						animating = true;
						$("#dialogWrapper").animate(
							{scrollTop: $("#dialogWrapper").scrollTop() + $(".dialogButton:eq("+ dialog.focused +")").outerHeight(true)},
							{
								duration:250,
								easing:"linear",
								complete:function(){
									animating = false;
									handleDialogArrows();
								},
								fail: function(){
									animating = false;
								}
							}
						);
					}
					dialog.focused++;
				}
				$(".dialogButton.focused").removeClass("focused");
				$(".dialogButton:eq("+ dialog.focused +")").addClass("focused");
				break;

			case VK_ENTER:
                dialog.open = false;

				        if( dialog.callback && typeof(dialog.callback) == "function"){
					        dialog.callback(dialog.focused); // call handler for response
				        }
                else {
                    $("#dialog").html("");
				            $("#dialog").removeClass("show");
				            $("#dialog").addClass("hide");
                }
                break;
			case VK_BACK:
                if( dialog.keyHandler && typeof(dialog.keyHandler) == "function"){
					        if(dialog.keyHandler(keyCode,dialog.focused)) {
                    return true;
                  } // call handler for response
				        }
                if(dialog.cancel) {
                    dialog.open = false;
                    if( keyCode == VK_BACK && typeof(dialog.cancel) == "function"){
                        dialog.cancel.call();
                    }
                    else {
                      $("#dialog").html("");
			                $("#dialog").removeClass("show");
      				        $("#dialog").addClass("hide");
                    }
                }
				break;

			default:
        if( dialog.keyHandler && typeof(dialog.keyHandler) == "function"){
					return dialog.keyHandler(keyCode,dialog.focused); // call handler for response
				}
				return false;
		}
		return true;
	}
	else{
		return false;
	}
}

function updateLabel(index,label) {
  dialog.buttonLabels[index].innerHTML = "<span>"+label+"</span>";
}
