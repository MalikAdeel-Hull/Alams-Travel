// Alams Travel — site interactions

(function(){
  var dests = ['NOTTINGHAM','BIRMINGHAM','LONDON'];
  var di = 0;
  var wordEl = document.getElementById('destWord');
  var pinEl = document.getElementById('pinDestName');
  function titleCase(s){ return s.charAt(0) + s.slice(1).toLowerCase(); }
  setInterval(function(){
    wordEl.style.opacity = 0;
    setTimeout(function(){
      di = (di + 1) % dests.length;
      wordEl.textContent = dests[di];
      pinEl.textContent = titleCase(dests[di]);
      wordEl.style.opacity = 1;
    }, 260);
  }, 2600);
})();

(function(){
  var rates = { mpv: { per: 0.95, min: 35, cap: 8 }, mini: { per: 1.45, min: 55, cap: 16 } };
  var names = { mpv: '7–8 Seater MPV', mini: '16 Seater Minibus' };

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

  function getVehicle(){ return document.querySelector('input[name="vehicle"]:checked').value; }
  function getTripMult(){ return parseFloat(document.querySelector('input[name="trip"]:checked').value); }
  function getMiles(){ return destSel.value === 'other' ? (parseFloat(milesInput.value) || 0) : parseFloat(destSel.value); }
  function destLabel(){ return destSel.value === 'other' ? 'Custom destination' : destSel.options[destSel.selectedIndex].text; }

  function recalc(){
    var v = getVehicle();
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
    milesField.style.display = destSel.value === 'other' ? 'flex' : 'none';
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

  document.getElementById('submitBtn').addEventListener('click', function(){
    var required = document.querySelectorAll('.fld');
    var missing = false;
    required.forEach(function(f){ if (!f.value.trim()) missing = true; });
    var terms = document.getElementById('terms').checked;
    if (missing || !terms) {
      alert('Please fill in your name, email, mobile and pickup details, and accept the terms before submitting.');
      return;
    }
    // TODO: wire this up to a real backend (booking API, CRM) or a form
    // service like Formspree so the lead actually reaches your team.
    alert('Thanks! Your booking request for £' + priceOut.textContent + ' has been noted. Wire this button up to your backend or a form service to actually send it.');
  });

  recalc();

  function destToMiles(text){
    if (text.indexOf('Nottingham') === 0) return '16';
    if (text.indexOf('Birmingham') === 0) return '40';
    if (text.indexOf('London') === 0) return '125';
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
