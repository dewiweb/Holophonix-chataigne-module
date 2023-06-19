/* Chataigne Module for Holophonix spatial audio processor
based on Module for ADM-OSC v1.1 (c)  developped by Mathieu Delquignies, 5/2023
===============================================================================


/**
 *  GLOBAL VARIABLES
 */
// Module parameters
var getObjectsXYZ = false;
var getObjectsAED = false;
var getObjectsGain = false;

// objects parameters containers pointers arrays
var xParam = [];
var yParam = [];
var zParam = [];
var xyzParam = [];
var aParam = [];
var eParam = [];
var dParam = [];
var aedParam = [];
var gainParam = [];

var objectsList = [];
var declaredObjects;
var lastSendTime = 0;
var requestSendRate; //in milliseconds
var option = "initial";
var recMode = local.parameters.recordCues.recMode.get();

/**
 * Module intialisation
 */
function init() {
  // Setup default reception update rate and get update states as in module GUI
  requestSendRate = local.parameters.requestValues.autoRequestRate.get();
  script.setUpdateRate(5000);
  getObjectsXYZ = local.parameters.requestValues.autoXYZPositionsRequest.get();
  //  getObjectsAED = local.parameters.getObjectsPositionsAED.get();
  //getObjectsGain = local.parameters.getObjectsGain.get();
  declaredObjects = local.parameters.objects.objectsIDs.get();
  updateObjectsList();
  // Module GUI settings
  local.scripts.setCollapsed(true);
  if (root.states.getChild("XYZ states") == undefined) {
    XYZstates = root.states.addItem();
    XYZstates.setName("XYZ states");
  }
  root.states.xyzStates.active.set(false);
  //root.states.xyzStates.processors.mapping.enabled;
}

/**
 * Callback when a module parameter has changed
 */
function moduleParameterChanged(param) {
  script.log("param.name is : " + param.name);
  if (param.isParameter()) {
    if (param.is(local.parameters.requestValues.autoRequestRate)) {
      // Get send Rate parameter has changed
      requestSendRate = local.parameters.requestValues.autoRequestRate.get();
      script.setUpdateRate(5000);
    }
    if (param.is(local.parameters.recordCues.recMode)) {
      recMode = local.parameters.recordCues.recMode.get();
      script.log("recMode changed to : " + recMode);
      if (recMode == 0) {
        local.parameters.oscInput.enabled.set(false);
        root.states.xyzStates.active.set(true);
      } else {
        local.parameters.oscInput.enabled.set(true);
        root.states.xyzStates.active.set(false);
      }
      script.log("oscInput  : " + local.parameters.oscInput.enabled);
    }
    // handling of "get" parameters settings changes
    if (param.is(local.parameters.requestValues.autoXYZPositionsRequest)) {
      getObjectsXYZ = param.get();
    }

    //    if (param.is(local.parameters.getObjectsPositionsAED)) {
    //      getObjectsAED = param.get();
    //    }
    //    if (param.is(local.parameters.getObjectsGain)) {
    //      getObjectsGain = param.get();
    //    }
  }

  if (param.is(local.parameters.recordCues.createGlobalCues)) {
    script.log("createNewPreset Triggered!!");
    createNewPreset();
  }
  if (param.name == "addObjects") {
    // New Objects declared.
    declaredObjects = local.parameters.objects.objectsIDs.get();
    if (declaredObjects.indexOf("-") > -1) {
      tmpList = declaredObjects.split("-");
      script.log("tmpList   " + JSON.stringify(tmpList));
      objectsList[parseInt(tmpList[0])] = parseInt(tmpList[0]);
      objectsList[parseInt(tmpList[1])] = parseInt(tmpList[1]);
      for (i = parseInt(tmpList[0]) + 1; i < parseInt(tmpList[1]); i++) {
        objectsList[i] = i;
      }

      script.log(" objects list case 1 : " + JSON.stringify(objectsList));
    } else if (declaredObjects.indexOf(",") > -1) {
      tmpList1 = declaredObjects.split(",");
      script.log("tmpList1   " + JSON.stringify(tmpList1));
      for (i = 0; i < parseInt(tmpList1[tmpList1.length - 1]) + 1; i++) {
        if (tmpList1.indexOf(i) > -1) {
          objectsList[i] = i;
        }
      }
      script.log(" objects list case 2 : " + JSON.stringify(objectsList));
    } else {
      objectsList[parseInt(declaredObjects)] = parseInt(declaredObjects);
      script.log(" objects list case 3 : " + JSON.stringify(objectsList));
    }

    createObjectsContainer();
    createCC();
  }
  if (param.name == "manualXYZPositionsRequest") {
    updateObjectsList();
    maxObjectID = objectsList[0];
    for (i = 1; i < objectsList.length; ++i) {
      if (objectsList[i] > maxID) {
        maxObjectID = objectsList[i];
      }
    }

    for (i = 0; i < maxObjectID + 1; i++) {
      if (local.values.objectsParameters.xyz.getChild(i) !== null) {
        getXYZ(i);
      }
    }
  }
}

