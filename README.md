# Holophonix-Chataigne-Module

An experimental [Chataigne](http://benjamin.kuperberg.fr/chataigne)'s Module to interact with [Holophonix](https://holophonix.xyz) spatial audio processor.

Main purpose is to create Cues(or scenes) of tracks 3D positions(XYZ or AED) and Gains to reload them similar a lighting Cues logic.

<p align="center">
<img src="https://github.com/dewiweb/Holophonix-chataigne-module/blob/main/example/example.gif">
</p>

## Installation

To install the Custom Module, [download](https://github.com/dewiweb/Holophonix-chataigne-module/archive/refs/heads/main.zip) and unzip the files to your Documents/Chataigne/Modules folder.

## First Steps

- Add an Holophonix module instance (pick it in "Spatial Audio" category").
- Specify your local OSC receiving port.
- Specify IP address and OSC port of your Holophonix processor.
- Specify Tracks IDs to add, accepted formats are:
  - single number (ex: 9)
  - range of numbers (ex: 5-15)
  - list of numbers (ex: 3,12,89,45)

## Principle of use

- In "Rec Mode", you can record/reload/update or delete Global Cues (XYZ,AED and Gain values).
- If you don't specify a custom name for new created Cue, "Cue" + number is set by default.
- Be sure to send "Request" (XYZ,AED and Gain) to Holophonix processor BEFORE record or update a Cue (manually or automatically)
- "Create Cue" generates associated Triggers (consequences TRUE of Cue Triggers). You can use these triggers to reload Cues.
- To reload Cues you've got to uncheck "Rec Mode" before to avoid IN/OUT data's loop, it disables OSC input and set AED,XYZ and Gain States as active.
- BE CAREFUL! You've got to choose which kind of states you stay activated between "XYZ states" and "AED states". Send both kind of coordinates simultaneously is not really recommended.
- You can also set custom interpolation's curves and times per-track if needed (Default is set to "Bezier" and "5 seconds").

## Additional Features

You can automatically( with a "request rate" setting) or manually send "get" commands to the third within modules parameters :

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
