const sourceTypes = {
    "urn:dvb:metadata:source:dvb-dash": "DVB-DASH",
    "urn:dvb:metadata:source:dvb-t":"DVB-T" ,
    "urn:dvb:metadata:source:dvb-s":"DVB-S" ,
    "urn:dvb:metadata:source:dvb-c":"DVB-C" ,
    "urn:dvb:metadata:source:dvb-iptv":"DVB-IPTV" ,
    "urn:dvb:metadata:source:application":"Application"
};

const polarizationTypes = {
    "horizontal": "Horizontal",
    "vertical":"Vertical" ,
    "left circular":"Left circular",
    "right circular":"Right circular"
};

function createTextInput(inputId, label) {
    var inputDiv = document.createElement('div');
    inputDiv.classList.add("form-group");
    var inputLabel = document.createElement('label');
    inputLabel.htmlFor = inputId;
    inputLabel.appendChild(document.createTextNode(label));
    inputDiv.appendChild(inputLabel);
    var inputElement = document.createElement('input');
    inputElement.classList.add("form-control");
    inputElement.type="text";
    inputElement.name=inputId;
    inputElement.id=inputId;
    inputDiv.appendChild(inputElement);
    return inputDiv;

}

function addServiceInstance(serviceId,instanceElement) {
    var service=document.getElementById('service_'+serviceId);
    var instanceId=parseInt(document.getElementById("service_"+serviceId+"_instances").value);
    document.getElementById("service_"+serviceId+"_instances").value = (instanceId+1);
    var instanceDiv=document.createElement('div');
    instanceDiv.id = "instance_"+serviceId+"_"+instanceId;
    instanceDiv.classList.add("serviceinstance");
    instanceDiv.classList.add("service_"+serviceId+"_instance");
    instanceDiv.appendChild(createTextInput("instance_"+serviceId+"_"+instanceId+"_priority","Priority"));
    instanceDiv.appendChild(document.createTextNode("Source Type"));
    newTextbox = document.createElement('select');
    newTextbox.onchange = function() {changeSourceType(instanceDiv.id)};
    newTextbox.name="instance_"+serviceId+"_"+instanceId+"_source_type";
    newTextbox.id="instance_"+serviceId+"_"+instanceId+"_source_type";
    
    for (var sourceType in sourceTypes) {
        var option = document.createElement("option");
        option.value = sourceType;
        option.text = sourceTypes[sourceType];
        newTextbox.appendChild(option);
    }

    instanceDiv.appendChild(newTextbox);
    var params =  document.createElement('div');
    params.classList.add("deliveryparameters");
    params.id="instance_"+serviceId+"_"+instanceId+"_deliveryparameters";
    instanceDiv.appendChild(params);

    newTextbox = document.createElement('a');
    newTextbox.href="javascript:removeElement('instance_"+serviceId+"_"+instanceId+"')";
    newTextbox.classList.add("btn","btn-outline-blue","btn-sm","mr-1");
    newTextbox.appendChild(document.createTextNode("Remove instance"));
    instanceDiv.appendChild(newTextbox);
    
    service.appendChild(instanceDiv);

    if(instanceElement != null) {
        document.getElementById("instance_"+serviceId+"_"+instanceId+"_priority").value = instanceElement.getAttribute("priority");
        var children = instanceElement.childNodes;
        for (var i = 0; i < children.length ;i++) {
            if(children[i].nodeName === "SourceType") {
                document.getElementById("instance_"+serviceId+"_"+instanceId+"_source_type").value = children[i].childNodes[0].nodeValue;
                changeSourceType(instanceDiv.id);
            }
            else if(children[i].nodeName === "DASHDeliveryParameters") {
                document.getElementById("instance_"+serviceId+"_"+instanceId+"_dash_uri").value = children[i].getElementsByTagName("URI")[0].childNodes[0].nodeValue;
            }
            else if(children[i].nodeName === "DVBTDeliveryParameters") {
                document.getElementById("instance_"+serviceId+"_"+instanceId+"_dvb_triplet").value = parseDvbTriplet(children[i].getElementsByTagName("DVBTriplet")[0]);
                document.getElementById("instance_"+serviceId+"_"+instanceId+"_target_country").value = children[i].getElementsByTagName("TargetCountry")[0].childNodes[0].nodeValue;
            }
            else if(children[i].nodeName === "DVBCDeliveryParameters") {
                document.getElementById("instance_"+serviceId+"_"+instanceId+"_dvb_triplet").value = parseDvbTriplet(children[i].getElementsByTagName("DVBTriplet")[0]);
                document.getElementById("instance_"+serviceId+"_"+instanceId+"_target_country").value = children[i].getElementsByTagName("TargetCountry")[0].childNodes[0].nodeValue;
                document.getElementById("instance_"+serviceId+"_"+instanceId+"_network_id").value = children[i].getElementsByTagName("NetworkID")[0].childNodes[0].nodeValue;
            }
            else if(children[i].nodeName === "DVBSDeliveryParameters") {
                document.getElementById("instance_"+serviceId+"_"+instanceId+"_dvb_triplet").value = parseDvbTriplet(children[i].getElementsByTagName("DVBTriplet")[0]);
                document.getElementById("instance_"+serviceId+"_"+instanceId+"_frequency").value = parseFloat(children[i].getElementsByTagName("Frequency")[0].childNodes[0].nodeValue)/100000.0;
                document.getElementById("instance_"+serviceId+"_"+instanceId+"_polarization").value = children[i].getElementsByTagName("Polarization")[0].childNodes[0].nodeValue;
                document.getElementById("instance_"+serviceId+"_"+instanceId+"_orbital_position").value = children[i].getElementsByTagName("OrbitalPosition")[0].childNodes[0].nodeValue;
            }
        }
    }
    else {
        changeSourceType(instanceDiv.id);
    }
}

