/*
 * Experiment Order:
 *   Fix, 4OL1, Feedback [feat. onClick feedback]
 *   Fix, 4OL2, Feedback [feat. onClick feedback]
 *   Fix, 4OL1/4OL2(accuracy feedback), 4UL3(acc)/6NovelUL4(acc), Feedback //Shape Condition ends here
 *   Fix, 4NovelUL1(noFeedback)/4NovelUL2(noFeedback)/4NovelUL3(noFeedback)/6NovelUL4(noFeedback), Feedback
 */

// mTurk Code
// Get stuff from JATOS/URI
if(typeof jatos != "undefined"){
    jatos.onLoad(function(){
        CAOsExp.storage.mTurkCode = jatos.urlQueryParameters.study_code;
    })
} else {
    CAOsExp.storage.mTurkCode = CAOsExp.functions.genID();
}
let pictureGame = undefined;

// Experiment Randomization
const condition_order = [[open1, open2, close2, close1], [open2, open3, close3, close2]];
const condition_noOrder = [[open1, open2, close2, close1], [open1, open3, close3, close1]];
const condition_serial = [[open1, open2, close1, close2], [open1, open3, close1, close3]];


CAOsExp.functions.shuffle(condition_order);
CAOsExp.functions.shuffle(condition_noOrder);
CAOsExp.functions.shuffle(condition_serial);


condition_order.push([open1, open3, close3, close1]);
condition_noOrder.push([open2, open3, close3, close2]);
condition_serial.push([open2, open3, close3, close2]);


const condition_all = [condition_noOrder, condition_order];
// CAOsExp.functions.shuffle(condition_all);

// const condition_all = [condition_serial]

const condition_lineThreeToFive = condition_all[0];
condition_lineThreeToFive.push([open1, open2, open3, close3, close2, close1])

const condition_lineSix = [
    [open4, open5, close5, close4],
    [open5, open6, close6, close5],
    [open4, open6, close6, close4],
    [open4, open5, open6, close6, close5, close4]
]
// Final trial tracking

let caosData_TrialsLeft = 42;

// saving grace

const criterion_sizeRolling = 4;
const criterion_sizeTrials4 = 4;
const criterion_sizeTrials5 = 16;
const criterion_sizeTrials6 = 6;

// Experiment (line 3)
let instructions_line3 = new CAOsExp.classes.elInstructions({infoName: 'instructions3'}, `Instructions Update:<br></br> Now, you'll be shown some new images. <br><br> Take your best guess and click on the images in the way that best fits the pattern. Don't worry - you are not expected to know the correct order - you will discover it as you go along! <br> <br> If you get the entire sequence of the images correct, the trial will end with a green screen! If not, the trial will end with a red screen. <br> <br> Get the sequence correct several times in a row, and you will move on to the next sequence! <br><br>`)

// When you click on a image, it'll either fade out (if you're correct), or end the trial with a red screen (incorrect). <br> <br> 

let fixation_line3 = new CAOsExp.classes.elFixation(true, imageFixation);
let orderedlist_line3 = new CAOsExp.classes.elImageSequence(
    {   infoName: '40L1',
        setupClick_sound: soundTouch,
        setupClick_opacity: .25,
        setupImages_width: 200,
        setupImages_height: 200,
        setupEnd_condition: 4,
        setupEnd_window: 5,
        setupReset_onIncorrectReset: false,
        setupReset_onResetExit: true,
        setupInstructions: `If you get the entire sequence of the images correct, the trial will end with a green screen! If not, the trial will end with a red screen. To start every trial, click the blue robot!`,
    }, ...condition_lineThreeToFive[0])

let feedback_line3 = new CAOsExp.classes.elFeedback(true,
    {result: true, 
    components : [
        {type: 'background', src: '#90EE90'}, 
        {type: 'audio', src: soundCorrect},
    ]},
    {result: false, 
        components : [
            {type: 'background', src: '#F08080'}, 
            {type: 'audio', src: soundIncorrect},
        ]},
    {result: undefined, 
        components : [
            {type: 'background', src: 'black'}, 
        ]}
)

