var OPEN_SUBITLES_STRING = "open";

function mapValues(vals, map) {
  function mapValue(val) {
    var found = map.find((e) => e.value == val);
    return found ? found.definition : "!err!";
  }
  var typ = datatypeIs(vals);
  if (typ == "array") {
    if (vals.length == 0) return null;
    let res = [];
    for (var i = 0; i < vals.length; i++) res.push(mapValue(vals[i]));
    return res;
  } else if (typ == "string") {
    return vals == "" ? null : mapValue(vals);
  }
  return null;
}

var TVASubtitleCarriageCSuri = "urn:tva:metadata:cs:SubtitleCarriageCS:2023";
var TVASubtitleCarriageCSmap = [
  { value: `${TVASubtitleCarriageCSuri}:1`, definition: "app" },
  { value: `${TVASubtitleCarriageCSuri}:2.1`, definition: "ttml" },
  { value: `${TVASubtitleCarriageCSuri}:3`, definition: "isobmff" },
  { value: `${TVASubtitleCarriageCSuri}:4`, definition: "standalone" },
  { value: `${TVASubtitleCarriageCSuri}:5`, definition: OPEN_SUBITLES_STRING },
  { value: `${TVASubtitleCarriageCSuri}:99`, definition: "other" },
];
function SubtitleCarriageCS(vals) {
  return mapValues(vals, TVASubtitleCarriageCSmap);
}

var TVASubtitleCodingCSuri = "urn:tva:metadata:cs:SubtitleCodingFormatCS:2023";
var TVASubtitleCodingCSmap = [
  { value: `${TVASubtitleCodingCSuri}:1`, definition: "WST" },
  { value: `${TVASubtitleCodingCSuri}:2.1.2`, definition: "DVB bmp 1.2.1" },
  { value: `${TVASubtitleCodingCSuri}:2.1.3`, definition: "DVB bmp 1.3.1" },
  { value: `${TVASubtitleCodingCSuri}:2.1.4`, definition: "DVB bmp 1.5.1" },
  { value: `${TVASubtitleCodingCSuri}:2.1.5`, definition: "DVB bmp 1.6.1" },
  { value: `${TVASubtitleCodingCSuri}:2.2`, definition: "DVB char" },
  { value: `${TVASubtitleCodingCSuri}:3.1`, definition: "EBU-TT" },
  { value: `${TVASubtitleCodingCSuri}:3.2.1`, definition: "EBU-TT-D 1.0" },
  { value: `${TVASubtitleCodingCSuri}:3.2.2`, definition: "EBU-TT-D 1.0.1" },
  { value: `${TVASubtitleCodingCSuri}:3.3`, definition: "SMPTE-TT" },
  { value: `${TVASubtitleCodingCSuri}:3.4.1`, definition: "CFF-TT-t" },
  { value: `${TVASubtitleCodingCSuri}:3.4.2`, definition: "CFF-TT-i" },
  { value: `${TVASubtitleCodingCSuri}:3.5`, definition: "SDP-US" },
  { value: `${TVASubtitleCodingCSuri}:3.6.1.1`, definition: "IMSC-t 1.0" },
  { value: `${TVASubtitleCodingCSuri}:3.6.1.2`, definition: "IMSC-t 1.0.1" },
  { value: `${TVASubtitleCodingCSuri}:3.6.1.3`, definition: "IMSC-t 1.1" },
  { value: `${TVASubtitleCodingCSuri}:3.6.1.4`, definition: "IMSC-t 1.2" },
  { value: `${TVASubtitleCodingCSuri}:3.6.2.1`, definition: "IMSC-i 1.0" },
  { value: `${TVASubtitleCodingCSuri}:3.6.2.2`, definition: "IMSC-i 1.0.1" },
  { value: `${TVASubtitleCodingCSuri}:3.6.2.3`, definition: "IMSC-i 1.1" },
  { value: `${TVASubtitleCodingCSuri}:3.6.2.4`, definition: "IMSC-i 1.2" },
  { value: `${TVASubtitleCodingCSuri}:3.7`, definition: "ARIB-TT" },
  { value: `${TVASubtitleCodingCSuri}:4`, definition: "WebVTT" },
  { value: `${TVASubtitleCodingCSuri}:5`, definition: "SRT" },
  { value: `${TVASubtitleCodingCSuri}:8`, definition: "app" },
  { value: `${TVASubtitleCodingCSuri}:9`, definition: "open" },
  { value: `${TVASubtitleCodingCSuri}:99`, definition: "other" },
];
function SubtitleCodingCS(vals) {
  return mapValues(vals, TVASubtitleCodingCSmap);
}

var MPEG7AudioPresentationCSuri = "urn:mpeg:mpeg7:cs:AudioPresentationCS:2007";
var MPEG7AudioPresentationCSmap = [
  { value: `${MPEG7AudioPresentationCSuri}:1`, definition: "none" },
  { value: `${MPEG7AudioPresentationCSuri}:2`, definition: "mono" },
  { value: `${MPEG7AudioPresentationCSuri}:3`, definition: "stereo" },
  { value: `${MPEG7AudioPresentationCSuri}:4`, definition: "surround" },
  { value: `${MPEG7AudioPresentationCSuri}:5`, definition: "home" },
  { value: `${MPEG7AudioPresentationCSuri}:6`, definition: "movie" },
];
function AudioPresentationCS(vals) {
  return mapValues(vals, MPEG7AudioPresentationCSmap);
}