function parseDvbTriplet(tripletElement) {
    var orgid = parseInt(tripletElement.getAttribute("origNetId")).toString(16);
    var tsid = parseInt(tripletElement.getAttribute("tsId")).toString(16);
    var sid = parseInt(tripletElement.getAttribute("serviceId")).toString(16);
    return orgid+"."+tsid+"."+sid;
}

function changeSourceType(serviceInstanceId) {
    var type = document.getElementById(serviceInstanceId+"_source_type").value;
    var params = document.getElementById(serviceInstanceId+"_deliveryparameters");
    //Remove previous content
    while (params.firstChild) {
        params.firstChild.remove();
    }
    if(type == "urn:dvb:metadata:source:dvb-dash") {
        params.appendChild(createTextInput(serviceInstanceId+"_dash_uri","DASH manifest URI"));
    }
    else if(type == "urn:dvb:metadata:source:dvb-iptv") {
        //TODO
    }
    else if(type == "urn:dvb:metadata:source:application") {
        //TODO
    }
    else { //DVB-T, DVB-C or DVB-S
        params.appendChild(createTextInput(serviceInstanceId+"_dvb_triplet","DVB Triplet (onid.tsid.sid) using hex values"));
        if(type == "urn:dvb:metadata:source:dvb-s") {
            params.appendChild(createTextInput(serviceInstanceId+"_orbital_position","Orbital Position"));
            params.appendChild(createTextInput(serviceInstanceId+"_frequency","Frequency in GHz"));
            params.appendChild(document.createTextNode("Polarization"));
            newTextbox = document.createElement('select');
            newTextbox.name=serviceInstanceId+"_polarization";
            newTextbox.id=serviceInstanceId+"_polarization";
    
            for (var polarization in polarizationTypes) {
                var option = document.createElement("option");
                option.value = polarization;
                option.text = polarizationTypes[polarization];
                newTextbox.appendChild(option);
            }

            params.appendChild(newTextbox);
        }
        else { //DVB-T or DVB-C, both have target country 
            params.appendChild(createTextInput(serviceInstanceId+"_target_country","Target Country"));
            if(type == "urn:dvb:metadata:source:dvb-c") {
                params.appendChild(createTextInput(serviceInstanceId+"_network_id","Network ID"));
            }
        } 
    }
 
}   

