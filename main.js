speechSynthesis.cancel();
setInterval(function(){ speechSynthesis.pause(); speechSynthesis.resume();}, 5000);
var buzzer = new Audio('buzzer.wav');
buzzer.preload = "auto";
function playBuzzer() { 
    buzzer.currentTime = 0;
    buzzer.play();
}
var speech = "";
var questions = [{question: "TOSS UP: What organelle is primarily responsible for energy production in eukaryotic cells?\nW) Nucleus\nX) Ribosome\nY) Mitochondrion\nZ) Endoplasmic Reticulum", spokenAnswer: "Y) Mitochondrion", answer: "Y) Mitochondrion", timer: 5},
    {question: "BONUS: What is the term for the tendency of an object to resist changes to its state of motion?\nW) Acceleration\nX) Inertia\nY) Momentum\nZ) Force", spokenAnswer: "X) Inertia", answer: "X) Inertia", timer: 20}];
var currentQuestion = null;
var questionNumber = 0;
var timer = 20;
var fullTimer = timer;
var startedTimer = Date.now();
var showOnScreen = true;

document.getElementById("input").addEventListener("change", function (e) {
    var file = e.target.files[0];
    var reader = new FileReader();
    reader.onload = function (e) {
        questions = JSON.parse(e.target.result);
        questionNumber = 0;
        document.getElementById("input2").value = JSON.stringify(questions);
    }
    reader.readAsText(file);
});

document.getElementById("input2").value = JSON.stringify(questions);
document.getElementById("input2").addEventListener("change", function (e) {
    questions = JSON.parse(e.target.value);
});

document.getElementById("timerInput").addEventListener("change", function (e) {
    timer = parseInt(e.target.value);
});
window.addEventListener("beforeunload", function (e) {
    this.speechSynthesis.cancel();
})
document.getElementById("export").addEventListener("click", function (e) {
    var fileContent = JSON.stringify(questions);
    var blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'questions.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
});

document.getElementById("close").addEventListener("click", function (e) {
    document.getElementById("left").classList.add("slide-out");
    document.getElementById("left").classList.remove("slide-in");
    document.getElementById("menubutton").classList.add("slide-in");
    document.getElementById("menubutton").style["display"] = "block";
    document.getElementById("left").addEventListener("animationend", function (e) {
        document.getElementById("left").style["display"] = "none";
        
    }, { once: true });
    
});

document.getElementById("menubutton").addEventListener("click", function (e) {
    document.getElementById("menubutton").style["display"] = "none";
    document.getElementById("left").style["display"] = "block";
    document.getElementById("left").classList.add("slide-in");
    document.getElementById("left").classList.remove("slide-out");
    document.getElementById("left").style["display"] = "block";
});


var message = new SpeechSynthesisUtterance();
message.lang = "";

document.getElementById("rateSlider").addEventListener("change", function (e) {
    message.rate = e.target.value / 100 + 0.5;
});

document.getElementById("pitchSlider").addEventListener("change", function (e) {
    message.pitch = e.target.value / 100 + 0.5;
});

document.getElementById("spacebar").addEventListener("click", function (e) {
    handleSpacebar(e);
});

document.getElementById("showonscreen").addEventListener("change", function (e) {
    showOnScreen = e.target.checked;
});

document.addEventListener("keydown", function (e) {
    if (e.code == "Space") {
        handleSpacebar(e);
    }
});

var sleep = function (ms) {
    return new Promise(function(r){setTimeout(r, ms)});
}
var sleepUntil = async function(f, ms = 50){
    return new Promise(function(r){
        var inter = setInterval(function(){
            if(f()){
                clearInterval(inter);
                r();
            }
        }, ms);
    })
}
var buzzed = false;
var handleSpacebar = function (e) {
    if(document.getElementById("spacebar").classList.contains("buzzerDisabled") || e.repeat){
        return;
    }
    playBuzzer();
    buzzed = true;
    
    if(!currentQuestion){
        currentQuestion = randomQuestion();
        buzzed = false;
        startQuestion(currentQuestion);
    }
}
var buzz = async function(){
    while(true){
        if(buzzed){
            buzzed = false;
            break;
        }
        await sleep(250);
    }
}
var setVoices = function(){
    var elem = document.getElementById("selectVoices");
    elem.replaceChildren();
    for(var i of allVoices){
        if(!(window.navigator.onLine || i.localService)){
            continue;
        }
        var option = document.createElement("option");
        option.value = i.name;
        option.text = i.name;
        elem.appendChild(option);
    }
};

document.getElementById("selectVoices").addEventListener("change", function(e){
    message.voice = allVoices.find(i => i.name == e.target.value);
});


var allVoices = [];
speechSynthesis.onvoiceschanged = function(e){
    allVoices = window.speechSynthesis.getVoices();
    setVoices();
    var xx = 0;
    for(var i of window.speechSynthesis.getVoices()){
        if(window.Navigator.onLine && i.name.toLowerCase().includes("google") && i.name.toLowerCase().includes("uk") && !i.name.toLowerCase().includes("female")){
            message.voice = i;
            document.getElementById("selectVoices").selectedIndex = xx;
            break;
        }
        xx++;
    }
};

window.addEventListener("online", setVoices);
window.addEventListener("offline", setVoices);


