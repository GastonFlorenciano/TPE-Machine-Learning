let currentResult = null;
let chart = null;

document.addEventListener('DOMContentLoaded', function () {
  document
    .getElementById('prediction-form')
    .addEventListener('submit', handlePrediction);
});

async function handlePrediction(e) {
  e.preventDefault();

  showLoading();

  const formData = new FormData(e.target);
  const patientData = {
    Pregnancies: parseInt(formData.get('Pregnancies')),
    Glucose: parseFloat(formData.get('Glucose')),
    BloodPressure: parseFloat(formData.get('BloodPressure')),
    SkinThickness: parseFloat(formData.get('SkinThickness')),
    Insulin: parseFloat(formData.get('Insulin')),
    BMI: parseFloat(formData.get('BMI')),
    DiabetesPedigreeFunction: parseFloat(
      formData.get('DiabetesPedigreeFunction')
    ),
    Age: parseInt(formData.get('Age')),
  };

  try {
    const response = await fetch('/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patientData),
    });

    const result = await response.json();

    if (result.error) {
      alert('Error: ' + result.error);
      return;
    }

    currentResult = patientData;
    currentResult.prediction = result.message;
    currentResult.hasDiabetes = !result.message.includes('NO tiene');
    currentResult.modelAccuracy = result.accuracy || null;


    showResults();
  } catch (error) {
    alert('Error en la predicción: ' + error.message);
  } finally {
    hideLoading();
  }
}

function showResults() {
  document.getElementById('results-section').style.display = 'block';

  const resultIcon = document.getElementById('result-icon');
  const resultTitle = document.getElementById('result-title');
  const resultMessage = document.getElementById('result-message');
  const accuracyDisplay = document.getElementById('accuracy-display');

  if (currentResult.hasDiabetes) {
    resultIcon.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
    resultIcon.className = 'result-icon danger';
    resultTitle.textContent = 'Riesgo de Diabetes Detectado';
  } else {
    resultIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
    resultIcon.className = 'result-icon success';
    resultTitle.textContent = 'Sin Riesgo de Diabetes';
  }

  if (currentResult.modelAccuracy !== null) {
    accuracyDisplay.textContent =
      'Precisión del modelo: ' + currentResult.modelAccuracy + '%';
    accuracyDisplay.style.display = 'block';
  }

  resultMessage.textContent = currentResult.prediction;

  showRiskFactors();
  showRecommendations();
  createChart();
}

function showRiskFactors() {
  const list = document.getElementById('risk-factors-list');
  list.innerHTML = '';

  const factors = [];

  if (currentResult.Glucose > 140) {
    factors.push({
      name: 'Glucosa Elevada',
      description:
        currentResult.Glucose + ' mg/dL está por encima del rango normal',
      level: 'high',
      icon: 'fa-tint',
    });
  }

  if (currentResult.BMI > 30) {
    factors.push({
      name: 'Obesidad',
      description: 'BMI de ' + currentResult.BMI + ' indica obesidad',
      level: 'high',
      icon: 'fa-weight',
    });
  }

  if (currentResult.Age > 45) {
    factors.push({
      name: 'Edad Avanzada',
      description: currentResult.Age + ' años aumenta el riesgo',
      level: 'medium',
      icon: 'fa-birthday-cake',
    });
  }

  if (factors.length === 0) {
    factors.push({
      name: 'Perfil de Bajo Riesgo',
      description: 'Los valores están en rangos normales',
      level: 'low',
      icon: 'fa-check-circle',
    });
  }

  for (let i = 0; i < factors.length; i++) {
    const factor = factors[i];
    const item = document.createElement('div');
    item.className = 'risk-item ' + factor.level;
    item.innerHTML =
      '<i class="fas ' +
      factor.icon +
      '"></i><div><strong>' +
      factor.name +
      '</strong><p>' +
      factor.description +
      '</p></div>';
    list.appendChild(item);
  }
}

function showRecommendations() {
  const list = document.getElementById('recommendations-list');
  list.innerHTML = '';

  const recommendations = [];

  if (currentResult.hasDiabetes) {
    recommendations.push({
      title: 'Consulta Médica',
      description: 'Programa una cita con un médico especialista',
      icon: 'fa-user-md',
    });
  } else {
    recommendations.push({
      title: 'Mantén Hábitos Saludables',
      description: 'Continúa con una dieta balanceada y ejercicio',
      icon: 'fa-heart',
    });
  }

  for (let i = 0; i < recommendations.length; i++) {
    const rec = recommendations[i];
    const item = document.createElement('div');
    item.className = 'recommendation-item';
    item.innerHTML =
      '<i class="fas ' +
      rec.icon +
      '"></i><div><strong>' +
      rec.title +
      '</strong><p>' +
      rec.description +
      '</p></div>';
    list.appendChild(item);
  }
}

function createChart() {
  const ctx = document.getElementById('riskChart').getContext('2d');

  if (chart) {
    chart.destroy();
  }

  const glucoseValue = Math.min(
    100,
    Math.max(0, ((currentResult.Glucose - 70) / (200 - 70)) * 100)
  );
  const bmiValue = Math.min(
    100,
    Math.max(0, ((currentResult.BMI - 18.5) / (40 - 18.5)) * 100)
  );
  const ageValue = Math.min(
    100,
    Math.max(0, ((currentResult.Age - 20) / (80 - 20)) * 100)
  );
  const pressureValue = Math.min(
    100,
    Math.max(0, ((currentResult.BloodPressure - 60) / (120 - 60)) * 100)
  );
  const insulinValue = Math.min(
    100,
    Math.max(0, ((currentResult.Insulin - 16) / (300 - 16)) * 100)
  );
  const pedigreeValue = Math.min(
    100,
    Math.max(0, ((currentResult.DiabetesPedigreeFunction - 0) / (1 - 0)) * 100)
  );

  const backgroundColor = currentResult.hasDiabetes
    ? 'rgba(220, 38, 38, 0.2)'
    : 'rgba(22, 163, 74, 0.2)';
  const borderColor = currentResult.hasDiabetes ? '#dc2626' : '#16a34a';

  chart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['Glucosa', 'BMI', 'Edad', 'Presión', 'Insulina', 'Historial'],
      datasets: [
        {
          label: 'Nivel de Riesgo',
          data: [
            glucoseValue,
            bmiValue,
            ageValue,
            pressureValue,
            insulinValue,
            pedigreeValue,
          ],
          backgroundColor: backgroundColor,
          borderColor: borderColor,
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
        },
      },
      plugins: {
        legend: { display: false },
      },
    },
  });
}

function showLoading() {
  document.getElementById('loading-overlay').style.display = 'block';
}

function hideLoading() {
  document.getElementById('loading-overlay').style.display = 'none';
}
