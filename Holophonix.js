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
var xyzParam = [];
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
  getObjectsAED = local.parameters.requestValues.autoAEDPositionsRequest.get();
  getObjectsGain = local.parameters.requestValues.autoGainRequest.get();
  declaredObjects = local.parameters.objects.objectsIDs.get();
  updateObjectsList();
  // Module GUI settings
  local.scripts.setCollapsed(true);
  //Add States to state machine
  if (root.states.getChild("XYZ states") == undefined) {
    XYZstates = root.states.addItem();
    XYZstates.loadJSONData({
      parameters: [
        {
          value: [-500.0, 0.0],
          controlAddress: "/viewUIPosition",
        },
        {
          value: false,
          controlAddress: "/active",
        },
      ],
      niceName: "XYZ states",
      type: "State",
      processors: {
        viewOffset: [0, 0],
        viewZoom: 1.0,
      },
    });
  }
  root.states.xyzStates.active.set(false);

  if (root.states.getChild("AED states") == undefined) {
    AEDstates = root.states.addItem();
    AEDstates.loadJSONData({
      parameters: [
        {
          value: [-250.0, 0.0],
          controlAddress: "/viewUIPosition",
        },
        {
          value: false,
          controlAddress: "/active",
        },
      ],
      niceName: "AED states",
      type: "State",
      processors: {
        viewOffset: [0, 0],
        viewZoom: 1.0,
      },
    });
  }
  root.states.aedStates.active.set(false);

  if (root.states.getChild("Gain states") == undefined) {
    gainStates = root.states.addItem();
    gainStates.loadJSONData({
      parameters: [
        {
          value: [0.0, 0.0],
          controlAddress: "/viewUIPosition",
        },
        {
          value: false,
          controlAddress: "/active",
        },
      ],
      niceName: "Gain states",
      type: "State",
      processors: {
        viewOffset: [0, 0],
        viewZoom: 1.0,
      },
    });
  }
  root.states.gainStates.active.set(false);
  if (root.states.getChild("Cue Triggers") == undefined) {
    cueTriggers = root.states.addItem();
    cueTriggers.loadJSONData({
      parameters: [
        {
          value: [-500.0, 250.0],
          controlAddress: "/viewUIPosition",
        },
        {
          value: [750.0, 150.0],
          controlAddress: "/viewUISize",
        },
        {
          value: true,
          controlAddress: "/active",
        },
      ],
      niceName: "Cue Triggers",
      type: "State",
      processors: {
        viewOffset: [0, 0],
        viewZoom: 1.0,
      },
    });
  }
  root.states.cueTriggers.active.set(false);
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
        root.states.aedStates.active.set(true);
        root.states.gainStates.active.set(true);
      } else {
        local.parameters.oscInput.enabled.set(true);
        root.states.xyzStates.active.set(false);
        root.states.aedStates.active.set(false);
        root.states.gainStates.active.set(false);
      }
      script.log("oscInput  : " + local.parameters.oscInput.enabled);
    }
    // handling of "get" parameters settings changes
    if (param.is(local.parameters.requestValues.autoXYZPositionsRequest)) {
      getObjectsXYZ = param.get();
    }
    if (param.is(local.parameters.requestValues.autoAEDPositionsRequest)) {
      getObjectsAED = param.get();
    }
    if (param.is(local.parameters.requestValues.autoGainRequest)) {
      getObjectsGain = param.get();
    }
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
  if (param.name == "manualAEDPositionsRequest") {
    updateObjectsList();
    maxObjectID = objectsList[0];
    for (i = 1; i < objectsList.length; ++i) {
      if (objectsList[i] > maxID) {
        maxObjectID = objectsList[i];
      }
    }

    for (i = 0; i < maxObjectID + 1; i++) {
      if (local.values.objectsParameters.aed.getChild(i) !== null) {
        getAED(i);
      }
    }
  }
  if (param.name == "manualGainRequest") {
    updateObjectsList();
    maxObjectID = objectsList[0];
    for (i = 1; i < objectsList.length; ++i) {
      if (objectsList[i] > maxID) {
        maxObjectID = objectsList[i];
      }
    }

    for (i = 0; i < maxObjectID + 1; i++) {
      if (local.values.objectsParameters.gain.getChild(i) !== null) {
        getGain(i);
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
    if (objectsList !== undefined) {
      if (objectsList.indexOf(objectID) == -1) {
        script.logWarning("Received not handled object number #" + objectID);
        return;
      }

      if (address[3] == "xyz") {
        local.values.objectsParameters.xyz.getChild(objectID).set(args);
      }
      if (address[3] == "x") {
        previousXYZ = local.values.objectsParameters.xyz
          .getChild(objectID)
          .get();
        local.values.objectsParameters.xyz
          .getChild(objectID)
          .set(args[0], previousXYZ[1], previousXYZ[2]);
      }
      if (address[3] == "y") {
        previousXYZ = local.values.objectsParameters.xyz
          .getChild(objectID)
          .get();
        local.values.objectsParameters.xyz
          .getChild(objectID)
          .set(previousXYZ[0], args[0], previousXYZ[2]);
      }
      if (address[3] == "z") {
        previousXYZ = local.values.objectsParameters.xyz
          .getChild(objectID)
          .get();
        local.values.objectsParameters.xyz
          .getChild(objectID)
          .set(previousXYZ[0], previousXYZ[1], args[0]);
      }
      if (address[3] == "aed") {
        local.values.objectsParameters.aed.getChild(objectID).set(args);
      }
      if (address[3] == "azim") {
        previousAED = local.values.objectsParameters.aed
          .getChild(objectID)
          .get();
        local.values.objectsParameters.aed
          .getChild(objectID)
          .set(args[0], previousAED[1], previousAED[2]);
      }
      if (address[3] == "elev") {
        previousAED = local.values.objectsParameters.aed
          .getChild(objectID)
          .get();
        local.values.objectsParameters.aed
          .getChild(objectID)
          .set(previousAED[0], args[0], previousAED[2]);
      }
      if (address[3] == "dist") {
        previousAED = local.values.objectsParameters.aed
          .getChild(objectID)
          .get();
        local.values.objectsParameters.aed
          .getChild(objectID)
          .set(previousAED[0], previousAED[1], args[0]);
      }
      if (address[3] == "gain") {
        script.log(
          "gain value : " + args + " received for track n° : " + objectID
        );
        local.values.objectsParameters.gain.getChild(objectID).set(args[0]);
      }
    }
  }
}
/**
 * This function is called automatically by Chataigne at updateRate period.
 *
 */
function update() {
  var t = util.getTime();
  if (t > lastSendTime + requestSendRate / 1000) {
    // Sends commands to retreive values, at specified updateRate.
    if (getObjectsXYZ) {
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
    if (getObjectsAED) {
      updateObjectsList();
      maxObjectID = objectsList[0];
      for (i = 1; i < objectsList.length; ++i) {
        if (objectsList[i] > maxID) {
          maxObjectID = objectsList[i];
        }
      }

      for (i = 0; i < maxObjectID + 1; i++) {
        if (local.values.objectsParameters.aed.getChild(i) !== null) {
          getAED(i);
        }
      }
    }
    if (getObjectsGain) {
      updateObjectsList();
      maxObjectID = objectsList[0];
      for (i = 1; i < objectsList.length; ++i) {
        if (objectsList[i] > maxID) {
          maxObjectID = objectsList[i];
        }
      }

      for (i = 0; i < maxObjectID + 1; i++) {
        if (local.values.objectsParameters.gain.getChild(i) !== null) {
          getGain(i);
        }
      }
    }

    lastSendTime = t;
  }
}

/**
 * Reset the objects container depending on Number of objects module parameter
 */
function createObjectsContainer(option) {
  if (local.values.objectsParameters == undefined) {
    ObjectsContainer = local.values.addContainer("Objects parameters");
  } else {
    ObjectsContainer = local.values.objectsParameters;
  }

  // Add XYZ container & values
  xyzContainer = ObjectsContainer.addContainer("xyz");
  for (i = 0; i < objectsList[objectsList.length - 1] + 1; i++) {
    if (objectsList[i] !== undefined) {
      xyzParam[i] = xyzContainer.addPoint3DParameter(i, "xyz", 0, -20, 20);
      xyzParam[i].setAttribute("readonly", true);
    }
  }
  xyzContainer.setCollapsed(true);

  // Add AED container & values
  aedContainer = ObjectsContainer.addContainer("aed");
  for (i = 0; i < objectsList.length; i++) {
    if (objectsList[i] !== undefined) {
      aedParam[i] = aedContainer.addPoint3DParameter(i, "aed", 0);
      aedParam[i].setAttribute("readonly", true);
    }
  }
  aedContainer.setCollapsed(true);

  // Add gain container & values
  gainContainer = ObjectsContainer.addContainer("gain");
  for (i = 0; i < objectsList.length; i++) {
    if (objectsList[i] !== undefined) {
      gainParam[i] = gainContainer.addFloatParameter(i, "gain", 0, -60, 12);
      gainParam[i].setAttribute("readonly", true);
    }
  }
  gainContainer.setCollapsed(true);
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
        trCCaed = trCC.variables.addItem("Point3D Parameter");
        trCCaed.setName("/aed");
        trCCgain = trCC.variables.addItem("Float Parameter");
        trCCgain.setName("/gain");
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
          ObjectStateXYZ = root.states.xyzStates.processors.addItem("Mapping");
          ObjectStateXYZ.setName("/track/" + i);
          ObjectStateXYZ.loadJSONData({
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
                    paramLinks: {
                      xyz: {
                        linkType: 1,
                        mappingValueIndex: 0,
                      },
                    },
                  },
                },
              ],
              viewOffset: [0, 0],
              viewZoom: 1.0,
            },
          });
          trCCaed = trCC.variables.addItem("Point3D Parameter");
          trCCaed.setName("/aed");
          createParamReferenceTo(
            "/modules/holophonix/values/objectsParameters/aed/" + i,
            "/customVariables/_track_" + i + "/variables/_aed/_aed"
          );
          ObjectStateAED = root.states.aedStates.processors.addItem("Mapping");
          ObjectStateAED.setName("/track/" + i);
          ObjectStateAED.loadJSONData({
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
                        "/_aed",
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
                  commandType: "Send aed",
                  command: {
                    parameters: [
                      {
                        value: i,
                        hexMode: false,
                        controlAddress: "/sourceIndex",
                      },
                    ],
                    paramLinks: {
                      aed: {
                        linkType: 1,
                        mappingValueIndex: 0,
                      },
                    },
                  },
                },
              ],
              viewOffset: [0, 100],
              viewZoom: 1.0,
            },
          });
          trCCgain = trCC.variables.addItem("Float Parameter");
          trCCgain.setName("/gain");
          createParamReferenceTo(
            "/modules/holophonix/values/objectsParameters/gain/" + i,
            "/customVariables/_track_" + i + "/variables/_gain/_gain"
          );
          ObjectStateGain =
            root.states.gainStates.processors.addItem("Mapping");
          ObjectStateGain.setName("/track/" + i);
          ObjectStateGain.loadJSONData({
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
                        "/_gain",
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
                  commandType: "Send gain",
                  command: {
                    parameters: [
                      {
                        value: i,
                        hexMode: false,
                        controlAddress: "/sourceIndex",
                      },
                    ],
                    paramLinks: {
                      gain: {
                        linkType: 1,
                        mappingValueIndex: 0,
                      },
                    },
                  },
                },
              ],
              viewOffset: [0, 200],
              viewZoom: 1.0,
            },
          });
        }
      }
    }
  }
}