var inter = setInterval(function(){
    var voice = null;

    for(var i of window.speechSynthesis.getVoices()){
        if(i.name.toLowerCase().includes("google") && i.name.toLowerCase().includes("uk") && !i.name.toLowerCase().includes("female")){
            voice = i;
            break;
        }
    }

    //message.voice = voice;
    if(voice != null) clearInterval(inter);
}, 100);

var sanitize = function (text) {
    var element = document.createElement("div");
    element.innerHTML = text;
    return element.textContent;
}
var textToShow = "";
var speak = async function (text, showOnScreen, txt2show = text, id = "question") {
    message.text = text;
    window.speechSynthesis.speak(message);
    window.speechSynthesis.resume();
    var now = Date.now();
    textToShow = sanitize(txt2show);
    var i = 0;
    while (true) {
        i++;
        if(buzzed){
            window.speechSynthesis.cancel();
            if(!showOnScreen){
                document.getElementById(id).innerHTML = "DONE SPEAKING";
            }
            return;
        }
        if(!window.speechSynthesis.speaking){ 
            if(!showOnScreen){
                document.getElementById(id).innerHTML = "DONE SPEAKING";
            }
            return;
        }
        if(showOnScreen){
            var now2 = Date.now();
            var estimatedTime = textToShow.length * 85;
            var percentage = (now2 - now) / estimatedTime * message.rate;
            var newText = textToShow.substring(0, Math.floor(percentage * text.length));
            document.getElementById(id).innerHTML = newText.replaceAll("\n", "<br>");
        }
        else{
            if(id){
                document.getElementById(id).innerHTML = "SPEAKING" + ".".repeat((i/6)%4);
            }
        }
        await sleep(100);
    }
};

var randomQuestion = function () {
    return questions[questionNumber++];
}

var showTimer = function(timer2 = timer){
    document.getElementById("timer").textContent = timer2;
    fullTimer = timer2;
    document.getElementById("timerTimer").style.background = "conic-gradient(rgba(0,0,0,0) 0% 0%, rgba(255,255,255,255) 0% 100%)";
    document.getElementById("timerContainer").classList.add("fade-in");
    document.getElementById("timerContainer").classList.remove("fade-out");
    document.getElementById("timerContainer").style["display"] = "block";
}

var hideTimer = function(){
    document.getElementById("timerContainer").classList.remove("fade-in");
    document.getElementById("timerContainer").classList.add("fade-out");
    document.getElementById("timerContainer").addEventListener("animationend", function (e) {
        document.getElementById("timerContainer").style["display"] = "none";
    }, { once: true });
}
var disableBuzzer = function(){
    document.getElementById("spacebar").classList.add("buzzerDisabled");
    document.getElementById("spacebar").classList.remove("buzzerEnabled");
};
var enableBuzzer = function(){
    document.getElementById("spacebar").classList.remove("buzzerDisabled");
    document.getElementById("spacebar").classList.add("buzzerEnabled");
};
var startTimer = async function(){
    startedTimer = Date.now();
    while(true){
        var now = Date.now();
        var time = (now - startedTimer) / 1000;
        var percentage = time / fullTimer;
        percentage = Math.max(percentage, 0);
        document.getElementById("timerTimer").style.background = "conic-gradient(rgba(0,0,0,0) 0% " + percentage*100 + "%, rgba(255,255,255,255) " + percentage*100 + "% 100%)";
        document.getElementById("timer").innerHTML = Math.ceil(fullTimer - time);
        if(buzzed == true){
            document.getElementById("timerTimer").style.background = "conic-gradient(rgba(0,0,0,0) 0% " + percentage*100 + "%, rgba(0,255,0,255) " + percentage*100 + "% 100%)";
            buzzed = false;
            return true;
        }
        if(time >= fullTimer){
            return false;
        }
        await sleep(12);
    }
}
var beepTimer = async function(){
    for(var i = 0; i < 3; i++){
        await sleep(250);
        playBuzzer();
        document.getElementById("timerTimer").style.background = "conic-gradient(rgba(0,0,0,0) 0% 0%, rgba(255,0,0,255) 0% 100%)";
        await sleep(250);
        document.getElementById("timerTimer").style.background = "conic-gradient(rgba(0,0,0,0) 0% 0%, rgba(0,0,0,0) 0% 100%)";
    }
}


clearQuestionAndAnswer = function(){
    document.getElementById("question").textContent = "";
    document.getElementById("answer").textContent = "";
}


var startQuestion = async function(x){
    if(!x){
        return;
    }
    clearQuestionAndAnswer();
    showTimer(x.timer ?? timer);
    await speak(x.question, showOnScreen, x.question, "question");
    
    startTimer().then(async function(y){
        var txt = textToShow.replaceAll("\n", "<br>");
        if(y){
            disableBuzzer();
            await sleep(3000);
            hideTimer();
            await speak("The answer was " + x.spokenAnswer, true, x.answer, "answer");
            document.getElementById("question").innerHTML = txt;
            enableBuzzer();
            currentQuestion = null;
        }
        else{
            disableBuzzer();
            beepTimer();
            await sleep(2500);
            hideTimer();
            await speak("Times up. The answer was " + x.spokenAnswer, true, x.answer, "answer");
            document.getElementById("question").innerHTML = txt;
            await sleep(1000);
            enableBuzzer();
            currentQuestion = null;
        }
    });
}