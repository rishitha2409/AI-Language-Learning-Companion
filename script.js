const $ = (id) => document.getElementById(id);

const plan = [
  ["Introduce yourself","Say your name, age range if comfortable, and interests."],
  ["Learn 10 words","Choose useful everyday words and write example sentences."],
  ["Build simple sentences","Practise subject + verb + object."],
  ["Present tense","Describe routines: I study every day."],
  ["Ask questions","Practise what, where, when, why and how."],
  ["Write a paragraph","Write 4–5 sentences about your day."],
  ["Revision quiz","Review the first six days and take the quiz."],
  ["Past tense","Describe yesterday using simple past tense."],
  ["Future tense","Practise plans: I will study tomorrow."],
  ["Daily conversation","Practise greetings and asking for help."],
  ["Useful phrases","Learn polite requests and responses."],
  ["Pronunciation","Listen to phrases and repeat them aloud."],
  ["Correct mistakes","Review common grammar errors and corrections."],
  ["Final revision","Take the quiz again and compare your real scores."]
];
function renderPlan(){
  const saved = JSON.parse(localStorage.getItem("llbPlanChecks") || "[]");
  $("planGrid").replaceChildren();
  [["Week 1 · Build the basics",0,7],["Week 2 · Build confidence",7,14]].forEach(([title,start,end])=>{
    const card=document.createElement("div"); card.className="plan-card";
    const h=document.createElement("h3"); h.textContent=title; card.append(h);
    for(let i=start;i<end;i++){
      const row=document.createElement("label"); row.className="day-row"+(saved.includes(i)?" done":"");
      const cb=document.createElement("input"); cb.type="checkbox"; cb.checked=saved.includes(i); cb.setAttribute("aria-label",`Mark day ${i+1} complete`);
      cb.addEventListener("change",()=>{
        let current=JSON.parse(localStorage.getItem("llbPlanChecks")||"[]");
        current=cb.checked?[...new Set([...current,i])]:current.filter(n=>n!==i);
        localStorage.setItem("llbPlanChecks",JSON.stringify(current)); row.classList.toggle("done",cb.checked);
      });
      const day=document.createElement("span"); day.className="day-label"; day.textContent=`Day ${i+1}`;
      const task=document.createElement("span"); task.textContent=plan[i][0];
      const info=document.createElement("span"); info.textContent="›"; info.style.color="var(--purple)";
      row.append(cb,day,task,info); card.append(row);
    }
    $("planGrid").append(card);
  });
}

async function checkGrammar() {
    const input = $("grammarInput");
    const result = $("grammarResult");
    const original = input.value.trim();

    result.replaceChildren();

    if (!original) {
        result.textContent = "Please enter a sentence first.";
        return;
    }

    if (original.length > 5000) {
        result.textContent = "Please enter a shorter sentence (maximum 5,000 characters).";
        return;
    }

    result.textContent = "Checking your grammar...";

    try {
        const response = await fetch(
            "https://api.languagetool.org/v2/check",
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams({
                    text: original,
                    language: "en-US"
                })
            }
        );

        if (!response.ok) {
            throw new Error("Grammar service unavailable");
        }

        const data = await response.json();

        // Apply corrections from right to left so offsets remain valid.
        const matches = [...data.matches].sort(
            (a, b) => b.offset - a.offset
        );

        let corrected = original;
        const explanations = [];
        let lastStart = Infinity;

        for (const match of matches) {
            if (match.message) {
                explanations.push(match.message);
            }

            if (
                !match.replacements ||
                match.replacements.length === 0
            ) {
                continue;
            }

            const start = match.offset;
            const end = start + match.length;

            // Skip overlapping suggestions to avoid conflicting edits.
            if (end > lastStart) {
                continue;
            }

            const replacement = match.replacements[0].value;

            corrected =
                corrected.slice(0, start) +
                replacement +
                corrected.slice(end);

            lastStart = start;
        }

        // Capitalize the first letter.
        corrected = corrected.replace(
            /^(\s*)([a-z])/,
            (whole, spaces, letter) =>
                spaces + letter.toUpperCase()
        );

        // Add punctuation if it is missing.
        if (!/[.!?]$/.test(corrected.trim())) {
            corrected = corrected.trimEnd() + ".";
        }

        const heading = document.createElement("strong");
        heading.textContent = "Suggested correction:";

        const sentence = document.createElement("p");
        sentence.textContent = corrected;

        const explanation = document.createElement("p");
        explanation.style.marginTop = "8px";

        explanation.textContent = explanations.length
            ? "Explanation: " +
              [...new Set(explanations)].join(" ")
            : "No mistakes detected. This does not guarantee the sentence is completely correct.";

        result.append(heading, sentence, explanation);

    } catch (error) {
        result.textContent =
            "Unable to check grammar. Please check your internet connection and try again.";
    }
}
  $("grammarButton").addEventListener("click", checkGrammar);