var MPEG7AudioCodingCSuri = "urn:mpeg:mpeg7:cs:AudioCodingFormatCS:2001";
var MPEG7AudioCodingCSmap = [
  { value: `${MPEG7AudioCodingCSuri}:1`, definition: "AC3" },
  { value: `${MPEG7AudioCodingCSuri}:2`, definition: "DTS" },
  { value: `${MPEG7AudioCodingCSuri}:3.1`, definition: "MP1-L1" },
  { value: `${MPEG7AudioCodingCSuri}:3.2`, definition: "MP1-L1" },
  { value: `${MPEG7AudioCodingCSuri}:3.3`, definition: "MP1-L1" },
  { value: `${MPEG7AudioCodingCSuri}:4.1.1`, definition: "MP2-LSR-L1" },
  { value: `${MPEG7AudioCodingCSuri}:4.1.2`, definition: "MP2-LSR-L2" },
  { value: `${MPEG7AudioCodingCSuri}:4.1.3`, definition: "MP2-LSR-L3" },
  { value: `${MPEG7AudioCodingCSuri}:4.2.1`, definition: "MP2-BCmc-L1" },
  { value: `${MPEG7AudioCodingCSuri}:4.2.2`, definition: "MP2-BCmc-L2" },
  { value: `${MPEG7AudioCodingCSuri}:4.2.3`, definition: "MP2-BCmc-L3" },
  { value: `${MPEG7AudioCodingCSuri}:4.3.1`, definition: "AAC-LC" },
  { value: `${MPEG7AudioCodingCSuri}:4.3.2`, definition: "AAC-MP" },
  { value: `${MPEG7AudioCodingCSuri}:4.3.3`, definition: "AAC=SP" },
  { value: `${MPEG7AudioCodingCSuri}:4.4`, definition: "MP3" },
  { value: `${MPEG7AudioCodingCSuri}:5.1.1`, definition: "MP4-Synth-L1" },
  { value: `${MPEG7AudioCodingCSuri}:5.1.2`, definition: "MP4-Synth-L2" },
  { value: `${MPEG7AudioCodingCSuri}:5.1.3`, definition: "MP4-Synth-L3" },
  { value: `${MPEG7AudioCodingCSuri}:5.2.1`, definition: "MP4-Speech-L1" },
  { value: `${MPEG7AudioCodingCSuri}:5.2.2`, definition: "MP4-Speech-L2" },
  { value: `${MPEG7AudioCodingCSuri}:5.3.1`, definition: "MP4-Scale-L1" },
  { value: `${MPEG7AudioCodingCSuri}:5.3.2`, definition: "MP4-Scale-L2" },
  { value: `${MPEG7AudioCodingCSuri}:5.3.3`, definition: "MP4-Scale-L3" },
  { value: `${MPEG7AudioCodingCSuri}:5.3.4`, definition: "MP4-Scale-L4" },
  { value: `${MPEG7AudioCodingCSuri}:5.4.1`, definition: "MP4-Main-L1" },
  { value: `${MPEG7AudioCodingCSuri}:5.4.2`, definition: "MP4-Main-L2" },
  { value: `${MPEG7AudioCodingCSuri}:5.4.3`, definition: "MP4-Main-L3" },
  { value: `${MPEG7AudioCodingCSuri}:5.4.4`, definition: "MP4-Main-L4" },
  { value: `${MPEG7AudioCodingCSuri}:5.5.1`, definition: "MP4-HQ-L1" },
  { value: `${MPEG7AudioCodingCSuri}:5.5.2`, definition: "MP4-HQ-L2" },
  { value: `${MPEG7AudioCodingCSuri}:5.5.3`, definition: "MP4-HQ-L3" },
  { value: `${MPEG7AudioCodingCSuri}:5.5.4`, definition: "MP4-HQ-L4" },
  { value: `${MPEG7AudioCodingCSuri}:5.5.5`, definition: "MP4-HQ-L5" },
  { value: `${MPEG7AudioCodingCSuri}:5.5.6`, definition: "MP4-HQ-L6" },
  { value: `${MPEG7AudioCodingCSuri}:5.5.7`, definition: "MP4-HQ-L7" },
  { value: `${MPEG7AudioCodingCSuri}:5.5.8`, definition: "MP4-HQ-L8" },
  { value: `${MPEG7AudioCodingCSuri}:5.6.1`, definition: "MP4-LD-L1" },
  { value: `${MPEG7AudioCodingCSuri}:5.6.2`, definition: "MP4-LD-L2" },
  { value: `${MPEG7AudioCodingCSuri}:5.6.3`, definition: "MP4-LD-L3" },
  { value: `${MPEG7AudioCodingCSuri}:5.6.4`, definition: "MP4-LD-L4" },
  { value: `${MPEG7AudioCodingCSuri}:5.6.5`, definition: "MP4-LD-L5" },
  { value: `${MPEG7AudioCodingCSuri}:5.6.6`, definition: "MP4-LD-L6" },
  { value: `${MPEG7AudioCodingCSuri}:5.6.7`, definition: "MP4-LD-L7" },
  { value: `${MPEG7AudioCodingCSuri}:5.6.8`, definition: "MP4-LD-L8" },
  { value: `${MPEG7AudioCodingCSuri}:5.7.1`, definition: "MP4-NA-L1" },
  { value: `${MPEG7AudioCodingCSuri}:5.7.2`, definition: "MP4-NA-L2" },
  { value: `${MPEG7AudioCodingCSuri}:5.7.3`, definition: "MP4-NA-L3" },
  { value: `${MPEG7AudioCodingCSuri}:5.7.4`, definition: "MP4-NA-L4" },
  { value: `${MPEG7AudioCodingCSuri}:5.8.1`, definition: "MP4-MAI-L1" },
  { value: `${MPEG7AudioCodingCSuri}:5.8.2`, definition: "MP4-MAI-L2" },
  { value: `${MPEG7AudioCodingCSuri}:5.8.3`, definition: "MP4-MAI-L3" },
  { value: `${MPEG7AudioCodingCSuri}:5.8.4`, definition: "MP4-MAI-L4" },
  { value: `${MPEG7AudioCodingCSuri}:5.8.5`, definition: "MP4-MAI-L5" },
  { value: `${MPEG7AudioCodingCSuri}:5.8.6`, definition: "MP4-MAI-L6" },
  { value: `${MPEG7AudioCodingCSuri}:6`, definition: "AMR" },
  { value: `${MPEG7AudioCodingCSuri}:7.1`, definition: "G.723" },
  { value: `${MPEG7AudioCodingCSuri}:7.2`, definition: "G.726" },
  { value: `${MPEG7AudioCodingCSuri}:7.3`, definition: "G.728" },
  { value: `${MPEG7AudioCodingCSuri}:7.4`, definition: "G.729" },
  { value: `${MPEG7AudioCodingCSuri}:8`, definition: "PCM" },
  { value: `${MPEG7AudioCodingCSuri}:10`, definition: "ATRAC" },
  { value: `${MPEG7AudioCodingCSuri}:11`, definition: "ATRAC2" },
  { value: `${MPEG7AudioCodingCSuri}:12`, definition: "ATRAC3" },
];