/**
 * Callback when a module value has changed
 */

function moduleValueChanged(value) {
  if (value.isParameter()) {
    script.log(
      "Module value changed : " +
        "/track/" +
        value.name +
        "/" +
        value.getParent().name +
        " > " +
        value.get()
    );
  } else {
    script.log("Module value triggered : " + value.name);
  }
}

/**
 * Callback on OSC Rx to parse OSC message
 */
function oscEvent(address, args) {
  // Convert address string to string array
  var address = address.split("/");
  // Parse address
  if (address[1] == "track") {
    var objectID = parseInt(address[2]);
    if (objectsList.indexOf(objectID) == -1) {
      script.logWarning("Received not handled object number #" + objectID);
      return;
    }
    //    if (address[3] == "azim") {
    //      if (args.length == 0) {
    //        azim(objectID, aParam[objectID].get());
    //      } else {
    //        local.values.objectsParameters.a.objectID.set(args[0]);
    //        aedParam[objectID][0].set(args[0]);
    //      }
    //    }
    //    if (address[3] == "elev") {
    //      if (args.length == 0) {
    //        elev(objectID, eParam[objectID].get());
    //      } else {
    //        eParam[objectID].set(args[0]);
    //        aedParam[objectID][1].set(args[0]);
    //      }
    //    }
    //    if (address[3] == "dist") {
    //      if (args.length == 0) {
    //        dist(objectID, dParam[objectID].get());
    //      } else {
    //        dParam[objectID].set(args[0]);
    //        aedParam[objectID][2].set(args[0]);
    //      }
    //    }
    //    if (address[3] == "aed") {
    //      if (args.length == 0) {
    //        aed(
    //          objectID,
    //          aParam[objectID].get(),
    //          eParam[objectID].get(),
    //          dParam[objectID].get(),
    //          aedParam[objectID].get()
    //        );
    //      } else {
    //        aParam[objectID].set(args[0]);
    //        eParam[objectID].set(args[1]);
    //        dParam[objectID].set(args[2]);
    //        aedParam[objectID].set(args);
    //      }
    //    }
    //    if (address[3] == "x") {
    //      if (args.length == 0) {
    //        x(objectID, xParam[objectID].get());
    //      } else {
    //        xParam[objectID].set(args[0]);
    //        xyzParam[objectID].value[0].set(args[0]);
    //      }
    //    }
    //    if (address[3] == "y") {
    //      if (args.length == 0) {
    //        y(objectID, yParam[objectID].get());
    //      } else {
    //        yParam[objectID].set(args[0]);
    //        xyzParam[objectID].value[1].set(args[0]);
    //      }
    //    }
    //    if (address[3] == "z") {
    //      if (args.length == 0) {
    //        z(objectID, zParam[objectID].get());
    //      } else {
    //        zParam[objectID].set(args[0]);
    //        xyzParam[objectID].value[2].set(args[0]);
    //      }
    //    }
    if (address[3] == "xyz") {
      script.log(" new xyz coord of track: " + objectID + " received ");
      //      if (args.length == 0) {
      //        xyz(
      //          objectID,
      //          xParam[objectID].get(),
      //          yParam[objectID].get(),
      //          zParam[objectID].get(),
      //          xyzParam[objectID].get()
      //        );
      //      } else {
      //        xParam[objectID].set(args[0]);
      //        yParam[objectID].set(args[1]);
      //        zParam[objectID].set(args[2]);
      //      local.values.objectsParameters.x.getChild(objectID).set(args[0]);
      //      local.values.objectsParameters.y.getChild(objectID).set(args[1]);
      //      local.values.objectsParameters.z.getChild(objectID).set(args[2]);
      local.values.objectsParameters.xyz.getChild(objectID).set(args);
      //      }
    }
    //    if (address[3] == "gain") {
    //      if (args.length == 0) {
    //        gain(objectID, gainParam[objectID].get());
    //      } else {
    //        gainParam[objectID].set(args[0]);
    //      }
    //    }
  }
}
/**
 * This function is called automatically by Chataigne at updateRate period.
 *
 */
