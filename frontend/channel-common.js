Channel.prototype.getGenre = function(genre) {
    if(typeof genre === 'string' && genre.substring(0,  "urn:dvb:metadata:cs:ContentSubject:2019:".length) == "urn:dvb:metadata:cs:ContentSubject:2019:") {
        var genre = genre.substring(genre.lastIndexOf(":")+1);
        if(genre == "1") {
            return "Movie/Drama";
        }
        else if(genre == "2") {
            return "News/Current affairs";
        }
        else if(genre == "3") {
            return "Show/Game show";
        }
        else if(genre == "4") {
            return "Sports";
        }
        else if(genre == "5") {
            return "Children's/Youth programmes";
        }
        else if(genre == "6") {
            return "Music/Ballet/Dance";
        }
        else if(genre == "7") {
            return "Arts/Culture";
        }
        else if(genre == "8") {
            return "Social/Political issues/Economics";
        }
        else if(genre == "9") {
            return "Education/Science/Factual topics";
        }
        else if(genre == "10") {
            return "Leisure hobbies";
        }
        else if(genre == "11") {
            return "Special characteristics";
        }
        else if(genre == "12") {
            return "Adult";
        }


    }
    return null; 
}

Channel.prototype.parseSchedule = function(data) {
    var newPrograms = [];     
    var parser = new DOMParser();
    var doc = parser.parseFromString(data,"text/xml");
    var events = doc.getElementsByTagName("ScheduleEvent");
    var programs = doc.getElementsByTagName("ProgramInformation");
    for(var i=0;i<events.length;i++) {      
        var program = {};
        var programId = events[i].getElementsByTagName("Program")[0].getAttribute("crid");
        program.start = events[i].getElementsByTagName("PublishedStartTime")[0].childNodes[0].nodeValue.toUTCDate();
        program.end  = iso6801end(events[i].getElementsByTagName("PublishedDuration")[0].childNodes[0].nodeValue, program.start);
        program.prglen = (program.end.getTime() - program.start.getTime())/(1000*60);
        for(var j=0;j<programs.length;j++) {
            if(programs[j].getAttribute("programId") == programId) {
                var description = programs[j].getElementsByTagName("BasicDescription")[0];
                program.title = description.getElementsByTagName("Title")[0].childNodes[0].nodeValue;
                var synopsis = description.getElementsByTagName("Synopsis")
                if(synopsis.length > 0) {
                    program.desc = synopsis[0].childNodes[0].nodeValue;
                }
                var genre = description.getElementsByTagName("Genre")
                if(genre.length > 0) {
                    var genreValue = this.getGenre(genre[0].getAttribute("href"));
                    if(genreValue != null) {
                        program.genre = genreValue;
                    }
                }
                var relatedMaterial =  description.getElementsByTagName("RelatedMaterial");
                for(var k=0;k<relatedMaterial.length;k++) {
                    var howRelated = relatedMaterial[k].getElementsByTagName("HowRelated")[0].getAttribute("href");
                    if(howRelated == "urn:tva:metadata:cs:HowRelatedCS:2012:19") { //Program still image
                        program.mediaimage = relatedMaterial[k].getElementsByTagName("MediaUri")[0].childNodes[0].nodeValue;
                        break;
                    }
                }
                break;
            }
        }
        var program = new Program(program, this.element_id + "_program_" + i, this);
        program.bilingual = this.bilingual;
        program.channelimage = this.image;
        program.channel_streamurl = this.streamurl;
        newPrograms.push(program);
    }
    return newPrograms;
}

Channel.prototype.getServiceRef = function() {
     return (this.contentGuideServiceRef) ? this.contentGuideServiceRef : this.id;
}

