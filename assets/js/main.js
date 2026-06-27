// Alams Travel — site interactions

(function(){
  var dests = ['NOTTINGHAM','BIRMINGHAM','LONDON','MANCHESTER AIRPORT','LONDON HEATHROW'];
  var di = 0;
  var wordEl = document.getElementById('destWord');
  var pinEl = document.getElementById('pinDestName');
  function titleCase(s){ return s.toLowerCase().replace(/\b\w/g, function(c){ return c.toUpperCase(); }); }
  setInterval(function(){
    wordEl.style.opacity = 0;
    setTimeout(function(){
      di = (di + 1) % dests.length;
      wordEl.textContent = dests[di];
      wordEl.classList.toggle('long', dests[di].length > 11);
      pinEl.textContent = titleCase(dests[di]);
      wordEl.style.opacity = 1;
    }, 260);
  }, 2600);
})();

(function(){
  var rates = { mpv: { per: 2.20, min: 75, cap: 8 }, mini: { per: 3.20, min: 120, cap: 16 } };
  var names = { mpv: '7–8 Seater MPV', mini: '16 Seater Minibus' };
  var airportPrices = {
    'airport-manchester': { mpv: 150, mini: 240, label: 'Manchester Airport' },
    'airport-birmingham': { mpv: 110, mini: 150, label: 'Birmingham Airport' },
    'airport-heathrow':   { mpv: 250, mini: 350, label: 'London Heathrow' },
    'airport-gatwick':    { mpv: 270, mini: 410, label: 'Gatwick Airport' },
    'airport-luton':      { mpv: 175, mini: 270, label: 'Luton Airport' }
  };

  var destSel = document.getElementById('dest');
  var milesField = document.getElementById('miles-field');
  var milesInput = document.getElementById('miles');
  var dateInput = document.getElementById('date');
  var paxInput = document.getElementById('pax');
  var priceOut = document.getElementById('price');
  var breakdownOut = document.getElementById('breakdown');
  var warnOut = document.getElementById('warn');
  var vcardMpv = document.getElementById('vcard-mpv');
  var vcardMini = document.getElementById('vcard-mini');
  var priceOutWrap = document.getElementById('price-out-wrap');
  var airportPriceWrap = document.getElementById('airport-price-wrap');
  var airportPriceEl = document.getElementById('airport-price');
  var airportBreakdownEl = document.getElementById('airport-breakdown');

  function getVehicle(){ return document.querySelector('input[name="vehicle"]:checked').value; }
  function getTripMult(){ return parseFloat(document.querySelector('input[name="trip"]:checked').value); }
  function isAirport(){ return destSel.value.indexOf('airport-') === 0; }
  function getMiles(){
    if(isAirport()) return 0;
    return destSel.value === 'other' ? (parseFloat(milesInput.value) || 0) : parseFloat(destSel.value);
  }
  function destLabel(){
    if(isAirport()) return airportPrices[destSel.value].label;
    return destSel.value === 'other' ? 'Custom destination' : destSel.options[destSel.selectedIndex].text;
  }

  function recalc(){
    var v = getVehicle();
    if(isAirport()){
      var ap = airportPrices[destSel.value];
      priceOutWrap.style.display = 'none';
      airportPriceWrap.style.display = 'block';
      airportPriceEl.textContent = ap[v];
      airportBreakdownEl.textContent = 'Derby → ' + ap.label + ' · ' + names[v];
      warnOut.style.display = 'none';
      return;
    }
    priceOutWrap.style.display = '';
    airportPriceWrap.style.display = 'none';
    var r = rates[v];
    var miles = getMiles();
    var mult = getTripMult();
    var raw = Math.max(r.min, r.per * miles) * mult;
    var price = Math.round(raw / 5) * 5;
    priceOut.textContent = price;
    var tripLabel = mult > 1 ? 'Return' : 'One way';
    breakdownOut.textContent = 'Derby → ' + destLabel() + ' · ' + tripLabel + ' · ' + names[v];
    var pax = parseInt(paxInput.value, 10) || 0;
    if (pax > r.cap) {
      warnOut.style.display = 'block';
      warnOut.textContent = 'Selected vehicle seats up to ' + r.cap + '. For ' + pax + ' passengers, switch vehicle or call us for a multi-vehicle quote.';
    } else {
      warnOut.style.display = 'none';
    }
  }

  destSel.addEventListener('change', function(){
    milesField.style.display = (destSel.value === 'other') ? 'flex' : 'none';
    recalc();
  });
  [milesInput, paxInput].forEach(function(el){ el.addEventListener('input', recalc); });
  document.querySelectorAll('input[name="trip"]').forEach(function(el){ el.addEventListener('change', recalc); });
  document.querySelectorAll('input[name="vehicle"]').forEach(function(el){
    el.addEventListener('change', function(){
      vcardMpv.classList.toggle('active', getVehicle() === 'mpv');
      vcardMini.classList.toggle('active', getVehicle() === 'mini');
      recalc();
    });
  });

  var todayStr = new Date().toISOString().split('T')[0];
  dateInput.min = todayStr;
  // Hero widget's date field shares the same "no past dates" rule.
  var heroDateInput = document.getElementById('hero-date');
  if (heroDateInput) heroDateInput.min = todayStr;

  // ─── CONFIGURATION ──────────────────────────────────────────────────────────
  // EmailJS — sign up free at https://www.emailjs.com/
  // Then create two email templates and paste your IDs below.
  var EMAILJS_PUBLIC_KEY   = 'YOUR_EMAILJS_PUBLIC_KEY';   // Account → API Keys
  var EMAILJS_SERVICE_ID   = 'YOUR_SERVICE_ID';            // Email Services tab
  var EMAILJS_TEMPLATE_BIZ = 'YOUR_BIZ_TEMPLATE_ID';      // Template that emails YOU (Alams Travel)
  var EMAILJS_TEMPLATE_CUST= 'YOUR_CUSTOMER_TEMPLATE_ID'; // Template that emails the CUSTOMER

  // WhatsApp Business Cloud API — set up at https://developers.facebook.com/docs/whatsapp/cloud-api
  // You need a Meta Business account, a verified WhatsApp Business number, and a permanent token.
  var WA_PHONE_NUMBER_ID   = 'YOUR_PHONE_NUMBER_ID';       // From Meta Developer Console
  var WA_ACCESS_TOKEN      = 'YOUR_PERMANENT_ACCESS_TOKEN';// System user token (never expires)
  var WA_TO_NUMBER         = '447777399135';               // Your (Alams Travel) WhatsApp number
  // ────────────────────────────────────────────────────────────────────────────

  // Initialise EmailJS once
  if (window.emailjs) emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

  var submitBtn = document.getElementById('submitBtn');
  var submitError = document.getElementById('submitError');
  var termsRow = document.getElementById('terms-row');
  var submitDefaultLabel = submitBtn.innerHTML;

  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  // UK mobile: 07xxxxxxxxx, or +447xxxxxxxxx / 00447... — ignore spaces
  var phoneRe = /^(?:\+?44|0)7\d{9}$/;

  // Map each field to its validator + error element
  var fields = [
    { el: document.getElementById('name-field'),   err: 'err-name',   test: function(v){ return v.length >= 2; } },
    { el: document.getElementById('mobile-field'), err: 'err-mobile', test: function(v){ return phoneRe.test(v.replace(/[\s()-]/g, '')); } },
    { el: document.getElementById('email-field'),  err: 'err-email',  test: function(v){ return emailRe.test(v); } },
    { el: document.getElementById('pickup-field'), err: 'err-pickup', test: function(v){ return v.length >= 3; } }
  ];

  function setFieldError(f, show){
    f.el.classList.toggle('invalid', show);
    f.el.setAttribute('aria-invalid', show ? 'true' : 'false');
    f.el.closest('label').classList.toggle('has-error', show);
  }

  // Clear a field's error as soon as the user corrects it
  fields.forEach(function(f){
    f.el.addEventListener('input', function(){
      if (f.test(f.el.value.trim())) setFieldError(f, false);
    });
  });
  document.getElementById('terms').addEventListener('change', function(){
    if (this.checked) termsRow.classList.remove('has-error');
  });

  function validateForm(){
    var firstInvalid = null;
    fields.forEach(function(f){
      var ok = f.test(f.el.value.trim());
      setFieldError(f, !ok);
      if (!ok && !firstInvalid) firstInvalid = f.el;
    });
    var termsOk = document.getElementById('terms').checked;
    termsRow.classList.toggle('has-error', !termsOk);
    if (!termsOk && !firstInvalid) firstInvalid = document.getElementById('terms');
    return firstInvalid;
  }

  function showSubmitError(msg){
    submitError.innerHTML = msg;
    submitError.classList.add('show');
  }
  function clearSubmitError(){
    submitError.classList.remove('show');
  }
  function setSending(on){
    submitBtn.disabled = on;
    submitBtn.innerHTML = on ? 'Sending…' : submitDefaultLabel;
  }

  submitBtn.addEventListener('click', function(){
    clearSubmitError();
    var firstInvalid = validateForm();
    if (firstInvalid) {
      firstInvalid.focus();
      if (firstInvalid.scrollIntoView) firstInvalid.scrollIntoView({ behavior:'smooth', block:'center' });
      return;
    }

    var v = getVehicle();
    var tripLabel = getTripMult() > 1 ? 'Return' : 'One way';
    var name      = document.getElementById('name-field').value.trim();
    var firstName = name.split(' ')[0];
    var mobile    = document.getElementById('mobile-field').value.trim();
    var email     = document.getElementById('email-field').value.trim();
    var pickup    = document.getElementById('pickup-field').value.trim();
    var notes     = document.getElementById('notes-field').value.trim();
    var dateVal   = dateInput.value;
    var priceEst  = '£' + priceOut.textContent;

    // Shared template variables used by both EmailJS templates
    var templateParams = {
      customer_name    : name,
      customer_first   : firstName,
      customer_email   : email,
      customer_mobile  : mobile,
      vehicle          : names[v],
      route            : 'Derby → ' + destLabel(),
      trip_type        : tripLabel,
      travel_date      : dateVal || 'Not specified',
      passengers       : paxInput.value || 'Not specified',
      estimate         : priceEst,
      pickup           : pickup,
      notes            : notes || 'None',
      reply_to         : email
    };

    var confirmDetails = {
      firstName : firstName,
      vehicle   : names[v],
      route     : 'Derby → ' + destLabel(),
      tripType  : tripLabel,
      date      : dateVal,
      passengers: paxInput.value,
      estimate  : priceEst
    };

    // WhatsApp notification text (sent server-side in production — see note in config)
    var waMessage = [
      '🚐 *New Booking Request — Alams Travel*',
      '',
      '👤 *Name:* ' + name,
      '📱 *Mobile:* ' + mobile,
      '📧 *Email:* ' + email,
      '',
      '🗺️ *Route:* Derby → ' + destLabel(),
      '🚌 *Vehicle:* ' + names[v],
      '🔄 *Trip:* ' + tripLabel,
      '📅 *Date:* ' + (dateVal || 'Not specified'),
      '👥 *Passengers:* ' + (paxInput.value || 'Not specified'),
      '💷 *Estimate:* ' + priceEst,
      '📍 *Pickup:* ' + pickup,
      (notes ? '📝 *Notes:* ' + notes : '')
    ].filter(Boolean).join('\n');

    function sendWhatsApp(){
      return fetch('https://graph.facebook.com/v19.0/' + WA_PHONE_NUMBER_ID + '/messages', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + WA_ACCESS_TOKEN, 'Content-Type': 'application/json' },
        body: JSON.stringify({ messaging_product:'whatsapp', to:WA_TO_NUMBER, type:'text', text:{ body:waMessage } })
      });
    }

    // Is the booking pipeline actually configured, or still on placeholder keys?
    var emailReady = window.emailjs && EMAILJS_PUBLIC_KEY.indexOf('YOUR_') !== 0;
    var waReady    = WA_ACCESS_TOKEN.indexOf('YOUR_') !== 0;

    setSending(true);

    // Demo/preview mode: nothing is wired up yet — show the confirmation so the
    // page can be previewed, but don't pretend a real request was delivered.
    if (!emailReady && !waReady) {
      setSending(false);
      showConfirmPopup(confirmDetails);
      return;
    }

    // The business notification is the source of truth: only confirm to the
    // customer once it has actually been accepted.
    var primarySend = emailReady
      ? emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_BIZ, templateParams)
      : sendWhatsApp();

    primarySend.then(function(){
      // Fire the secondary, non-critical notifications (best effort)
      if (emailReady) {
        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_CUST, templateParams)
          .catch(function(err){ console.warn('Customer email failed:', err); });
        if (waReady) sendWhatsApp().catch(function(err){ console.warn('WhatsApp failed:', err); });
      }
      setSending(false);
      showConfirmPopup(confirmDetails);
    }).catch(function(err){
      console.warn('Booking request failed:', err);
      setSending(false);
      showSubmitError('Sorry — we couldn\'t send your request just now. Please call or WhatsApp us on <b>07777 399135</b> and we\'ll sort it straight away.');
    });
  });

  // ── Popup renderer ───────────────────────────────────────────────────────────
  function showConfirmPopup(d){
    document.getElementById('aqName').textContent = d.firstName;

    var dateDisplay = d.date
      ? new Date(d.date).toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
      : 'TBC';

    var rows = [
      { label:'Route',      val: d.route },
      { label:'Vehicle',    val: d.vehicle },
      { label:'Trip',       val: d.tripType },
      { label:'Date',       val: dateDisplay },
      { label:'Passengers', val: d.passengers },
      { label:'Estimate',   val: d.estimate, cls:'price' }
    ];
    document.getElementById('aqSummary').innerHTML = rows.map(function(r){
      return '<div class="aq-row"><span class="aq-label">' + r.label + '</span>'
           + '<span class="aq-val' + (r.cls ? ' ' + r.cls : '') + '">' + r.val + '</span></div>';
    }).join('');

    var overlay = document.getElementById('aqOverlay');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';

    document.getElementById('aqClose').onclick = closePopup;
    overlay.addEventListener('click', function(e){ if (e.target === overlay) closePopup(); });
  }

  function closePopup(){
    document.getElementById('aqOverlay').classList.remove('open');
    document.body.style.overflow = '';
  }

  recalc();

  function destToMiles(text){
    if (text.indexOf('Nottingham') === 0)      return '16';
    if (text.indexOf('Birmingham Airport') === 0) return 'airport-birmingham';
    if (text.indexOf('Birmingham') === 0)      return '40';
    if (text.indexOf('London Heathrow') === 0) return 'airport-heathrow';
    if (text.indexOf('London') === 0)          return '125';
    if (text.indexOf('Manchester Airport') === 0) return 'airport-manchester';
    if (text.indexOf('Gatwick') === 0)         return 'airport-gatwick';
    if (text.indexOf('Luton') === 0)           return 'airport-luton';
    return 'other';
  }
  function vehicleToKey(text){ return text.indexOf('16') === 0 ? 'mini' : 'mpv'; }

  document.getElementById('hero-submit').addEventListener('click', function(){
    var hDest = document.getElementById('hero-dest').value;
    var hVehicle = document.getElementById('hero-vehicle').value;
    var hDate = document.getElementById('hero-date').value;
    var hSeats = document.getElementById('hero-seats').value;
    var hTrip = document.querySelector('input[name="hero-trip"]:checked').value;
    var hMobile = document.getElementById('hero-mobile').value;

    var milesVal = destToMiles(hDest);
    destSel.value = milesVal;
    milesField.style.display = milesVal === 'other' ? 'flex' : 'none';

    var vKey = vehicleToKey(hVehicle);
    var vInput = document.querySelector('input[name="vehicle"][value="' + vKey + '"]');
    if (vInput) vInput.checked = true;
    vcardMpv.classList.toggle('active', vKey === 'mpv');
    vcardMini.classList.toggle('active', vKey === 'mini');

    var tripInput = document.querySelector('input[name="trip"][value="' + (hTrip === 'return' ? '1.8' : '1') + '"]');
    if (tripInput) tripInput.checked = true;

    if (hDate) dateInput.value = hDate;
    if (hSeats) paxInput.value = hSeats;

    recalc();

    var mobileField = document.getElementById('mobile-field');
    if (hMobile && mobileField) mobileField.value = hMobile;

    var pricingSection = document.getElementById('pricing-section');
    if (pricingSection) pricingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    priceOutWrap.classList.add('pulse');
    setTimeout(function(){ priceOutWrap.classList.remove('pulse'); }, 1300);
  });
})();