function update() {
  var t = util.getTime();
  if (t > lastSendTime + requestSendRate / 1000) {
    //send

    // Sends commands to retreive values, at specified updateRate.
    //    if (getObjectsAED) {
    //      for (i = 0; i < objectsList.length; i++) {
    //        if (objectsList[i] !== undefined) {
    //          getAED(i);
    //        }
    //      }
    //    }
    if (getObjectsXYZ) {
      maxObjectID = objectsList[0];
      for (i = 1; i < objectsList.length; ++i) {
        if (objectsList[i] > maxID) {
          maxObjectID = objectsList[i];
        }
      }

      for (i = 0; i < maxObjectID + 1; i++) {
        if (local.values.objectsParameters.xyz.getChild(i) !== null) {
          getXYZ(i);
        }
      }
    }
    //    if (getObjectsGain) {
    //      for (i = 0; i < objectsList.length; i++) {
    //        if (objectsList[i] !== undefined) {
    //          getGain(i);
    //        }
    //      }
    //    }
    lastSendTime = t;
  }
}

/**
 * Reset the objects container depending on Number of objects module parameter
 */
function createObjectsContainer(option) {
  // Remove previous source container
  //local.values.removeContainer("Objects parameters");
  // Add the Source container
  //ObjectsContainer = local.values.addContainer("Objects parameters");
  if (local.values.objectsParameters == undefined) {
    ObjectsContainer = local.values.addContainer("Objects parameters");
  } else {
    ObjectsContainer = local.values.objectsParameters;
  }

  //  // Add X container & values for X position
  //  xContainer = ObjectsContainer.addContainer("x");
  //  for (i = 0; i < objectsList.length; i++) {
  //    if (objectsList[i] !== undefined) {
  //      xParam[i] = xContainer.addFloatParameter(i, "x", 0, -20, 20);
  //      xParam[i].setAttribute("readonly", true);
  //    }
  //  }
  //  xContainer.setCollapsed(true);
  //
  //  // Add Y container & values for Y position
  //  yContainer = ObjectsContainer.addContainer("y");
  //  for (i = 0; i < objectsList.length; i++) {
  //    if (objectsList[i] !== undefined) {
  //      yParam[i] = yContainer.addFloatParameter(i, "y", 0, -20, 20);
  //      yParam[i].setAttribute("readonly", true);
  //    }
  //  }
  //  yContainer.setCollapsed(true);
  //
  //  // Add Z container & values for Z position
  //  zContainer = ObjectsContainer.addContainer("z");
  //  for (i = 0; i < objectsList.length; i++) {
  //    if (objectsList[i] !== undefined) {
  //      zParam[i] = zContainer.addFloatParameter(i, "z", 0, -20, 20);
  //      zParam[i].setAttribute("readonly", true);
  //    }
  //  }
  //  zContainer.setCollapsed(true);
  //
  // Add XYZ container & values
  xyzContainer = ObjectsContainer.addContainer("xyz");
  for (i = 0; i < objectsList[objectsList.length - 1] + 1; i++) {
    if (objectsList[i] !== undefined) {
      xyzParam[i] = xyzContainer.addPoint3DParameter(i, "xyz", 0, -20, 20);
      xyzParam[i].setAttribute("readonly", true);
    }
  }

  xyzContainer.setCollapsed(true);

  //  // Add A container & values for polar azimuth
  //  aContainer = ObjectsContainer.addContainer("a");
  //  for (i = 0; i < objectsList.length; i++) {
  //    if (objectsList[i] !== undefined) {
  //      aParam[i] = aContainer.addFloatParameter(i, "a", 0, -180, 180);
  //      aParam[i].setAttribute("readonly", true);
  //    }
  //  }
  //  aContainer.setCollapsed(true);
  //
  //  // Add E container & values for polar elevation
  //  eContainer = ObjectsContainer.addContainer("e");
  //  for (i = 0; i < objectsList.length; i++) {
  //    if (objectsList[i] !== undefined) {
  //      eParam[i] = eContainer.addFloatParameter(i, "e", 45, -90, 90);
  //      eParam[i].setAttribute("readonly", true);
  //    }
  //  }
  //  eContainer.setCollapsed(true);
  //
  //  // Add D container & values for polar radius
  //  dContainer = ObjectsContainer.addContainer("d");
  //  for (i = 0; i < objectsList.length; i++) {
  //    if (objectsList[i] !== undefined) {
  //      dParam[i] = dContainer.addFloatParameter(i, "d", 1, -20, 20);
  //      dParam[i].setAttribute("readonly", true);
  //    }
  //  }
  //  dContainer.setCollapsed(true);
  //
  //  // Add AED container & values
  //  aedContainer = ObjectsContainer.addContainer("aed");
  //  for (i = 0; i < objectsList.length; i++) {
  //    if (objectsList[i] !== undefined) {
  //      aedParam[i] = aedContainer.addPoint3DParameter(i, "aed", 0);
  //      aedParam[i].setAttribute("readonly", true);
  //    }
  //  }
  //  aedContainer.setCollapsed(true);
  //
  //  // Add gain container & values for object gain
  //  gainContainer = ObjectsContainer.addContainer("gain");
  //  for (i = 0; i < objectsList.length; i++) {
  //    if (objectsList[i] !== undefined) {
  //      gainParam[i] = gainContainer.addFloatParameter(i, "gain", -10, -30, 12);
  //      gainParam[i].setAttribute("readonly", true);
  //    }
  //  }
  //  gainContainer.setCollapsed(true);
}