let trial_line3 = new CAOsExp.classes.trial({infoName: "4OL1", setupEnd_condition: 2}, instructions_line3, fixation_line3, orderedlist_line3, feedback_line3);

// Experiment (line4)
let instructions_line4 = new CAOsExp.classes.elInstructions({infoName: 'instructions4'}, `Instructions Update:<br><br> Great! You successfully mastered the first set of images! Now for the second set. As before, these images need to be clicked in the correct order. You won't know this order to begin with - you will discover it as you go along!`)

let fixation_line4 = new CAOsExp.classes.elFixation(true, imageFixation);
let orderedlist_line4 = new CAOsExp.classes.elImageSequence(
    {   infoName: '40L2',
        setupClick_sound: soundTouch,
        setupClick_opacity: .25,
        setupImages_width: 200,
        setupImages_height: 200,
        setupEnd_condition: 4,
        setupEnd_window: 5,
        setupReset_onIncorrectReset: false,
        setupReset_onResetExit: true,
        setupInstructions: `Click on the images in the correct order - first... second... third... fourth. To start every trial, click the blue robot!`,
    }, ...condition_lineThreeToFive[1])

let feedback_line4 = new CAOsExp.classes.elFeedback(true,
    {result: true, 
    components : [
        {type: 'background', src: '#90EE90'}, 
        {type: 'audio', src: soundCorrect},
    ]},
    {result: false, 
        components : [
            {type: 'background', src: '#F08080'}, 
            {type: 'audio', src: soundIncorrect},
        ]},
    {result: undefined, 
        components : [
            {type: 'background', src: 'black'}, 
        ]}
)

let trial_line4 = new CAOsExp.classes.trial({infoName: "4OL2", setupEnd_condition: 2}, instructions_line4, fixation_line4, orderedlist_line4, feedback_line4);

// Experiment (line5)
let instructions_line5 = new CAOsExp.classes.elInstructions({infoName: 'instructions5'}, `Instructions Update:<br></br>Now you'll see some more images. <br><br>You have seen some before - make sure you click on them in the correct order. <br><br> This time you will be told if you are correct or wrong only after you have clicked on all the images! <br><br> If you feel like don't know or remember, take your best guess and click in the order which you think best fits the pattern.`)
let fixation_line5 = new CAOsExp.classes.elFixation(true, imageFixation);

let orderedlist_line3B = new CAOsExp.classes.elImageSequence(
    {   infoName: '40L1B',
        setupClick_sound: soundTouch,
        setupClick_opacity: .25,
        setupImages_width: 200,
        setupImages_height: 200,
        setupEnd_condition: `${criterion_sizeTrials4}Length`,
        setupReset_onIncorrectReset: false,
        setupReset_onResetExit: true,
        setupInstructions:  `Now you'll see some more images. You have seen some before - make sure you click on them in the correct order. If you don't remember or know the correct order, that's no problem! Take your best guess and click on the images in the way that best fits the pattern. This time you will be told if you are correct or wrong only after you have clicked on all the images! To start every trial, click the blue robot! <br> <span style = "color: green"> There are ${caosData_TrialsLeft} trials left!  </span>`,
        setupCustom_onEnter: function(){
            document.getElementById('elImageSequence_instructionsDOM').innerHTML = `Now you'll see some more images. You have seen some before - make sure you click on them in the correct order. If you don't remember or know the correct order, that's no problem! Take your best guess and click on the images in the way that best fits the pattern. This time you will be told if you are correct or wrong only after you have clicked on all the images! To start every trial, click the blue robot! <br> <span style = "color: green"> There are ${caosData_TrialsLeft} trials left!  </span>`
            caosData_TrialsLeft = caosData_TrialsLeft - 1;
        }
    }, ...condition_lineThreeToFive[0])

let feedback_line3B = new CAOsExp.classes.elFeedback(true,
    {result: true, 
    components : [
        {type: 'background', src: '#90EE90'}, 
        {type: 'audio', src: soundCorrect},
    ]},
    {result: false, 
        components : [
            {type: 'background', src: '#F08080'}, // RED
            {type: 'audio', src: soundIncorrect},
        ]},
    {result: undefined, 
        components : [
            {type: 'background', src: 'black'}, 
        ]}
)