var DVBAudioCodecCS2007uri = "urn:dvb:metadata:cs:AudioCodecCS:2007";
var DVBAudioCodecCS2007map = [
  { value: `${DVBAudioCodecCS2007uri}:1.1.1`, definition: "MP4-Adv-L1" },
  { value: `${DVBAudioCodecCS2007uri}:1.1.2`, definition: "MP4-Adv-L2" },
  { value: `${DVBAudioCodecCS2007uri}:1.1.3`, definition: "MP4-Adv-L4" },
  { value: `${DVBAudioCodecCS2007uri}:1.1.4`, definition: "MP4-Adv-L5" },
  { value: `${DVBAudioCodecCS2007uri}:1.2.2`, definition: "MP4-HE-L2" },
  { value: `${DVBAudioCodecCS2007uri}:1.2.3`, definition: "MP4-HE-L3" },
  { value: `${DVBAudioCodecCS2007uri}:1.2.4`, definition: "MP4-HE-L4" },
  { value: `${DVBAudioCodecCS2007uri}:1.2.5`, definition: "MP4-HE-L5" },
  { value: `${DVBAudioCodecCS2007uri}:1.2.5`, definition: "MP4-HE-L5" },
  { value: `${DVBAudioCodecCS2007uri}:1.3.2`, definition: "MP4-HEv2-L2" },
  { value: `${DVBAudioCodecCS2007uri}:1.3.3`, definition: "MP4-HEv2-L3" },
  { value: `${DVBAudioCodecCS2007uri}:1.3.4`, definition: "MP4-HEv2-L4" },
  { value: `${DVBAudioCodecCS2007uri}:1.3.5`, definition: "MP4-HEv2-L5" },
  { value: `${DVBAudioCodecCS2007uri}:2.1`, definition: "AMR-WB+" },
  { value: `${DVBAudioCodecCS2007uri}:3.1`, definition: "E-AC3" },
];

var DVBAudioCodecCS2020uri = "urn:dvb:metadata:cs:AudioCodecCS:2020";
var DVBAudioCodecCS2020map = [
  { value: `${DVBAudioCodecCS2020uri}:1.1.1`, definition: "MP4-Adv-L1" },
  { value: `${DVBAudioCodecCS2020uri}:1.1.2`, definition: "MP4-Adv-L2" },
  { value: `${DVBAudioCodecCS2020uri}:1.1.3`, definition: "MP4-Adv-L4" },
  { value: `${DVBAudioCodecCS2020uri}:1.1.4`, definition: "MP4-Adv-L5" },
  { value: `${DVBAudioCodecCS2020uri}:1.2.2`, definition: "MP4-HE-L2" },
  { value: `${DVBAudioCodecCS2020uri}:1.2.3`, definition: "MP4-HE-L3" },
  { value: `${DVBAudioCodecCS2020uri}:1.2.4`, definition: "MP4-HE-L4" },
  { value: `${DVBAudioCodecCS2020uri}:1.2.5`, definition: "MP4-HE-L5" },
  { value: `${DVBAudioCodecCS2020uri}:1.3.2`, definition: "MP4-HEv2-L2" },
  { value: `${DVBAudioCodecCS2020uri}:1.3.3`, definition: "MP4-HEv2-L3" },
  { value: `${DVBAudioCodecCS2020uri}:1.3.4`, definition: "MP4-HEv2-L4" },
  { value: `${DVBAudioCodecCS2020uri}:1.3.5`, definition: "MP4-HEv2-L5" },
  { value: `${DVBAudioCodecCS2020uri}:2.1`, definition: "AMR-WB+" },
  { value: `${DVBAudioCodecCS2020uri}:3.1`, definition: "E-AC3" },
  { value: `${DVBAudioCodecCS2020uri}:4.1.1`, definition: "AC4-CIP-L0" },
  { value: `${DVBAudioCodecCS2020uri}:4.1.2`, definition: "AC4-CIP-L1" },
  { value: `${DVBAudioCodecCS2020uri}:4.1.3`, definition: "AC4-CIP-L2" },
  { value: `${DVBAudioCodecCS2020uri}:4.1.4`, definition: "AC4-CIP-L3" },
  { value: `${DVBAudioCodecCS2020uri}:5.1.1`, definition: "DTS-HD Core" },
  { value: `${DVBAudioCodecCS2020uri}:5.1.2`, definition: "DTS-HD LBR" },
  { value: `${DVBAudioCodecCS2020uri}:5.1.3`, definition: "DTS-HD Core+Ext" },
  { value: `${DVBAudioCodecCS2020uri}:5.1.4`, definition: "DTS-HD Lossless" },
  { value: `${DVBAudioCodecCS2020uri}:5.2.1`, definition: "DTS-UHD 2" },
  { value: `${DVBAudioCodecCS2020uri}:5.2.2`, definition: "DTS-UHD 3" },
  { value: `${DVBAudioCodecCS2020uri}:6.1.1`, definition: "MPEG-H 3D LC-1" },
  { value: `${DVBAudioCodecCS2020uri}:6.1.2`, definition: "MPEG-H 3D LC-2" },
  { value: `${DVBAudioCodecCS2020uri}:6.1.3`, definition: "MPEG-H 3D LC-3" },
];
var AllAudioTerms = MPEG7AudioCodingCSmap.concat(DVBAudioCodecCS2020map).concat(DVBAudioCodecCS2007map);
function AudioCodingCS(vals) {
  return mapValues(vals, AllAudioTerms);
}

