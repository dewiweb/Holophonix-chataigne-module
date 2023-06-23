# Holophonix-Chataigne-Module

An experimental Chataigne's Module to interact with [Holophonix](https://holophonix.xyz) spatial audio processor. 

Main purpose is to create cues(or scenes) of tracks 3D positions(XYZ or AED) and Gains to reload them similar a lighting cues logic.

## Installation

To install the Custom Module, [download](https://github.com/dewiweb/Holophonix-chataigne-module/archive/refs/heads/main.zip) and unzip the files to your Documents/Chataigne/Modules folder.

## First Steps

- Add an Holophonix module instance (pick it in "Spatial Audio" category").
- Specify your local OSC receiving port.
- Specify IP address and OSC port of your Holophonix processor.
- Specify Objects IDs to add, accepted format are:
  - single number (ex: 9)
  - range of numbers (ex: 5-15)
  - list of numbers (ex: 3,12,89,45)

## Principle of use

- In "Rec Mode", you can record Global Cues (XYZ,AED and Gain values).
- Record Cues generates associated Triggers (consequences TRUE of Cue Triggers).
- To reload Cues you've got to disable "Rec Mode" to avoid IN/OUT data's loop, it disables OSC input and set AED,XYZ and Gain States as active.
- Choose one kind of states you activate between aed states and xyz states .Send both kind of coordinates simultaneously is not recommended. 
- You can set interpolation's curve and time per-track if needed.

## Additionnal Features

You can automatically( with "request rate" setting) or manually send "get" commands to the third within modules parameters :

- XYZ positions Request : for (x,y,z)cartesian coordinates
- AED positions Request : for (a,e,d) spherical coordinates
- Gain Request : for gains

You may also use Module Commands to send parameters to Holophonix processor :

- aed(sourceIndex, aed)
- xyz(sourceIndex, xyz)
- gain(sourceIndex, gain)

And send manually queries commands :

- getAED(sourceIndex)
- getXYZ(sourceIndex)
- getGain(sourceIndex)