function createNewPreset() {
  cuesNames = local.parameters.recordCues.globalCuesName.get();
  cueName;
  cuesLength;
  cueTrigger = root.states.cueTriggers.processors.addItem("Action");
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
        cueName = cuesNames;
        iCC.setName(cuesNames);
      } else {
        cueName = "Cue" + (cuesLength + 1);
        iCC.setName("Cue" + (cuesLength + 1));
      }
      cueTrigger.setName(cueName);
      actionName = "/_track_" + i + "/presets/" + cueName;
      triggerConsequence = root.states.cueTriggers.processors
        .getItemWithName(cueName)
        .consequencesTRUE.addItem("Consequence");
      triggerConsequence.loadJSONData({
        niceName: "track " + i,
        type: "Consequence",
        commandModule: "customVariables",
        commandPath: "",
        commandType: "Go to preset",
        command: {
          parameters: [
            {
              value: "/_track_" + i + "/presets/" + cueName,
              controlAddress: "/targetPreset",
            },
            {
              value: 5.0,
              controlAddress: "/interpolationTime",
              enabled: true,
            },
          ],
          containers: {
            interpolationCurve: {
              parameters: [
                {
                  value: 1.0,
                  controlAddress: "/length",
                },
                {
                  value: [0.0, 1.0],
                  controlAddress: "/viewValueRange",
                },
                {
                  value: [0.0, 1.0],
                  controlAddress: "/range",
                  enabled: true,
                },
                {
                  value: false,
                  controlAddress: "/enabled",
                },
              ],
              editorIsCollapsed: true,
              hideInRemoteControl: false,
              items: [
                {
                  parameters: [
                    {
                      value: "Bezier",
                      controlAddress: "/easingType",
                    },
                  ],
                  niceName: "Key",
                  containers: {
                    easing: {
                      parameters: [
                        {
                          value: [0.300000011920929, 0.0],
                          controlAddress: "/anchor1",
                        },
                        {
                          value: [-0.300000011920929, 0.0],
                          controlAddress: "/anchor2",
                        },
                      ],
                    },
                  },
                  type: "Key",
                },
                {
                  parameters: [
                    {
                      value: 1.0,
                      controlAddress: "/position",
                    },
                    {
                      value: 1.0,
                      controlAddress: "/value",
                    },
                    {
                      value: "Bezier",
                      controlAddress: "/easingType",
                    },
                  ],
                  niceName: "Key 1",
                  containers: {
                    easing: {},
                  },
                  type: "Key",
                },
              ],
              viewOffset: [0, 0],
              viewZoom: 1.0,
              owned: true,
              niceName: "Interpolation Curve",
            },
          },
          paramLinks: {},
        },
      });
    }
  }
}