var DVBVideoCodecCSuri = "urn:dvb:metadata:cs:VideoCodecCS:2022";
var DVBVideoCodecCSmap = [
  { value: `${DVBVideoCodecCSuri}:1.1.1`, definition: "H.264-base-L1" },
  { value: `${DVBVideoCodecCSuri}:1.1.2`, definition: "H.264-base-L1b" },
  { value: `${DVBVideoCodecCSuri}:1.1.3`, definition: "H.264-base-L1.1" },
  { value: `${DVBVideoCodecCSuri}:1.1.4`, definition: "H.264-base-L1.2" },
  { value: `${DVBVideoCodecCSuri}:1.1.5`, definition: "H.264-base-L1.3" },
  { value: `${DVBVideoCodecCSuri}:1.1.6`, definition: "H.264-base-L2" },
  { value: `${DVBVideoCodecCSuri}:1.1.7`, definition: "H.264-base-L2.1" },
  { value: `${DVBVideoCodecCSuri}:1.1.8`, definition: "H.264-base-L2.2" },
  { value: `${DVBVideoCodecCSuri}:1.1.9`, definition: "H.264-base-L3" },
  { value: `${DVBVideoCodecCSuri}:1.1.10`, definition: "H.264-base-L3.1" },
  { value: `${DVBVideoCodecCSuri}:1.1.11`, definition: "H.264-base-L3.2" },
  { value: `${DVBVideoCodecCSuri}:1.1.12`, definition: "H.264-base-L4" },
  { value: `${DVBVideoCodecCSuri}:1.1.13`, definition: "H.264-base-L4.1" },
  { value: `${DVBVideoCodecCSuri}:1.1.14`, definition: "H.264-base-L4.2" },
  { value: `${DVBVideoCodecCSuri}:1.1.15`, definition: "H.264-base-L4" },
  { value: `${DVBVideoCodecCSuri}:1.1.16`, definition: "H.264-base-L5.1" },
  { value: `${DVBVideoCodecCSuri}:1.2.1`, definition: "H.264-main-L1" },
  { value: `${DVBVideoCodecCSuri}:1.2.2`, definition: "H.264-main-L1b" },
  { value: `${DVBVideoCodecCSuri}:1.2.3`, definition: "H.264-main-L1.1" },
  { value: `${DVBVideoCodecCSuri}:1.2.4`, definition: "H.264-main-L1.2" },
  { value: `${DVBVideoCodecCSuri}:1.2.5`, definition: "H.264-main-L1.3" },
  { value: `${DVBVideoCodecCSuri}:1.2.6`, definition: "H.264-main-L2" },
  { value: `${DVBVideoCodecCSuri}:1.2.7`, definition: "H.264-main-L2.1" },
  { value: `${DVBVideoCodecCSuri}:1.2.8`, definition: "H.264-main-L2.2" },
  { value: `${DVBVideoCodecCSuri}:1.2.9`, definition: "H.264-main-L3" },
  { value: `${DVBVideoCodecCSuri}:1.2.10`, definition: "H.264-main-L3.1" },
  { value: `${DVBVideoCodecCSuri}:1.2.11`, definition: "H.264-main-L3.2" },
  { value: `${DVBVideoCodecCSuri}:1.2.12`, definition: "H.264-main-L4" },
  { value: `${DVBVideoCodecCSuri}:1.2.13`, definition: "H.264-main-L4.1" },
  { value: `${DVBVideoCodecCSuri}:1.2.14`, definition: "H.264-main-L4.2" },
  { value: `${DVBVideoCodecCSuri}:1.2.15`, definition: "H.264-main-L4" },
  { value: `${DVBVideoCodecCSuri}:1.2.16`, definition: "H.264-main-L5.1" },
  { value: `${DVBVideoCodecCSuri}:1.3.1`, definition: "H.264-ext-L1" },
  { value: `${DVBVideoCodecCSuri}:1.3.2`, definition: "H.264-ext-L1b" },
  { value: `${DVBVideoCodecCSuri}:1.3.3`, definition: "H.264-ext-L1.1" },
  { value: `${DVBVideoCodecCSuri}:1.3.4`, definition: "H.264-ext-L1.2" },
  { value: `${DVBVideoCodecCSuri}:1.3.5`, definition: "H.264-ext-L1.3" },
  { value: `${DVBVideoCodecCSuri}:1.3.6`, definition: "H.264-ext-L2" },
  { value: `${DVBVideoCodecCSuri}:1.3.7`, definition: "H.264-ext-L2.1" },
  { value: `${DVBVideoCodecCSuri}:1.3.8`, definition: "H.264-ext-L2.2" },
  { value: `${DVBVideoCodecCSuri}:1.3.9`, definition: "H.264-ext-L3" },
  { value: `${DVBVideoCodecCSuri}:1.3.10`, definition: "H.264-ext-L3.1" },
  { value: `${DVBVideoCodecCSuri}:1.3.11`, definition: "H.264-ext-L3.2" },
  { value: `${DVBVideoCodecCSuri}:1.3.12`, definition: "H.264-ext-L4" },
  { value: `${DVBVideoCodecCSuri}:1.3.13`, definition: "H.264-ext-L4.1" },
  { value: `${DVBVideoCodecCSuri}:1.3.14`, definition: "H.264-ext-L4.2" },
  { value: `${DVBVideoCodecCSuri}:1.3.15`, definition: "H.264-ext-L4" },
  { value: `${DVBVideoCodecCSuri}:1.3.16`, definition: "H.264-ext-L5.1" },
  { value: `${DVBVideoCodecCSuri}:1.4.1`, definition: "H.264-high-L1" },
  { value: `${DVBVideoCodecCSuri}:1.4.2`, definition: "H.264-high-L1b" },
  { value: `${DVBVideoCodecCSuri}:1.4.3`, definition: "H.264-high-L1.1" },
  { value: `${DVBVideoCodecCSuri}:1.4.4`, definition: "H.264-high-L1.2" },
  { value: `${DVBVideoCodecCSuri}:1.4.5`, definition: "H.264-high-L1.3" },
  { value: `${DVBVideoCodecCSuri}:1.4.6`, definition: "H.264-high-L2" },
  { value: `${DVBVideoCodecCSuri}:1.4.7`, definition: "H.264-high-L2.1" },
  { value: `${DVBVideoCodecCSuri}:1.4.8`, definition: "H.264-high-L2.2" },
  { value: `${DVBVideoCodecCSuri}:1.4.9`, definition: "H.264-high-L3" },
  { value: `${DVBVideoCodecCSuri}:1.4.10`, definition: "H.264-high-L3.1" },
  { value: `${DVBVideoCodecCSuri}:1.4.11`, definition: "H.264-high-L3.2" },
  { value: `${DVBVideoCodecCSuri}:1.4.12`, definition: "H.264-high-L4" },
  { value: `${DVBVideoCodecCSuri}:1.4.13`, definition: "H.264-high-L4.1" },
  { value: `${DVBVideoCodecCSuri}:1.4.14`, definition: "H.264-high-L4.2" },
  { value: `${DVBVideoCodecCSuri}:1.4.15`, definition: "H.264-high-L4" },
  { value: `${DVBVideoCodecCSuri}:1.4.16`, definition: "H.264-high-L5.1" },
  { value: `${DVBVideoCodecCSuri}:1.5.1`, definition: "H.264-high10-L1" },
  { value: `${DVBVideoCodecCSuri}:1.5.2`, definition: "H.264-high10-L1b" },
  { value: `${DVBVideoCodecCSuri}:1.5.3`, definition: "H.264-high10-L1.1" },
  { value: `${DVBVideoCodecCSuri}:1.5.4`, definition: "H.264-high10-L1.2" },
  { value: `${DVBVideoCodecCSuri}:1.5.5`, definition: "H.264-high10-L1.3" },
  { value: `${DVBVideoCodecCSuri}:1.5.6`, definition: "H.264-high10-L2" },
  { value: `${DVBVideoCodecCSuri}:1.5.7`, definition: "H.264-high10-L2.1" },
  { value: `${DVBVideoCodecCSuri}:1.5.8`, definition: "H.264-high10-L2.2" },
  { value: `${DVBVideoCodecCSuri}:1.5.9`, definition: "H.264-high10-L3" },
  { value: `${DVBVideoCodecCSuri}:1.5.10`, definition: "H.264-high10-L3.1" },
  { value: `${DVBVideoCodecCSuri}:1.5.11`, definition: "H.264-high10-L3.2" },
  { value: `${DVBVideoCodecCSuri}:1.5.12`, definition: "H.264-high10-L4" },
  { value: `${DVBVideoCodecCSuri}:1.5.13`, definition: "H.264-high10-L4.1" },
  { value: `${DVBVideoCodecCSuri}:1.5.14`, definition: "H.264-high10-L4.2" },
  { value: `${DVBVideoCodecCSuri}:1.5.15`, definition: "H.264-high10-L4" },
  { value: `${DVBVideoCodecCSuri}:1.5.16`, definition: "H.264-high10-L5.1" },
  { value: `${DVBVideoCodecCSuri}:1.6.1`, definition: "H.264-high422-L1" },
  { value: `${DVBVideoCodecCSuri}:1.6.2`, definition: "H.264-high422-L1b" },
  { value: `${DVBVideoCodecCSuri}:1.6.3`, definition: "H.264-high422-L1.1" },
  { value: `${DVBVideoCodecCSuri}:1.6.4`, definition: "H.264-high422-L1.2" },
  { value: `${DVBVideoCodecCSuri}:1.6.5`, definition: "H.264-high422-L1.3" },
  { value: `${DVBVideoCodecCSuri}:1.6.6`, definition: "H.264-high422-L2" },
  { value: `${DVBVideoCodecCSuri}:1.6.7`, definition: "H.264-high422-L2.1" },
  { value: `${DVBVideoCodecCSuri}:1.6.8`, definition: "H.264-high422-L2.2" },
  { value: `${DVBVideoCodecCSuri}:1.6.9`, definition: "H.264-high422-L3" },
  { value: `${DVBVideoCodecCSuri}:1.6.10`, definition: "H.264-high422-L3.1" },
  { value: `${DVBVideoCodecCSuri}:1.6.11`, definition: "H.264-high422-L3.2" },
  { value: `${DVBVideoCodecCSuri}:1.6.12`, definition: "H.264-high422-L4" },
  { value: `${DVBVideoCodecCSuri}:1.6.13`, definition: "H.264-high422-L4.1" },
  { value: `${DVBVideoCodecCSuri}:1.6.14`, definition: "H.264-high422-L4.2" },
  { value: `${DVBVideoCodecCSuri}:1.6.15`, definition: "H.264-high422-L4" },
  { value: `${DVBVideoCodecCSuri}:1.6.16`, definition: "H.264-high422-L5.1" },
  { value: `${DVBVideoCodecCSuri}:1.7.1`, definition: "H.264-high444-L1" },
  { value: `${DVBVideoCodecCSuri}:1.7.2`, definition: "H.264-high444-L1b" },
  { value: `${DVBVideoCodecCSuri}:1.7.3`, definition: "H.264-high444-L1.1" },
  { value: `${DVBVideoCodecCSuri}:1.7.4`, definition: "H.264-high444-L1.2" },
  { value: `${DVBVideoCodecCSuri}:1.7.5`, definition: "H.264-high444-L1.3" },
  { value: `${DVBVideoCodecCSuri}:1.7.6`, definition: "H.264-high444-L2" },
  { value: `${DVBVideoCodecCSuri}:1.7.7`, definition: "H.264-high444-L2.1" },
  { value: `${DVBVideoCodecCSuri}:1.7.8`, definition: "H.264-high444-L2.2" },
  { value: `${DVBVideoCodecCSuri}:1.7.9`, definition: "H.264-high444-L3" },
  { value: `${DVBVideoCodecCSuri}:1.7.10`, definition: "H.264-high444-L3.1" },
  { value: `${DVBVideoCodecCSuri}:1.7.11`, definition: "H.264-high444-L3.2" },
  { value: `${DVBVideoCodecCSuri}:1.7.12`, definition: "H.264-high444-L4" },
  { value: `${DVBVideoCodecCSuri}:1.7.13`, definition: "H.264-high444-L4.1" },
  { value: `${DVBVideoCodecCSuri}:1.7.14`, definition: "H.264-high444-L4.2" },
  { value: `${DVBVideoCodecCSuri}:1.7.15`, definition: "H.264-high444-L4" },
  { value: `${DVBVideoCodecCSuri}:1.7.16`, definition: "H.264-high444-L5.1" },
  { value: `${DVBVideoCodecCSuri}:1.8.9`, definition: "H.264-scal-high-L3" },
  { value: `${DVBVideoCodecCSuri}:1.8.10`, definition: "H.264-scal-high-L3.1" },
  { value: `${DVBVideoCodecCSuri}:1.8.11`, definition: "H.264-scal-high-L3.2" },
  { value: `${DVBVideoCodecCSuri}:1.8.12`, definition: "H.264-scal-high-L4" },
  { value: `${DVBVideoCodecCSuri}:1.8.13`, definition: "H.264-scal-high-L4.1" },
  { value: `${DVBVideoCodecCSuri}:1.8.14`, definition: "H.264-scal-high-L4.2" },
  { value: `${DVBVideoCodecCSuri}:1.9.9`, definition: "H.264-stereo-high-L3" },
  { value: `${DVBVideoCodecCSuri}:1.9.10`, definition: "H.264-stereo-high-L3.1" },
  { value: `${DVBVideoCodecCSuri}:1.9.11`, definition: "H.264-stereo-high-L3.2" },
  { value: `${DVBVideoCodecCSuri}:1.9.12`, definition: "H.264-stereo-high-L4" },
  { value: `${DVBVideoCodecCSuri}:2.1.1`, definition: "VC1-simp-LL" },
  { value: `${DVBVideoCodecCSuri}:2.1.2`, definition: "VC1-simp-ML" },
  { value: `${DVBVideoCodecCSuri}:2.2.1`, definition: "VC1-main-LL" },
  { value: `${DVBVideoCodecCSuri}:2.2.2`, definition: "VC1-main-ML" },
  { value: `${DVBVideoCodecCSuri}:2.2.3`, definition: "VC1-main-HL" },
  { value: `${DVBVideoCodecCSuri}:2.3.1`, definition: "VC1-adv-L0" },
  { value: `${DVBVideoCodecCSuri}:2.3.2`, definition: "VC1-adv-L1" },
  { value: `${DVBVideoCodecCSuri}:2.3.3`, definition: "VC1-adv-L2" },
  { value: `${DVBVideoCodecCSuri}:2.3.4`, definition: "VC1-adv-L3" },
  { value: `${DVBVideoCodecCSuri}:2.3.5`, definition: "VC1-adv-L4" },
  { value: `${DVBVideoCodecCSuri}:3.1.1`, definition: "H.242-main-main" },
  { value: `${DVBVideoCodecCSuri}:3.1.2`, definition: "H.262-main-high" },
  { value: `${DVBVideoCodecCSuri}:4.1.1`, definition: "H.265-main-L1" },
  { value: `${DVBVideoCodecCSuri}:4.1.6`, definition: "H.265-main-L2" },
  { value: `${DVBVideoCodecCSuri}:4.1.7`, definition: "H.265-main-L2.1" },
  { value: `${DVBVideoCodecCSuri}:4.1.9`, definition: "H.265-main-L3" },
  { value: `${DVBVideoCodecCSuri}:4.1.10`, definition: "H.265-main-L3.1" },
  { value: `${DVBVideoCodecCSuri}:4.1.12`, definition: "H.265-main-L4" },
  { value: `${DVBVideoCodecCSuri}:4.1.13`, definition: "H.265-main-L4.1" },
  { value: `${DVBVideoCodecCSuri}:4.2.1`, definition: "H.265-main10-L1" },
  { value: `${DVBVideoCodecCSuri}:4.2.6`, definition: "H.265-main10-L2" },
  { value: `${DVBVideoCodecCSuri}:4.2.7`, definition: "H.265-main10-L2.1" },
  { value: `${DVBVideoCodecCSuri}:4.2.9`, definition: "H.265-main10-L3" },
  { value: `${DVBVideoCodecCSuri}:4.2.10`, definition: "H.265-main10-L3.1" },
  { value: `${DVBVideoCodecCSuri}:4.2.12`, definition: "H.265-main10-L4" },
  { value: `${DVBVideoCodecCSuri}:4.2.13`, definition: "H.265-main10-L4.1" },
  { value: `${DVBVideoCodecCSuri}:4.2.15`, definition: "H.265-main10-L5" },
  { value: `${DVBVideoCodecCSuri}:4.2.16`, definition: "H.265-main10-L5.1" },
  { value: `${DVBVideoCodecCSuri}:4.2.17`, definition: "H.265-main10-L5.2" },
  { value: `${DVBVideoCodecCSuri}:4.2.18`, definition: "H.265-main10-L6" },
  { value: `${DVBVideoCodecCSuri}:4.2.19`, definition: "H.265-main10-L6.1" },
  { value: `${DVBVideoCodecCSuri}:5.1.1`, definition: "AVS3-high10-2.0.15" },
  { value: `${DVBVideoCodecCSuri}:5.1.2`, definition: "AVS3-high10-2.0.30" },
  { value: `${DVBVideoCodecCSuri}:5.1.3`, definition: "AVS3-high10-2.0.60" },
  { value: `${DVBVideoCodecCSuri}:5.1.4`, definition: "AVS3-high10-4.0.30" },
  { value: `${DVBVideoCodecCSuri}:5.1.5`, definition: "AVS3-high10-4.0.60" },
  { value: `${DVBVideoCodecCSuri}:5.1.6`, definition: "AVS3-high10-6.0.30" },
  { value: `${DVBVideoCodecCSuri}:5.1.7`, definition: "AVS3-high10-6.4.30" },
  { value: `${DVBVideoCodecCSuri}:5.1.8`, definition: "AVS3-high10-6.0.60" },
  { value: `${DVBVideoCodecCSuri}:5.1.9`, definition: "AVS3-high10-6.4.60" },
  { value: `${DVBVideoCodecCSuri}:5.1.10`, definition: "AVS3-high10-6.0.120" },
  { value: `${DVBVideoCodecCSuri}:5.1.11`, definition: "AVS3-high10-6.4.120" },
  { value: `${DVBVideoCodecCSuri}:5.1.12`, definition: "AVS3-high10-8.0.30" },
  { value: `${DVBVideoCodecCSuri}:5.1.13`, definition: "AVS3-high10-8.4.30" },
  { value: `${DVBVideoCodecCSuri}:5.1.14`, definition: "AVS3-high10-8.0.60" },
  { value: `${DVBVideoCodecCSuri}:5.1.15`, definition: "AVS3-high10-8.4.60" },
  { value: `${DVBVideoCodecCSuri}:5.1.16`, definition: "AVS3-high10-8.0.120" },
  { value: `${DVBVideoCodecCSuri}:5.1.17`, definition: "AVS3-high10-8.4.120" },
  { value: `${DVBVideoCodecCSuri}:5.1.18`, definition: "AVS3-high10-10.0.30" },
  { value: `${DVBVideoCodecCSuri}:5.1.19`, definition: "AVS3-high10-10.4.30" },
  { value: `${DVBVideoCodecCSuri}:5.1.20`, definition: "AVS3-high10-10.0.60" },
  { value: `${DVBVideoCodecCSuri}:5.1.21`, definition: "AVS3-high10-10.4.60" },
  { value: `${DVBVideoCodecCSuri}:5.1.22`, definition: "AVS3-high10-10.0.120" },
  { value: `${DVBVideoCodecCSuri}:5.1.23`, definition: "AVS3-high10-10.4.120" },
  { value: `${DVBVideoCodecCSuri}:6.1.1`, definition: "VVC-main10-L3.0" },
  { value: `${DVBVideoCodecCSuri}:6.1.2`, definition: "VVC-main10-L3.1" },
  { value: `${DVBVideoCodecCSuri}:6.1.3`, definition: "VVC-main10-L4.0" },
  { value: `${DVBVideoCodecCSuri}:6.1.4`, definition: "VVC-main10-L4.1" },
  { value: `${DVBVideoCodecCSuri}:6.1.5`, definition: "VVC-main10-L5.0" },
  { value: `${DVBVideoCodecCSuri}:6.1.6`, definition: "VVC-main10-L5.1" },
  { value: `${DVBVideoCodecCSuri}:6.1.7`, definition: "VVC-main10-L5.2" },
  { value: `${DVBVideoCodecCSuri}:6.1.8`, definition: "VVC-main10-L6.0" },
  { value: `${DVBVideoCodecCSuri}:6.1.9`, definition: "VVC-main10-L6.1" },
  { value: `${DVBVideoCodecCSuri}:6.1.10`, definition: "VVC-main10-L6.2" },
];
function VideoCodecCS(vals) {
  return mapValues(vals, DVBVideoCodecCSmap);
}

