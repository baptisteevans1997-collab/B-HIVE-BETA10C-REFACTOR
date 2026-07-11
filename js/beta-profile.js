/* B HIVE BETA — Profile check-in MODULE (beta-only).
   Self-contained: reads window.BHIVE_BETA_PROFILE + the DOM + its own localStorage.
   Does NOT touch app internals (cells/learnings/save), app STORE, Supabase, the
   receiver, or production. Writes only bhive_beta_profile_* keys. The Finish Beta
   telemetry module reads bhive_beta_profile_result to optionally include it. */
(function () {
  try {
    var P = window.BHIVE_BETA_PROFILE;
    if (!P || !P.questions) return;

    var K = { answers: 'bhive_beta_profile_answers', result: 'bhive_beta_profile_result' };
    var storageAvailable = true;
    function lget(k){ try { return localStorage.getItem(k); } catch(e){ storageAvailable = false; return null; } }
    function lset(k,v){ try { localStorage.setItem(k, v); return true; } catch(e){ storageAvailable = false; return false; } }
    function readAnswers(){ try { return JSON.parse(lget(K.answers) || '{}') || {}; } catch(e){ return {}; } }
    function saveAnswers(a){ lset(K.answers, JSON.stringify(a)); }
    function readResult(){
      try {
        var result = JSON.parse(lget(K.result) || 'null');
        return result && typeof result === 'object' ? result : null;
      } catch(e) { return null; }
    }

    var byId = {}, followUpParent = {};
    P.questions.forEach(function(q){
      byId[q.id] = q;
      if (q.followUp) followUpParent[q.followUp.questionId] = q;
    });
    function activeQuestion(q, answers){
      if (!q.conditional) return true;
      var parent = followUpParent[q.id];
      return !!(parent && parent.followUp.showIfOptionIn.indexOf(answers[parent.id]) >= 0);
    }

    /* ---------------- PURE SCORING (present-based, deterministic, no ML) ----------------
       Each question probes a different facet, so a signal is "present" when the tester
       chose the option carrying it (weight >= 2). Interpretations fire on COMBINATIONS of
       present signals; reinforcement across questions raises confidence. */
    function period(s){ return /[.!?]$/.test(s) ? s : s + '.'; }

    function score(answers) {
      var tally = {};
      P.questions.forEach(function(q){
        if (!activeQuestion(q, answers)) return;
        var pick = answers[q.id];
        if (!pick || pick === '__skip__') return;
        var opt = null; q.options.forEach(function(o){ if (o.id === pick) opt = o; });
        if (!opt) return;
        for (var s in opt.signals) tally[s] = (tally[s] || 0) + opt.signals[s];
      });
      var load = null, mx = 0;
      (P.load || []).forEach(function(s){ if ((tally[s]||0) > mx) { mx = tally[s]; load = s; } });
      return { tally: tally, load: load };
    }
    function present(t, s){ return (t[s] || 0) >= 2; }
    function strongestIn(t, dim){
      var order = P.priority[dim] || [], strongest = null, strongestTally = 1;
      for (var i=0;i<order.length;i++) {
        var tally = t[order[i]] || 0;
        if (tally > strongestTally) { strongest = order[i]; strongestTally = tally; }
      }
      return strongest;
    }
    function condMet(t, cond){ var sigs = cond.split(':')[1].split('|'); return sigs.some(function(s){ return present(t, s); }); }
    function condStr(t, cond){ var sigs = cond.split(':')[1].split('|'); return Math.max.apply(null, sigs.map(function(s){ return t[s]||0; })); }

    function interpret(scored) {
      var t = scored.tally;
      var q = (P.interpretations || []).map(function(e){
        var ok = e.all.every(function(c){ return condMet(t, c); });
        if (ok && e.load && scored.load !== e.load) ok = false;
        var conf = ok ? e.all.reduce(function(sum,c){ return sum + condStr(t, c); }, 0) : 0;
        return { e: e, ok: ok, conf: conf };
      }).filter(function(x){ return x.ok; }).sort(function(a,b){ return b.conf - a.conf; });

      var reads = [], experiment = null;
      if (q.length) {
        reads.push(period(P.hedges.clear + ' ' + q[0].e.read));
        experiment = q[0].e.experiment;
        if (q[1]) reads.push(period(P.hedges.clear + ' ' + q[1].e.read));
      } else {
        var ph = P.signalPhrase || {};
        var strong = Object.keys(t).filter(function(s){ return present(t, s) && ph[s]; })
                           .sort(function(a,b){ return t[b] - t[a]; });
        if (strong.length) {
          reads.push(period(P.hedges.clear + ' ' + ph[strong[0]]));
          if (strong[1]) reads.push(period(P.hedges.clear + ' ' + ph[strong[1]]));
        } else reads.push(P.hedges.mixed + ' yet — a few more answers would sharpen it.');
      }

      var momSig = strongestIn(t, 'momentum');                 // one next move, shaped by momentum
      var move = (momSig && P.nextMove[momSig]) ? P.nextMove[momSig] : P.nextMove._default;
      return { reads: reads, experiment: experiment, nextMove: move, signalRead: reads[0] };
    }

    /* ---------------- build the send-shape result + store it ---------------- */
    function answerOutput(answers) {
      var out = [];
      P.questions.forEach(function(q){
        if (!activeQuestion(q, answers)) return;
        var pick = answers[q.id];
        if (pick === undefined) return;                 // never shown / not reached
        if (pick === '__skip__') { out.push({ qid: q.id, optionId: '', optionText: '', status: 'skipped' }); return; }
        var opt = null; q.options.forEach(function(o){ if (o.id === pick) opt = o; });
        if (opt) out.push({ qid: q.id, optionId: opt.id, optionText: opt.label, status: 'answered' });
      });
      return out;
    }
    function buildResult(answers, status) {
      var scored = score(answers);
      var interp = interpret(scored);
      var out = answerOutput(answers);
      var result = { status: status, signalRead: interp.signalRead, answers: out };   // EXACT payload shape (no scores/labels)
      lset(K.result, JSON.stringify(result));
      return { result: result, interp: interp };
    }

    /* ---------------- UI ---------------- */
    function el(tag, attrs, html){ var e=document.createElement(tag); if(attrs) for(var k in attrs) e.setAttribute(k, attrs[k]); if(html!=null) e.innerHTML=html; return e; }

    function injectStyle(){
      /* beta10c: styles moved to css/beta-overlays.css */
    }

    // ordered list of question ids to walk, expanding the conditional follow-up
    function sequence(answers){
      var seq = [];
      P.questions.forEach(function(q){
        if (q.conditional) return;                       // inserted only via its parent's followUp
        seq.push(q.id);
        if (q.followUp) {
          var pick = answers[q.id];
          if (pick && q.followUp.showIfOptionIn.indexOf(pick) >= 0) seq.push(q.followUp.questionId);
        }
      });
      return seq;
    }

    function done(){ var result = readResult(); return result ? result.status : null; }

    function mountCard(){
      injectStyle();
      var host = document.getElementById('energy'); if (!host) return;
      if (document.getElementById('bhpr-card')) return;
      var card = el('div', { 'class':'bhpr-card', id:'bhpr-card' });
      render();
      function render(){
        var st = done();
        card.innerHTML = '';
        card.appendChild(el('div', { 'class':'bhpr-k' }, '&#129504; Beta feature'));
        card.appendChild(el('h4', null, 'Quick profile check-in'));
        card.appendChild(el('p', null, st === 'completed'
          ? 'You’ve done the check-in. Reopen it to see your read again or change answers.'
          : '14 quick questions, plus one follow-up when relevant, on how you actually operate — energy, momentum, pressure, motivation, support. About 5 minutes. Every answer is a legitimate way to work; there’s no score and no personality label.'));
        var b = el('button', { 'class':'bhpr-go', type:'button' }, st === 'completed' ? 'View your check-in' : (Object.keys(readAnswers()).length ? 'Resume check-in' : 'Start check-in'));
        b.addEventListener('click', function(){ st === 'completed' ? openResult(render) : openFlow(render); });
        card.appendChild(b);
      }
      // mount high on the Hive Mind screen (under the intro) for discoverability
      var anchor = document.getElementById('hive-today') || document.getElementById('hive-quiz');
      if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(card, anchor); else host.appendChild(card);
    }

    // Let a tester escape a modal opened by mistake: click the dark backdrop or
    // press Escape. Answers are saved as they go when browser storage is available.
    function dismissable(ov, onClose){
      var returnFocus = document.activeElement, closed = false;
      function close(){
        if (closed) return;
        closed = true;
        if (ov.parentNode) ov.parentNode.removeChild(ov);
        document.removeEventListener('keydown', onKey);
        if (onClose) onClose();
        var target = returnFocus && document.documentElement.contains(returnFocus)
          ? returnFocus : document.querySelector('#bhpr-card .bhpr-go');
        if (target && target.focus) target.focus();
      }
      function onKey(e){
        if (!ov.parentNode) { document.removeEventListener('keydown', onKey); return; }  // closed another way
        if (e.key === 'Escape' || e.keyCode === 27) { close(); return; }
        if (e.key !== 'Tab') return;
        var dialog = ov.querySelector('[role="dialog"]');
        var focusable = ov.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
        if (!focusable.length) { e.preventDefault(); if (dialog) dialog.focus(); return; }
        var first = focusable[0], last = focusable[focusable.length - 1], active = document.activeElement;
        if (e.shiftKey && (active === first || active === dialog || !ov.contains(active))) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && (active === last || active === dialog || !ov.contains(active))) {
          e.preventDefault(); first.focus();
        }
      }
      ov.addEventListener('click', function(e){ if (e.target === ov) close(); });
      document.addEventListener('keydown', onKey);
      return close;
    }

    function openFlow(onClose){
      injectStyle();
      var answers = readAnswers();
      var ov = el('div', { 'class':'bhpr-ov', id:'bhpr-flow' });
      var modal = el('div', { 'class':'bhpr-modal', role:'dialog', 'aria-modal':'true', 'aria-label':'Profile check-in', tabindex:'-1' });
      ov.appendChild(modal); document.body.appendChild(ov);
      var closeDialog = dismissable(ov, onClose);
      var pos = 0;

      function step(){
        var seq = sequence(answers);
        if (pos >= seq.length) return finish();
        var q = byId[seq[pos]];
        modal.innerHTML = '';
        modal.setAttribute('aria-label', 'Profile check-in, question ' + (pos + 1) + ' of ' + seq.length + ': ' + q.prompt);
        var prog = el('div', { 'class':'bhpr-prog' });
        prog.appendChild(el('span', null, 'Question ' + (pos + 1) + ' of ' + seq.length));
        prog.appendChild(el('span', null, q.dimension.charAt(0).toUpperCase() + q.dimension.slice(1)));
        modal.appendChild(prog);
        modal.appendChild(el('div', { 'class':'bhpr-q' }, q.prompt));
        var chosen = answers[q.id];
        q.options.forEach(function(o){
          var btn = el('button', { 'class':'bhpr-opt' + (chosen === o.id ? ' sel' : ''), type:'button' }, o.label);
          btn.addEventListener('click', function(){
            answers[q.id] = o.id;
            if (q.followUp && q.followUp.showIfOptionIn.indexOf(o.id) < 0) delete answers[q.followUp.questionId];
            saveAnswers(answers);
            Array.prototype.forEach.call(modal.querySelectorAll('.bhpr-opt'), function(x){ x.classList.remove('sel'); });
            btn.classList.add('sel');
            nextBtn.removeAttribute('disabled');
          });
          modal.appendChild(btn);
        });
        var row = el('div', { 'class':'bhpr-row' });
        if (q.skippable) {
          var skip = el('button', { 'class':'bhpr-skip', type:'button' }, 'Skip this one');
          skip.addEventListener('click', function(){ answers[q.id] = '__skip__'; saveAnswers(answers); pos++; step(); });
          row.appendChild(skip);
        }
        var nextBtn = el('button', { 'class':'bhpr-next', type:'button' }, pos === seq.length - 1 ? 'See my read' : 'Next');
        if (!answers[q.id] || answers[q.id] === '__skip__') nextBtn.setAttribute('disabled', 'disabled');
        nextBtn.addEventListener('click', function(){ pos++; step(); });
        row.appendChild(nextBtn);
        modal.appendChild(row);
        modal.focus();
      }

      function finish(){
        // status: completed if every non-skippable core question answered; else partial
        var complete = true;
        P.questions.forEach(function(q){
          if (q.conditional || q.skippable) return;
          if (!answers[q.id] || answers[q.id] === '__skip__') complete = false;
        });
        showResult(modal, closeDialog, answers, complete ? 'completed' : 'partial', function(){ pos = 0; step(); });
      }
      step();
    }

    function openResult(onClose){
      injectStyle();
      var ov = el('div', { 'class':'bhpr-ov', id:'bhpr-flow' });
      var modal = el('div', { 'class':'bhpr-modal', role:'dialog', 'aria-modal':'true', 'aria-label':'Profile check-in results', tabindex:'-1' });
      ov.appendChild(modal); document.body.appendChild(ov);
      var closeDialog = dismissable(ov, onClose);
      var saved = readResult();
      showResult(modal, closeDialog, readAnswers(), saved && saved.status ? saved.status : 'completed', function(){
        closeDialog();
        openFlow(onClose);
      });
    }

    function showResult(modal, closeDialog, answers, status, onEdit){
      var built = buildResult(answers, status);
      var interp = built.interp;
      modal.innerHTML = '';
      modal.setAttribute('aria-label', 'Profile check-in results');
      modal.appendChild(el('div', { 'class':'bhpr-prog' }, '<span>Your signal read</span><span>Beta</span>'));
      interp.reads.forEach(function(r){ modal.appendChild(el('p', { 'class':'bhpr-read' }, r)); });
      var move = el('div', { 'class':'bhpr-move' });
      move.appendChild(el('div', { 'class':'bhpr-k' }, 'One next move to try'));
      move.appendChild(el('div', null, interp.nextMove));
      modal.appendChild(move);
      if (interp.experiment) modal.appendChild(el('p', { 'class':'bhpr-read' }, P.hedges.experiment + ' ' + interp.experiment));
      var storageNote = storageAvailable
        ? 'Your choices and this read are saved on this device; they’re only included with your beta feedback if you tap Finish Beta.'
        : 'Browser storage is unavailable, so your choices and this read have not been saved on this device or attached to beta feedback.';
      modal.appendChild(el('p', { 'class':'bhpr-fine' }, 'This is a read of your answers, not a verdict — it may be off, and it’s meant to be tested, not believed. ' + storageNote));
      var row = el('div', { 'class':'bhpr-row' });
      var edit = el('button', { 'class':'bhpr-skip', type:'button' }, 'Change answers');
      edit.addEventListener('click', onEdit);
      row.appendChild(edit);
      var close = el('button', { 'class':'bhpr-next', type:'button' }, 'Done');
      close.addEventListener('click', closeDialog);
      row.appendChild(close);
      modal.appendChild(row);
      modal.focus();
    }

    // expose pure scoring helpers for offline testing only (no data, no side effects)
    window.BHIVE_BETA_PROFILE._score = score;
    window.BHIVE_BETA_PROFILE._interpret = function(a){ return interpret(score(a)); };
    window.BHIVE_BETA_PROFILE._strongestIn = strongestIn;
    window.BHIVE_BETA_PROFILE._answerOutput = answerOutput;

    if (document.getElementById('energy')) mountCard();
    else document.addEventListener('DOMContentLoaded', mountCard);
  } catch (e) { /* never break the beta app */ }
})();