let group_line3B = new CAOsExp.classes.group({infoName: '4OL1B_group', setupEnd_condition: 1,}, orderedlist_line3B, feedback_line3B)


let orderedlist_line4B = new CAOsExp.classes.elImageSequence(
    {   infoName: '40L2B',
        setupClick_sound: soundTouch,
        setupClick_opacity: .25,
        setupImages_width: 200,
        setupImages_height: 200,
        setupEnd_condition: `${criterion_sizeTrials4}Length`,
        setupReset_onIncorrectReset: false,
        setupReset_onResetExit: true,
        setupInstructions:  `Now you'll see some more images. You have seen some before - make sure you click on them in the correct order. If you don't remember or know the correct order, that's no problem! Take your best guess and click on the images in the way that best fits the pattern. This time you will be told if you are correct or wrong only after you have clicked on all the images! To start every trial, click the blue robot! <br> <span style = "color: green"> There are ${caosData_TrialsLeft} trials left!  </span>`,
        setupCustom_onEnter: function(){
            document.getElementById('elImageSequence_instructionsDOM').innerHTML = `Now you'll see some more images. You have seen some before - make sure you click on them in the correct order. If you don't remember or know the correct order, that's no problem! Take your best guess and click on the images in the way that best fits the pattern. This time you will be told if you are correct or wrong only after you have clicked on all the images! To start every trial, click the blue robot! <br> <span style = "color: green"> There are ${caosData_TrialsLeft} trials left!  </span>`
            caosData_TrialsLeft = caosData_TrialsLeft - 1;
        }
    }, ...condition_lineThreeToFive[1])

let feedback_line4B = new CAOsExp.classes.elFeedback(true,
    {result: true, 
    components : [
        {type: 'background', src: '#90EE90'}, 
        {type: 'audio', src: soundCorrect},
    ]},
    {result: false, 
        components : [
            {type: 'background', src: '#F08080'}, // RED
            {type: 'audio', src: soundIncorrect},
        ]},
    {result: undefined, 
        components : [
            {type: 'background', src: 'black'}, 
        ]}
)

let group_line4B = new CAOsExp.classes.group({infoName: '4OL2B_group', setupEnd_condition: 1, setupReset_onResetExit: true,}, orderedlist_line4B, feedback_line4B)

let unorderedlist_line5A = new CAOsExp.classes.elImageSequence(
    {   infoName: '4UL3A',
        setupClick_sound: soundTouch,
        setupClick_opacity: .25,
        setupImages_width: 200,
        setupImages_height: 200,
        setupEnd_condition: `${criterion_sizeTrials5}Length`,
        setupReset_onIncorrectReset: false,
        setupReset_onResetExit: true,
        setupInstructions:  `Now you'll see some more images. You have seen some before - make sure you click on them in the correct order. If you don't remember or know the correct order, that's no problem! Take your best guess and click on the images in the way that best fits the pattern. This time you will be told if you are correct or wrong only after you have clicked on all the images! To start every trial, click the blue robot! <br> <span style = "color: green"> There are ${caosData_TrialsLeft} trials left!  </span>`,
        setupCustom_onEnter: function(){
            document.getElementById('elImageSequence_instructionsDOM').innerHTML = `Now you'll see some more images. You have seen some before - make sure you click on them in the correct order. If you don't remember or know the correct order, that's no problem! Take your best guess and click on the images in the way that best fits the pattern. This time you will be told if you are correct or wrong only after you have clicked on all the images! To start every trial, click the blue robot! <br> <span style = "color: green"> There are ${caosData_TrialsLeft} trials left!  </span>`
            caosData_TrialsLeft = caosData_TrialsLeft - 1;
        }
    }, ...condition_lineThreeToFive[2])

let feedback_line5A = new CAOsExp.classes.elFeedback(true,
    {result: true, 
    components : [
        {type: 'background', src: '#90EE90'}, 
        {type: 'audio', src: soundCorrect},
    ]},
    {result: false, 
        components : [
            {type: 'background', src: '#90EE90'}, // RED
            {type: 'audio', src: soundCorrect},
        ]},
    {result: undefined, 
        components : [
            {type: 'background', src: 'black'}, 
        ]}
)