document.querySelectorAll(".example-chip").forEach(btn => {
    btn.addEventListener("click", () => {
        $("grammarInput").value = btn.dataset.sentence;
        checkGrammar();
    });
});
const words=[
["Hello","வணக்கம்","Greeting","👋","Hello, how are you?"],
["Thank you","நன்றி","Conversation","🙏","Thank you for your help."],
["Please","தயவுசெய்து","Conversation","💬","Please open the book."],
["Water","தண்ணீர்","Daily life","💧","I drink water."],
["Food","உணவு","Daily life","🍚","The food is ready."],
["Home","வீடு","Daily life","🏠","I am at home."],
["Friend","நண்பர்","Daily life","🧑‍🤝‍🧑","She is my friend."],
["Book","புத்தகம்","Study","📘","This is my book."],
["School","பள்ளி","Study","🏫","I go to school."],
["Teacher","ஆசிரியர்","Study","👩‍🏫","My teacher is kind."],
["Learn","கற்றுக்கொள்","Study","🌱","I learn English."],
["Read","படி","Study","📖","I read a story."],
["Write","எழுது","Study","✍️","Please write your name."],
["Happy","மகிழ்ச்சியாக","Feelings","😊","I am happy today."],
["Sad","சோகமாக","Feelings","😔","He feels sad."],
["Tired","சோர்வாக","Feelings","😴","I am tired after work."],
["Help","உதவி","Conversation","🆘","Can you help me?"],
["Sorry","மன்னிக்கவும்","Conversation","💐","I am sorry I am late."],
["Good morning","காலை வணக்கம்","Conversation","🌞","Good morning, everyone."],
["Beautiful","அழகான","Daily life","🌸","It is a beautiful day."],
["Family","குடும்பம்","Daily life","👨‍👩‍👧","I love my family."],
["Understand","புரிந்துகொள்","Study","💡","I understand the lesson."]
];
function renderVocab(){
  const query=$("vocabSearch").value.trim().toLowerCase(),cat=$("vocabCategory").value;
  const grid=$("vocabGrid");grid.replaceChildren();let count=0;
  words.filter(w=>(cat==="all"||w[2]===cat)&&w.join(" ").toLowerCase().includes(query)).forEach(w=>{
    count++;const card=document.createElement("article");card.className="vocab-card";
    const emoji=document.createElement("div");emoji.className="vocab-emoji";emoji.textContent=w[3];
    const title=document.createElement("h3");title.textContent=w[0];
    const tamil=document.createElement("div");tamil.className="tamil";tamil.textContent=w[1];
    const category=document.createElement("p");category.textContent=w[2];
    const example=document.createElement("p");example.textContent=w[4];
    const speak=document.createElement("button");speak.textContent="🔊 Listen";speak.addEventListener("click",()=>speakText(w[0]));
    card.append(emoji,title,tamil,category,example,speak);grid.append(card);
  });
  if(!count){const p=document.createElement("p");p.textContent="No words found. Try another search.";grid.append(p);}
}
$("vocabSearch").addEventListener("input",renderVocab);$("vocabCategory").addEventListener("change",renderVocab);