var TVASubtitlePurposeCSuri = "urn:tva:metadata:cs:SubtitlePurposeCS:2023";
var TVASubtitlePurposeCSmap = [
  { value: `${TVASubtitlePurposeCSuri}:1`, definition: "~subtitle_purpose_translation" },
  { value: `${TVASubtitlePurposeCSuri}:2`, definition: "~subtitle_purpose_hard_of_hearing" },
  { value: `${TVASubtitlePurposeCSuri}:3`, definition: "~subtitle_purpose_audio_description" },
  { value: `${TVASubtitlePurposeCSuri}:4`, definition: "~subtitle_purpose_commentary" },
  { value: `${TVASubtitlePurposeCSuri}:5`, definition: "~subtitle_purpose_forced_narrative" },
];
function SubtitlePurposeCS(vals) {
  return mapValues(vals, TVASubtitlePurposeCSmap);
}

var HbbTVStandard_uri = "urn:hbbtv:appinformation:standardversion:hbbtv";
var CEAuri = "urn:cta:wave:appinformation:standardversion";
var AppStandards_map = [
  { value: `${HbbTVStandard_uri}:1.2.1`, definition: "HbbTV 1.5" },
  { value: `${HbbTVStandard_uri}:1.5.1`, definition: "HbbTV 2.0.2" },
  { value: `${HbbTVStandard_uri}:1.6.1`, definition: "HbbTV 2.0.3" },
  { value: `${HbbTVStandard_uri}:1.7.1`, definition: "HbbTV 2.0.4" },
  { value: `${CEAuri}:cta5000:2017`, definition: "CTA-5000" },
  { value: `${CEAuri}:cta5000a:2018`, definition: "CTA-5000-A" },
  { value: `${CEAuri}:cta5000b:2019`, definition: "CTA-5000-B" },
  { value: `${CEAuri}:cta5000c:2020`, definition: "CTA-5000-C" },
  { value: `${CEAuri}:cta5000d:2021`, definition: "CTA-5000-D" },
  { value: `${CEAuri}:cta5000e:2022`, definition: "CTA-5000-E" },
  { value: `${CEAuri}:cta5000f:2023`, definition: "CTA-5000-F" },
];
function StandardVersion(vals) {
  return mapValues(vals, AppStandards_map);
}