let group_line5A = new CAOsExp.classes.group({infoName: '4UL3A_group', setupEnd_condition: 1, setupReset_onResetExit: true,}, unorderedlist_line5A, feedback_line5A)

let unorderedlist_line5B = new CAOsExp.classes.elImageSequence(
    {   infoName: '6UL3B',
        setupClick_sound: soundTouch,
        setupClick_opacity: .25,
        setupImages_width: 200,
        setupImages_height: 200,
        setupEnd_condition: `${criterion_sizeTrials5}Length`,
        setupReset_onIncorrectReset: false,
        setupReset_onResetExit: true,
        setupInstructions:  `Now you'll see some more images. You have seen some before - make sure you click on them in the correct order. If you don't remember or know the correct order, that's no problem! Take your best guess and click on the images in the way that best fits the pattern. This time you will be told if you are correct or wrong only after you have clicked on all the images! To start every trial, click the blue robot! <br> <span style = "color: green"> There are ${caosData_TrialsLeft} trials left!  </span>`,
        setupCustom_onEnter: function(){
            document.getElementById('elImageSequence_instructionsDOM').innerHTML = `Now you'll see some more images. You have seen some before - make sure you click on them in the correct order. If you don't remember or know the correct order, that's no problem! Take your best guess and click on the images in the way that best fits the pattern. This time you will be told if you are correct or wrong only after you have clicked on all the images! To start every trial, click the blue robot! <br> <span style = "color: green"> There are ${caosData_TrialsLeft} trials left!  </span>`
            caosData_TrialsLeft = caosData_TrialsLeft - 1;
        }
    }, ...condition_lineThreeToFive[3])

let feedback_line5B = new CAOsExp.classes.elFeedback(true,
    {result: true, 
    components : [
        {type: 'background', src: '#90EE90'}, 
        {type: 'audio', src: soundCorrect},
    ]},
    {result: false, 
        components : [
            {type: 'background', src: '#90EE90'}, // RED
            {type: 'audio', src: soundCorrect},
        ]},
    {result: undefined, 
        components : [
            {type: 'background', src: 'black'}, 
        ]}
)

let group_line5B = new CAOsExp.classes.group({infoName: '6UL3B_group', setupEnd_condition: 1, setupReset_onResetExit: true,}, unorderedlist_line5B, feedback_line5B);

let group_line5_all = new CAOsExp.classes.group({infoName: 'groupForTests_Old', setupEnd_condition: 4, setupSet_randomize: false, setupSet_pick: 1, setupSet_array: [1,1,4], setupReset_onResetExit: true,}, group_line3B, group_line4B, group_line5A)

let trial_line5 = new CAOsExp.classes.trial({infoName: "Test_Old", setupEnd_condition: 2}, instructions_line5, fixation_line5, group_line5_all);

// line 6
let instructions_line6 = new CAOsExp.classes.elInstructions({infoName: 'instructions6'}, `Welcome to Kid Neuro Lab's Picture Game! In this game you will be shown sets of scrambled-up images that need to be clicked in the correct order.<br><br> For these images, you won't know the correct order. That's no problem! Take your best guess and click on the images in the way that best fits the pattern. For these images, you won't be told whether you are correct or wrong - you'll see a black screen after each trial!`)
let fixation_line6 = new CAOsExp.classes.elFixation(true, imageFixation);
let feedback_line6 = new CAOsExp.classes.elFeedback(true,
    {result: true, 
    components : [
        {type: 'background', src: 'black'},
    ]},
    {result: false, 
        components : [
            {type: 'background', src: 'black'},
        ]},
    {result: undefined, 
        components : [
            {type: 'background', src: 'black'}, 
        ]}
)

