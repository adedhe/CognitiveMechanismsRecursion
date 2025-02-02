//<---- Original Object ---->
let CAOsExp = {};

//<---- DOM ---->
CAOsExp.DOM = document.getElementById("CAOsExp");

//<---- DATA ---->
CAOsExp.data = {}; //The obj that holds the other data forms
CAOsExp.data.init = {}; //The defaults dataCreate copies to data.current + stores trial/exp settings
CAOsExp.data.current = {}; //The current data collected for this event
CAOsExp.data.log = []; //the overall collection of all data events
CAOsExp.data.id = Date.now(); // Generates a UUID based on the timestamp

//<---- Functions ---->
CAOsExp.functions = {};

/**
 * Function: shuffle
 * Uses the fisher-yates shuffle algorithm to randomize a supplied array's elements
 * param {array} array - the array to be shuffled (shallow)
 * obtained from this StackOverflow post: https://stackoverflow.com/a/6274381
 * @param {Array} array 
 */
CAOsExp.functions.shuffle = function(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/**
 * Function: cartesianProduct [Takes multiple arrays and does equivalent to r's expand.grid()]
 * Takes every combination of multiple arrays (like r's expand.grid fn)
 * Taken from this StackOverflow post: https://stackoverflow.com/a/46951510
 * @param  {...any} arrays 
 * @returns 
 */
CAOsExp.functions.cartesianProduct = function(...arrays) {
    return [...arrays].reduce((a, b) =>
                              a.map(x => b.map(y => x.concat(y)))
                              .reduce((a, b) => a.concat(b), []), [[]]);
}

/**
 * Function: parentID [finds the parent ID of any atom (e.g. '_0_1_0_3's parent == '_0_1_0')]
 * @param {*} yourID 
 * @param {String} sep 
 * @returns 
 */
CAOsExp.functions.parentID = function(yourID, sep = '_'){
    return yourID.slice(0,yourID.lastIndexOf(sep));
}

/**
 * Function: arrayCheck [For use with Array.some/every() ~ Checks if the array is true]
 * const arrayCheck = (element) => element === true;
 * @param {*} element 
 * @returns 
 */
CAOsExp.functions.arrayCheck = function(element){
    return element === true;
}

/**
 * Function: uuid v4
 * I started to do something fancy, but then I found someone who had the same idea and used the same crypto API, but did it better
 * source: https://stackoverflow.com/a/2117523
 * @returns 
 */
CAOsExp.functions.uuid4 = function(){
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
      );
}
/**
 * Function: genID() [generates a random ID]
 * @returns 
 */