function addService(serviceElement) {
    var services=document.getElementById('services');
    var serviceId=parseInt(document.getElementById('service_count').value);
    document.getElementById('service_count').value = (serviceId+1);
    var serviceDiv=document.createElement('div');
    serviceDiv.id = "service_"+serviceId;
    serviceDiv.classList.add("service");
    
    var newTextbox = document.createElement('input');
    newTextbox.type="hidden";
    newTextbox.name="service_"+serviceId+"_instances";
    newTextbox.id="service_"+serviceId+"_instances";
    newTextbox.value = "0";
    serviceDiv.appendChild(newTextbox);
    
    serviceDiv.appendChild(createTextInput("service_"+serviceId+"_name","Service name"));
    serviceDiv.appendChild(createTextInput("service_"+serviceId+"_unique_id","Service Unique Identifier"));
    serviceDiv.appendChild(createTextInput("service_"+serviceId+"_version","Service version"));
    serviceDiv.appendChild(createTextInput("service_"+serviceId+"_provider","Service provider"));

    var newTextbox = document.createElement('a');
    newTextbox.href="javascript:addServiceInstance('"+serviceId+"')";
    newTextbox.classList.add("btn","btn-outline-blue","btn-sm","mr-1");
    newTextbox.appendChild(document.createTextNode("Add service instance"));
    serviceDiv.appendChild(newTextbox);

    var newTextbox = document.createElement('a');
    newTextbox.href="javascript:removeElement('service_"+serviceId+"')";
    newTextbox.appendChild(document.createTextNode("Remove service"));
    newTextbox.classList.add("btn","btn-outline-blue","btn-sm","mr-1");
    serviceDiv.appendChild(newTextbox);

    services.appendChild(serviceDiv);

    if(serviceElement != null) {
        document.getElementById("service_"+serviceId+"_version").value = serviceElement.getAttribute("version");
        var children = serviceElement.childNodes;
        for (var i = 0; i < children.length ;i++) {
            if(children[i].nodeName === "ServiceName") {
                document.getElementById("service_"+serviceId+"_name").value = children[i].childNodes[0].nodeValue;
            }
            else if(children[i].nodeName === "ProviderName") {
                document.getElementById("service_"+serviceId+"_provider").value = children[i].childNodes[0].nodeValue;
            }
            else if(children[i].nodeName === "UniqueIdentifier") {
                document.getElementById("service_"+serviceId+"_unique_id").value = children[i].childNodes[0].nodeValue;
            }
            else if(children[i].nodeName === "ServiceInstance") {
                try {
                    addServiceInstance(serviceId,children[i]);
                }
                catch(e) {
                    alert( "Error reading servicelist:"+e.message );
                }
            }
        }
    }
}

function removeElement(elementId) {
    var element = document.getElementById(elementId);
    element.parentNode.removeChild(element);
}

function showXML() {
     document.getElementById("xml").value = generateXML();
}

function generateXML() {

    var doc = document.implementation.createDocument(null, "ServiceList", null);

    var services = document.getElementsByClassName("service");
    var listName = doc.createElement("Name");
    listName.appendChild(doc.createTextNode(document.getElementById("name").value));
    doc.documentElement.appendChild(listName);

    var listProvider = doc.createElement("ProviderName");
    listProvider.appendChild(doc.createTextNode(document.getElementById("provider").value));
    doc.documentElement.appendChild(listProvider);

    doc.documentElement.setAttribute("version",document.getElementById("version").value);
    doc.documentElement.setAttribute("xmlns","urn:dvb:metadata:servicediscovery:2019");
    doc.documentElement.setAttribute("xmlns:xsi","http://www.w3.org/2001/XMLSchema-instance");
    doc.documentElement.setAttribute("xsi:schemaLocation","urn:dvb:metadata:servicediscovery:2019 ../dvbi_v1.0.xsd");
    doc.documentElement.setAttribute("xmlns:tva","urn:tva:metadata:2019");

    for(var i=0; i<services.length;i++) {
        var serviceId = services[i].id;
        var serviceElement = doc.createElement("Service");
        serviceElement.setAttribute("version",document.getElementById(serviceId+"_version").value);
        var nameElement = doc.createElement("UniqueIdentifier");
        nameElement.appendChild(doc.createTextNode(document.getElementById(serviceId+"_unique_id").value));
        serviceElement.appendChild(nameElement);
        
        var instances = document.getElementsByClassName(serviceId+"_instance");
        for(var j=0; j<instances.length;j++) {
            var instanceElement = generatetServiceInstance(instances[j],doc);
            serviceElement.appendChild(instanceElement);
        }
       
        nameElement = doc.createElement("ServiceName");
        nameElement.appendChild(doc.createTextNode(document.getElementById(serviceId+"_name").value));
        serviceElement.appendChild(nameElement);
        nameElement = doc.createElement("ProviderName");
        nameElement.appendChild(doc.createTextNode(document.getElementById(serviceId+"_provider").value));
        serviceElement.appendChild(nameElement);

        doc.documentElement.appendChild(serviceElement);

    }

    return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"+new XMLSerializer().serializeToString(doc.documentElement);
}