///**
// * Callback functions for module commands
//
///**

/**
 * aed	: Send spheric coordinate of sound location.
 * 1 int [1, 128] object index
 * 2 Point3D [a, e, d] [[-180, -90, 0],[180, 90, 1]]
 *
 * example : /track/4/aed -22.5 12.7 0.9
 */
function aed(sourceIndex, aed) {
  local.send("/track/" + sourceIndex + "/aed", aed[0], aed[1], aed[2]);
}

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

/**
 * gain	: Send gain of sound object.
 * 1 int [1, 128] object index
 * 2 float [0,1] gain
 *
 * example : /track/3/x 0.707
 */
function gain(sourceIndex, gain) {
  local.send("/track/" + sourceIndex + "/gain", gain);
}

/**
 * getAED	: Send spheric coordinate of sound location query.
 * 1 int [1, 128] object index
 *
 */
function getAED(sourceIndex) {
  local.send("/get", "/track/" + sourceIndex + "/aed");
}

/**
 * getXYZ : Send (x,y,z) position of sound object query.
 * 1 int [1, 128] object index
 *
 */
function getXYZ(sourceIndex) {
  local.send("/get", "/track/" + sourceIndex + "/xyz");
}

/**
 * getGain	: Send gain of sound object query.
 * 1 int [1, 128] object index
 *
 */
function getGain(sourceIndex) {
  local.send("/get", "/track/" + sourceIndex + "/gain");
}

//**Function to link module Values to corresponding CCs
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

if (local.values.objectsParameters.xyz) {
  updateObjectsList();
}
