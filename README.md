# Holophonix-Chataigne-Module

## Installation

To install the Custom Module, [download](https://github.com/dewiweb/Holophonix-chataigne-module/archive/refs/heads/main.zip) and unzip the files to your Documents/Chataigne/Modules folder.

## First Steps

- Add an Holophonix module instance (pick it in "Spatial Audio" category").
- Specify your local OSC receiving port.
- Specify IP address and OSC port of your Holophonix processor.
- Specify Objects Numbers to add, accepted format are:
  - single number (ex: 9)
  - range of numbers (ex: 5-15)
  - list of numbers (ex: 3,12,89,45)

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
