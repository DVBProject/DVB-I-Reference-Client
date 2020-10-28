<?php  
header( "Content-Type: application/vnd.dvb.ait+xml;charset=utf-8" );

echo "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
?>
<mhp:ServiceDiscovery xmlns:mhp="urn:dvb:mhp:2009" xmlns:ipi="urn:dvb:metadata:iptv:sdns:2008-1" xmlns:tva="urn:tva:metadata:2005" xmlns:mpeg7="urn:tva:mpeg7:2005" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="urn:dvb:mhp:2009 mis_xmlait.xsd">
        <mhp:ApplicationDiscovery DomainName="77.36.163.194">
                <mhp:ApplicationList>
                        <mhp:Application>
                                <mhp:appName Language="deu">Playready DRM</mhp:appName>
                                <mhp:applicationIdentifier>
                                        <mhp:orgId>7</mhp:orgId>
                                        <mhp:appId>1</mhp:appId>
                                </mhp:applicationIdentifier>
                                <mhp:applicationDescriptor>
                                        <mhp:type>
                                                <mhp:OtherApp>application/vnd.hbbtv.xhtml+xml</mhp:OtherApp>
                                        </mhp:type>
                                        <mhp:controlCode>AUTOSTART</mhp:controlCode>
                                        <mhp:visibility>VISIBLE_ALL</mhp:visibility>
                                        <mhp:serviceBound>false</mhp:serviceBound>
                                        <mhp:priority>5</mhp:priority>
                                        <mhp:version>00</mhp:version>
                                        <mhp:mhpVersion>
                                                <mhp:profile>0</mhp:profile>
                                                <mhp:versionMajor>1</mhp:versionMajor>
                                                <mhp:versionMinor>4</mhp:versionMinor>
                                                <mhp:versionMicro>1</mhp:versionMicro>
                                        </mhp:mhpVersion>
                                </mhp:applicationDescriptor>
                                <mhp:applicationTransport xsi:type="mhp:HTTPTransportType">
                                        <mhp:URLBase>https://stage.sofiadigital.fi/dvb/dvb-i-reference-application/linked_applications/</mhp:URLBase>
                                </mhp:applicationTransport>
                                <mhp:applicationLocation>hbbtv_playready.html</mhp:applicationLocation>
                        </mhp:Application>
                </mhp:ApplicationList>
        </mhp:ApplicationDiscovery>
</mhp:ServiceDiscovery>
