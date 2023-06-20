# Holophonix-Chataigne-Module

## Installation

To install the Custom Module, download and unzip the files to your Documents/Chataigne/Modules folder.

## Principle of use

You can automatically send "get" commands to the third within modules parameters :

- /getObjectsPositionsXYZ : for (x,y,z)cartesian objects coordinates
- /getObjectsPositionsAED : for (a,e,d) spheric objects coordinates
- /getObjectsGain : for objects gains


You may also use Module Commands to send parameters to Holophonix processor :

- aed(sourceIndex, aed)
- xyz(sourceIndex, xyz)
- gain(sourceIndex, gain)

And send manually queries commands :

- getAED(sourceIndex)
- getXYZ(sourceIndex)
- getGain(sourceIndex)