function generatetServiceInstance(instance,doc) {
    var instanceElement = doc.createElement("ServiceInstance");
    var instanceId = instance.id;
    instanceElement.setAttribute("priority",document.getElementById(instanceId+"_priority").value);
    var sourceTypeElement = doc.createElement("SourceType");
    var sourceType = document.getElementById(instanceId+"_source_type").value;
    sourceTypeElement.appendChild(doc.createTextNode(sourceType));
    instanceElement.appendChild(sourceTypeElement);

    if(sourceType === "urn:dvb:metadata:source:dvb-dash") {
        var deliveryParametersElement = doc.createElement("DASHDeliveryParameters");
        var locationElement = doc.createElement("UriBasedLocation");
        locationElement.setAttribute("contentType","application/dash+xml");
        var uriElement =  doc.createElement("URI");
        uriElement.appendChild(doc.createTextNode(document.getElementById(instanceId+"_dash_uri").value));
        locationElement.appendChild(uriElement);
        deliveryParametersElement.appendChild(locationElement);  
        instanceElement.appendChild(deliveryParametersElement);
    }
    else if(sourceType === "urn:dvb:metadata:source:dvb-t") {
        var deliveryParametersElement = doc.createElement("DVBTDeliveryParameters");
        deliveryParametersElement.appendChild(generateDVBTriplet(document.getElementById(instanceId+"_dvb_triplet").value,doc));
        var targetCountry = doc.createElement("TargetCountry");
        targetCountry.appendChild(doc.createTextNode(document.getElementById(instanceId+"_target_country").value));
        deliveryParametersElement.appendChild(targetCountry);
        instanceElement.appendChild(deliveryParametersElement);
    }
    else if(sourceType === "urn:dvb:metadata:source:dvb-c") {
        var deliveryParametersElement = doc.createElement("DVBCDeliveryParameters");
        deliveryParametersElement.appendChild(generateDVBTriplet(document.getElementById(instanceId+"_dvb_triplet").value,doc));
        var targetCountry = doc.createElement("TargetCountry");
        targetCountry.appendChild(doc.createTextNode(document.getElementById(instanceId+"_target_country").value));
        deliveryParametersElement.appendChild(targetCountry);
        var networkId = doc.createElement("NetworkID");
        networkId.appendChild(doc.createTextNode(document.getElementById(instanceId+"_network_id").value));
        deliveryParametersElement.appendChild(networkId);
        instanceElement.appendChild(deliveryParametersElement);
    }
    else if(sourceType === "urn:dvb:metadata:source:dvb-s") {
        var deliveryParametersElement = doc.createElement("DVBSDeliveryParameters");
        deliveryParametersElement.appendChild(generateDVBTriplet(document.getElementById(instanceId+"_dvb_triplet").value,doc));
        var parameter = doc.createElement("OrbitalPosition");
        parameter.appendChild(doc.createTextNode(document.getElementById(instanceId+"_orbital_position").value));
        deliveryParametersElement.appendChild(parameter);
        var parameter = doc.createElement("Frequency");
        var freq = parseFloat(document.getElementById(instanceId+"_frequency").value)*100000;
        parameter.appendChild(doc.createTextNode(freq));
        deliveryParametersElement.appendChild(parameter);
        var parameter = doc.createElement("Polarization");
        parameter.appendChild(doc.createTextNode(document.getElementById(instanceId+"_polarization").value));
        deliveryParametersElement.appendChild(parameter);

        instanceElement.appendChild(deliveryParametersElement);
    }
    return instanceElement;
}