function createCC(option) {
  existingCCs = root.customVariables.getItems();
  if (option == "initial") {
    // create  New CCs
    for (i = 0; i < objectsList[objectsList.length - 1] + 1; i++) {
      if (objectsList[i] !== undefined) {
        trCC = root.customVariables.addItem();
        trCC.setName("/track/" + i);
        trCCxyz = trCC.variables.addItem("Point3D Parameter");
        trCCxyz.setName("/xyz");
      }
    }
    option = "";
  } else {
    // Delete Old CCs
    ccsNames = [];
    ccs = root.customVariables.getItems();
    for (var j = 0; j < ccs.length; j++) {
      ccsNames.push(ccs[j].name);
      //      root.customVariables.removeItem(ccs[j].name);
    }
    // create  New CCs
    for (i = 0; i < objectsList.length; i++) {
      ccIndex = ccsNames.indexOf("_track_" + i);
      script.log(" CC in CCs index = " + ccIndex + " for i = " + i);
      script.log("list of existing CCs : " + JSON.stringify(ccsNames));
      if (objectsList[i] !== undefined) {
        if (ccIndex == -1) {
          trCC = root.customVariables.addItem();
          trCC.setName("/track/" + i);
          trCCxyz = trCC.variables.addItem("Point3D Parameter");
          trCCxyz.setName("/xyz");
          createParamReferenceTo(
            "/modules/holophonix/values/objectsParameters/xyz/" + i,
            "/customVariables/_track_" + i + "/variables/_xyz/_xyz"
          );
          ObjectState = root.states.xyzStates.processors.addItem("Mapping");
          ObjectState.setName("/track/" + i);
          ObjectState.loadJSONData({
            niceName: "/track/" + i,
            editorIsCollapsed: true,
            type: "Mapping",
            im: {
              items: [
                {
                  parameters: [
                    {
                      value:
                        "/customVariables/customVariables/values/_track_" +
                        i +
                        "/_xyz",
                      controlAddress: "/inputValue",
                    },
                  ],
                  niceName: "Input Value",
                  type: "Input Value",
                },
              ],
              viewOffset: [0, 0],
              viewZoom: 1.0,
            },
            params: {
              parameters: [
                {
                  value: 50,
                  hexMode: false,
                  controlAddress: "/updateRate",
                },
              ],
              editorIsCollapsed: true,
            },
            filters: { viewOffset: [0, 0], viewZoom: 1.0 },
            outputs: {
              items: [
                {
                  niceName: "MappingOutput",
                  type: "BaseItem",
                  commandModule: "holophonix",
                  commandPath: "Set objects",
                  commandType: "Send xyz",
                  command: {
                    parameters: [
                      {
                        value: i,
                        hexMode: false,
                        controlAddress: "/sourceIndex",
                      },
                    ],
                    paramLinks: {},
                  },
                },
              ],
              viewOffset: [0, 0],
              viewZoom: 1.0,
            },
          });
          //OSinput = ObjectState.inputs.addItem("Input Value");

          //ObjectState.setName("test");
          //ObjectState.setAttribute("type", "Mapping");
          //ObjectState.setName("/track/" + i);
          //root.states.xyzStates.processors.processor.enabled;
          //root.states.xyzStates.processors.mapping.enabled;
          //root.states.xyzStates.processors.action.enabled;
        }
      }
    }
  }
  root.customVariables.reorderItems();
}

