
/******************************
	DIALOG Functions
*******************************/
var alertDialog = { open : false };

function showAlertDialog( q1, q2, buttons, _checked, _focused, callback, cancel)
{
	
	console.log("showAlertDialog");
	alertDialog.open = true;
	alertDialog.callback = callback;
	alertDialog.cancel = cancel;
	alertDialog.visibleItems = 10;
	alertDialog.focused = (_focused!=null)? _focused : 0;
	alertDialog.options = buttons.length;
	alertDialog.checked = (_checked!=null)? _checked : 0;
	alertDialog.buttonbar = new ButtonBar( [VK_ENTER , VK_BACK, VK_BLUE], { VK_ENTER: "Select", VK_BACK: "Back", VK_BLUE: "Close" }, "buttonbar_dialog");
	$("#dialog").removeClass("hide");
	$("#dialog").addClass("show dialog_alert_container");
	$("#dialog").append(alertDialog.buttonbar.bar);

	var wrapper = document.createElement("div");
	wrapper.addClass("wrapper");
	wrapper.setAttribute("id", "dialogWrapper");
	document.getElementById("dialog").appendChild(wrapper);

	var dialog_alert = document.createElement("div");
	dialog_alert.addClass("dialog_alert");
	dialog_alert.setAttribute("id", "dialog_alert");
	document.getElementById("dialogWrapper").appendChild(dialog_alert);
	
	var dialog_alert_header = document.createElement("div");
	dialog_alert_header.addClass("dialog_alert_header");
	dialog_alert_header.setAttribute("id", "dialog_alert_header");
	document.getElementById("dialog_alert").appendChild(dialog_alert_header);
	
	var dialog_alert_text = document.createElement("div");
	dialog_alert_text.addClass("dialog_alert_text");
	dialog_alert_text.setAttribute("id", "dialog_alert_text");
	document.getElementById("dialog_alert").appendChild(dialog_alert_text);
	
	document.getElementById("dialog_alert_header").innerHTML = q1;
	
	document.getElementById("dialog_alert_text").innerHTML = q2;
	
	// Arrows
	/*
	var up_arrow 	= document.createElement("div");
	var down_arrow 	= document.createElement("div");
	up_arrow.setAttribute("id", "dialog_up_arrow");
	down_arrow.setAttribute("id", "dialog_down_arrow");
	up_arrow.addClass("dialog_arrow");
	down_arrow.addClass("dialog_arrow");
	up_arrow.addClass("hide");
	down_arrow.addClass("hide");
	document.getElementById("dialog").appendChild(up_arrow);
	document.getElementById("dialog").appendChild(down_arrow);
	*/
	var alertDialogButtons = document.createElement("div");
	alertDialogButtons.setAttribute("id", "dialogButtons");
	alertDialogButtons.addClass("dialogButton_alert");
	wrapper.appendChild(alertDialogButtons);

	if(buttons.length > 0){
		$.each( buttons, function(i, label){
			var alertDialogButton = document.createElement("div");
			alertDialogButton.addClass("dialogButton");
			alertDialogButton.innerHTML = "<span>"+label+"</span>";
			var checkmark = document.createElement("div");
			checkmark.addClass("checkmark");
			alertDialogButton.appendChild(checkmark);
			if(i == alertDialog.focused){ alertDialogButton.addClass("focused"); }
			if(i == alertDialog.checked){ 
				alertDialogButton.addClass("checked");
			}
			alertDialogButtons.appendChild(alertDialogButton);
		});
		
		var buttonElems = $(".dialogButton");
		var firstvisible = buttonElems[0];
		var lastvisible = null;
		var firstvisibleIdx = 0;
		if(alertDialog.focused >= alertDialog.visibleItems){
			$.each( buttonElems, function(i, elem){
				if(i == alertDialog.focused || i == buttonElems.length - alertDialog.visibleItems){
					firstvisible = elem;
					firstvisibleIdx = i;
					return false;
				}
			});
		}
		buttonElems[firstvisibleIdx].addClass("firstvisible");
		lastvisible = buttonElems[Math.min(buttonElems.length-1, firstvisibleIdx + alertDialog.visibleItems-1)];
		lastvisible.addClass("lastvisible");
		
		var scrolltop = (($(".dialogButton:eq("+ alertDialog.focused +")").outerHeight(true)) * firstvisibleIdx);
		console.log("scrolltop: ", scrolltop);
		$("#dialogWrapper").scrollTop(scrolltop);
	}
	//handleAlertDialogArrows();
}

function handleAlertDialogArrows(){
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

function navigateAlertDialog( keyCode )
{
	console.log( "alertDialog.js: navigate alertDialog" );
	if(!animating){
		switch(keyCode)
		{
			case VK_DOWN:
			case VK_UP:
				if( keyCode == VK_UP && alertDialog.focused ){
					if($(".dialogButton:eq("+ alertDialog.focused +")").hasClass("firstvisible") && alertDialog.focused > 0){
						animating = true;
						$(".dialogButton:eq("+ alertDialog.focused +")").removeClass("firstvisible");
						$(".dialogButton:eq("+ alertDialog.focused +")").prev().addClass("firstvisible");
						var lastvisible = $(".dialogButton.lastvisible");
						lastvisible.removeClass("lastvisible");
						lastvisible.prev().addClass("lastvisible");
						animating = true;
						$("#dialogWrapper").animate(
							{scrollTop: $("#dialogWrapper").scrollTop() - $(".dialogButton:eq("+ alertDialog.focused +")").outerHeight(true)},
							{
								duration:250,
								easing:"linear",
								complete:function(){
									animating = false;
									//handleAlertDialogArrows();
								},
								fail: function(){
									animating = false;
								}
							}
						);
					}
					alertDialog.focused--;
				}
				else if( keyCode == VK_DOWN && alertDialog.focused < alertDialog.options-1 ){
					if($(".dialogButton:eq("+ alertDialog.focused +")").hasClass("lastvisible") && alertDialog.focused+1 < alertDialog.options){
						animating = true;
						$(".dialogButton:eq("+ alertDialog.focused +")").removeClass("lastvisible");
						$(".dialogButton:eq("+ alertDialog.focused +")").next().addClass("lastvisible");
						var firstvisible = $(".dialogButton.firstvisible");
						firstvisible.removeClass("firstvisible");
						firstvisible.next().addClass("firstvisible");
						animating = true;
						$("#dialogWrapper").animate(
							{scrollTop: $("#dialogWrapper").scrollTop() + $(".dialogButton:eq("+ alertDialog.focused +")").outerHeight(true)},
							{
								duration:250,
								easing:"linear",
								complete:function(){
									animating = false;
									//handleAlertDialogArrows();
								},
								fail: function(){
									animating = false;
								}
							}
						);
					}
					alertDialog.focused++;
				}
				$(".dialogButton.focused").removeClass("focused");
				$(".dialogButton:eq("+ alertDialog.focused +")").addClass("focused");
				break;

			case VK_ENTER:
			case VK_BLUE:
			case VK_BACK:
			
				if( [VK_BACK, VK_BLUE].indexOf(keyCode) > -1 && alertDialog.cancel && typeof(alertDialog.cancel) == "function"){
					alertDialog.cancel().call();
				}
				if( keyCode == VK_ENTER && alertDialog.callback && typeof(alertDialog.callback) == "function"){
					alertDialog.callback(alertDialog.focused); // call handler for response
				}
				$("#dialog").html("");
				$("#dialog").removeClass("show");
				$("#dialog").addClass("hide");
				alertDialog.open = false;
				break;

			default:
				return false;
		}
		return true;
	}
	else{
		return false;
	}
}