var HbbTVOption_uri = "urn:hbbtv:appinformation:optionalfeature:hbbtv";
var OptionalFeatures_map = [
  { value: `${HbbTVOption_uri}:2decoder`, definition: "+2DECODER" },
  { value: `${HbbTVOption_uri}:2html`, definition: "+2HTML" },
  { value: `${HbbTVOption_uri}:graphics_01`, definition: "+GRAHICS_01" },
  { value: `${HbbTVOption_uri}:graphics_02`, definition: "+GRAHICS_02" },
  { value: `${HbbTVOption_uri}:aria`, definition: "+ARIA" },
];
function OptionalFeature(vals) {
  return mapValues(vals, OptionalFeatures_map);
}

var AccessibilityPurposeCSuri = "urn:tva:metadata:cs:AccessibilityPurposeCS:2023";
var AccessibilityPurposeCSmap = [
  { value: `${AccessibilityPurposeCSuri}:1.1`, definition: "~textMagnification" },
  { value: `${AccessibilityPurposeCSuri}:1.2`, definition: "~magnifierGlass" },
  { value: `${AccessibilityPurposeCSuri}:1.3`, definition: "~screenZoom" },
  { value: `${AccessibilityPurposeCSuri}:1.4`, definition: "~largeLayout" },
  { value: `${AccessibilityPurposeCSuri}:2.1`, definition: "~monochrome" },
  { value: `${AccessibilityPurposeCSuri}:3.1`, definition: "~maleVoice" },
  { value: `${AccessibilityPurposeCSuri}:3.2`, definition: "~femaleVoice" },
  { value: `${AccessibilityPurposeCSuri}:3.3`, definition: "~configurableVerbosity" },
  { value: `${AccessibilityPurposeCSuri}:3.4`, definition: "~speed" },
  { value: `${AccessibilityPurposeCSuri}:4.1`, definition: "~audio" },
  { value: `${AccessibilityPurposeCSuri}:4.2`, definition: "~visual" },
  { value: `${AccessibilityPurposeCSuri}:4.3`, definition: "~haptic" },
];

function AccessibilityPurposeCS(vals) {
  return mapValues(vals, AccessibilityPurposeCSmap);
}