CAOsExp.functions.genID = function(){
    return crypto ? CAOsExp.functions.uuid4() : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
/**
 * Function: fixArrayLength [fixes array lengths to be the correct size, using css-style logic]
 * @param {Array} array 
 * @param {Number} length 
 * @returns 
 */
CAOsExp.functions.fixArrayLength = function(array, length){
    // corrects arrayData based on length
   if (array.length > length) {
        return array.slice(0, length);
    } else if(array.length < length) {
        let backtrack = array.length
        for (i = array.length; i < length; i++) {
            array.push(array[i - backtrack]);
        }
        return [...array];
    } else {
        return array;
    }  
}

/**
 * Function: createRatio ObjArray [create Array of objects (using ratio arguments & correction logic)]
 * @param {Object} objs 
 * @param {Array} arrayData 
 * @param {Boolean} randomize 
 * @returns 
 */
CAOsExp.functions.createRatioObjArray = function(objs, arrayData = [1], randomize = false){
    // Temporary data to hold the return product
    let createRatioObjArrayTEMP = [];
    
    // corrects arrayData length if necessary
    arrayData = CAOsExp.functions.fixArrayLength(arrayData, objs.length);

    // creates the ratio'd object array
    for(let cROAi = 0; cROAi < arrayData.length; cROAi++){
        for(let cROAj = 0; cROAj < arrayData[cROAi]; cROAj++){
            createRatioObjArrayTEMP.push(objs[cROAi]);
        }
    }

    //shuffles the array if wanted
    if(randomize){
        CAOsExp.functions.shuffle(createRatioObjArrayTEMP);
    }

    return createRatioObjArrayTEMP;

}

/**
 * Function: calcGrid
 * @param {Number} width 
 * @param {Number} height 
 * @param {*} stim_w 
 * @param {*} stim_h 
 * @param {Array} margin 
 * @param {Boolean} nRow 
 * @param {Boolean} nCol 
 * @param {Boolean} outputQuant 
 * @param {Boolean} jitter 
 * @param {Boolean} shuffle 
 * @param {String} arrange 
 * @returns 
 */
CAOsExp.functions.calcGrid = function(width, height, stim_w, stim_h, margin, nRow = false, nCol = false, outputQuant = false, jitter = false, shuffle = true, arrange = 'x'){
    // assigns defaults
    stim_w = stim_w || 72 * window.devicePixelRatio;
    stim_h = stim_h || 72 * window.devicePixelRatio;
    margin = margin || [1, 1, 1, 1];
    
    //updates margin size to array 4
    if (typeof(margin) !== "object"){
        margin = [margin]
    }
    
    switch (margin.length){
        case 4:
            break;
        case 3:
            margin[3] = 0;
            break;
        case 2:
            margin[2,3] = margin[0,1];
            break;
        case 1:
            margin = [margin[0], margin[0], margin[0], margin[0]];
            break;
        case 0:
            margin = [1, 1, 1, 1];
            break;
        default:
            margin = margin.slice(4);
            break;
    }
    
    // determines how many points in the grid there are total
    let w_quant = 0;
    let h_quant = 0;
    // if nRow or nCol are defined, it sets the quantity of grid points to that
    // if that means that the grid can't fit on the current canvas, then it resizes the canvas
    if(!nRow){
        h_quant = Math.floor(height/(stim_h+margin[1]+margin[3]));
    } else{
        h_quant = Number(nRow);
        if(h_quant > Math.floor(height/(stim_h+margin[1]+margin[3]))){
            margin = 1;
            if(h_quant > Math.floor(height/(stim_h+margin[1]+margin[3]))){
                height = h_quant * (stim_h+margin[1]+margin[3]);
            }
        }
    }
    if(!nCol){
        w_quant = Math.floor(width/(stim_w+margin[0]+margin[2]));
    } else{
        w_quant = Number(nCol);
        if(w_quant > Math.floor(width/(stim_w+margin[0]+margin[2]))){
            margin = 1;
            if(w_quant >Math.floor(width/(stim_w+margin[0]+margin[2]))){
                width = h_quant * (stim_w+margin[0]+margin[2]);
            }
        }
    }
    
    // adjusts margins to better center stimuli
    let w_leftover = Math.floor(width - (w_quant * (stim_w + (margin[0] + margin[2]))));
    w_leftover = Math.floor(w_leftover/(w_quant * 2));
    margin[0] += w_leftover;
    margin[2] += w_leftover;
    
    let h_leftover = Math.floor(height - (h_quant * (stim_h + (margin[1] + margin[3]))));
    h_leftover = Math.floor(h_leftover/(h_quant * 2));
    margin[1] += h_leftover;
    margin[3] += h_leftover;
    
    // determines the actual x coordinates for the grid 
    let w_coords = [];
    for (i = 0 ; i < w_quant ; i++){
        w_coords.push(((stim_w+margin[2])*i)+((i+1)*margin[0]));
    }
    
    // determines the actual x coordinates for 
    let h_coords = [];
    for (i = 0 ; i < h_quant ; i++){
            h_coords.push(((stim_h+margin[3])*i)+((i+1)*margin[1]));
    }
    
    // creates all combination of x/y coordinates
    let r = CAOsExp.functions.cartesianProduct(w_coords, h_coords);
    
    // applies jittering
    if (jitter === true) {
        for(i = 0; i < r.length; i++){
            r[i][0] = r[i][0] + (Math.random()*(margin[0]+margin[2])-margin[0]);
            r[i][1] = r[i][1] + (Math.random()*(margin[1]+margin[3])-margin[1]);
        }
    } else if (!isNaN(parseInt(jitter))){
        for(i = 0; i < r.length; i++){
            r[i][0] = r[i][0] + ((Math.random() - .5) * (2 * jitter));
            r[i][1] = r[i][1] + ((Math.random() - .5) * (2 * jitter));
        }
    }
    
    if (shuffle){
        CAOsExp.functions.shuffle(r);
    }
    
    // arranges coordinates by defined parameter
    switch(true){
        case /-x/.test(arrange):
            r.reverse();
            break;
        case /-y/.test(arrange):
            r.sort(function(a,b){return b[1]-a[1]});
            break;
        case /y/.test(arrange):
            r.sort(function(a,b){return a[1]-b[1]});
            break;
        default:
            break;
    }
    
    if (outputQuant){
        r = r.slice(0, outputQuant);
    }
    
    return r;
}

/**
 * Function: debounce
 * @param {function} callback - the function to be called
 * @param {number} wait - How long to wait for another call in ms
 * @returns 
 */
CAOsExp.functions.deBounce = (callback, wait) => {
    let timeout = null
    return (...args) => {
        const next = () => callback(...args)
        clearTimeout(timeout)
        timeout = setTimeout(next, wait)
    }
}

//<---- Atoms ---->
CAOsExp.atoms = {};

//<---- STORAGE ---->
CAOsExp.storage = {}; // for the user, allows them to store misc variables/functions here without cluttering up the namespace

//<---- Time ---->
CAOsExp.time = {};
CAOsExp.time.deltaTime = 0;
CAOsExp.time.lastTime = 0;
CAOsExp.time.currentTime = 0;

//<---- Event ---->
CAOsExp.event = {};
CAOsExp.event.current = {
  event_type: "",
  event_time: 0,
  event_timeElapsed: 0,
};
CAOsExp.event.currentRaw = {};
CAOsExp.event.prior = {};

//<---- START ---->
CAOsExp.start = function(exp){
    //Create DOM if not already created
    //TODO?  remove other children...
    if(CAOsExp.DOM === null || CAOsExp.DOM === undefined){

        CAOsExp.DOM = document.createElement('div');
        CAOsExp.DOM.id = 'CAOsExp';
        document.body.appendChild(CAOsExp.DOM);
    }
    CAOsExp.DOM.className = 'CAOsExp' // gives it a class name

    // set expTimeline = exp;
    // + add to CAOsExp.atoms at '_0'
    CAOsExp.expTimeline = exp;
    CAOsExp.atoms['_0'] = CAOsExp.expTimeline

    //Call Start Exp
    CAOsExp.expTimeline._startExp();

    // Next
    CAOsExp.expTimeline._next({
        event_type: '_start',
    })
}

//<---- Classes ---->
CAOsExp.classes = {};

// class ATOM ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
CAOsExp.classes.atom = class {
    constructor(settings = true, ...atoms) {
        // setupCustom function
        if(typeof settings.setupCustom_beforeConstructor == 'function'){
            settings.setupCustom_beforeConstructor();
        }
    
        // meta info
        this.classType = "atom";
        this.level = 'undefined';
        this.id = 'undefined';
        this.keyPrefix = "atomLVL";

        // sets the trackers
        this.index = 0;
        this.progress = 0;
        this.count = 0;
        this.trials = 0;
        this.i = 0; //for cross-object counting;

        //Flags
        this.flagExpStart = true;
        this.flagInitialize = true;
        this.flagEnter = true;
        this.flagReset = false;
        this.flagExit = false;
        this.flagFinalize = false;
        this.flagExpEnd = false;

        //Markers
        this.markerExpStart = false;
        this.markerInitialize = false;
        this.markerEnter = false;
        this.markerReset = false;
        this.markerExit = false;
        this.markerFinalize = false;
        this.markerExpEnd = false;

        this.finArray = [];
        this.minTrials;
        this.maxProgress = atoms.length;

        this.atoms = atoms;
        // this.feedback = false;

        // settings
        // TODO: separate out 'data' (needs to be updated every event) & 'settings' (only on enter/exit)
        this.data = {
            keyPrefix: "atomLVL",
            setupEnd_maxCount: false,
            setupEnd_maxTime: false,
            setupEnd_condition: "all", // when do you end this block? Any/All of the trials give a "true" to being over
            setupEnd_conditionStrict: false, // determines whether you can surpass the stated end condition (true) or you have to meet it exactly if applicable (false)
            setupEnd_window: false,
            setupEnd_onEndFinishSet: false,
            infoLevel: undefined,
            infoID: undefined,
            infoType: "atom",
            infoClass: "atom",
            infoName: "UntitledAtom",
            loopIndex: 0,
            loopProgress: 0,
            loopCount: 0,

            timeStart_init: 0, // time @ first initProgress
            timeStart_enter: 0, // time @ latest initProgress
            timeTotal_sinceInit: 0,
            timeTotal_sinceEnter: 0,
            timeDuration_inInit: 0,
            timeDuration_inEnter: 0,

            dataOutput_finished: false,

            setupReset_onResetExit: true,

            setupCustom_beforeConstructor: false,
            setupCustom_beforeStartExp: false, 
            setupCustom_beforeInit: false, 
            setupCustom_beforeEnter: false, 
            setupCustom_beforeLoop: false, 
            setupCustom_beforeExit: false, 
            setupCustom_beforeFin: false, 
            setupCustom_beforeEndExp: false,

            setupCustom_beforeData: false,
            //TODO: reset
            //TODO: setupCustom_onX ones too?
        };

        if (settings !== true) {
            for (let [key, value] of Object.entries(settings)) {
                this.data[key] = value;
            }
        }

        if(typeof this.data.keyPrefix === 'string'){
        this.keyPrefix = this.data.keyPrefix;
        for (let [key] of Object.entries(this.data)) {
            delete Object.assign(this.data, {[`${this.keyPrefix}_${key}`]: this.data[key] })[key];
        }
        }

    }

    /* <---- Flow ----> */
    _next(e) {
        switch (true) {
            case this._checkExpStart(e):
                this._startExp(level, id);
            case this._checkInit(e):
                this._init(e);
            case this._checkEnter(e):
                this._enter(e);
                this._loop(e);
                break;
            case this._checkFin(e):
                console.log(`The current instance is: ${this.name}`);
                this._fin(true, e);
                this._exit(e);
            case this._checkExit(e):
                this._exit(e);
                break;
            case this._checkExpEnd(e):
                this._endExp(e);
                break;
            default:
                this._loop(e);
                break;
          }
    }
  
    _startExp(level, id) {
    // setupCustom function
    if(typeof this.data[`${this.keyPrefix}_setupCustom_beforeStartExp`] == 'function'){
        this.data[`${this.keyPrefix}_setupCustom_beforeStartExp`](e);
    }
    
    // assigns the level/id
    this.level = level || 0;
    this.id = id || "_0";

    // Changes the 'LVL' keyword in this.data to be the actual level
    if (this.keyPrefix.includes("LVL")) {
        for (let [key] of Object.entries(this.data)) {
            delete Object.assign(this.data, {[`${key.replace("LVL", `${this.level}`)}`]: this.data[key] })[key];
        }
        this.keyPrefix = this.keyPrefix.replace("LVL", `${this.level}`);      
    }

    this.data[`${this.keyPrefix}_infoID`] = this.id;
    this.data[`${this.keyPrefix}_infoLevel`] = this.level;

    this.flagExpStart = false;
    this.markerExpStart = true;
    }

    _init(e) {
        // setupCustom function
        if(typeof this.data[`${this.keyPrefix}_setupCustom_beforeInit`] == 'function'){
            this.data[`${this.keyPrefix}_setupCustom_beforeInit`](e);
        }

        this.data[`${this.keyPrefix}_timeStart_init`] = Date.now();
        this.flagInitialize = false;
        this.markerInitialize = true;
    }

    _enter(e) {
        // setupCustom function
        if(typeof this.data[`${this.keyPrefix}_setupCustom_beforeEnter`] == 'function'){
            this.data[`${this.keyPrefix}_setupCustom_beforeEnter`](e);
        }

        this.data[`${this.keyPrefix}_timeStart_enter`] = Date.now();
        this._flagEnter(false);
        this.markerEnter = true;
        // TODO: repetitive i think?
        this._flagExit(false);
        this.markerExit = false;
    }
  
    _loop(e) {
        // setupCustom function
        if(typeof this.data[`${this.keyPrefix}_setupCustom_beforeLoop`] == 'function'){
            this.data[`${this.keyPrefix}_setupCustom_beforeLoop`](e);
        }
        // TODO! everything should call super._loop(e) first so that the custom function works!
    }
  
    _fin(finalized = true) {
        // setupCustom function
        if(typeof this.data[`${this.keyPrefix}_setupCustom_beforeFin`] == 'function'){
            this.data[`${this.keyPrefix}_setupCustom_beforeFin`](e);
        }
        
        this.flagFinalize = false;
        this.markerFinalize = finalized;

        if(this.level > 0){
            CAOsExp.atoms[CAOsExp.functions.parentID(this.id)]._finArrayUpdate(finalized);
        } else {
            this._trialUpdate();
        }

        this.flagExit = true;
    }
  
    _exit(e) {
        // setupCustom function
        if(typeof this.data[`${this.keyPrefix}_setupCustom_beforeExit`] == 'function'){
            this.data[`${this.keyPrefix}_setupCustom_beforeExit`](e);
        }

        this.flagExit = false;
        this.markerExit = true;
        this.flagEnter = true;
        this.markerEnter = false;
    }
  
    _endExp(e) {
        // setupCustom function
        if(typeof this.data[`${this.keyPrefix}_setupCustom_beforeEndExp`] == 'function'){
            this.data[`${this.keyPrefix}_setupCustom_beforeEndExp`](e);
        }
        this.flagExpEnd = false;
        this.markerExpEnd = true;
    }

    _data(e){
        if(typeof this.data[`${this.keyPrefix}_setupCustom_beforeData`] == 'function'){
            this.data[`${this.keyPrefix}_setupCustom_beforeData`](e);
        }
        this._dataCalculate();
        CAOsExp.data.current = Object.assign({}, CAOsExp.data.current, this.data);
        if(this.level > 0){
            CAOsExp.atoms[CAOsExp.functions.parentID(this.id)]._data();
        }
    }
    
    _reset() {
        this.flagReset = false;
        this.markerReset = true;
        this.progress = 0;
        this.count++;
        if(this.data[`${this.keyPrefix}_setupReset_onResetExit`] && this.level > 0){
            this._flagExit();
        }
    }

    /* <---- Flags ----> */
    _flagEnter(x = true){
        this.flagEnter = x;
    }

    _flagExit(x = true){
        this.flagReset = x;
        this.flagExit = x;
    }

    _flagUpdate(x = true) {
      this.flagUpdate = x;
    }

    _flagReset(x = true) {
      this.flagReset = x;
    }

    _flagRender(x = true) {
      this.flagRender = x;
    }

    _flagFin(x = true) {
        this.flagReset = x;
        this.flagExit = x;
        this.flagFinalize = x;
    }

    /* <---- Checks ----> */
    _checkFin(e) {
        let OUT = false;

        switch(true){
            case (this.flagFinalize): //if you've been flagged for finalization
            case (this.markerFinalize): //if you've already been finalized
            case (this.data[`${this.keyPrefix}_setupEnd_maxTime`] ? this.data[`${this.keyPrefix}_timeDuration_inInit`] >= this.data[`${this.keyPrefix}_setupEnd_maxTime`] : false): //if you have a maxCount # and have exceeded that
            case (this.data[`${this.keyPrefix}_setupEnd_maxCount`] ? this.data[`${this.keyPrefix}_loopCount`] >= this.data[`${this.keyPrefix}_setupEnd_maxCount`] : false): //if you have a maxCount # and have exceeded that
            case (this.data[`${this.keyPrefix}_setupEnd_maxTrials`] !== false && this.trials >= this.data[`${this.keyPrefix}_setupEnd_maxTrials`]): //if you have a maxTrials # and have exceeded that
            // TODO: This needs to trigger at the end of the trial too! (is checkFin() not there yet?)
            case this._checkFinArray(this.data[`${this.keyPrefix}_setupEnd_condition`], this.finArray, this.data[`${this.keyPrefix}_setupEnd_conditionStrict`]):
                if(this.data[`${this.keyPrefix}_setupEnd_onEndFinishSet`]){
                    if(this.progress === 0){
                        OUT = true;
                    }
                } else {
                    OUT = true;
                }
                break;
            default:
                break;
        }
        return OUT;
    }

    _checkFinArray(endCondition, endData, endStrict){
        if(this.data[`${this.keyPrefix}_setupEnd_window`] !== false && endData.length >= this.data[`${this.keyPrefix}_setupEnd_window`]){
            endData = endData.slice(endData.length-this.data[`${this.keyPrefix}_setupEnd_window`],endData.length)
        } else if(endStrict){
            return false;
        }

        // TODO: Make this more efficient (faster/less code/more readable)
        if(endStrict){
        switch(true){
            case endCondition == 'any':
                return endData.some(CAOsExp.functions.arrayCheck);
            case endCondition == 'all':
                return endData.every(CAOsExp.functions.arrayCheck);
            case Array.isArray(endCondition): //An array of conditions // TODO: check if this works 
                if(endCondition.length != endData.length){
                    endCondition = CAOsExp.functions.fixArrayLength(endCondition, endData.length);
                }
                let tempCheck = [];
                for(i=0;i<endData.length;i++){
                    tempCheck[i] = endCondition[i] == endData[i];
                }
                return tempCheck.every(CAOsExp.functions.arrayCheck);
            case Number.isInteger(endCondition): // is an integer (has Trues >= integer value) // TODO: check if it works
                return endData.filter(Boolean).length == endCondition; 
            case !isNaN(endCondition) && endCondition % 1 !== 0 && endCondition <= 1: // is a float (has Trues/length >= float value) //TODO: check if this works 
                return endData.filter(Boolean).length/endData.length == endCondition;
            // TODO: float > 1 endCondition
        }
        } else {
        switch(true){
            case endCondition == 'any':
                return endData.some(CAOsExp.functions.arrayCheck);
            case endCondition == 'all':
                return endData.every(CAOsExp.functions.arrayCheck);
            case Array.isArray(endCondition): //An array of conditions // TODO: check if this works 
                if(endCondition.length != endData.length){
                    endCondition = CAOsExp.functions.fixArrayLength(endCondition, endData.length);
                }
                let tempCheck = [];
                for(i=0;i<endData.length;i++){
                    tempCheck[i] = endCondition[i] == endData[i] || endData[i] == false;
                }
                return tempCheck.every(CAOsExp.functions.arrayCheck);
            case Number.isInteger(endCondition): // is an integer (has Trues >= integer value) // TODO: check if it works
                return endData.filter(Boolean).length >= endCondition; 
            case !isNaN(endCondition) && endCondition % 1 !== 0 && endCondition <= 1: // is a float (has Trues/length >= float value) //TODO: check if this works
                return endData.filter(Boolean).length/endData.length >= endCondition;
            // TODO: float > 1 endCondition
        }
        }
    }

    _checkReset() {
      return this.progress >= this.maxProgress;
    }

    _checkExit() {
        let OUT = false;
        if (this.flagExit) {
            OUT = true;
        }
        if (this.markerExit) {
            OUT = false;
        }

      return OUT;
    }

    _checkUpdate() {
      return this.flagUpdate;
    }

    _checkEnter() {
      return this.flagEnter;
    }

    _checkInit() {
      return this.flagInitialize;
    }

    _checkExpEnd() {
      return this.flagExpEnd;
    }

    _checkExpStart() {
      return this.flagExpStart;
    }

    /* <---- Utils ----> */
    _dataCalculate(){
        this.index++;
        this.data[`${this.keyPrefix}_loopIndex`] = this.index;
        this.data[`${this.keyPrefix}_loopProgress`] = this.progress;
        this.data[`${this.keyPrefix}_loopCount`] = this.count;
    
        this.data[`${this.keyPrefix}_dataOutput_finished`] = this.flagFinalize || this.markerFinalize;
    
        this.data[`${this.keyPrefix}_timeTotal_sinceInit`] = CAOsExp.event.current.event_time - this.data[`${this.keyPrefix}_timeStart_init`];
        this.data[`${this.keyPrefix}_timeTotal_sinceEnter`] = CAOsExp.event.current.event_time - this.data[`${this.keyPrefix}_timeStart_enter`];
    
        this.data[`${this.keyPrefix}_timeDuration_inInit`] += CAOsExp.event.current.event_timeElapsed; 
        this.data[`${this.keyPrefix}_timeDuration_inEnter`] += CAOsExp.event.current.event_timeElapsed; 
    }
    
    _finArrayUpdate(finalized = true) {
        if (this.progress > this.finArray.length) {
          this.finArray.push(finalized);
        } else {
          this.finArray[this.progress] = finalized;
        }
    
        if (this._checkFin()) {
          this._fin(true);
        }
    }
    //increment for updating elImage Sequence clicking
    _increment(letReset = false){
      this.progress++;

      if(this.progress >= this.maxProgress){ // [CHANGE]
          this._flagReset();
          if(letReset){
              this._reset();
          }
      }
    }

};

CAOsExp.classes.group = class extends CAOsExp.classes.atom {
    constructor(settings, ...atoms){
        let settingsDefaults = {
            keyPrefix: 'groupLVL',
            infoClass: "group",
            infoType: 'group',
            infoName: 'untitledGroup',
            loopTrials: 0,
            // end specifics
            setupEnd_maxTrials: false,
            setupEnd_onEndFinishSet: true,
            // setArray specifics
            setupSet_array: [1], // determines how many of each trial to show in a window
            setupSet_randomize: false, // determines if you randomize the trial locations in a window or not
            setupSet_pick: false, // if pick is a number, how many sub-groups you'll next in a set before reset-ing
            setupSet_onPickWithReplacement: false, //whether it chooses the set as with Replacement or not

            setupReset_onResetExit: true,
            setupReset_onResetIncrementTrial: false,

            // custom code blocks
            //TODO! ALL BELOW
            setupCustom_onStartExp: false,
            setupCustom_onEnter: false,
            setupCustom_onInit: false,
            setupCustom_onEndExp: false,
            setupCustom_onExit: false,
            setupCustom_onFin: false,
            setupCustom_onLoop: false, // have this at all?

            // For exp only
            // TODO: Move to exp
            setupData_send: 'JSON',
        }
        if(settings !== true){
            for (let [key, value] of Object.entries(settings)) {
                settingsDefaults[key] = value;
            }
        }
        
        super(settingsDefaults, ...atoms);

        this.classType = 'group'
        this.trials = 0;

        this.minTime = [];
        this.minTrials = [];

        // what will actually be 
        this.setArray = [];
        this.superSetArray = [];
        this.setBag = CAOsExp.functions.createRatioObjArray(this.atoms, this.data[`${this.keyPrefix}_setupSet_array`], this.data[`${this.keyPrefix}_setupSet_randomize`]);
        // creates finArray with just the correction logic
        this.finArray = CAOsExp.functions.fixArrayLength([false], this.atoms.length);
    }

    _startExp(level, id){
        super._startExp(level, id);
    
        // initExp for groups
        for(this.i=0;this.i<this.atoms.length;this.i++){
            this.atoms[this.i]._startExp(this.level + 1, `${this.id}_${this.i}`) // asign level & ID to below groups
            CAOsExp.atoms[`${this.id}_${this.i}`] = this.atoms[this.i]; // give atoms a reference point for below ids
            //grabs minTime/Trials of atoms below
            this.minTime.push(this.atoms[this.i].minTime);
            this.minTrials.push(this.atoms[this.i].minTrials);
        }
    
        this.i=0;
    
        // calc minTime/minTrials for this group
        this.minTime = this.minTime.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        this.minTrials = this.minTrials.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    }
    
    _enter(e){
        super._enter(e);
    
        this.setArray = this._createSet();
        // TODO! Make this more useable for _createSet
        //this.setBagSize = this.data[`${this.keyPrefix}_setupSet_array`].reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        //this.maxProgress = this.setArray.length;
        this.setBagSize = this.setBag.length;
        this.maxProgress = this.data[`${this.keyPrefix}_setupSet_pick`] !== false ? this.data[`${this.keyPrefix}_setupReset_onResetExit`] : this.setBagSize;
    }

    _finArrayUpdate(finalized = true){ 
        this.finArray[this.atoms.indexOf(this.setArray[this.progress])] = finalized;
        this.setBag = this.setBag.filter(atoms => atoms !== this.setArray[this.progress]);
        if(this._checkFin()){
            this._fin();
        }
    }

    _createSet(){ 
        let setArray;

        //this.superSetRepeat
        if(this.data[`${this.keyPrefix}_setupSet_pick`] !== false){ //if pick is a number 
            // This is only called if progress == 0, so keep that in mind;
  
            //if we're going to go over the supersetArray length with this next set of trials, make 60 more trials worth
            if(this.count*this.data[`${this.keyPrefix}_setupSet_pick`]+this.progress+this.data[`${this.keyPrefix}_setupSet_pick`] >= this.superSetArray.length){
                switch(true){
                    case this.data[`${this.keyPrefix}_setupSet_onPickWithReplacement`]:
                        for(this.i=0;this.i<this.data[`${this.keyPrefix}_setupSet_pick`];this.i++){
                            this.superSetArray.push(...CAOsExp.functions.createRatioObjArray(this.setBag, [1], this.data[`${this.keyPrefix}_setupSet_randomize`]).slice(0,1))
                        }
                        break;
                    default:
                        for(this.i=0;this.i<this.data[`${this.keyPrefix}_setupSet_pick`]; this.i++){
                            this.superSetArray.push(...CAOsExp.functions.createRatioObjArray(this.setBag, [1], this.data[`${this.keyPrefix}_setupSet_randomize`]));
                        }
                        break;
                }
            }

            // re-assign the set array to be the next portion of the supersetArray to be seen
            setArray = this.superSetArray.slice(this.count*this.data[`${this.keyPrefix}_setupSet_pick`] + this.progress, this.count*this.data[`${this.keyPrefix}_setupSet_pick`] + this.progress + this.data[`${this.keyPrefix}_setupSet_pick`])
            
        } else { // else if we have the full set always
            //onPickWithReplacement isn't headed here since pick == false;
            // TODO: Make this a push(...) to have superSetArray be equivalent structures whether it's onPickWithReplacement or not!
            // TODO: That means also figuring out a slice() for it
            this.superSetArray = CAOsExp.functions.createRatioObjArray(this.setBag, [1], this.data[`${this.keyPrefix}_setupSet_randomize`]);

            setArray = this.superSetArray;
        }

        return setArray;
    }

    _loop(e){
        super._loop(e);
        for(this.i=0;this.i<this.setBagSize*2;this.i++){ //TODO: something other than setBagSize*2
            if(this._checkFin(e)){
                this._fin(true);
                break;
            }else if(this.setArray[this.progress].markerExit){
                this.setArray[this.progress].markerExit = false;
                this.setArray[this.progress].flagEnter = true; //TODO: make this._flagEnter() also set markerExit to false
                this._increment(true);
            }else if(this.setArray[this.progress].markerFinalize){
                this._finArrayUpdate(true);
                this._increment(true); //letReset parameter = true means it'll reset immediately
                if(this._checkExit(e)){
                    break;
                }
            } else {
                break;
            }
        }
        
        switch(true){
            case this.i >= this.setBagSize*2:
            // intential no break; here! if you finalize you need to exit
            case this._checkFin(e):
                this._fin();
            case this._checkExit():
                this._exit(e);
                break;
            default:
                this.setArray[this.progress]._next(e);
                break;
        }
    }

    _exit(e){
        super._exit(e);

        if (this.level > 0) {
            CAOsExp.atoms[CAOsExp.functions.parentID(this.id)]._next(e);
        }
    }

    _reset(){
        super._reset();
        if(!this.data[`${this.keyPrefix}_setupReset_onResetExit`]){
            this._createSet();
        }
    }

    _trialUpdate(){
        this.trials++
        if(this.level > 0){
            CAOsExp.atoms[CAOsExp.functions.parentID(this.id)]._trialUpdate();
            // TODO: checkFin here? + flagFin or actual fin???
        }
    }

    _dataCalculate(){
        this.data[`${this.keyPrefix}_loopTrials`] = this.trials;
        super._dataCalculate();
    }
    
}

//'trial' which is just the 'onResetIncrementTrials' setting turned on by default + keyPrefix of trial
CAOsExp.classes.trial = class extends CAOsExp.classes.group{
    constructor(settings, ...atoms){
        let settingsDefaults = {
            infoClass: "trial",
            keyPrefix: 'trial',
            setupReset_onResetIncrementTrial: true,
            setupReset_onResetExit: false,
        }
        if(settings !== true){
            for (let [key, value] of Object.entries(settings)) {
                settingsDefaults[key] = value;
            }
        }
        
        super(settingsDefaults, ...atoms);
    }

    _reset(){
        super._reset();
        
        if(this.data[`${this.keyPrefix}_setupReset_onResetIncrementTrial`]){
            this._trialUpdate();
        }
    }
}

//'exp' which has all the top level shit
CAOsExp.classes.exp = class extends CAOsExp.classes.group{
    constructor(settings, ...atoms){
        let settingsDefaults = {
            infoClass: "exp",
            keyPrefix: 'exp',
            setupReset_onResetExit: false,
        }
        if(settings !== true){
            for (let [key, value] of Object.entries(settings)) {
                settingsDefaults[key] = value;
            }
        }
        
        super(settingsDefaults, ...atoms);
    }

    _data(){
        super._data();
        CAOsExp.data.current = Object.assign({}, CAOsExp.data.current, CAOsExp.event.current);
        this._dataPush();
    }

    _dataPush(){
        // TODO: settings option that turns true/falses into 1s/0s
        // deep clones data.current to data.log (pushed to end of course)
        let temp = Object.assign({}, CAOsExp.data.current)
        CAOsExp.data.log.push(temp);
        CAOsExp.data.current = {};
    }

    _dataSave(){
        if(!Array.isArray(this.data[`${this.keyPrefix}_setupData_send`])){
            this.data[`${this.keyPrefix}_setupData_send`] = [this.data[`${this.keyPrefix}_setupData_send`]]
        } 
        for(let i=0; i<this.data[`${this.keyPrefix}_setupData_send`].length; i++){
            if(typeof this.data[`${this.keyPrefix}_setupData_send`][i] == 'function'){
                this.data[`${this.keyPrefix}_setupData_send`][i](CAOsExp.data.log);
            } else {
                switch(this.data[`${this.keyPrefix}_setupData_send`][i]){
                    case 'JATOS':
                        if(typeof jatos !== 'undefined'){
                            setTimeout(function(){jatos.submitResultData(CAOsExp.data.log)}, 12)
                        } else {
                            console.log('ERROR: JATOS IS NOT SET UP!!!')
                        }
                        break;
                    case 'JSON':
                    default:
                        console.log(CAOsExp.data.log)
                       break;
               } 
            }
        }
    }

    _trialUpdate(){
        super._trialUpdate();
        this._dataSave();
    }

    _fin(finalized = true) { //TODO: other finalization steps (besides JATOS)
        super._fin(finalized)
        switch(this.data[`${this.keyPrefix}_setupData_send`]){
            case 'JATOS':
                jatos.endStudyAjax();
                break;
        }
    }
}

let endCondition, finArray, strict;
// elements which make up the backbone for the system
CAOsExp.classes.element = class extends CAOsExp.classes.atom {
    constructor(settings, ...atoms) {
        let settingsDefaults = {
            keyPrefix: 'el',
            infoClass: 'element',
            infoType: 'element',
            infoName: 'untitledElement',
            setupX_minTime: 0,
            setupX_minTrials: 0,
            setupX_minCount: 0,
            setupX_maxProgress: false,
            setupEnd_condition: false,
            setupReset_onIncorrectReset: false,
            setupReset_onResetExit: true,

            setupTiming_delay: [0,0,0],
            setupTiming_duration: false, //TODO

            setupCustom_beforeProcessing: false,
            setupCustom_beforeEvent: false,
            setupCustom_beforeElement: false, 
            setupCustom_beforeData: false, 
            setupCustom_beforeUpdate: false,
            setupCustom_onEnter: false,
            setupCustom_onInit: false,
            setupCustom_onExit: false,
            setupCustom_onFin: false,
            setupCustom_onLoop: false,
            setupCustom_onRender: false,
            setupCustom_onEvent: false,
            // TODO: setupCustom eventTrigger/windowResize/render/renderCustom/etc.

            setupDiv_style: false, // adding styling to the test div
            setupDiv_attributes: false, // adding misc object attributes to the test div
            setupDOM_add: false, // TODO: Adds another dyDOM to the list
            setupDOM_attributes: false,
            setupDOM_style: false,

        }
        if(settings !== true){
          for (let [key, value] of Object.entries(settings)) {
              settingsDefaults[key] = value;
          }
        }
        super(settingsDefaults, ...atoms);

        this.dyDOM = atoms;
        this.dyDOMDefault = {
            componentType: 'div',
            componentEventListeners: [],
            componentID: false,
            componentParentID: false,
            componentClass: 'CAOsExp CAOsElement',
            componentStyle: false,
            componentInner: false,
            componentAttribute: false,
        }

        //updates the array for setupTimingDelay
        if(!Array.isArray(this.data[`${this.keyPrefix}_setupTiming_delay`])){
            this.data[`${this.keyPrefix}_setupTiming_delay`] = [this.data[`${this.keyPrefix}_setupTiming_delay`]]
        }
        if(this.data[`${this.keyPrefix}_setupTiming_delay`].length < 3){
            while(this.data[`${this.keyPrefix}_setupTiming_delay`].length < 3){
                this.data[`${this.keyPrefix}_setupTiming_delay`].push(0);
            }
        }

        this.flagRender = true;
    }
    
    // <---- FLOW ---->
    _init(e){
        super._init();

        // updating UTIL functions 
        this.minTime = this._getMinTime();
        this.minTrials = this._getMinTrials();
        this.minCount = this._getMinCount();

        this.maxProgress = this._getMaxProgress();

        // testDiv creation!
        this.DOM = document.createElement('div')
        this.DOM.id = 'CAOsExp_testDiv'; //default id
        this.DOM.style.position = 'relative'; //default position
        if(this.data[`${this.keyPrefix}_setupDiv_attributes`] !== false && typeof this.data[`${this.keyPrefix}_setupDiv_attributes`] === 'object'){
            for (let [key, value] of Object.entries(this.data[`${this.keyPrefix}_setupDiv_attributes`])) {
                this.DOM[key] = value;
            }
        }
        if(this.data[`${this.keyPrefix}_setupDiv_style`] !== false){
            if(typeof this.data[`${this.keyPrefix}_setupDiv_style`] === 'string'){
                this.DOM.style.cssText = this.data[`${this.keyPrefix}_setupDiv_style`];
            } else if(typeof this.data[`${this.keyPrefix}_setupDiv_style`] === 'object') {
                for (let [key, value] of Object.entries(this.data[`${this.keyPrefix}_setupDiv_style`])) {
                    this.DOM.style[key] = value;
                }
            }
        }

        // dyDOM creation
        switch(true){
            case this.dyDOM == undefined:
                this.dyDOM = {};
            case typeof this.dyDOM == 'object' && !Array.isArray(this.dyDOM):
                this.dyDOM = [this.dyDOM];
            case Array.isArray(this.dyDOM):
                for(let i=0; i<this.dyDOM.length; i++){
                    //updates component info if not included
                    this.dyDOM[i].componentType = this.dyDOM[i].componentType || this.dyDOMDefault.componentType;
                    this.dyDOM[i].componentEventListeners = this.dyDOM[i].componentEventListeners || this.dyDOMDefault.componentEventListeners;
                    if(!Array.isArray(this.dyDOM[i].componentEventListeners)){
                        this.dyDOM[i].componentEventListeners = [this.dyDOM[i].componentEventListeners];
                    }
                    this.dyDOM[i].componentID = this.dyDOM[i].componentID || `${this.id}_c${i}`;
                    this.dyDOM[i].componentParentID = this.dyDOM[i].componentParentID || this.DOM.id;
                    this.dyDOM[i].componentClass = this.dyDOM[i].componentClass || `${this.dyDOMDefault.componentClass} ${this.data[this.keyPrefix+"_infoClass"]} ${this.dyDOM[i].componentType}`;
                    this.dyDOM[i].componentStyle = this.dyDOM[i].componentStyle || this.dyDOMDefault.componentStyle;
                    this.dyDOM[i].componentInner = this.dyDOM[i].componentInner || this.dyDOMDefault.componentInner;
                    this.dyDOM[i].componentAttribute = this.dyDOM[i].componentAttribute || this.dyDOMDefault.componentAttribute;
                    //creates the dyDOM.DOM
                    this.dyDOM[i].DOM = document.createElement(this.dyDOM[i].componentType);
                    this.dyDOM[i].DOM.className = this.dyDOM[i].componentClass;
                    this.dyDOM[i].DOM.id = this.dyDOM[i].componentID; 
                    if(this.dyDOM[i].componentInner !== false){
                        this.dyDOM[i].DOM.innerHTML = this.dyDOM[i].componentInner;
                    }
                    if(this.dyDOM[i].componentStyle !== false){
                        if(typeof this.dyDOM[i].componentStyle === 'string'){
                            this.dyDOM[i].DOM.style.cssText = this.dyDOM[i].componentStyle;
                        } else if(typeof this.dyDOM[i].componentStyle === 'object') {
                            for (let [key, value] of Object.entries(this.dyDOM[i].componentStyle)) {
                                this.dyDOM[i].DOM.style[key] = value;
                            }
                        }
                    }
                    if(this.dyDOM[i].componentAttribute !== false){
                        if(typeof this.dyDOM[i].componentAttribute === 'object') {
                            for (let [key, value] of Object.entries(this.dyDOM[i].componentAttribute)) {
                                this.dyDOM[i].DOM[key] = value;
                            }
                        }
                    }
                }
                break;
        }
        if(this.data[`${this.keyPrefix}_setupDOM_style`] !== false){
            if(!Array.isArray(this.data[`${this.keyPrefix}_setupDOM_style`])){
                this.data[`${this.keyPrefix}_setupDOM_style`] = [this.data[`${this.keyPrefix}_setupDOM_style`]];
            }
            for(let i=0; i<this.data[`${this.keyPrefix}_setupDOM_style`].length; i++){
                if(typeof this.data[`${this.keyPrefix}_setupDOM_style`][i]==='string'){
                    this.dyDOM[i].DOM.style.cssText = this.data[`${this.keyPrefix}_setupDOM_style`][i];
                } else {
                    for (let [key, value] of Object.entries(this.data[`${this.keyPrefix}_setupDOM_style`][i])) {
                        this.dyDOM[i].DOM.style[key] = value;
                    }
                }
            }
        }
        if(this.data[`${this.keyPrefix}_setupDOM_attributes`] !== false){
            if(!Array.isArray(this.data[`${this.keyPrefix}_setupDOM_attributes`])){
                this.data[`${this.keyPrefix}_setupDOM_attributes`] = [this.data[`${this.keyPrefix}_setupDOM_attributes`]];
            }
            for(let i=0; i<this.data[`${this.keyPrefix}_setupDOM_attributes`].length; i++){
                for (let [key, value] of Object.entries(this.data[`${this.keyPrefix}_setupDOM_attributes`][i])) {
                    this.dyDOM[i].DOM[key] = value;
                }
            }
        }


        // Custom code block 'onInit'
        if(typeof this.data[`${this.keyPrefix}_setupCustom_onInit`] == 'function'){
            this.data[`${this.keyPrefix}_setupCustom_onInit`](e);
        }
    }

    _enter(e){
        if(this.data[`${this.keyPrefix}_setupTiming_delay`][0] > 0){
            let delayStart = performance.now()
            while(performance.now() - delayStart < this.data[`${this.keyPrefix}_setupTiming_delay`][0]){
                // Nothing?
            }
        }
        super._enter();

        // create _eventFunction for easy addEventListener/removeEventListener
        this._eventFunction = function(e){
            this._eventTrigger(e);
        }.bind(this);

        // adds DOM & dyDOMs!
        CAOsExp.DOM.appendChild(this.DOM);
        for(let i=0;i<this.dyDOM.length;i++){
            this.DOM.appendChild(this.dyDOM[i].DOM);
            for(let j=0;j<this.dyDOM[i].componentEventListeners.length;j++){
                this.dyDOM[i].DOM.addEventListener(this.dyDOM[i].componentEventListeners[j], this._eventFunction);
            }
        }
        
        this.windowFunction = CAOsExp.functions.deBounce(function(e){this._windowResize()}.bind(this), 100);
        window.addEventListener('resize', this.windowFunction)

        // TODO! On loop(e) assign event.current to e (so we can send information between loops)
        // TODO: move to loop~
        CAOsExp.event.current.event_time = Date.now();

        // Custom code block 'onEnter'
        if(typeof this.data[`${this.keyPrefix}_setupCustom_onEnter`] == 'function'){
            this.data[`${this.keyPrefix}_setupCustom_onEnter`](e);
        }

    }

    _exit(e){
        //TODO! The way this is set up, you should be calling super._exit(e) after everything in the specific element classes
        // This should be made so you still call it prior without triggering _next until needed...


        if(this.data[`${this.keyPrefix}_setupTiming_delay`][2] > 0){
            let delayStart = performance.now()
            while(performance.now() - delayStart < this.data[`${this.keyPrefix}_setupTiming_delay`][2]){
                // Nothing?
            }
        }
        super._exit(e);

        window.cancelAnimationFrame(CAOsExp.loop);
        this.DOM.remove();

        for(let i=0;i<this.dyDOM.length;i++){
            for(let j=0;j<this.dyDOM[i].componentEventListeners.length;j++){
                this.dyDOM[i].DOM.removeEventListener(this.dyDOM[i].componentEventListeners[j], this._eventFunction, false)
            }
        }

        window.removeEventListener('resize', this.windowFunction)

        // Custom code block 'onExit'
        if(typeof this.data[`${this.keyPrefix}_setupCustom_onExit`] == 'function'){
            this.data[`${this.keyPrefix}_setupCustom_onExit`](e);
        }

        // sends the signal to start the next element
        CAOsExp.expTimeline._next({
            event_time: Date.now(),
            event_type: '_next',
            event_result: this.elResult,
        })
    }

    _fin(letExit = false){
        super._fin();

        // Custom code block 'onFin'
        if(typeof this.data[`${this.keyPrefix}_setupCustom_onFin`] == 'function'){
            this.data[`${this.keyPrefix}_setupCustom_onFin`]();
        }

        if(letExit){
            this._exit();
        }
    }

    // <---- LOOP ---->
    _loop(e){
        super._loop(e);
        // Starts the animation & timing
        this.runningTime = 0;
        CAOsExp.loop = window.requestAnimationFrame(function(time){this._render(time)}.bind(this));
        // Custom code block 'onLoop'
        if(typeof this.data[`${this.keyPrefix}_setupCustom_onLoop`] == 'function'){
            this.data[`${this.keyPrefix}_setupCustom_onLoop`](e);
        }
    }

    _render(time){ // constant timing + graphics
        CAOsExp.time.lastTime = CAOsExp.time.currentTime;
        CAOsExp.time.currentTime = time;
        CAOsExp.time.deltaTime = CAOsExp.time.currentTime - CAOsExp.time.lastTime;
        this.runningTime += CAOsExp.time.deltaTime;
        if(this.level == 2){
            this.flagRender = true;
        }
        if(this.flagRender) {
            this.flagRender = false;
            this._renderCustom(time);
        }
        CAOsExp.loop = window.requestAnimationFrame(function(time){this._render(time)}.bind(this))
        if(this.data[`${this.keyPrefix}_setupTiming_duration`] !== false && this.runningTime >= this.data[`${this.keyPrefix}_setupTiming_duration`]){
            this._processing({event_time: Date.now(), event_type: 'Duration Exceeded'});
        } 
        // TODO: maxTime check??? ~ checks upwards too...


        // Custom code block 'onRender'
        if(typeof this.data[`${this.keyPrefix}_setupCustom_onRender`] == 'function'){
            this.data[`${this.keyPrefix}_setupCustom_onRender`](time);
        }
    }

    _renderCustom(time){ // what extended elements can add their rendering logic to, if any
        cancelAnimationFrame(CAOsExp.loop)
    } 

    // <---- NEXT ----> 
    _processing(e){
        if(this.data[`${this.keyPrefix}_setupTiming_delay`][1] > 0){
            let delayStart = performance.now()
            while(performance.now() - delayStart < this.data[`${this.keyPrefix}_setupTiming_delay`][1]){
                // Nothing?
            }
        }

        if(typeof this.data[`${this.keyPrefix}_setupCustom_beforeProcessing`] == 'function'){
            this.data[`${this.keyPrefix}_setupCustom_beforeProcessing`](e);
        }

        this._event(e);

        this._element(e);

        this._data(e);

        this._update(e);
    }

    _event(e){
        if(typeof this.data[`${this.keyPrefix}_setupCustom_beforeEvent`] == 'function'){
            this.data[`${this.keyPrefix}_setupCustom_beforeEvent`](e);
        }

        CAOsExp.event.prior = Object.assign({}, CAOsExp.event.current);
        CAOsExp.event.currentRaw = Object.assign({}, e); 
        CAOsExp.event.current = Object.assign({}, this._eventStrip(this._eventProcessing(e)))

        // Custom code block 'onEvent'
        if(typeof this.data[`${this.keyPrefix}_setupCustom_onEvent`] == 'function'){
            this.data[`${this.keyPrefix}_setupCustom_onEvent`](e);
        }
    }

    _eventProcessing(e){
        // For each element it will need to find the type + result (+ pass & result notes)
        // Call this AFTER you've done your own eventProcessing
        e.event_time = e.event_time || Date.now();
        e.event_timeElapsed = e.event_time - CAOsExp.event.prior.event_time;
        return e
    }

    _eventStrip(e){
        // elements will call this AFTER anything it does 
        var OUT = {};

        for (let [key, value] of Object.entries(e)) {
            if(/event_/.test(key)){
                OUT[key] = value;
            }
        }

        return OUT;
    }

    _element(e){ // element logic goes here
        if(typeof this.data[`${this.keyPrefix}_setupCustom_beforeElement`] == 'function'){
            this.data[`${this.keyPrefix}_setupCustom_beforeElement`](e);
        }
    }

    _update(e){ // updates the checks/flags/states
        if(typeof this.data[`${this.keyPrefix}_setupCustom_beforeUpdate`] == 'function'){
            this.data[`${this.keyPrefix}_setupCustom_beforeUpdate`](e);
        }

        if(this._checkReset()){
            this._reset(); //577
        }
        let idArray = this.id.split("_");
        //this is elImageSequence
        if(this.level == 4 && idArray[idArray.length - 1] === "0"){
            endCondition = this.data[`${this.keyPrefix}_setupEnd_condition`]
            finArray = this.finArray
            strict = this.data[`${this.keyPrefix}_setupEnd_conditionStrict`]
        }

        //elFeedback
        if(this.level == 4 && idArray[idArray.length - 1] === "1"){
            this.data[`${this.keyPrefix}_setupEnd_condition`] = endCondition;
            this.finArray = finArray;
            this.data[`${this.keyPrefix}_setupEnd_conditionStrict`] = strict;
        }

        console.log(this)
        //runs checkFine when it is elFeedback for image trials and elImageSequence and elFeedback for bracket trials
        let runsCheck = (this.level == 4 && idArray[idArray.length - 1] === "1") || this.level == 3 || this.level == 2
        switch(true){
            case this._checkExpEnd(e):
                this._endExp();
                break;
            //if it is elInstruction or elFeedback
            case (this.message || runsCheck) && this._checkFin(e):
                this._fin(true);
                break;
            case this._checkExit():
                this._exit();
                break;
        }

    }

    // <---- RESPONSES ---->
    _windowResize(){// what happens when the window Resizes
    }

    _eventTrigger(e){
        e.event_time = Date.now();
        e.preventDefault();
        this._processing(e);
    }

    // <---- CHECKS ---->
    _checkExit(){
        let OUT = false;

        OUT = super._checkExit();
        if(this.data[`${this.keyPrefix}_setupExit_onIncorrectExit`] && this.elResult === false){
            OUT = true;
        }
        if(this.data[`${this.keyPrefix}_setupTiming_duration`] !== false && this.runningTime >= this.data[`${this.keyPrefix}_setupTiming_duration`]){
            OUT = true;
        }
        return OUT;
    }

    _checkFinArray(endCondition, endData, endStrict){  
        if(this.data[`${this.keyPrefix}_setupEnd_window`] !== false && endData.length >= this.data[`${this.keyPrefix}_setupEnd_window`]){
            endData = endData.slice(endData.length-this.data[`${this.keyPrefix}_setupEnd_window`],endData.length)
        } else if(endStrict){
            return false;
        }

        // TODO: Make this more efficient (faster/less code/more readable)
        if(endStrict){
        switch(true){
            case /Length$/.test(endCondition):
                let tempLength = Number.parseInt(endCondition);
                return endData.length == tempLength;
            case Array.isArray(endCondition): //An array of conditions // TODO: check if this works 
                if(endCondition.length != endData.length){
                    endCondition = CAOsExp.functions.fixArrayLength(endCondition, endData.length);
                }
                let tempCheck = [];
                for(i=0;i<endData.length;i++){
                    tempCheck[i] = endCondition[i] == endData[i];
                }
                return tempCheck.every(CAOsExp.functions.arrayCheck);
            case Number.isInteger(endCondition): // is an integer (has Trues >= integer value) 
                return endData.filter(Boolean).length == endCondition; 
            case !isNaN(endCondition) && endCondition % 1 !== 0 && endCondition <= 1: // is a float (has Trues/length >= float value) //TODO: check if this works 
                return endData.filter(Boolean).length/endData.length == endCondition;
            // TODO: float > 1 endCondition
        }
        } else {
        switch(true){
            case /Length$/.test(endCondition):
                let tempLength = Number.parseInt(endCondition);
                return endData.length >= tempLength;
            case Array.isArray(endCondition): //An array of conditions // TODO: check if this works 
                if(endCondition.length != endData.length){
                    endCondition = CAOsExp.functions.fixArrayLength(endCondition, endData.length);
                }
                let tempCheck = [];
                for(i=0;i<endData.length;i++){
                    tempCheck[i] = endCondition[i] == endData[i] || !endData[i];
                }
                return tempCheck.every(CAOsExp.functions.arrayCheck);
            case Number.isInteger(endCondition): // is an integer (has Trues >= integer value) // TODO: check if it works
                return endData.filter(Boolean).length >= endCondition; 
            case !Number.isNaN(endCondition) && endCondition % 1 !== 0 && endCondition <= 1: // is a float (has Trues/length >= float value) //TODO: check if this works
                return endData.filter(Boolean).length/endData.length >= endCondition;
            // TODO: float > 1 endCondition
        }
        }
    }

    // <---- UTILS ---->
    _dataCalculate(){
        super._dataCalculate();
        this.data[`${this.keyPrefix}_dataOutput_correct`] = this.elCorrect;
        this.data[`${this.keyPrefix}_dataOutput_relevant`] = this.elRelevant;
        this.data[`${this.keyPrefix}_dataOutput_result`] = this.elResult;
        this.data[`${this.keyPrefix}_dataOutput_resultNote`] = this.elResultNote;
        this.data[`${this.keyPrefix}_dataOutput_finished`] = this.flagFinalize || this.markerFinalize;
    }

    _finArrayUpdate(result = true){
        this.finArray.push(result)
    }

    _getMinTime(){
        return this.data[`${this.keyPrefix}_setupX_minTime`] || 0;
    }

    _getMinTrials(){
        return this.data[`${this.keyPrefix}_setupX_minTrials`] || this._getMinCount() || 0;
    }

    _getMinCount(){
        return this.data[`${this.keyPrefix}_setupX_minCount`] || 0;
    }

    _getMaxProgress(){
        return this.data[`${this.keyPrefix}_setupX_maxProgress`] || 1; 
    }
}

CAOsExp.classes.elInstructions = class extends CAOsExp.classes.element {
    constructor(settings, message){
        let settingsDefaults = {
            infoClass: 'elInstructions',
            setupX_maxProgress: 1,
            setupEnd_condition: 1,
        }
        if(settings !== true){
            for (let [key, value] of Object.entries(settings)) {
                settingsDefaults[key] = value;
            }
        }

        let dyDOMs = [
            {
                componentType: 'h2',
                componentInner: message,
                componentID: 'message',
            },
            {
                componentType: 'button',
                componentInner: "<span>NEXT</span>",
                componentID: 'button',
                componentStyle: 'padding: 12px;',
                componentEventListeners: ['mousedown', 'touchstart'],
            }
        ]

        super(settingsDefaults, ...dyDOMs);
        this.message = message;
    }

    _init(){
        super._init();
    }

    _enter(){
        super._enter();
        this.DOM.style.cssText = 'display: flex; flex: 1; flex-direction: column; justify-content: center; align-items: center; align-text: center;'
    }

    _eventTrigger(e){
        e.event_DOM = 'button';
        super._eventTrigger(e);
    }

    _element(e){
        if(CAOsExp.event.current.event_DOM == 'button'){
            this._finArrayUpdate(true);
            this._increment();
            this.elRelevant = true;
            this.elResult = true;
            this.elResultNote = 'they pressed the button';
        }
    }
}

CAOsExp.classes.elFixation = class extends CAOsExp.classes.element {
    constructor(settings, imageSrc){
        let settingsDefaults = {
            infoClass: 'elFixation',
            setupX_maxProgress: 1,
            setupEnd_condition: false,
            setupImage_type: 'img', // else it could be 'div'
            setupImages_width: 96 * window.devicePixelRatio,
            setupImages_height: 96 * window.devicePixelRatio,
        }
        if(settings !== true){
            for (let [key, value] of Object.entries(settings)) {
                settingsDefaults[key] = value;
            }
        }

        // TODO: more dynamic (work with image resize)
        if(/%/.test(settingsDefaults.setupImages_width)){
            settingsDefaults.setupImages_width = window.innerHeight <= window.innerWidth ? Number.parseInt(settingsDefaults.setupImages_width)/100 * window.innerHeight : Number.parseInt(settingsDefaults.setupImages_width)/100 * window.innerWidth
        }

        if(/%/.test(settingsDefaults.setupImages_height)){
            settingsDefaults.setupImages_height = window.innerHeight <= window.innerWidth ? Number.parseInt(settingsDefaults.setupImages_height)/100 * window.innerHeight : Number.parseInt(settingsDefaults.setupImages_height)/100 * window.innerWidth
        }

        let dyDOMs = [];
        if(settingsDefaults.setupImage_type == 'img'){
            dyDOMs.push({
                componentType: 'img',
                componentEventListeners: ['touchstart', 'mousedown', 'click'],
                componentAttribute: {
                    src: imageSrc,
                    width: settingsDefaults.setupImages_width,
                    height: settingsDefaults.setupImages_height,
                },
            })
        } else if(settingsDefaults.setupImage_type == 'div'){
            dyDOMs.push({
                componentType: 'div',
                componentEventListeners: ['touchstart', 'mousedown', 'click'],
                componentStyle: {
                    backgroundColor: imageSrc,
                    width: settingsDefaults.setupImages_width,
                    height: settingsDefaults.setupImages_height,
                }
            })
        }

        super(settingsDefaults, ...dyDOMs);
        this.imageSrc = imageSrc;
    }

    _enter(){
        super._enter();
        this.DOM.style.cssText = 'display: flex; flex: 1; flex-direction: column; justify-content: center; align-items: center; align-text: center;'
    }

    _eventTrigger(e){
        e.event_DOM = 'img';
        super._eventTrigger(e);
    }

    _element(e){
        if(CAOsExp.event.current.event_DOM == 'img'){
            this._finArrayUpdate(true);
            this._increment();
            this.elRelevant = true;
            this.elResult = true;
            this.elResultNote = 'they pressed the fixation';
        }
    }
}

CAOsExp.classes.elImageSequence = class extends CAOsExp.classes.element {
    constructor(settings, ...imageSrc){
        let settingsDefaults = {
            infoClass: 'elImageSequence',

            setupClick_sound: false,
            setupClick_opacity: .5,
            setupImages_width: 72 * devicePixelRatio,
            setupImages_height: 72 * devicePixelRatio,
            setupInstructions: false,


            //Grid settings
            setupGrid_margin: 0,
            setupGrid_nRow: false,
            setupGrid_nCol: false,
            setupGrid_quant: undefined,
            setupGrid_jitter: true,
            setupGrid_shuffle: true,
            setupGrid_arrange: 'x',
        }

        if(settings !== true){
            for (let [key, value] of Object.entries(settings)) {
                settingsDefaults[key] = value;
            }
        }
        
        super(settingsDefaults);

        // TODO: imageArrays >> Better implementation of imageArrays (passing an array of arrays to imageSrc)
        if(Array.isArray(imageSrc[0])){
            this.imageArrays = imageSrc;
            this.imageSrc = this.imageArrays[this.count];
        } else {
            this.imageSrc = imageSrc;
            this.imageArrays = false;
        }
        this.data[`${this.keyPrefix}_dataOutput_sequence`] = this.imageSrc;

        // TODO: imageArrays >> recalculate quant on each count/enter?
        if(this.data[`${this.keyPrefix}_setupGrid_quant`] === undefined){
            this.data[`${this.keyPrefix}_setupGrid_quant`] = this.imageSrc.length;
        }
        this.imageClicked = [];
        this.images = [];
        let i;
        // calculates image size based on smallest window dimension
        // TODO: more dynamic (work with image resize)
        if(/%/.test(this.data[`${this.keyPrefix}_setupImages_width`])){
            this.data[`${this.keyPrefix}_setupImages_width`] = window.innerHeight <= window.innerWidth ? Number.parseInt(this.data[`${this.keyPrefix}_setupImages_width`])/100 * window.innerHeight : Number.parseInt(this.data[`${this.keyPrefix}_setupImages_width`])/100 * window.innerWidth
        }

        if(/%/.test(this.data[`${this.keyPrefix}_setupImages_height`])){
            this.data[`${this.keyPrefix}_setupImages_height`] = window.innerHeight <= window.innerWidth ? Number.parseInt(this.data[`${this.keyPrefix}_setupImages_height`])/100 * window.innerHeight : Number.parseInt(this.data[`${this.keyPrefix}_setupImages_height`])/100 * window.innerWidth
        }

        for(i=0; i<this.imageSrc.length; i++){
            this.images[i] = document.createElement('img');
            this.images[i].src = this.imageSrc[i];
            this.images[i].width = this.data[`${this.keyPrefix}_setupImages_width`];
            this.images[i].height = this.data[`${this.keyPrefix}_setupImages_height`];
        }
        if(this.data[`${this.keyPrefix}_setupInstructions`] !== false){
            this.instructions = this.data[`${this.keyPrefix}_setupInstructions`];
        }
        
    }

    _getMaxProgress(){
        return this.data[`${this.keyPrefix}_setupX_maxProgress`] || this.imageSrc.length;
    }

    _init(){
        super._init();
        for(i=0;i<this.imageSrc.length;i++){
            this.DOM.appendChild(this.images[i]);
            this.images[i].style.position = 'absolute';
            let temp_i = Number.parseInt(JSON.parse(JSON.stringify(i)))
            this.images[i].addEventListener('mousedown', function(e){
                e.preventDefault();
                e.event_imageIndex = temp_i;
                e.target.style.opacity = this.data[`${this.keyPrefix}_setupClick_opacity`];
                if(this.data[`${this.keyPrefix}_setupClick_sound`] !== false){
                    this.sound.pause();
                    this.sound.play();
                }
                this._processing(e);
            }.bind(this), false);
            this.images[i].addEventListener('touchstart', function(e){
                e.preventDefault();
                e.event_imageIndex = temp_i;
                e.target.style.opacity = this.data[`${this.keyPrefix}_setupClick_opacity`];
                if(this.data[`${this.keyPrefix}_setupClick_sound`] !== false){
                    this.sound.pause();
                    this.sound.play();
                }
                this._processing(e);
            }.bind(this), false);
        }

        // Load audio click
        if(this.data[`${this.keyPrefix}_setupClick_sound`] !== false){
            this.sound = new Audio(this.data[`${this.keyPrefix}_setupClick_sound`]);
            let data = this.data;
            let keyPrefix = this.keyPrefix;
            // Setup delays if there is audio
            this.sound.addEventListener("loadeddata", function() {
                console.log("Audio duration is: " + this.duration);
                if(data[`${keyPrefix}_setupTiming_delay`][2] < this.duration*1000){
                    data[`${keyPrefix}_setupTiming_delay`][2] = this.duration*1000 + 12;
                }
            });
        }
        if(this.data[`${this.keyPrefix}_setupInstructions`] !== false){
            this.instructionsDOM = document.createElement('div');
            this.instructionsDOM.id = 'elImageSequence_instructionsDOM'
            this.instructionsDOM.innerHTML = this.instructions;
            this.instructionsDOM.style.cssText = 'text-align: center;'
        }

    }

    _enter(){
        if(this.data[`${this.keyPrefix}_setupInstructions`] !== false){
            CAOsExp.DOM.appendChild(this.instructionsDOM);
        }
        super._enter();

        // TODO: imageArrays >> changing the src
        if(this.imageArrays !== false && this.imageArrays[this.count % this.imageArrays.length] !== this.imageSrc){
            this.imageSrc = this.imageArrays[this.count % this.imageArrays.length];
            for(let i=0; i<this.imageSrc.length; i++){
                this.images[i].src = this.imageSrc[i];
            }
            this.data[`${this.keyPrefix}_dataOutput_sequence`] = this.imageSrc;
        }

        this.imageClicked = [];
        if(this.data[`${this.keyPrefix}_setupInstructions`] !== false){
            this.DOM.style.height = `${CAOsExp.DOM.offsetHeight - this.DOM.offsetTop}px`;
        }
        
        this.data[`${this.keyPrefix}_dataCreated_gridCoordinates`] = CAOsExp.functions.calcGrid(this.DOM.offsetWidth, this.DOM.offsetHeight, this.data[`${this.keyPrefix}_setupImages_width`], this.data[`${this.keyPrefix}_setupImages_height`],
            this.data[`${this.keyPrefix}_setupGrid_margin`],this.data[`${this.keyPrefix}_setupGrid_nRow`],this.data[`${this.keyPrefix}_setupGrid_nCol`],
            this.data[`${this.keyPrefix}_setupGrid_quant`], this.data[`${this.keyPrefix}_setupGrid_jitter`], this.data[`${this.keyPrefix}_setupGrid_shuffle`], this.data[`${this.keyPrefix}_setupGrid_arrange`])

        
        for(i=0;i<this.imageSrc.length;i++){
            this.images[i].style.opacity = 1;
            this.images[i].style.left = this.data[`${this.keyPrefix}_dataCreated_gridCoordinates`][i][0];
            this.images[i].style.top = this.data[`${this.keyPrefix}_dataCreated_gridCoordinates`][i][1];
        }
    }

    _exit(e){
        super._exit(e);
        if(this.data[`${this.keyPrefix}_setupInstructions`] !== false){
            this.instructionsDOM.remove();
            this.DOM.style.height = CAOsExp.DOM.offsetHeight;
        }
    }

    _element(e){
        super._element(e);
        if(this.imageClicked.includes(e.event_imageSrc)){
            this.elRelevant = false;
            this.elCorrect = false;
        } else {
            this.imageClicked.push(e.event_imageSrc);
            this.elRelevant = true;
            if(e.event_imageIndex === this.progress){
                this.elCorrect = true;
            } else {
                this.elCorrect = false;
                if(this.data[`${this.keyPrefix}_setupReset_onIncorrectReset`]){
                    this._flagReset();
                    // This should happen no matter what!
                    //if(this.data[`${this.keyPrefix}_setupReset_onResetExit`]){
                    //    this.elResult = this.elCorrect;
                    //}
                    this.elResult = this.elCorrect;
                    // calling _finArrayUpdate() here leads to double counting incorrect presses! Instead we'll simply make the progress > maxProgress
                    // TODO: temp fix though...
                    // this._finArrayUpdate(this.elResult)
                    this.progress = this.maxProgress;
                }
            }
            this._increment(); //check this part
            if(this.progress >= this.maxProgress){ // [CHANGE]
                if(JSON.stringify(this.imageSrc) == JSON.stringify(this.imageClicked)){
                    this.elResult = true;
                } else {
                    this.elResult = false;
                }
                this._flagReset();
                this._finArrayUpdate(this.elResult)
            }
        }
    }

    _eventProcessing(e){
        e = super._eventProcessing(e)
        e.event_imageSrc = this.imageSrc[e.event_imageIndex];
        return e;
    }

    _windowResize(){
        if(this.data[`${this.keyPrefix}_setupInstructions`] !== false){
            this.DOM.style.height = `${CAOsExp.DOM.offsetHeight - this.DOM.offsetTop}px`;
        }
        this.data[`${this.keyPrefix}_dataCreated_gridCoordinates`] = CAOsExp.functions.calcGrid(this.DOM.offsetWidth, this.DOM.offsetHeight, this.data[`${this.keyPrefix}_setupImages_width`], this.data[`${this.keyPrefix}_setupImages_height`],
        this.data[`${this.keyPrefix}_setupGrid_margin`],this.data[`${this.keyPrefix}_setupGrid_nRow`],this.data[`${this.keyPrefix}_setupGrid_nCol`],
        this.data[`${this.keyPrefix}_setupGrid_quant`], this.data[`${this.keyPrefix}_setupGrid_jitter`], this.data[`${this.keyPrefix}_setupGrid_shuffle`], this.data[`${this.keyPrefix}_setupGrid_arrange`]) //TODO! Other grid options

        for(i=0;i<this.imageSrc.length;i++){
            this.images[i].style.left = this.data[`${this.keyPrefix}_dataCreated_gridCoordinates`][i][0];
            this.images[i].style.top = this.data[`${this.keyPrefix}_dataCreated_gridCoordinates`][i][1];
        }
    }
}

/* choiceSet 
    Basic = ...
    Array = [,,,]
    Object = {
        imageSrc: [,,,],
        settingYouWantChanged: true,

    }
*/
CAOsExp.classes.elImageChoice = class extends CAOsExp.classes.element {
    constructor(settings, ...choiceSet){
        let settingsDefaults = {
            infoClass: 'elImageChoice',

            setupInstructions: false,
            setupImages_width: 96,
            setupImages_height: 96,

            //Grid settings
            setupGrid_margin: 0,
            setupGrid_nRow: 1,
            setupGrid_nCol: false, //TODO: update every reset (loopCount update) for quant of 
            setupGrid_quant: false, //TODO: update every loopCount (reset)
            setupGrid_jitter: false,
            setupGrid_shuffle: false,
            setupGrid_arrange: 'x',
        }

        if(settings !== true){
            for (let [key, value] of Object.entries(settings)) {
                settingsDefaults[key] = value;
            }
        }
        
        super(settingsDefaults);

        if(!Array.isArray(choiceSet[0])){
            this.sets = [choiceSet];
        } else {
            this.sets = choiceSet;
        }

        this.setCurrent = this.sets[this.count % this.sets.length];
    }

    _getGridSettings(){
      // TODO document why this method '_getGridSettings' is empty
    }

    _refreshSet(){
      // TODO document why this method '_refreshSet' is empty
    }

    _createDyDOM(){
      // TODO document why this method '_createDyDOM' is empty
    }
}

// elFeedback
/* EXAMPLE FEEDBACK ARGUMENTS
five_o = new CAOsExp.classes.elFeedback(true, {
        result: true, 
        components : [
            {type: 'background', src: 'green', cssText: XYZ, innerHTML: ZYX}, 
            {type: 'image', src: './assets/image.svg'}, 
            {type: 'function', src: myFunction(true)}
        ]}, 
        {result: false,
            components: 
            {dafdsfakdsndfl;adsksd}
    })
*/
CAOsExp.classes.elFeedback = class extends CAOsExp.classes.element {
    constructor(settings, ...responses){
        let settingsDefaults = { // TODO: Duration running off of window.requestAnimationFrame; && Make this a default setting
            infoClass: 'elFeedback',
            
            setupTiming_duration: 600,
            setupEnd_condition: false,
            feedback: false
        }
        
        if(settings !== true){
            for (let [key, value] of Object.entries(settings)) {
                settingsDefaults[key] = value;
            }
        }
        super(settingsDefaults);
        this.responses = [...responses];
    }

    _init(e){
        super._init();
        // TODO: create the DOM elements here instead
    }

    _enter(e){
        super._enter();
        // show the DOM elements (+creates them)
        for(let i=0;i<this.responses.length;i++){
            if(this.responses[i].result === e.event_result){
                this.responsesDOM = [];
                this.responsesNOW = this.responses[i].components; //TODO: rename
                for(let j=0;j<this.responsesNOW.length; j++){
                    switch(this.responsesNOW[j].type){
                        case 'background': // Works :)
                             this.DOM.style.backgroundColor = this.responsesNOW[j].src;
                             break;
                         case 'function': // Works :)
                             this.responsesNOW[j].src; // [HUGO] Here is a bug!
                             break;
                         case 'audio': // Works :)
                             this.responsesDOM[j] = new Audio(this.responsesNOW[j].src);
                             this.responsesDOM[j].play();
                            break;
                         default:
                             this.responsesDOM[j] = document.createElement(this.responsesNOW[j].type);
                             this.responsesDOM[j].src =  this.responsesNOW[j].src;
                             this.DOM.appendChild(this.responsesDOM[j])
                             break;
                    }
                    if(typeof this.responsesNOW[j].style === 'string'){
                        this.responsesDOM[j].style.cssText = this.responsesNOW[j].style
                    } else if(typeof this.responsesNOW[j].style === 'object') {
                        for (let [key, value] of Object.entries(this.responsesNOW[j].style)) {
                            this.responsesDOM[j].style[key] = value;
                        }
                    }
                    if(typeof this.responsesNOW[j].attribute === 'object') {
                        for (let [key, value] of Object.entries(this.responsesNOW[j].attribute)) {
                            this.responsesDOM[j][key] = value;
                        }
                    }
                }

                break;
            }
         }
    }

    _setFeedback(){
        let parentID = CAOsExp.functions.parentID(this.id)
        while(CAOsExp.atoms[parentID]){
            CAOsExp.atoms[parentID].feedback = false;
            parentID = CAOsExp.functions.parentID(parentID)
        }
        
    }

    _element(){
        super._element();
        this._increment();
    }

    _exit(e){
        super._exit(e);
        for(const element of this.responsesDOM){
            if(typeof element !== 'undefined'){
                element.remove();
            }
        }
    }
}