(function(){
  var t=document.getElementById('navToggle'), l=document.getElementById('navLinks');
  if(t&&l){
    t.addEventListener('click',function(){t.classList.toggle('open');l.classList.toggle('open');});
    l.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){t.classList.remove('open');l.classList.remove('open');});});
  }
})();

// ── Booking type tabs ────────────────────────────────────────────────────────
(function(){
  var tabs = document.querySelectorAll('.btab');
  var panels = document.querySelectorAll('.tab-panel');
  tabs.forEach(function(btn){
    btn.addEventListener('click', function(){
      tabs.forEach(function(b){ b.classList.remove('active'); b.setAttribute('aria-selected','false'); });
      panels.forEach(function(p){ p.style.display = 'none'; });
      btn.classList.add('active');
      btn.setAttribute('aria-selected','true');
      var panel = document.getElementById('tab-' + btn.dataset.tab);
      if(panel) panel.style.display = '';
    });
  });
})();

// ── Callback popup (Wedding / Corporate) ────────────────────────────────────
(function(){
  function showCallbackPopup(name, place, date, type){
    var firstName = name.split(' ')[0];
    document.getElementById('aqName').textContent = firstName;
    document.querySelector('#aqOverlay .aq-sub').textContent = 'Your enquiry has been received. Here\'s what happens next:';
    var dateDisplay = date
      ? new Date(date).toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
      : '';
    document.getElementById('aqSummary').innerHTML =
      '<div class="aq-row"><span class="aq-label">Type</span><span class="aq-val">' + type + ' Booking</span></div>' +
      '<div class="aq-row"><span class="aq-label">Venue</span><span class="aq-val">' + place + '</span></div>' +
      (dateDisplay ? '<div class="aq-row"><span class="aq-label">Date</span><span class="aq-val">' + dateDisplay + '</span></div>' : '');
    document.querySelector('#aqOverlay .aq-next').innerHTML =
      '<div class="aq-next-item"><span class="aq-num">1</span><span>One of our team will <b>call you shortly</b> to discuss your requirements in detail</span></div>' +
      '<div class="aq-next-item"><span class="aq-num">2</span><span>We\'ll put together a <b>tailored quote</b> just for your ' + type.toLowerCase() + ' — no automated prices, a real conversation</span></div>' +
      '<div class="aq-next-item"><span class="aq-num">3</span><span>Once you\'re happy, we lock in your booking — <b>no payment needed until the day</b></span></div>';
    var overlay = document.getElementById('aqOverlay');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    document.getElementById('aqClose').onclick = function(){ overlay.classList.remove('open'); document.body.style.overflow = ''; };
    overlay.onclick = function(e){ if(e.target === overlay){ overlay.classList.remove('open'); document.body.style.overflow = ''; } };
  }

  var wBtn = document.getElementById('weddingSubmitBtn');
  if(wBtn) wBtn.addEventListener('click', function(){
    var name  = document.getElementById('wedding-name').value.trim();
    var phone = document.getElementById('wedding-phone').value.trim();
    var place = document.getElementById('wedding-place').value.trim();
    var date  = document.getElementById('wedding-date').value;
    if(!name || !phone || !place){ alert('Please fill in your name, phone number and venue before submitting.'); return; }
    showCallbackPopup(name, place, date, 'Wedding');
  });

  var cBtn = document.getElementById('corpSubmitBtn');
  if(cBtn) cBtn.addEventListener('click', function(){
    var name  = document.getElementById('corp-name').value.trim();
    var phone = document.getElementById('corp-phone').value.trim();
    var place = document.getElementById('corp-place').value.trim();
    var date  = document.getElementById('corp-date').value;
    if(!name || !phone || !place){ alert('Please fill in your name, phone number and destination before submitting.'); return; }
    showCallbackPopup(name, place, date, 'Corporate');
  });

  var eBtn = document.getElementById('eventsSubmitBtn');
  if(eBtn) eBtn.addEventListener('click', function(){
    var name  = document.getElementById('events-name').value.trim();
    var phone = document.getElementById('events-phone').value.trim();
    var type  = document.getElementById('events-type').value;
    var place = document.getElementById('events-place').value.trim();
    var date  = document.getElementById('events-date').value;
    if(!name || !phone || !place){ alert('Please fill in your name, phone number and destination before submitting.'); return; }
    showCallbackPopup(name, place, date, type || 'Event');
  });
})();
