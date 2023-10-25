/* Chataigne Module for Holophonix spatial audio processor
based on Module for ADM-OSC v1.1 (c)  developed by Mathieu Delquignies, 5/2023
===============================================================================


/**
 *  GLOBAL VARIABLES
 */
// Module parameters
var getTracksXYZ = false;
var getTracksAED = false;
var getTracksGain = false;

// tracks parameters containers pointers arrays
var xyzParam = [];
var aedParam = [];
var gainParam = [];

var tracksList = [];
var reinitialize = 0;

var tracksIDsDeclaration;
var declaredTracks = [];
var lastSendTime = 0;
var requestSendRate; //in milliseconds
var option = "initial";
var recMode = local.parameters.manageCues.recMode.get();


/**
 * Module initialization
 */
function init() {
  // Setup default reception update rate and get update states as in module GUI
  requestSendRate = local.parameters.requestValues.autoRequestRate.get();
  script.setUpdateRate(5000);
  getTracksValues = local.parameters.requestValues.autoRequest.get();
  tracksIDsDeclaration = local.parameters.controlledTracks.tracksIDs.get();
  updateTracksList();
  // Module GUI settings
  local.scripts.setCollapsed(true);
  //Add States to state machine
  if (root.states.getChild("XYZ Outputs") == undefined) {
    xyzOutputs = root.states.addItem();
    xyzOutputs.loadJSONData({
  if (root.states.getChild("XYZ Outputs") == undefined) {
    xyzOutputs = root.states.addItem();
    xyzOutputs.loadJSONData({
      parameters: [
        {
          value: [-500.0, 0.0],
          controlAddress: "/viewUIPosition",
        },
        {
          value: [
            0.2627451121807098, 0.6274510025978088, 0.6431372761726379, 1.0,
          ],
          controlAddress: "/color",
        },
        {
          value: false,
          controlAddress: "/active",
        },
      ],
      niceName: "XYZ Outputs",
      niceName: "XYZ Outputs",
      type: "State",
      processors: {
        viewOffset: [0, 0],
        viewZoom: 1.0,
      },
    });
  } else {
    root.states.getChild("XYZ Outputs").active.set(0);
    root.states.getChild("XYZ Outputs").active.set(0);
  }

  if (root.states.getChild("AED Outputs") == undefined) {
    aedOutputs = root.states.addItem();
    aedOutputs.loadJSONData({
  if (root.states.getChild("AED Outputs") == undefined) {
    aedOutputs = root.states.addItem();
    aedOutputs.loadJSONData({
      parameters: [
        {
          value: [-250.0, 0.0],
          controlAddress: "/viewUIPosition",
        },
        {
          value: [
            0.2627451121807098, 0.6274510025978088, 0.6431372761726379, 1.0,
          ],
          controlAddress: "/color",
        },
        {
          value: false,
          controlAddress: "/active",
        },
      ],
      niceName: "AED Outputs",
      niceName: "AED Outputs",
      type: "State",
      processors: {
        viewOffset: [0, 0],
        viewZoom: 1.0,
      },
    });
  } else {
    root.states.getChild("AED Outputs").active.set(0);
    root.states.getChild("AED Outputs").active.set(0);
  }

  if (root.states.getChild("Gain Outputs") == undefined) {
    gainOutputs = root.states.addItem();
    gainOutputs.loadJSONData({
  if (root.states.getChild("Gain Outputs") == undefined) {
    gainOutputs = root.states.addItem();
    gainOutputs.loadJSONData({
      parameters: [
        {
          value: [0.0, 0.0],
          controlAddress: "/viewUIPosition",
        },
        {
          value: [
            0.2627451121807098, 0.6274510025978088, 0.6431372761726379, 1.0,
          ],
          controlAddress: "/color",
        },
        {
          value: false,
          controlAddress: "/active",
        },
      ],
      niceName: "Gain Outputs",
      niceName: "Gain Outputs",
      type: "State",
      processors: {
        viewOffset: [0, 0],
        viewZoom: 1.0,
      },
    });
  } else {
    root.states.getChild("Gain Outputs").active.set(0);
    root.states.getChild("Gain Outputs").active.set(0);
  }

  if (root.states.getChild("Cues") == undefined) {
    cues = root.states.addItem();
    cues.loadJSONData({
  if (root.states.getChild("Cues") == undefined) {
    cues = root.states.addItem();
    cues.loadJSONData({
      parameters: [
        {
          value: [-500.0, 250.0],
          controlAddress: "/viewUIPosition",
        },
        {
          value: [
            0.6431372761726379, 0.2784313857555389, 0.5137255191802979, 1.0,
          ],
          controlAddress: "/color",
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
      niceName: "Cues",
      niceName: "Cues",
      type: "State",
      processors: {
        viewOffset: [0, 0],
        viewZoom: 1.0,
      },
    });
    cuesConductor = root.states.cues.processors.addItem("Conductor");
    cuesConductor = root.states.cues.processors.addItem("Conductor");
  }
  //NEXT LINE MAKES CHATAIGNE CRASH!
  //xyzORaed = root.states.transitions.addItem("Action");
  //xyzORaed.sourceState = "xyzOutputs";
  //xyzORaed.desState = "aedOutputs";
  root.states.addTransition("xyzOutputs", "aedOutputs");
  local.parameters.manageCues.recMode.set(1);
  //populateCueList();
  updateTracksList();
}

function populateCueList() {
  if (root.states.getChild("Cues")) {
  if (root.states.getChild("Cues")) {
    if (
      root.modules.holophonix.parameters.manageCues.selectCue.get() == undefined
    ) {
      cueListState = root.states.getChild("Cues");
      cueList = cueListState.processors.conductor.processors.getItems();
      cueListState = root.states.getChild("Cues");
      cueList = cueListState.processors.conductor.processors.getItems();
      for (i = 0; i < cueList.length; i++) {
        local.parameters.manageCues.selectCue.addOption(
          cueList[i].name,
          cueList[i].name
        );
      }
    }
  }
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
    if (param.is(local.parameters.manageCues.recMode)) {
      recMode = local.parameters.manageCues.recMode.get();
      script.log("recMode changed to : " + recMode);
      if (recMode == 0) {
        local.parameters.oscInput.enabled.set(false);
        local.parameters.manageCues.coordMode.setAttribute("readOnly",false);
        //local.parameters.manageCues.coordMode.setData("opt1");
        //root.states.xyzOutputs.active.set(true);
        //root.states.aedOutputs.active.set(true);
        root.states.gainOutputs.active.set(true);
        script.log("coord mode is set to:",local.parameters.manageCues.coordMode.get());
        if(local.parameters.manageCues.coordMode.get() =="opt1"){
          root.states.aedOutputs.active.set(true);
        }else{
          root.states.xyzOutputs.active.set(true);
        }
      } else {
        local.parameters.oscInput.enabled.set(true);
        local.parameters.manageCues.coordMode.setAttribute("readOnly",true);
        root.states.xyzOutputs.active.set(false);
        root.states.aedOutputs.active.set(false);
        root.states.gainOutputs.active.set(false);
      }
      script.log("oscInput  : " + local.parameters.oscInput.enabled);
    }
    // handling of "get" parameters settings changes
    if (param.is(local.parameters.requestValues.autoRequest)) {
      getTracksValues = param.get();
    }
  }
  if (param.is(local.parameters.manageCues.coordMode)) {
    coordMode = local.parameters.manageCues.coordMode.get();
    if (coordMode == "opt1"){
      root.states.aedOutputs.active.set(true);
        }else{
          root.states.xyzOutputs.active.set(true);
        }
    }

  if (param.is(local.parameters.manageCues.createCue)) {
    script.log("createNewPreset Triggered!!");
    createNewPreset();
  }
  if (param.name == "tracksIDs") {
    getDeclaredTracks();
  }
  if (param.name == "addTracks") {
    getDeclaredTracks();
    // New Tracks declared.
    createTracksContainer();
    createCV();
  }
  if (param.name == "removeTracks") {
    getDeclaredTracks();
    script.log("declared tracks are :" + tracksList);
    //updateTracksList();
    removeTracksContainer();
    deleteCVs();
  }
  if (param.name == "manualRequest") {
    updateTracksList();
    for (i = 0; i < tracksList.length; i++) {
      if (local.values.tracksParameters.xyz.getChild(i) !== undefined) {
        getXYZ(i);
      }
      if (local.values.tracksParameters.aed.getChild(i) !== undefined) {
        getAED(i);
      }
      if (local.values.tracksParameters.gain.getChild(i) !== undefined) {
        getGain(i);
      }
    }
  }
  if (param.name == "reloadCue") {
    root.states.cues.active.set(1);
    root.states.cues.active.set(1);
    cueToReload = local.parameters.manageCues.selectCue.get();
    manualAction =
      root.states.cues.processors.conductor.processors.getItemWithName(cueToReload).conditions
      root.states.cues.processors.conductor.processors.getItemWithName(cueToReload).conditions
        .manual.active;
    script.log("Manual action = " + manualAction);
    manualAction.set(1);
    manualAction.set(0);
  }
  if (param.name == "deleteCue") {
    cueToDelete = local.parameters.manageCues.selectCue.get();
    //script.log("Cue to delete : " + cueToDelete);
    toDelete = root.states.cues.processors.conductor.processors.getItemWithName(cueToDelete);
    toDelete = root.states.cues.processors.conductor.processors.getItemWithName(cueToDelete);
    allCues = local.parameters.manageCues.selectCue.getAllOptions();
    //script.log("all options : " + JSON.stringify(allCues));
    local.parameters.manageCues.selectCue.removeOptions();
    for (i = 0; i < allCues.length; i++) {
      //script.log("i key : " + allCues[i].key);
      if (allCues[i].key !== cueToDelete) {
        local.parameters.manageCues.selectCue.addOption(
          allCues[i].key,
          allCues[i].key
        );
      } else {
      }
    }

    root.states.cues.processors.conductor.processors.removeItem(toDelete);
    root.states.cues.processors.conductor.processors.removeItem(toDelete);

    cVs = root.customVariables.getItems();
    for (var j = 0; j < cVs.length; j++) {
      if (cVs[j].presets.getItemWithName(cueToDelete) !== undefined) {
        cVs[j].presets.removeItem(cueToDelete);
      }
    }
  }
  if (param.name == "updateCue") {
    cueToUpdate = local.parameters.manageCues.selectCue.get();
    cVs = root.customVariables.getItems();
    for (var j = 0; j < cVs.length; j++) {
      if (cVs[j].presets.getItemWithName(cueToUpdate) !== undefined) {
        cVs[j].presets.getItemWithName(cueToUpdate).update.trigger();
        //cVs[j].presets.getItemWithName(cueToUpdate).update = 0;
      }
      else{
        //ToDo: populate track's preset with cue's name if track didn't exist before! 
      }
      else{
        //ToDo: populate track's preset with cue's name if track didn't exist before! 
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
    if (tracksList !== undefined) {
      if (tracksList.indexOf(objectID) == -1) {
        script.logWarning("Received not handled object number : " + objectID);
        return;
      }

      if (address[3] == "xyz") {
        local.values.tracksParameters.xyz.getChild(objectID).set(args);
      }
      if (address[3] == "x") {
        previousXYZ = local.values.tracksParameters.xyz
          .getChild(objectID)
          .get();
        local.values.tracksParameters.xyz
          .getChild(objectID)
          .set(args[0], previousXYZ[1], previousXYZ[2]);
      }
      if (address[3] == "y") {
        previousXYZ = local.values.tracksParameters.xyz
          .getChild(objectID)
          .get();
        local.values.tracksParameters.xyz
          .getChild(objectID)
          .set(previousXYZ[0], args[0], previousXYZ[2]);
      }
      if (address[3] == "z") {
        previousXYZ = local.values.tracksParameters.xyz
          .getChild(objectID)
          .get();
        local.values.tracksParameters.xyz
          .getChild(objectID)
          .set(previousXYZ[0], previousXYZ[1], args[0]);
      }
      if (address[3] == "aed") {
        local.values.tracksParameters.aed.getChild(objectID).set(args);
      }
      if (address[3] == "azim") {
        previousAED = local.values.tracksParameters.aed
          .getChild(objectID)
          .get();
        local.values.tracksParameters.aed
          .getChild(objectID)
          .set(args[0], previousAED[1], previousAED[2]);
      }
      if (address[3] == "elev") {
        previousAED = local.values.tracksParameters.aed
          .getChild(objectID)
          .get();
        local.values.tracksParameters.aed
          .getChild(objectID)
          .set(previousAED[0], args[0], previousAED[2]);
      }
      if (address[3] == "dist") {
        previousAED = local.values.tracksParameters.aed
          .getChild(objectID)
          .get();
        local.values.tracksParameters.aed
          .getChild(objectID)
          .set(previousAED[0], previousAED[1], args[0]);
      }
      if (address[3] == "gain") {
        script.log(
          "gain value : " + args + " received for track n° : " + objectID
        );
        local.values.tracksParameters.gain.getChild(objectID).set(args[0]);
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
    if (reinitialize == 0) {
      local.parameters.manageCues.recMode.set(1);
      local.parameters.oscInput.enabled.set(true);
      root.states.xyzOutputs.active.set(false);
      root.states.aedOutputs.active.set(false);
      root.states.gainOutputs.active.set(false);
      root.states.xyzOutputs.active.set(false);
      root.states.aedOutputs.active.set(false);
      root.states.gainOutputs.active.set(false);
    }
    if (reinitialize < 3) {
      if (reinitialize == 1) {
        populateCueList();
      }
      updateTracksList();
      reinitialize = reinitialize + 1;
    }
    // Sends commands to retrieve values, at specified updateRate.
    if (getTracksValues) {
      updateTracksList();
      for (i = 0; i < tracksList.length; i++) {
        if (local.values.tracksParameters.xyz.getChild(i) !== undefined) {
          getXYZ(i);
        }
        if (local.values.tracksParameters.aed.getChild(i) !== undefined) {
          getAED(i);
        }
        if (local.values.tracksParameters.gain.getChild(i) !== undefined) {
          getGain(i);
        }
      }
    }

    lastSendTime = t;
  }
}

//** Create tracks container */
function createTracksContainer(option) {
  if (local.values.tracksParameters == undefined) {
    TracksContainer = local.values.addContainer("Tracks parameters");
  } else {
    TracksContainer = local.values.tracksParameters;
  }

  //** Add XYZ container & values */
  xyzContainer = TracksContainer.addContainer("xyz");
  for (i = 0; i < declaredTracks.length; i++) {
    if (declaredTracks[i] !== undefined) {
      xyzParam[i] = xyzContainer.addPoint3DParameter(i, "xyz", 0, -20, 20);
      xyzParam[i].setAttribute("readonly", true);
    }
  }
  xyzContainer.setCollapsed(true);

  //** Add AED container & values */
  aedContainer = TracksContainer.addContainer("aed");
  for (i = 0; i < declaredTracks.length; i++) {
    if (declaredTracks[i] !== undefined) {
      aedParam[i] = aedContainer.addPoint3DParameter(i, "aed", 0);
      aedParam[i].setAttribute("readonly", true);
    }
  }
  aedContainer.setCollapsed(true);

  //** Add gain container & values */
  gainContainer = TracksContainer.addContainer("gain");
  for (i = 0; i < declaredTracks.length; i++) {
    if (declaredTracks[i] !== undefined) {
      gainParam[i] = gainContainer.addFloatParameter(i, "gain", 0, -60, 12);
      gainParam[i].setAttribute("readonly", true);
    }
  }
  gainContainer.setCollapsed(true);
}

function removeTracksContainer() {
  if (local.values.tracksParameters == undefined) {
    TracksContainer = local.values.addContainer("Tracks parameters");
  } else {
    TracksContainer = local.values.tracksParameters;
  }

  for (i = 0; i < declaredTracks[declaredTracks.length - 1] + 1; i++) {
    if (declaredTracks[i] !== undefined) {
      TracksContainer.xyz.removeParameter(i);
      TracksContainer.aed.removeParameter(i);
      TracksContainer.gain.removeParameter(i);
    }
  }
}

//** Create New Custom Variable based on declared Object  */
function createCV(option) {
  existingCVs = root.customVariables.getItems();
  if (option == "initial") {
    for (i = 0; i < declaredTracks[declaredTracks.length - 1] + 1; i++) {
      if (declaredTracks[i] !== undefined) {
        trCV = root.customVariables.addItem();
        trCV.setName("/track/" + i);
        trCVxyz = trCV.variables.addItem("Point3D Parameter");
        trCVxyz.setName("/xyz");
        trCVaed = trCV.variables.addItem("Point3D Parameter");
        trCVaed.setName("/aed");
        trCVgain = trCV.variables.addItem("Float Parameter");
        trCVgain.setName("/gain");
      }
    }
    option = "";
  } else {
    CVsNames = [];
    cVs = root.customVariables.getItems();
    for (var j = 0; j < cVs.length; j++) {
      CVsNames.push(cVs[j].name);
      //      root.customVariables.removeItem(cVs[j].name);
    }

    for (i = 0; i < declaredTracks.length; i++) {
      CVindex = CVsNames.indexOf("_track_" + i);
      script.log(" CV in CVs index = " + CVindex + " for i = " + i);
      script.log("list of existing CVs : " + JSON.stringify(CVsNames));
      if (declaredTracks[i] !== undefined) {
        if (CVindex == -1) {
          trCV = root.customVariables.addItem();
          trCV.setName("/track/" + i);
          trCVxyz = trCV.variables.addItem("Point3D Parameter");
          trCVxyz.setName("/xyz");
          createParamReferenceTo(
            "/modules/holophonix/values/tracksParameters/xyz/" + i,
            "/customVariables/_track_" + i + "/variables/_xyz/_xyz"
          );
          //** Add corresponding mappings to states * /
          ObjectStateXYZ = root.states.xyzOutputs.processors.addItem("Mapping");
          ObjectStateXYZ = root.states.xyzOutputs.processors.addItem("Mapping");
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
                  commandPath: "Set tracks",
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
          trCVaed = trCV.variables.addItem("Point3D Parameter");
          trCVaed.setName("/aed");
          createParamReferenceTo(
            "/modules/holophonix/values/tracksParameters/aed/" + i,
            "/customVariables/_track_" + i + "/variables/_aed/_aed"
          );
          ObjectStateAED = root.states.aedOutputs.processors.addItem("Mapping");
          ObjectStateAED = root.states.aedOutputs.processors.addItem("Mapping");
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
                  commandPath: "Set tracks",
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
          trCVgain = trCV.variables.addItem("Float Parameter");
          trCVgain.setName("/gain");
          createParamReferenceTo(
            "/modules/holophonix/values/tracksParameters/gain/" + i,
            "/customVariables/_track_" + i + "/variables/_gain/_gain"
          );
          ObjectStateGain =
            root.states.gainOutputs.processors.addItem("Mapping");
            root.states.gainOutputs.processors.addItem("Mapping");
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
                  commandPath: "Set tracks",
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

function deleteCVs() {
  for (i = 0; i < declaredTracks.length; i++) {
    if (declaredTracks[i] !== undefined) {
      root.customVariables.removeItem("/track/" + i);
      root.states.xyzOutputs.processors.removeItem("/track/" + i);
      root.states.aedOutputs.processors.removeItem("/track/" + i);
      root.states.gainOutputs.processors.removeItem("/track/" + i);
      root.states.xyzOutputs.processors.removeItem("/track/" + i);
      root.states.aedOutputs.processors.removeItem("/track/" + i);
      root.states.gainOutputs.processors.removeItem("/track/" + i);
    }
  }
}

//* Create a new preset */
function createNewPreset() {
  cuesNames = local.parameters.manageCues.newCue_sName.get();
//  listOfCues = root.states.cues.processors.getItems();
  listOfCues = root.states.cues.processors.conductor.processors.getItems();
//  listOfCues = root.states.cues.processors.getItems();
  listOfCues = root.states.cues.processors.conductor.processors.getItems();
  cueName;
  cuesLength;
//  cueTrigger = root.states.cues.processors.addItem("Action");
  cueAdded = root.states.cues.processors.conductor.processors.addItem("Cue");
//  cueTrigger = root.states.cues.processors.addItem("Action");
  cueAdded = root.states.cues.processors.conductor.processors.addItem("Cue");
  script.log(
    "createNewPreset Triggered!!  CuesNames ==" +
      cuesNames +
      "listOfCues ==" +
      JSON.stringify(listOfCues[0].name)
  );
  cVsIDs = [];
  cVs = root.customVariables.getItems();
  for (var j = 0; j < cVs.length; j++) {
    cVsIDs.push(parseInt(cVs[j].name.split("_")[2]));
  }
  maxID = cVsIDs[0];
  for (i = 1; i < cVsIDs.length; ++i) {
    if (cVsIDs[i] > maxID) {
      maxID = cVsIDs[i];
    }
  }
  script.log("cVs Max ID : " + maxID);

  for (i = 0; i < maxID + 1; i++) {
    if (cVsIDs.contains(i)) {
      cuesLength = root.customVariables
        .getItemWithName("_track_" + i)
        .presets.getItems().length;
      iCV = root.customVariables
        .getItemWithName("_track_" + i)
        .presets.addItem("String");

      if (cuesNames !== "") {
        if (listOfCues[listOfCues.length - 1].name !== cuesNames) {
          cueName = cuesNames;
          iCV.setName(cuesNames);
        } else {
          cueName = cuesNames + 1;
          iCV.setName(cueName);
          local.parameters.manageCues.newCue_sName.set(cueName);
        }
      } else {
        cueName = "Cue" + (cuesLength + 1);
        iCV.setName("Cue" + (cuesLength + 1));
      }
    //  cueTrigger.setName(cueName);
      cueAdded.setName(cueName);

    //  cueTrigger.setName(cueName);
      cueAdded.setName(cueName);

      actionName = "/_track_" + i + "/presets/" + cueName;
      //**Add a Trigger to load created preset
      triggerConsequence = root.states.cues.processors.conductor.processors
      triggerConsequence = root.states.cues.processors.conductor.processors
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
  triggerManual = root.states.cues.processors.conductor.processors
  triggerManual = root.states.cues.processors.conductor.processors
    .getItemWithName(cueName)
    .conditions.addItem("Manual");

  //script.log("  list of existing Cues: " + listOfCues);
  if (listOfCues[listOfCues.length - 1].name !== cueName) {
    local.parameters.manageCues.selectCue.addOption(cueName, cueName);
  }
}

//**
//* Callback functions for module commands
//**

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

//**Function to link module Values to corresponding CVs
function createParamReferenceTo(toValue, fromParam) {
  script.log(
    "Create Reference  from param : " + fromParam + " to value of : " + toValue
  );

  // From param, retrieve object
  var fromObj = root.getChild(fromParam);
  var paramToLink = fromObj.getParent();

  // To value of, retrieve object. Done in this way to validate the OSC address already provided.
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
cue;

function getDeclaredTracks() {
  for (k = 1; k < 129; k++) {
    declaredTracks[k] = undefined;
  }
  tracksIDsDeclaration = local.parameters.controlledTracks.tracksIDs.get();
  if (tracksIDsDeclaration.indexOf("-") > -1) {
    tmpList = tracksIDsDeclaration.split("-");
    script.log("tmpList   " + JSON.stringify(tmpList));
    declaredTracks[parseInt(tmpList[0])] = parseInt(tmpList[0]);
    declaredTracks[parseInt(tmpList[1])] = parseInt(tmpList[1]);

    for (i = parseInt(tmpList[0]) + 1; i < parseInt(tmpList[1]); i++) {
      declaredTracks[i] = i;
    }

    script.log(" tracks list case 1 : " + JSON.stringify(declaredTracks));
  } else if (tracksIDsDeclaration.indexOf(",") > -1) {
    tmpList1 = tracksIDsDeclaration.split(",");
    script.log("tmpList1   " + JSON.stringify(tmpList1));
    for (i = 0; i < parseInt(tmpList1[tmpList1.length - 1]) + 1; i++) {
      if (tmpList1.indexOf(i) > -1) {
        declaredTracks[i] = i;
      }
    }
    script.log(" tracks list case 2 : " + JSON.stringify(declaredTracks));
  } else {
    declaredTracks[parseInt(tracksIDsDeclaration)] =
      parseInt(tracksIDsDeclaration);
    script.log(" tracks list case 3 : " + JSON.stringify(declaredTracks));
  }
}

function updateTracksList() {
  for (i = 0; i < 129; i++) {
    if (local.values.tracksParameters.xyz) {
      if (root.customVariables.getChild("_track_" + i)) {
        tracksList[i] = i;
        if (local.values.tracksParameters.xyz.getChild(i)) {
        } else {
          xyzParam[i] = local.values.tracksParameters.xyz.addPoint3DParameter(
            i,
            "xyz",
            0,
            -20,
            20
          );
          xyzParam[i].setAttribute("readonly", true);
          aedParam[i] = local.values.tracksParameters.aed.addPoint3DParameter(
            i,
            "aed",
            0
          );
          aedParam[i].setAttribute("readonly", true);
          gainParam[i] = local.values.tracksParameters.gain.addFloatParameter(
            i,
            "gain",
            0,
            -60,
            12
          );
          gainParam[i].setAttribute("readonly", true);
        }
      }
    }
  }
}

//if (local.values.tracksParameters.xyz) {
//  updateTracksList();
//}