let unorderedlist_line6A = new CAOsExp.classes.elImageSequence(
    {   infoName: '4NovelUL1',
        setupClick_sound: soundTouch,
        setupClick_opacity: .25,
        setupImages_width: 200,
        setupImages_height: 200,
        setupEnd_condition: `${criterion_sizeTrials6}Length`,
        setupReset_onIncorrectReset: false,
        setupReset_onResetExit: true,
        setupInstructions:  `Click on the images in the correct order: first - second - third -fourth. Remember, you won't be told whether you are correct or wrong - instead you'll see a black screen after each trial!  To start every trial, click the blue robot! <br> <span style = "color: green"> There are ${caosData_TrialsLeft} trials left!  </span>`,
        setupCustom_onEnter: function(){
            document.getElementById('elImageSequence_instructionsDOM').innerHTML = `Click on the images in the correct order: first - second - third -fourth. Remember, you won't be told whether you are correct or wrong - instead you'll see a black screen after each trial!  To start every trial, click the blue robot! <br> <span style = "color: green"> There are ${caosData_TrialsLeft} trials left!  </span>`
            caosData_TrialsLeft = caosData_TrialsLeft - 1;
        }
    }, ...condition_lineSix[0])

let unorderedlist_line6B = new CAOsExp.classes.elImageSequence(
    {   infoName: '4NovelUL2',
        setupClick_sound: soundTouch,
        setupClick_opacity: .25,
        setupImages_width: 200,
        setupImages_height: 200,
        setupEnd_condition: `${criterion_sizeTrials6}Length`,
        setupReset_onIncorrectReset: false,
        setupReset_onResetExit: true,
        setupInstructions:  `Click on the images in the correct order: first - second - third -fourth. Remember, you won't be told whether you are correct or wrong - instead you'll see a black screen after each trial!  To start every trial, click the blue robot! <br> <span style = "color: green"> There are ${caosData_TrialsLeft} trials left!  </span>`,
        setupCustom_onEnter: function(){
            document.getElementById('elImageSequence_instructionsDOM').innerHTML = `Click on the images in the correct order: first - second - third -fourth. Remember, you won't be told whether you are correct or wrong - instead you'll see a black screen after each trial!  To start every trial, click the blue robot! <br> <span style = "color: green"> There are ${caosData_TrialsLeft} trials left!  </span>`
            caosData_TrialsLeft = caosData_TrialsLeft - 1;
        }
    }, ...condition_lineSix[1])

let unorderedlist_line6C = new CAOsExp.classes.elImageSequence(
    {   infoName: '4NovelUL3',
        setupClick_sound: soundTouch,
        setupClick_opacity: .25,
        setupImages_width: 200,
        setupImages_height: 200,
        setupEnd_condition: `${criterion_sizeTrials6}Length`,
        setupReset_onIncorrectReset: false,
        setupReset_onResetExit: true,
        setupInstructions:  `Click on the images in the correct order: first - second - third -fourth. Remember, you won't be told whether you are correct or wrong - instead you'll see a black screen after each trial!  To start every trial, click the blue robot! <br> <span style = "color: green"> There are ${caosData_TrialsLeft} trials left!  </span>`,
        setupCustom_onEnter: function(){
            document.getElementById('elImageSequence_instructionsDOM').innerHTML = `Click on the images in the correct order: first - second - third -fourth. Remember, you won't be told whether you are correct or wrong - instead you'll see a black screen after each trial!  To start every trial, click the blue robot! <br> <span style = "color: green"> There are ${caosData_TrialsLeft} trials left!  </span>`
            caosData_TrialsLeft = caosData_TrialsLeft - 1;
        }
    }, ...condition_lineSix[2])

let unorderedlist_line6D = new CAOsExp.classes.elImageSequence(
    {   infoName: '6NovelUL4',
        setupClick_sound: soundTouch,
        setupClick_opacity: .25,
        setupImages_width: 200,
        setupImages_height: 200,
        setupEnd_condition: `${criterion_sizeTrials6}Length`,
        setupReset_onIncorrectReset: false,
        setupReset_onResetExit: true,
        setupInstructions:  `Click on the images in the correct order: first - second - third -fourth. Remember, you won't be told whether you are correct or wrong - instead you'll see a black screen after each trial!  To start every trial, click the blue robot! <br> <span style = "color: green"> There are ${caosData_TrialsLeft} trials left!  </span>`,
        setupCustom_onEnter: function(){
            document.getElementById('elImageSequence_instructionsDOM').innerHTML = `Click on the images in the correct order: first - second - third -fourth. Remember, you won't be told whether you are correct or wrong - instead you'll see a black screen after each trial!  To start every trial, click the blue robot! <br> <span style = "color: green"> There are ${caosData_TrialsLeft} trials left!  </span>`
            caosData_TrialsLeft = caosData_TrialsLeft - 1;
        }
    }, ...condition_lineSix[3])