function generateDVBTriplet(input,doc) {
    var tripletElement = doc.createElement("DVBTriplet");
    var res = input.split(".");
    var onid = parseInt(res[0],16);
    var tsid = parseInt(res[1],16);
    var sid = parseInt(res[2],16);
    tripletElement.setAttribute("origNetId",onid);
    tripletElement.setAttribute("tsId",tsid);
    tripletElement.setAttribute("serviceId",sid);
    return tripletElement;
}

function listSavedServicelists() {
    $.getJSON( "saved_lists.php", function( data ) {
      var items = [];
      $('#saved_servicelists').empty();
      var targetElement = document.getElementById("saved_servicelists");
      $.each( data, function( val ) {
        var newTextbox = document.createElement('a');
        newTextbox.href="javascript:loadServicelist('"+this+"')";
        newTextbox.classList.add("btn-sm","mb-1");
        newTextbox.appendChild(document.createTextNode( this.substr("./servicelists/".length)));
        targetElement.appendChild(newTextbox);
        var newTextbox = document.createElement('a');
        newTextbox.href="javascript:loadServicelist('"+this+"')";
        newTextbox.appendChild(document.createTextNode( "Edit" ));
        newTextbox.classList.add("btn","btn-outline-blue","btn-sm","mb-1","mr-1");
        targetElement.appendChild(newTextbox);
        var newTextbox = document.createElement('a');
        newTextbox.href=this;
        newTextbox.appendChild(document.createTextNode("Open"));
        newTextbox.classList.add("btn","btn-outline-blue","btn-sm","mb-1","mr-1");
        targetElement.appendChild(newTextbox);
        var newTextbox = document.createElement('a');
        newTextbox.href="javascript:deleteServicelist('"+this+"')";
        newTextbox.appendChild(document.createTextNode("Delete"));
        newTextbox.classList.add("btn","btn-outline-blue","btn-sm","mb-1");
        targetElement.appendChild(newTextbox);
        targetElement.appendChild(document.createElement('hr'));
      });
    });
}

function uploadServicelist() {
    $.post( "upload_servicelist.php", { servicelist: generateXML(), filename: document.getElementById('filename').value })
      .done(function( data ) {
        alert( "Servicelist saved!" );
        listSavedServicelists();
      })
      .fail(function(data) {
        alert( "Error saving servicelist:"+data.responseText );
      });
}

function loadServicelist(list) {
    $.get( list, function( data ) {
        var parser;
        var doc;

        if (window.DOMParser) {
          parser = new DOMParser();
          doc = parser.parseFromString(data,"text/xml");
        } else {
          doc = new ActiveXObject("Microsoft.XMLDOM");
          doc.async = false;
          doc.loadXML(data); 
        } 
        $('#services').empty();
        document.getElementById('service_count').value = 0;
        document.getElementById("version").value = doc.documentElement.getAttribute("version");
        var children = doc.documentElement.childNodes;
        for (var i = 0; i < children.length ;i++) {
            if(children[i].nodeName === "Name") {
                document.getElementById("name").value = children[i].childNodes[0].nodeValue;
            }
            else if(children[i].nodeName === "ProviderName") {
                document.getElementById("provider").value = children[i].childNodes[0].nodeValue;
            }
            else if(children[i].nodeName === "Service") {
                try {
                    addService(children[i]);
                } 
                catch(e) {
                    alert( "Error reading servicelist:"+e.message );
                }
            }
        }
        
    },"text");
}

function deleteServicelist(list) {
    $.post( "delete_servicelist.php", { servicelist: list })
      .done(function( data ) {
        alert( "Servicelist deleted!" );
        listSavedServicelists();
      })
      .fail(function(data) {
        alert( "Error deleting servicelist:"+data.responseText );
      });
}