function createNewPreset() {
  cuesNames = local.parameters.recordCues.globalCuesName.get();
  script.log("createNewPreset Triggered!!");
  ccsIDs = [];
  ccs = root.customVariables.getItems();
  for (var j = 0; j < ccs.length; j++) {
    ccsIDs.push(parseInt(ccs[j].name.split("_")[2]));
  }
  maxID = ccsIDs[0];
  for (i = 1; i < ccsIDs.length; ++i) {
    if (ccsIDs[i] > maxID) {
      maxID = ccsIDs[i];
    }
  }
  script.log("ccs Max ID : " + maxID);

  for (i = 0; i < maxID + 1; i++) {
    if (ccsIDs.contains(i)) {
      cuesLength = root.customVariables
        .getItemWithName("_track_" + i)
        .presets.getItems().length;
      iCC = root.customVariables
        .getItemWithName("_track_" + i)
        .presets.addItem("String");
      if (cuesNames !== "") {
        iCC.setName(cuesNames);
      } else {
        iCC.setName("Cue" + (cuesLength + 1));
      }
    }
  }
}

///**
// * Callback functions for module commands
//
///**

// * azim	: Send azimuth of sound location.
// * 1 int [1, 128] object index
// * 2 float [-180, 180] in degrees. -90 is on the Right, 0 is in front.
// *
// * example : /track/4/azim -22.5
// */
//function azim(sourceIndex, azimuthAngle) {
//  local.send("/track/" + sourceIndex + "/azim", azimuthAngle);
//}
//
///**
// * elev	: Send elevation of sound location.
// * 1 int [1, 128] object index
// * 2 float [-90, 90] in degrees. -90 is down, 90 is up.
// *
// * example : /track/4/elev 12.7
// */
//function elev(sourceIndex, elevationAngle) {
//  local.send("/track/" + sourceIndex + "/elev", elevationAngle);
//}
//
///**
// * dist	: Send distance from origin.
// * 1 int [1, 128] object index
// * 2 float [0,1] normalized distance.
// *
// * example : /track/4/dist 0.9
// */
//function dist(sourceIndex, distance) {
//  local.send("/track/" + sourceIndex + "/dist", distance);
//}
//
///**
// * aed	: Send spheric coordinate of sound location.
// * 1 int [1, 128] object index
// * 2 Point3D [a, e, d] [[-180, -90, 0],[180, 90, 1]]
// *
// * example : /track/4/aed -22.5 12.7 0.9
// */
//function aed(sourceIndex, aed) {
//  local.send("/track/" + sourceIndex + "/aed", aed[0], aed[1], aed[2]);
//}
//
///**
// * x	: Send x position of sound object.
// * 1 int [1, 128] object index
// * 2 float [-1,1] left/right dimension, -1 is left.
// *
// * example : /track/4/x -0.9
// */
//function x(sourceIndex, posX) {
//  local.send("/track/" + sourceIndex + "/x", posX);
//}
//
///**
// * y	: Send y position of sound object.
// * 1 int [1, 128] object index
// * 2 float [-1,1] front/back dimension.
// *
// * example : /track/4/y 0.15
// */
//function y(sourceIndex, posY) {
//  local.send("/track/" + sourceIndex + "/y", posY);
//}
//
///**
// * z	: Send z position of sound object.
// * 1 int [1, 128] object index
// * 2 float [-1,1] top/bottom dimension.
// *
// * example : /track/4/x 0.7
// */
//function z(sourceIndex, posZ) {
//  local.send("/track/" + sourceIndex + "/z", posZ);
//}