let group_line6_all = new CAOsExp.classes.group({infoName: 'groupForTests_Novel', setupEnd_condition: 4, setupSet_randomize: true, setupSet_pick: 1, setupSet_array: [2,2,2], setupReset_onResetExit: true,}, unorderedlist_line6A, unorderedlist_line6B, unorderedlist_line6C)

let trial_line6 = new CAOsExp.classes.trial({infoName: "Test_Novel", setupEnd_condition: 2}, instructions_line6, fixation_line6, group_line6_all, feedback_line6);

// end Exp stuff
let lineX_end = new CAOsExp.classes.elImageSequence(
{
    infoName: 'endMessage', 
    setupEnd_condition: false, 
    setupReset_onIncorrectReset: false, 
    setupReset_onResetExit: false,
    setupInstructions: `Congratulations, you finished the game! Your code to put into mTurk is ${CAOsExp.storage.mTurkCode}.`,
    setupCustom_onEnter: function(){
        CAOsExp.expTimeline._dataSave();
        setTimeout(
            function(){
                jatos.endStudyAjax();
            }, 1)
        document.getElementById('CAOsExp_testDiv').style.backgroundColor = 'black';
        document.getElementById('elImageSequence_instructionsDOM').innerHTML = `Congratulations, you finished the game! Your code to put into mTurk is ${CAOsExp.storage.mTurkCode}.`;
    }
}, 
    './assets/images/timeout_face.png')

let trial_lineX = new CAOsExp.classes.trial({infoName: "End", setupEnd_condition: 1}, lineX_end);



// exp start


//let exp = new CAOsExp.classes.exp({infoName: "PictureGame", infoCondition: JSON.stringify(condition_all[0]) == JSON.stringify(condition_order) ? 'Order' : 'noOrder', setupData_send: 'JATOS'}, trial_line5, trial_line6, trial_lineX);
let exp = new CAOsExp.classes.exp({infoName: "PictureGame", infoCondition: JSON.stringify(condition_all[0]) == JSON.stringify(condition_order) ? 'Order' : 'noOrder', setupData_send: 'JATOS'}, trial_line6, trial_line3, trial_line4, trial_line5, trial_lineX);

CAOsExp.start(exp);


/*
round1_Fixation = new CAOsExp.classes.elFixation({});
round1_Training = new CAOsExp.classes.elImageSequence({}, image1, image2);
round1_Feedback = new CAOsExp.classes.elFeedback();
round1 = new CAOsExp.classes.trial(true, round1_Fixation, round1_Training, round1_Feedback);

round2_Fixation = new CAOsExp.classes.elFixation({});
round2_Training = new CAOsExp.classes.elImageSequence({}, image1, image2, image3, image4);
round2_Feedback = new CAOsExp.classes.elFeedback();
round2 = new CAOsExp.classes.trial(true, round1_Fixation, round1_Training, round1_Feedback);

round3_Fixation = new CAOsExp.classes.elFixation({});
round3_Training = new CAOsExp.classes.elImageSequence({}, image1, image2, image3, image4, image5, image6);
round3_Feedback = new CAOsExp.classes.elFeedback();
round3 = new CAOsExp.classes.trial(true, round1_Fixation, round1_Training, round1_Feedback);

roundX_Fixation = new CAOsExp.classes.elFixation(true, {});

round1_Training = new CAOsExp.classes.elImageSequence(true, image1, image2);
round2_Training = new CAOsExp.classes.elImageSequence({}, image1, image2, image3, image4);
round3_Training = new CAOsExp.classes.elImageSequence({}, image1, image2, image3, image4, image5, image6);

roundX_TrainingGroup = new CAOsExp.classes.group(true, round1_Training, round2_Training, round3_Training)
roundX_Feedback = new CAOsExp.classes.elFeedback(true, {});
roundX = new CAOsExp.classes.trial(true, roundX_Fixation, roundX_TrainingGroup, roundX_Feedback);
*/