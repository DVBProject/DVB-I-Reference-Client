function addServiceInstance(serviceId,instanceElement) {
    var service=document.getElementById('service_'+serviceId);
    var instanceId=parseInt(document.getElementById("service_"+serviceId+"_instances").value);
    document.getElementById("service_"+serviceId+"_instances").value = (instanceId+1);
    var instanceDiv=document.createElement('div');
    instanceDiv.id = "instance_"+serviceId+"_"+instanceId;
    instanceDiv.classList.add("serviceinstance");
    instanceDiv.classList.add("service_"+serviceId+"_instance");
    
    instanceDiv.appendChild(document.createTextNode("Priority"));
    var newTextbox = document.createElement('input');
    newTextbox.type="text";
    newTextbox.name="instance_"+serviceId+"_"+instanceId+"_priority";
    newTextbox.id="instance_"+serviceId+"_"+instanceId+"_priority";
    instanceDiv.appendChild(newTextbox);
    instanceDiv.appendChild(document.createElement('br'));

    instanceDiv.appendChild(document.createTextNode("Source Type"));
    newTextbox = document.createElement('select');
    newTextbox.name="instance_"+serviceId+"_"+instanceId+"_source_type";
    newTextbox.id="instance_"+serviceId+"_"+instanceId+"_source_type";
    
    var option = document.createElement("option");
    option.value = "urn:dvb:metadata:source:dvb-dash";
    option.text = "DVB-DASH";
    newTextbox.appendChild(option);

    option = document.createElement("option");
    option.value = "urn:dvb:metadata:source:dvb-t";
    option.text = "DVB-T";
    option.disabled = true;
    newTextbox.appendChild(option);

    option = document.createElement("option");
    option.value = "urn:dvb:metadata:source:dvb-s";
    option.text = "DVB-S";
    option.disabled = true;
    newTextbox.appendChild(option);

    option = document.createElement("option");
    option.value = "urn:dvb:metadata:source:dvb-c";
    option.text = "DVB-C";
    option.disabled = true;
    newTextbox.appendChild(option);

    option = document.createElement("option");
    option.value = "urn:dvb:metadata:source:dvb-iptv";
    option.text = "DVB-IPTV";
    option.disabled = true;
    newTextbox.appendChild(option);

    option = document.createElement("option");
    option.value = "urn:dvb:metadata:source:application";
    option.text = "Application";
    option.disabled = true;
    newTextbox.appendChild(option);

    instanceDiv.appendChild(newTextbox);
    instanceDiv.appendChild(document.createElement('br'));

    instanceDiv.appendChild(document.createTextNode("DASH manifest URI"));
    newTextbox = document.createElement('input');
    newTextbox.type="text";
    newTextbox.name="instance_"+serviceId+"_"+instanceId+"_dash_uri";
    newTextbox.id="instance_"+serviceId+"_"+instanceId+"_dash_uri";
    instanceDiv.appendChild(newTextbox);
    instanceDiv.appendChild(document.createElement('br'));

    newTextbox = document.createElement('a');
    newTextbox.href="javascript:removeElement('instance_"+serviceId+"_"+instanceId+"')";
    newTextbox.appendChild(document.createTextNode("Remove instance"));
    instanceDiv.appendChild(newTextbox);
    
    service.appendChild(instanceDiv);

    if(instanceElement != null) {
        document.getElementById("instance_"+serviceId+"_"+instanceId+"_priority").value = instanceElement.getAttribute("priority");
        var children = instanceElement.childNodes;
        for (var i = 0; i < children.length ;i++) {
            if(children[i].nodeName === "SourceType") {
                document.getElementById("instance_"+serviceId+"_"+instanceId+"_source_type").value = children[i].childNodes[0].nodeValue;
            }
            else if(children[i].nodeName === "DASHDeliveryParameters") {
                document.getElementById("instance_"+serviceId+"_"+instanceId+"_dash_uri").value = children[i].childNodes[0].childNodes[0].childNodes[0].nodeValue
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
    
    serviceDiv.appendChild(document.createTextNode("Service name"));
    var newTextbox = document.createElement('input');
    newTextbox.type="text";
    newTextbox.name="service_"+serviceId+"_name";
    newTextbox.id="service_"+serviceId+"_name";
    serviceDiv.appendChild(newTextbox);
    serviceDiv.appendChild(document.createElement('br'));

    serviceDiv.appendChild(document.createTextNode("Service Unique Identifier"));
    var newTextbox = document.createElement('input');
    newTextbox.type="text";
    newTextbox.name="service_"+serviceId+"_unique_id";
    newTextbox.id="service_"+serviceId+"_unique_id";
    serviceDiv.appendChild(newTextbox);
    serviceDiv.appendChild(document.createElement('br'));

    serviceDiv.appendChild(document.createTextNode("Service version"));
    var newTextbox = document.createElement('input');
    newTextbox.type="text";
    newTextbox.name="service_"+serviceId+"_version";
    newTextbox.id="service_"+serviceId+"_version";
    serviceDiv.appendChild(newTextbox);
    serviceDiv.appendChild(document.createElement('br'));

    serviceDiv.appendChild(document.createTextNode("Service provider"));
    var newTextbox = document.createElement('input');
    newTextbox.type="text";
    newTextbox.name="service_"+serviceId+"_provider";
    newTextbox.id="service_"+serviceId+"_provider";
    serviceDiv.appendChild(newTextbox);
    serviceDiv.appendChild(document.createElement('br'));

    var newTextbox = document.createElement('a');
    newTextbox.href="javascript:addServiceInstance('"+serviceId+"')";
    newTextbox.appendChild(document.createTextNode("Add service instance"));
    serviceDiv.appendChild(newTextbox);

    var newTextbox = document.createElement('a');
    newTextbox.href="javascript:removeElement('service_"+serviceId+"')";
    newTextbox.appendChild(document.createTextNode("Remove service"));
    serviceDiv.appendChild(newTextbox);

    services.appendChild(serviceDiv);

    if(serviceElement != null) {
        console.log("Populate service!");
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
                console.log("Add ServiceInstance");
                addServiceInstance(serviceId,children[i]);            
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
    return instanceElement;
}

function listSavedServicelists() {
    $.getJSON( "saved_lists.php", function( data ) {
      var items = [];
      $('#saved_servicelists').empty();
      var targetElement = document.getElementById("saved_servicelists");
      $.each( data, function( val ) {
        var newTextbox = document.createElement('a');
        newTextbox.href="javascript:loadServicelist('"+this+"')";
        newTextbox.appendChild(document.createTextNode("Edit "+this.substr("./servicelists/".length)));
        targetElement.appendChild(newTextbox);
        var newTextbox = document.createElement('a');
        newTextbox.href=this;
        newTextbox.appendChild(document.createTextNode("Open "+this.substr("./servicelists/".length)));
        targetElement.appendChild(newTextbox);
        targetElement.appendChild(document.createElement('br'));
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
                addService(children[i]);            
            }
        }
        
    },"text");
}

