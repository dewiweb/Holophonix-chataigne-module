# Holophonix-Chataigne-Module

## Installation

To install the Custom Module, download and unzip the files to your Documents/Chataigne/Modules folder.

## Principle of use

First set IP's and ports in /modules/adm_osc/parameters.

The objects container receives values from ADM-OSC thirds.
Select the number of objects to store in values container with /modules/adm_osc/parameters/numberOfObjects.
They are organised to ease multiplex mappings : you can automatically build list with "Fill...">"from Container" feature.

You can automatically send "get" commands to the third within modules parameters :

- /modules/adm_osc/parameters/getSoundObjectsPositionsXYZ : for (x,y,z) cartesian objects coordinates
- /modules/adm_osc/parameters/getSoundObjectsPositionsAED : for (a,e,d) spheric objects coordinates
- /modules/adm_osc/parameters/getSoundObjectsGain : for objects gains

Those will be polled automatically at /modules/adm_osc/parameters/getUpdateRate frequency.

You may also use Module Commands to send parameters to ADM-OSC third :

- aed(sourceIndex, aed)
- xyz(sourceIndex, xyz)
- gain(sourceIndex, gain)

And send queries commands :

- getAED(sourceIndex)
- getXYZ(sourceIndex)
- getGain(sourceIndex)