/**
 * xyz	: Send (x,y,z) position of sound object.
 * 1 int [1, 128] object index
 * 2 Point3D [x,y,z] [[-1, -1, -1],[1,1,1]]
 *
 * example : /track/4/xyz -0.9 0.15 0.7
 * compact format enables synchronicity of position changes and also less network traffic
 */
function xyz(sourceIndex, xyz) {
  local.send("/track/" + sourceIndex + "/xyz", xyz[0], xyz[1], xyz[2]);
}

///**
// * gain	: Send gain of sound object.
// * 1 int [1, 128] object index
// * 2 float [0,1] gain
// *
// * example : /track/3/x 0.707
// */
//function gain(sourceIndex, gain) {
//  local.send("/track/" + sourceIndex + "/gain", gain);
//}
//
///**
// * getAzim	: Send azimuth of sound location query.
// * 1 int [1, 128] object index
// *
// */
//function getAzim(sourceIndex) {
//  local.send("/get", "/track/" + sourceIndex + "/azim");
//}
//
///**
// * getElev	: Send elevation of sound location query.
// * 1 int [1, 128] object index
// *
// */
//function getElev(sourceIndex) {
//  local.send("/get", "/track/" + sourceIndex + "/elev");
//}
//
///**
// * getDist	: Send distance from origin query.
// * 1 int [1, 128] object index
// *
// */
//function getDist(sourceIndex) {
//  local.send("/get", "/track/" + sourceIndex + "/dist");
//}
//
///**
// * getAED	: Send spheric coordinate of sound location query.
// * 1 int [1, 128] object index
// *
// */
//function getAED(sourceIndex) {
//  local.send("/get", "/track/" + sourceIndex + "/aed");
//}
//
///**
// * getX	: Send x position of sound object query.
// * 1 int [1, 128] object index
// *
// */
//function getX(sourceIndex) {
//  local.send("/get", "/track/" + sourceIndex + "/x");
//}
//
///**
// * getY	: Send y position of sound object query.
// * 1 int [1, 128] object index
// *
// */
//function getY(sourceIndex) {
//  local.send("/get", "/track/" + sourceIndex + "/y");
//}
//
///**
// * getZ	: Send z position of sound object query.
// * 1 int [1, 128] object index
// *
// */
//function getZ(sourceIndex) {
//  local.send("/get", "/track/" + sourceIndex + "/z");
//}

/**
 * getXYZ : Send (x,y,z) position of sound object query.
 * 1 int [1, 128] object index
 *
 */
function getXYZ(sourceIndex) {
  local.send("/get", "/track/" + sourceIndex + "/xyz");
}

///**
// * getGain	: Send gain of sound object query.
// * 1 int [1, 128] object index
// *
// */
//function getGain(sourceIndex) {
//  local.send("/get", "/track/" + sourceIndex + "/gain");
//}

function createParamReferenceTo(toValue, fromParam) {
  script.log(
    "Create Reference  from param : " + fromParam + " to value of : " + toValue
  );

  // From param, retreive object
  var fromObj = root.getChild(fromParam);
  var paramToLink = fromObj.getParent();

  // To value of, retreive object. Done in this way to validate the OSC address already provided.
  var toParamValue = root.getChild(toValue).getControlAddress();

  // Modify Param definition to create the Reference
  paramToLink.loadJSONData({
    parameters: [
      {
        value: 1,
        controlMode: 2,
        reference: {
          value: toParamValue,
          controlAddress: "/reference",
        },
        hexMode: false,
        controlAddress: "/" + fromObj.name,
        feedbackOnly: false,
        customizable: true,
        removable: false,
        hideInEditor: false,
      },
    ],
  });
}

function updateObjectsList() {
  for (i = 0; i < 129; i++) {
    if (local.values.objectsParameters.xyz) {
      if (local.values.objectsParameters.xyz.getChild(i)) {
        objectsList[i] = i;
      }
    }
  }
}

//root.customVariables._track_5