const questions=[
{q:"Choose the correct sentence.",o:["She go to school.","She goes to school.","She going school.","She gone to school."],a:1,e:"Use goes with she in the simple present."},
{q:"What is the past tense of 'eat'?",o:["Eated","Eating","Ate","Eats"],a:2,e:"The simple past form of eat is ate."},
{q:"Choose the correct word: I ___ a student.",o:["is","am","are","be"],a:1,e:"Use am with I."},
{q:"What is the Tamil meaning of 'Water'?",o:["புத்தகம்","தண்ணீர்","வீடு","உணவு"],a:1,e:"Water means தண்ணீர்."},
{q:"Choose the correct article: I ate ___ apple.",o:["a","an","thee","no word is ever needed"],a:1,e:"Use an before a vowel sound, as in apple."},
{q:"Choose the correct sentence.",o:["They is happy.","They am happy.","They are happy.","They be happy."],a:2,e:"Use are with they."},
{q:"What is the opposite of 'happy'?",o:["Kind","Sad","Quick","Bright"],a:1,e:"Sad is a common opposite of happy."},
{q:"Complete: Yesterday, I ___ to school.",o:["go","goes","went","going"],a:2,e:"Went is the past tense of go."},
{q:"Which phrase is polite?",o:["Give me that now!","Could you please help me?","You must do it.","Move away."],a:1,e:"Could you please help me? is a polite request."},
{q:"What does 'நன்றி' mean in English?",o:["Sorry","Hello","Thank you","Good night"],a:2,e:"நன்றி means Thank you."}
];
let quizIndex=0,quizAnswers=Array(questions.length).fill(null),quizFinished=false;
function renderQuiz(){
  const q=questions[quizIndex];$("quizProgress").textContent=`Question ${quizIndex+1} of ${questions.length}`;
  $("quizProgressBar").style.width=`${(quizIndex+1)/questions.length*100}%`;
  $("quizArea").replaceChildren();$("quizResult").textContent="";$("restartQuiz").classList.add("hidden");
  const title=document.createElement("h3");title.className="quiz-question";title.textContent=q.q;$("quizArea").append(title);
  q.o.forEach((option,i)=>{const label=document.createElement("label");label.className="quiz-option";
    const input=document.createElement("input");input.type="radio";input.name="quizOption";input.value=i;input.checked=quizAnswers[quizIndex]===i;input.addEventListener("change",()=>quizAnswers[quizIndex]=i);
    const span=document.createElement("span");span.textContent=String.fromCharCode(65+i)+". "+option;label.append(input,span);$("quizArea").append(label);});
  $("prevQuestion").disabled=quizIndex===0;$("prevQuestion").style.opacity=quizIndex===0?".45":"1";
  $("nextQuestion").textContent=quizIndex===questions.length-1?"Submit quiz":"Next →";
}
$("prevQuestion").addEventListener("click",()=>{if(quizIndex>0){quizIndex--;renderQuiz();}});
$("nextQuestion").addEventListener("click",()=>{
  if(quizAnswers[quizIndex]===null){$("quizResult").textContent="Please choose an answer before continuing.";return;}
  if(quizIndex<questions.length-1){quizIndex++;renderQuiz();return;}
  let score=0;questions.forEach((q,i)=>{if(quizAnswers[i]===q.a)score++;});
  quizFinished=true;$("quizArea").replaceChildren();$("prevQuestion").classList.add("hidden");$("nextQuestion").classList.add("hidden");
  const r=$("quizResult");r.replaceChildren();const h=document.createElement("h3");h.textContent=`Your score: ${score}/${questions.length}`;
  const p=document.createElement("p");p.textContent=score>=8?"Great work! Review any missed answers.":score>=5?"Good effort! Practise the topics you missed.":"Keep practising. Review the vocabulary and grammar sections, then try again.";
  r.append(h,p);questions.forEach((q,i)=>{const line=document.createElement("p");line.style.marginTop="10px";line.textContent=`${i+1}. ${q.q} Correct answer: ${q.o[q.a]}. ${q.e} Your answer: ${quizAnswers[i]===null?"Not answered":q.o[quizAnswers[i]]}.`;r.append(line);});
  $("restartQuiz").classList.remove("hidden");localStorage.setItem("llbLastQuizScore",String(score));
});
$("restartQuiz").addEventListener("click",()=>{quizIndex=0;quizAnswers=Array(questions.length).fill(null);quizFinished=false;$("prevQuestion").classList.remove("hidden");$("nextQuestion").classList.remove("hidden");renderQuiz();});
function speakText(text){
  if(!("speechSynthesis" in window)){ $("speechStatus").textContent="Sorry, text-to-speech is not supported in this browser.";return;}
  window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(text);utterance.lang="en-IN";utterance.rate=.85;
  utterance.onstart=()=>{$("speechStatus").textContent="Playing: "+text;};
  utterance.onend=()=>{$("speechStatus").textContent="Finished. Repeat the phrase aloud and compare it with a trusted pronunciation source.";};
  utterance.onerror=()=>{$("speechStatus").textContent="Audio could not play. Check your browser/device audio settings.";};
  window.speechSynthesis.speak(utterance);
}
$("speakButton").addEventListener("click",()=>speakText($("speechText").value));
$("stopSpeakButton").addEventListener("click",()=>{if("speechSynthesis" in window)window.speechSynthesis.cancel();$("speechStatus").textContent="Playback stopped.";});
document.querySelectorAll(".copy-prompt").forEach(btn=>btn.addEventListener("click",async()=>{
  const text=btn.parentElement.querySelector("p").textContent;
  try{await navigator.clipboard.writeText(text);showToast("Prompt copied. Paste it into your AI tool.");}
  catch{showToast("Select and copy the prompt text manually.");}
}));
$("saveComparison").addEventListener("click",()=>{
  const values=[...document.querySelectorAll("#comparison input, #comparison textarea")].map(el=>el.value);
  localStorage.setItem("llbComparison",JSON.stringify(values));$("comparisonStatus").textContent=" Saved in this browser.";
});
function loadComparison(){const data=JSON.parse(localStorage.getItem("llbComparison")||"null");if(data){[...document.querySelectorAll("#comparison input, #comparison textarea")].forEach((el,i)=>el.value=data[i]||"");}}
$("analyseButton").addEventListener("click",()=>{
  const b=Number($("beforeScore").value),a=Number($("afterScore").value),r=$("analysisResult");
  if($("beforeScore").value===""||$("afterScore").value===""||b<0||b>10||a<0||a>10){r.textContent="Enter both scores from 0 to 10.";return;}
  const diff=a-b;const p=diff>0?`Your score increased by ${diff} point(s).`:diff<0?`Your score changed by ${diff} point(s). Review the topics you found difficult.`:"Your scores are the same. Keep practising and try again.";
  r.textContent=`Before: ${b}/10 · After: ${a}/10 · Difference: ${diff>0?"+":""}${diff}. ${p}`;
});
function showToast(message){const t=$("toast");t.textContent=message;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2400);}
$("menuToggle").addEventListener("click",()=>$("mainNav").classList.toggle("open"));
document.querySelectorAll("#mainNav a").forEach(a=>a.addEventListener("click",()=>$("mainNav").classList.remove("open")));
renderPlan();renderVocab();renderQuiz();loadComparison();
