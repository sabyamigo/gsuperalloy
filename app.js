const radioButtons = document.querySelectorAll('input[name="gold_karat"]');
const otherKaratInput = document.getElementById('ontherKinp');
const resultElement = document.getElementById('result');
const karatDisplay = document.getElementById('karat_by_purity'); 
const purityKaratDisplay = document.getElementById('purity_by_karat');

// Enable/Disable Other Karat input
function toggleOtherInput() {
  otherKaratInput.disabled = true;
  radioButtons.forEach(radio => {
    if (radio.checked && radio.id === 'otherK') {
      otherKaratInput.disabled = false;
    }
  });
}

// 🔥 NEW — Update purity % when selecting / entering karat
function updateKaratPurity() {
  let Kvalue = null;

  // If "Other" K selected
  if (document.getElementById("otherK").checked) {
    const otherVal = parseFloat(otherKaratInput.value);
    if (!isNaN(otherVal) && otherVal > 0 && otherVal <= 24) {
      Kvalue = otherVal / 24;
    }
  } else {
    // From radio buttons
    radioButtons.forEach(r => {
      if (r.checked) Kvalue = parseFloat(r.value);
    });
  }

  // Display or reset
  if (!Kvalue) {
    karatDisplay.textContent = "";
    return;
  }

  const purityPercent = (Kvalue * 100).toFixed(2);
  karatDisplay.textContent = `(${purityPercent}%)`;
}

// Event listeners for new feature
radioButtons.forEach(radio =>
  radio.addEventListener('change', () => {
    toggleOtherInput();
    updateKaratPurity();
  })
);

otherKaratInput.addEventListener("input", updateKaratPurity);


// Update karat when entering purity
function updatePurityByKarat() {
    const purityInput = parseFloat(document.getElementById('purity').value);

    if (isNaN(purityInput) || purityInput <= 0 || purityInput > 100) {
        purityKaratDisplay.textContent = "";
        return;
    }

    const karat = (purityInput / 100) * 24;
    const karatRounded = karat.toFixed(2).replace(/\.00$/, ""); // remove .00 if whole number

    purityKaratDisplay.textContent = `(${karatRounded}K)`;
}

document.getElementById('purity').addEventListener('input', updatePurityByKarat);


// Initial setup
toggleOtherInput();
updateKaratPurity();


// ================================
// MAIN CALCULATOR FUNCTION
// ================================
document.getElementById('calculate').addEventListener('click', function () {
  const weight = parseFloat(document.getElementById('weight').value);
  const purity = parseFloat(document.getElementById('purity').value);

  function showError(msg) {
    resultElement.innerHTML = msg;
    resultElement.classList.add('error');
  }

  function showResult(msg) {
    resultElement.innerHTML = msg;
    resultElement.classList.remove('error');
  }

  if (isNaN(weight) || isNaN(purity) || weight <= 0 || purity <= 0 || purity > 100) {
    showError('Please enter valid weight and purity (purity 0–100).');
    return;
  }

  const pureGoldCurrent = weight * (purity / 100);

  // Get target karat
  let karatValue = null;
  for (const radio of radioButtons) {
    if (radio.checked) karatValue = radio.value;
  }

  if (document.getElementById('otherK').checked) {
    const otherKaratVal = parseFloat(otherKaratInput.value);
    if (isNaN(otherKaratVal) || otherKaratVal <= 0 || otherKaratVal > 24) {
      showError('Enter valid Other Karat value (1–24).');
      return;
    }
    karatValue = otherKaratVal / 24;
  } else {
    karatValue = parseFloat(karatValue);
  }

  if (!karatValue || karatValue <= 0 || karatValue > 1) {
    showError('Select or enter a valid Karat value.');
    return;
  }

  const K = karatValue;
  const targetKaratRounded = Math.round(K * 24);
  const tolerance = 0.0005;
  let message = "";
  const currentPurityFraction = purity / 100;

  console.log(K);

  if (Math.abs(currentPurityFraction - K) < tolerance || K === 1) {
    message = `Your gold is already exactly ${targetKaratRounded}K. No addition needed.`;
  } else if (currentPurityFraction < K) {
    const x = (K * weight - pureGoldCurrent) / (1 - K);
    const finalWeight = weight + x;
    const requiredPure = finalWeight * K;

    message = `
      To convert your current gold to ${targetKaratRounded}K:<br>
      Current Pure Gold: <b>${pureGoldCurrent.toFixed(3)} g</b><br>
      Required Pure Gold for ${targetKaratRounded}K: <b>${requiredPure.toFixed(3)} g</b><br>
      You need to add: <b>${x.toFixed(3)} g</b> of pure 24K gold<br>
      Final Weight After Adding: <b>${finalWeight.toFixed(3)} g</b>
    `;
  } else {
    const y = (pureGoldCurrent / K) - weight;
    const finalWeight = weight + y;
    const requiredPure = finalWeight * K;

    message = `
      To convert your current gold to ${targetKaratRounded}K:<br>
      Current Pure Gold: <b>${pureGoldCurrent.toFixed(3)} g</b><br>
      Required Pure Gold for ${targetKaratRounded}K: <b>${requiredPure.toFixed(3)} g</b><br>
      You need to add: <b>${y.toFixed(3)} g</b> of alloy<br>
      Final Weight After Adding: <b>${finalWeight.toFixed(3)} g</b>
    `;
  }

  showResult(message);
});
