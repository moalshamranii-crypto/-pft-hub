(function(){
  "use strict";

  /* ---------- navigation ---------- */
  var pages = Array.prototype.slice.call(document.querySelectorAll('.page'));
  var links = Array.prototype.slice.call(document.querySelectorAll('[data-p]'));
  var side  = document.getElementById('side');
  var scrim = document.getElementById('scrim');

  function closeMenu(){ side.classList.remove('open'); scrim.classList.remove('on'); }

  function show(id, push){
    var target = document.getElementById(id);
    if(!target) return;
    pages.forEach(function(p){ p.classList.toggle('on', p === target); });
    document.querySelectorAll('.nav a').forEach(function(a){
      a.classList.toggle('on', a.getAttribute('data-p') === id);
    });
    if(push !== false && history.replaceState) history.replaceState(null,'','#'+id);
    window.scrollTo(0,0);
    closeMenu();
    document.title = 'PFT Education Hub \u2014 ' + (target.querySelector('h1') ? target.querySelector('h1').textContent : 'Respiratory Care Laboratory');
  }

  links.forEach(function(a){
    a.addEventListener('click', function(e){ e.preventDefault(); show(a.getAttribute('data-p')); });
  });

  var start = (location.hash || '').replace('#','');
  if(start && document.getElementById(start)) show(start, false);

  document.getElementById('burger').addEventListener('click', function(){
    side.classList.toggle('open'); scrim.classList.toggle('on');
  });
  scrim.addEventListener('click', closeMenu);

  /* ---------- search ---------- */
  var haystack = pages.map(function(p){
    return { id: p.id, text: (p.textContent || '').toLowerCase() };
  });
  var noresult = document.getElementById('noresult');

  document.getElementById('q').addEventListener('input', function(e){
    var v = e.target.value.trim().toLowerCase();
    var navLinks = document.querySelectorAll('.nav a');
    if(v.length < 2){
      navLinks.forEach(function(a){ a.classList.remove('hide'); });
      document.querySelectorAll('.navgroup').forEach(function(g){ g.style.display = ''; });
      noresult.style.display = 'none';
      return;
    }
    var hits = 0;
    navLinks.forEach(function(a){
      var id = a.getAttribute('data-p');
      var rec = haystack.filter(function(h){ return h.id === id; })[0];
      var match = rec && rec.text.indexOf(v) > -1;
      a.classList.toggle('hide', !match);
      if(match) hits++;
    });
    document.querySelectorAll('.navgroup').forEach(function(g){
      var visible = g.querySelectorAll('a:not(.hide)').length;
      g.style.display = visible ? '' : 'none';
    });
    noresult.style.display = hits ? 'none' : 'block';
  });

  /* ---------- competency checklist ---------- */
  var boxes = Array.prototype.slice.call(document.querySelectorAll('[data-ck] input'));
  var ckcount = document.getElementById('ckcount');
  function tally(){
    var done = boxes.filter(function(b){ return b.checked; }).length;
    ckcount.textContent = done + ' of ' + boxes.length + ' complete';
  }
  boxes.forEach(function(b){
    b.addEventListener('change', function(){
      b.closest('li').classList.toggle('done', b.checked);
      tally();
    });
  });
  document.getElementById('ckreset').addEventListener('click', function(){
    boxes.forEach(function(b){ b.checked = false; b.closest('li').classList.remove('done'); });
    tally();
  });
  tally();

  /* ---------- quiz ---------- */
  var Q = [
    {q:"The back-extrapolated volume on a spirometry effort must not exceed:",
     a:["5 % of the FVC or 0.100 L, whichever is greater","0.150 L in all patients","10 % of the FVC","0.025 L"],c:0,
     e:"A hesitant start steals volume from the first second. If BEV exceeds 5 % of FVC or 0.100 L, whichever is greater, the FEV\u2081 from that effort is not valid."},
    {q:"Which of these satisfies the end-of-forced-expiration criterion?",
     a:["The patient exhaled for 6 seconds","A plateau of at least 1 second with less than 0.025 L expired","The flow\u2013volume loop looks smooth","The patient says they are empty"],c:1,
     e:"Any one of three will do: a 1-second plateau with <0.025 L expired, an FET of 15 s or more, or the patient being genuinely unable to continue."},
    {q:"In an adult, the two largest FVC values must agree within:",
     a:["0.100 L","0.150 L","0.200 L","5 % of the largest"],c:1,
     e:"0.150 L for both FVC and FEV\u2081, tightening to 0.100 L when the FVC is 1.0 L or less."},
    {q:"A session with 3 acceptable manoeuvres where the two largest FEV\u2081 values differ by 0.180 L is graded:",
     a:["A","B","C","E"],c:2,
     e:"Grade C: at least 2 acceptable manoeuvres with the two largest within 0.200 L. Grade A would have required agreement within 0.150 L."},
    {q:"Under the 2022 standard, bronchodilator responsiveness is present when FEV\u2081 or FVC increases by more than:",
     a:["12 % of baseline and 200 mL","10 % of the predicted value","200 mL","15 % of baseline"],c:1,
     e:"(post \u2212 pre) \u00F7 predicted \u00D7 100 > 10 %. Using the predicted value rather than the patient's own baseline removes size and severity bias."},
    {q:"The standard bronchodilator dose and waiting time for a responsiveness study is:",
     a:["200 \u00B5g salbutamol, wait 5 minutes","400 \u00B5g salbutamol by spacer, wait 10\u201315 minutes","400 \u00B5g salbutamol, wait 30 minutes","160 \u00B5g ipratropium, wait 15 minutes"],c:1,
     e:"Four separate 100 \u00B5g actuations through a spacer, then 10\u201315 minutes. Ipratropium 160 \u00B5g is an alternative but needs a 30-minute wait."},
    {q:"The lower limit of normal corresponds to a z-score of:",
     a:["\u22121.0","\u22121.645","\u22122.0","\u22122.5"],c:1,
     e:"The LLN is the 5th percentile, which is z = \u22121.645. By definition 5 % of healthy people fall below it."},
    {q:"An FEV\u2081 z-score of \u22123.2 in a patient with obstruction is graded as:",
     a:["Mild","Moderate","Severe","Very severe"],c:1,
     e:"The 2022 standard uses three grades: mild down to \u22122.5, moderate from \u22122.5 to \u22124.0, and severe below \u22124.0."},
    {q:"Restriction can only be confirmed by:",
     a:["A low FVC","A normal FEV\u2081/FVC with a low FVC","A TLC below the LLN","A reduced DLCO"],c:2,
     e:"A low FVC with a normal ratio has several causes. Only TLC below its LLN establishes a restrictive defect."},
    {q:"Low FVC, normal FEV\u2081/FVC, normal TLC. This is:",
     a:["Restriction","A non-specific pattern","Mixed defect","Obstruction"],c:1,
     e:"The non-specific pattern. Common in obesity and small airways disease, and often the result of submaximal effort \u2014 check the traces before reporting it."},
    {q:"During plethysmography, the patient should pant at:",
     a:["0.5\u20131.0 Hz","1.5\u20132.0 Hz","2\u20133 Hz","As fast as comfortable"],c:0,
     e:"0.5\u20131.0 Hz, or 30\u201360 per minute. Above 1.5 Hz the signal distorts; below 0.5 Hz the controlled leak bleeds pressure away."},
    {q:"The switch-in error at shutter closure should be under:",
     a:["50 mL","100 mL","200 mL","500 mL"],c:2,
     e:"Under 200 mL. It is the drift between the true end-expiratory level and the level at which the shutter actually closed."},
    {q:"FRC values measured by plethysmography should be repeatable within:",
     a:["5 %","10 %","15 %","0.150 L"],c:0,
     e:"5 % is the best repeatability criterion for plethysmography; 10 % is the least stringent still considered usable. Gas dilution and MBW use 10 % and 25 %."},
    {q:"What did the 2023 lung volume update make mandatory?",
     a:["Helium dilution as the reference method","Performing the IC and slow VC linked within the same manoeuvre as the FRC measurement","Measuring airway resistance during the same panting manoeuvre","Reporting the single best FRC rather than an average"],c:1,
     e:"Linked spirometry is now required, FRC values are averaged rather than picked, and airway resistance must not be measured in the same panting manoeuvre used for FRC."},
    {q:"In severe emphysema, FRC measured by plethysmography compared with helium dilution will be:",
     a:["Lower","The same","Higher","Unpredictable"],c:2,
     e:"Plethysmography measures all intrathoracic gas including trapped, non-communicating gas. Helium dilution measures only communicating gas. The difference estimates trapped volume."},
    {q:"The DLCO breath-hold should be:",
     a:["5 seconds","10 seconds, acceptable 8\u201312","15 seconds","As long as the patient can manage"],c:1,
     e:"10 seconds, timed by the Jones\u2013Meade method, with 8\u201312 seconds acceptable. Hold with a relaxed open glottis \u2014 no Valsalva, no M\u00FCller."},
    {q:"Two DLCO values are acceptable and repeatable when they agree within:",
     a:["2 mL\u00B7min\u207B\u00B9\u00B7mmHg\u207B\u00B9","5 mL\u00B7min\u207B\u00B9\u00B7mmHg\u207B\u00B9","10 % of the larger","0.150 L"],c:0,
     e:"2 mL\u00B7min\u207B\u00B9\u00B7mmHg\u207B\u00B9, equivalent to 0.67 mmol\u00B7min\u207B\u00B9\u00B7kPa\u207B\u00B9. Report the mean of the acceptable values, not the highest."},
    {q:"The minimum interval between DLCO manoeuvres is:",
     a:["1 minute","2 minutes","4 minutes","4 minutes, extended to about 10 in significant obstruction"],c:3,
     e:"At least 4 minutes so CO and tracer wash out, and up to 10 minutes in obstruction. A stepwise fall across successive manoeuvres is usually this fault."},
    {q:"Untreated anaemia will make the measured DLCO appear:",
     a:["Falsely high","Falsely low","Unchanged","Unpredictable"],c:1,
     e:"Less haemoglobin means less CO uptake, so DLCO reads low without any change in the lung. Adjust for haemoglobin and report both adjusted and unadjusted values."},
    {q:"Low DLCO with a normal V\u2090 and a low K\u1D04\u1D0F most suggests:",
     a:["Interstitial lung disease","A pulmonary vascular problem or anaemia","Extraparenchymal restriction","Alveolar haemorrhage"],c:1,
     e:"The lung is a normal size and gas distributes normally, but transfer per unit volume is impaired \u2014 pointing at the capillary bed or the haemoglobin in it."},
    {q:"Why must the patient support their cheeks during oscillometry?",
     a:["To keep the mouthpiece sealed","Because unsupported cheeks shunt the oscillations and falsely lower resistance","To prevent glottis closure","To standardise tidal volume"],c:1,
     e:"Compliant cheeks absorb the pressure oscillations, so resistance reads falsely low. Firm support with the patient's own hands is the single most important coaching point."},
    {q:"In a combined session, oscillometry should be performed:",
     a:["After post-bronchodilator spirometry","Before spirometry","Immediately after DLCO","At any point"],c:1,
     e:"Deep inspirations and forced manoeuvres alter airway tone. Order the session oscillometry, spirometry, lung volumes, DLCO, muscle pressures, then post-bronchodilator spirometry."},
    {q:"R5 minus R20 mainly reflects:",
     a:["Large airway resistance","Peripheral airway involvement and ventilation heterogeneity","Chest wall stiffness","Upper airway obstruction"],c:1,
     e:"Low-frequency oscillations reach the periphery, high-frequency ones do not. The difference is frequency dependence of resistance, a peripheral marker."},
    {q:"MIP is measured starting from:",
     a:["Total lung capacity","Functional residual capacity","Residual volume","Any comfortable volume"],c:2,
     e:"MIP from RV, MEP from TLC \u2014 each measured where the muscle is at its most advantageous length. Sustain the effort at least 1.5 s so a 1-second average can be taken."},
    {q:"A methacholine challenge is stopped at a fall in FEV\u2081 of:",
     a:["10 %","15 %","20 %","25 %"],c:2,
     e:"A 20 % fall defines PD\u2082\u2080 and is the end point. Never chase a larger fall. Give salbutamol 400 \u00B5g immediately afterwards."},
    {q:"A patient may be discharged after a methacholine challenge when FEV\u2081 has returned to:",
     a:["Within 10 % of baseline, and they are symptom-free","Within 20 % of baseline","Above 80 % predicted","Whatever they had after one bronchodilator dose"],c:0,
     e:"Within 10 % of baseline and symptom-free. If not, repeat the bronchodilator and involve the physician. Never leave the patient unattended in recovery."},
    {q:"The 6-minute walk test corridor must be:",
     a:["20 m","30 m, flat, straight and enclosed","50 m","Any length, as long as it is consistent"],c:1,
     e:"30 m. A shorter course adds turns, and every turn costs distance, so results from different course lengths are not comparable."},
    {q:"Two 6-minute walk tests are performed on the same day. You should report:",
     a:["The first test","The mean of the two","The better of the two, stating that two were performed","The second test only"],c:2,
     e:"There is a learning effect of up to about 17 m, so the first test underestimates capacity. Report the better distance and state that two tests were done."},
    {q:"During CPET, which value indicates that the patient gave a good maximal effort?",
     a:["Peak RER of 1.10 or more","Heart rate above 100 bpm","Breathing reserve above 30 %","Test duration over 15 minutes"],c:0,
     e:"A peak respiratory exchange ratio of 1.10 or above indicates the patient pushed into the anaerobic range. Below about 1.05 with no reserve exhausted anywhere suggests a submaximal effort."},
    {q:"After a hypoxic challenge, in-flight oxygen is recommended when PaO\u2082 falls below:",
     a:["8.0 kPa (60 mmHg)","7.4 kPa (55 mmHg)","6.6 kPa (50 mmHg)","5.3 kPa (40 mmHg)"],c:2,
     e:"Below 6.6 kPa (50 mmHg) in-flight oxygen is recommended, commonly 2 L\u00B7min\u207B\u00B9. Between 6.6 and 7.4 kPa the result is borderline and a walk test during exposure may help."},
    {q:"A flow\u2013volume loop with a flattened inspiratory limb and a normal expiratory limb suggests:",
     a:["Variable intrathoracic obstruction","Variable extrathoracic obstruction","Fixed obstruction","Emphysema"],c:1,
     e:"Extrathoracic airways are sucked closed during inspiration. Repeat it before reporting \u2014 a submaximal inspiration looks identical."},
    {q:"An air bubble left in an arterial blood gas syringe will typically:",
     a:["Have no effect if analysed quickly","Raise the PaO\u2082 towards 150 mmHg and lower the PaCO\u2082","Lower both PaO\u2082 and PaCO\u2082","Cause a clot"],c:1,
     e:"The sample equilibrates towards room air. Expel bubbles immediately, cap, and mix thoroughly before analysis."},
    {q:"The daily 3-L syringe volume check passes when the reading is:",
     a:["2.900\u20133.100 L","2.925\u20133.075 L","2.970\u20133.030 L","Exactly 3.000 L"],c:1,
     e:"\u00B13 % of 3.000 L, with 0.5 % allowed for syringe error, gives a window of 2.925\u20133.075 L. Verify at three different flow rates."}
  ];

  var body = document.getElementById('quizbody');
  var scoreEl = document.getElementById('score');
  var endEl = document.getElementById('quizend');
  var answered = 0, correct = 0;

  function updateScore(){
    scoreEl.textContent = 'Answered ' + answered + ' of ' + Q.length + ' \u00B7 ' + correct + ' correct';
    if(answered === Q.length){
      var pct = Math.round(correct / Q.length * 100);
      endEl.textContent = 'Finished \u2014 ' + correct + ' of ' + Q.length + ' (' + pct + ' %). ' +
        (pct >= 90 ? 'Ready for a competency review.' :
         pct >= 75 ? 'Solid. Revisit the sections behind the ones you missed.' :
         'Work back through the sections behind the questions you missed, then try again.');
    } else { endEl.textContent = ''; }
  }

  function buildQuiz(){
    body.innerHTML = '';
    answered = 0; correct = 0;
    Q.forEach(function(item, i){
      var card = document.createElement('div');
      card.className = 'qcard';
      var n = document.createElement('div');
      n.className = 'qn';
      n.textContent = 'Question ' + (i+1) + ' of ' + Q.length;
      var t = document.createElement('div');
      t.className = 'qt';
      t.textContent = item.q;
      card.appendChild(n); card.appendChild(t);

      var expl = document.createElement('div');
      expl.className = 'expl';
      expl.textContent = item.e;

      item.a.forEach(function(opt, j){
        var b = document.createElement('button');
        b.className = 'opt';
        b.type = 'button';
        b.textContent = opt;
        b.addEventListener('click', function(){
          if(card.dataset.done) return;
          card.dataset.done = '1';
          answered++;
          var all = card.querySelectorAll('.opt');
          all.forEach(function(x){ x.disabled = true; });
          all[item.c].classList.add('right');
          if(j === item.c){ correct++; }
          else { b.classList.add('wrong'); }
          expl.classList.add('show');
          updateScore();
        });
        card.appendChild(b);
      });
      card.appendChild(expl);
      body.appendChild(card);
    });
    updateScore();
  }

  document.getElementById('resetQuiz').addEventListener('click', function(){
    buildQuiz();
    document.getElementById('quiz').scrollIntoView({block:'start'});
  });
  buildQuiz();

  /* ---------- print: expand collapsibles, show every page ---------- */
  window.addEventListener('beforeprint', function(){
    document.querySelectorAll('details').forEach(function(d){ d.dataset.wasOpen = d.open ? '1' : ''; d.open = true; });
  });
  window.addEventListener('afterprint', function(){
    document.querySelectorAll('details').forEach(function(d){ d.open = d.dataset.wasOpen === '1'; });
  });

})();
