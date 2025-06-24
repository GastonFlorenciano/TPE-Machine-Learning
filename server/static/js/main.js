class MediPredict {
  constructor() {
    this.currentResult = null;
    this.history = this.loadHistory();
    this.chart = null;
    this.init();
  }

  init() {
    this.bindEvents();
    this.updateHistoryCount();
    this.loadTheme();
  }

  bindEvents() {
    // Form submission
    document
      .getElementById('prediction-form')
      .addEventListener('submit', (e) => this.handlePrediction(e));

    // Theme toggle
    document
      .getElementById('theme-toggle')
      .addEventListener('click', () => this.toggleTheme());

    // History modal
    document
      .getElementById('history-btn')
      .addEventListener('click', () => this.showHistory());
    document
      .querySelector('.close-modal')
      .addEventListener('click', () => this.hideHistory());

    // Form controls
    document
      .getElementById('clear-form')
      .addEventListener('click', () => this.clearForm());
    document
      .getElementById('fill-example')
      .addEventListener('click', () => this.fillExample());

    // History controls
    document
      .getElementById('save-result')
      .addEventListener('click', () => this.saveResult());
    document
      .getElementById('download-csv')
      .addEventListener('click', () => this.downloadCSV());
    document
      .getElementById('clear-history')
      .addEventListener('click', () => this.clearHistory());

    // Modal close on outside click
    document.getElementById('history-modal').addEventListener('click', (e) => {
      if (e.target.id === 'history-modal') this.hideHistory();
    });
  }

  async handlePrediction(e) {
    e.preventDefault();

    this.showLoading();

    const formData = new FormData(e.target);
    const patientData = {
      PatientName: formData.get('PatientName') || 'Paciente Anónimo',
      PatientID: formData.get('PatientID') || this.generatePatientID(),
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

      if (result.error) throw new Error(result.error);

      this.currentResult = {
        ...patientData,
        prediction: result.message,
        hasDiabetes: !result.message.includes('NO tiene'),
        timestamp: new Date().toLocaleString('es-ES'),
        confidence: this.calculateConfidence(patientData),
      };

      this.displayResults();
    } catch (error) {
      this.showError('Error en la predicción: ' + error.message);
    } finally {
      this.hideLoading();
    }
  }

  displayResults() {
    const resultsSection = document.getElementById('results-section');
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth' });

    // Main result
    const resultIcon = document.getElementById('result-icon');
    const resultTitle = document.getElementById('result-title');
    const resultMessage = document.getElementById('result-message');
    const confidenceFill = document.getElementById('confidence-fill');
    const confidenceText = document.getElementById('confidence-text');

    const isPositive = this.currentResult.hasDiabetes;

    resultIcon.innerHTML = isPositive
      ? '<i class="fas fa-exclamation-triangle"></i>'
      : '<i class="fas fa-check-circle"></i>';
    resultIcon.className = `result-icon ${isPositive ? 'danger' : 'success'}`;
    resultTitle.textContent = isPositive
      ? 'Riesgo de Diabetes Detectado'
      : 'Sin Riesgo de Diabetes';
    resultMessage.textContent = this.currentResult.prediction;

    // Confidence animation
    setTimeout(() => {
      confidenceFill.style.width = `${this.currentResult.confidence}%`;
      confidenceText.textContent = `Confianza: ${this.currentResult.confidence}%`;
    }, 500);

    // Risk factors
    this.displayRiskFactors();

    // Recommendations
    this.displayRecommendations();

    // Chart
    this.createChart();
  }

  displayRiskFactors() {
    const riskFactorsList = document.getElementById('risk-factors-list');
    riskFactorsList.innerHTML = '';

    const factors = this.analyzeRiskFactors(this.currentResult);

    factors.forEach((factor, index) => {
      setTimeout(() => {
        const item = document.createElement('div');
        item.className = `risk-item ${factor.level}`;
        item.innerHTML = `
                    <i class="fas ${factor.icon}"></i>
                    <div>
                        <strong>${factor.name}</strong>
                        <p>${factor.description}</p>
                    </div>
                `;
        riskFactorsList.appendChild(item);
      }, index * 100);
    });
  }

  displayRecommendations() {
    const recommendationsList = document.getElementById('recommendations-list');
    recommendationsList.innerHTML = '';

    const recommendations = this.generateRecommendations(this.currentResult);

    recommendations.forEach((rec, index) => {
      setTimeout(() => {
        const item = document.createElement('div');
        item.className = 'recommendation-item';
        item.innerHTML = `
                    <i class="fas ${rec.icon}"></i>
                    <div>
                        <strong>${rec.title}</strong>
                        <p>${rec.description}</p>
                    </div>
                `;
        recommendationsList.appendChild(item);
      }, index * 100);
    });
  }

  createChart() {
    const ctx = document.getElementById('riskChart').getContext('2d');

    if (this.chart) this.chart.destroy();

    const data = this.currentResult;

    this.chart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['Glucosa', 'BMI', 'Edad', 'Presión', 'Insulina', 'Historial'],
        datasets: [
          {
            label: 'Nivel de Riesgo',
            data: [
              this.normalizeValue(data.Glucose, 70, 200),
              this.normalizeValue(data.BMI, 18.5, 40),
              this.normalizeValue(data.Age, 20, 80),
              this.normalizeValue(data.BloodPressure, 60, 120),
              this.normalizeValue(data.Insulin, 16, 300),
              this.normalizeValue(data.DiabetesPedigreeFunction, 0, 1) * 100,
            ],
            backgroundColor: data.hasDiabetes
              ? 'rgba(239, 68, 68, 0.2)'
              : 'rgba(16, 185, 129, 0.2)',
            borderColor: data.hasDiabetes ? '#ef4444' : '#10b981',
            borderWidth: 2,
            pointBackgroundColor: data.hasDiabetes ? '#ef4444' : '#10b981',
            pointRadius: 4,
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
            ticks: {
              display: false,
              stepSize: 20,
            },
            grid: { color: 'rgba(255, 255, 255, 0.1)' },
            pointLabels: {
              color: 'var(--text-primary)',
              font: { size: 12 },
            },
          },
        },
        plugins: {
          legend: { display: false },
        },
      },
    });
  }

  saveResult() {
    if (!this.currentResult) return;

    this.history.unshift(this.currentResult);
    this.saveHistory();
    this.updateHistoryCount();

    // Visual feedback
    const saveBtn = document.getElementById('save-result');
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="fas fa-check"></i> Guardado';
    saveBtn.style.background = 'var(--success-color)';

    setTimeout(() => {
      saveBtn.innerHTML = originalText;
      saveBtn.style.background = '';
    }, 2000);
  }

  showHistory() {
    const modal = document.getElementById('history-modal');
    modal.style.display = 'block';

    this.updateHistoryStats();
    this.renderHistoryList();
  }

  hideHistory() {
    document.getElementById('history-modal').style.display = 'none';
  }

  updateHistoryStats() {
    const totalPatients = this.history.length;
    const positiveCases = this.history.filter(
      (item) => item.hasDiabetes
    ).length;
    const negativeCases = totalPatients - positiveCases;

    document.getElementById('total-patients').textContent = totalPatients;
    document.getElementById('positive-cases').textContent = positiveCases;
    document.getElementById('negative-cases').textContent = negativeCases;
  }

  renderHistoryList() {
    const historyList = document.getElementById('history-list');

    if (this.history.length === 0) {
      historyList.innerHTML =
        '<p class="no-history">No hay registros en el historial</p>';
      return;
    }

    historyList.innerHTML = this.history
      .map(
        (item, index) => `
            <div class="history-item ${
              item.hasDiabetes ? 'positive' : 'negative'
            }">
                <div class="history-header">
                    <div class="patient-info">
                        <h4>${item.PatientName}</h4>
                        <span class="patient-id">${item.PatientID}</span>
                    </div>
                    <div class="history-meta">
                        <span class="timestamp">${item.timestamp}</span>
                        <span class="result-badge ${
                          item.hasDiabetes ? 'danger' : 'success'
                        }">
                            ${item.hasDiabetes ? 'Positivo' : 'Negativo'}
                        </span>
                    </div>
                </div>
                <div class="history-details">
                    <div class="detail-grid">
                        <span>Glucosa: ${item.Glucose}</span>
                        <span>BMI: ${item.BMI}</span>
                        <span>Edad: ${item.Age}</span>
                        <span>Confianza: ${item.confidence}%</span>
                    </div>
                </div>
            </div>
        `
      )
      .join('');
  }

  downloadCSV() {
    if (this.history.length === 0) {
      alert('No hay datos para descargar');
      return;
    }

    const headers = [
      'Nombre',
      'ID_Paciente',
      'Fecha_Hora',
      'Embarazos',
      'Glucosa',
      'Presion_Arterial',
      'Grosor_Piel',
      'Insulina',
      'BMI',
      'Historial_Familiar',
      'Edad',
      'Prediccion',
      'Tiene_Diabetes',
      'Confianza',
    ];

    const csvContent = [
      headers.join(','),
      ...this.history.map((item) =>
        [
          `"${item.PatientName}"`,
          `"${item.PatientID}"`,
          `"${item.timestamp}"`,
          item.Pregnancies,
          item.Glucose,
          item.BloodPressure,
          item.SkinThickness,
          item.Insulin,
          item.BMI,
          item.DiabetesPedigreeFunction,
          item.Age,
          `"${item.prediction}"`,
          item.hasDiabetes ? 'SI' : 'NO',
          item.confidence,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `historial_diabetes_${new Date().toISOString().split('T')[0]}.csv`
    );
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Visual feedback
    const downloadBtn = document.getElementById('download-csv');
    const originalText = downloadBtn.innerHTML;
    downloadBtn.innerHTML = '<i class="fas fa-check"></i> Descargado';

    setTimeout(() => {
      downloadBtn.innerHTML = originalText;
    }, 2000);
  }

  clearHistory() {
    if (confirm('¿Estás seguro de que quieres eliminar todo el historial?')) {
      this.history = [];
      this.saveHistory();
      this.updateHistoryCount();
      this.renderHistoryList();
      this.updateHistoryStats();
    }
  }

  // Utility functions
  fillExample() {
    const examples = [
      {
        // Sin diabetes
        PatientName: 'María García',
        PatientID: 'P-2024-001',
        Pregnancies: 2,
        Glucose: 95,
        BloodPressure: 70,
        SkinThickness: 18,
        Insulin: 85,
        BMI: 22.5,
        DiabetesPedigreeFunction: 0.2,
        Age: 28,
      },
      {
        // Con diabetes
        PatientName: 'Carmen López',
        PatientID: 'P-2024-002',
        Pregnancies: 6,
        Glucose: 180,
        BloodPressure: 90,
        SkinThickness: 32,
        Insulin: 250,
        BMI: 35.8,
        DiabetesPedigreeFunction: 0.85,
        Age: 55,
      },
    ];

    const example = examples[Math.floor(Math.random() * examples.length)];

    Object.keys(example).forEach((key) => {
      const input = document.getElementById(key);
      if (input) input.value = example[key];
    });
  }

  clearForm() {
    document.getElementById('prediction-form').reset();
    document.getElementById('results-section').style.display = 'none';
    this.currentResult = null;
  }

  generatePatientID() {
    const date = new Date();
    const year = date.getFullYear();
    const count = String(this.history.length + 1).padStart(3, '0');
    return `P-${year}-${count}`;
  }

  calculateConfidence(data) {
    // Simulación de confianza basada en rangos normales
    let confidence = 75;

    // Factores que aumentan la confianza
    if (data.Glucose > 140 || data.Glucose < 70) confidence += 10;
    if (data.BMI > 30 || data.BMI < 18.5) confidence += 8;
    if (data.Age > 45) confidence += 7;
    if (data.BloodPressure > 90 || data.BloodPressure < 60) confidence += 5;
    if (data.DiabetesPedigreeFunction > 0.5) confidence += 10;
    if (data.Pregnancies > 5) confidence += 3;

    return Math.min(confidence, 95);
  }

  analyzeRiskFactors(data) {
    const factors = [];

    if (data.Glucose > 140) {
      factors.push({
        name: 'Glucosa Elevada',
        description: `${data.Glucose} mg/dL está significativamente por encima del rango normal (70-100)`,
        level: 'high',
        icon: 'fa-tint',
      });
    } else if (data.Glucose > 100) {
      factors.push({
        name: 'Glucosa Ligeramente Elevada',
        description: `${data.Glucose} mg/dL está en el límite superior`,
        level: 'medium',
        icon: 'fa-tint',
      });
    }

    if (data.BMI > 30) {
      factors.push({
        name: 'Obesidad',
        description: `BMI de ${data.BMI} indica obesidad (>30)`,
        level: 'high',
        icon: 'fa-weight',
      });
    } else if (data.BMI > 25) {
      factors.push({
        name: 'Sobrepeso',
        description: `BMI de ${data.BMI} indica sobrepeso (25-30)`,
        level: 'medium',
        icon: 'fa-weight',
      });
    }

    if (data.Age > 45) {
      factors.push({
        name: 'Edad Avanzada',
        description: `${data.Age} años aumenta el riesgo de diabetes`,
        level: 'medium',
        icon: 'fa-birthday-cake',
      });
    }

    if (data.BloodPressure > 90) {
      factors.push({
        name: 'Presión Arterial Alta',
        description: `${data.BloodPressure} mmHg está por encima del rango normal`,
        level: 'high',
        icon: 'fa-thermometer-half',
      });
    }

    if (data.DiabetesPedigreeFunction > 0.5) {
      factors.push({
        name: 'Historial Familiar Significativo',
        description: `Valor de ${data.DiabetesPedigreeFunction} indica fuerte predisposición genética`,
        level: 'high',
        icon: 'fa-dna',
      });
    }

    if (factors.length === 0) {
      factors.push({
        name: 'Perfil de Bajo Riesgo',
        description:
          'Los valores principales están dentro de rangos saludables',
        level: 'low',
        icon: 'fa-check-circle',
      });
    }

    return factors;
  }

  generateRecommendations(data) {
    const recommendations = [];

    if (data.hasDiabetes) {
      recommendations.push(
        {
          title: 'Consulta Médica Urgente',
          description:
            'Programa una cita con un endocrinólogo lo antes posible',
          icon: 'fa-user-md',
        },
        {
          title: 'Monitoreo de Glucosa',
          description: 'Controla los niveles de glucosa diariamente',
          icon: 'fa-chart-line',
        },
        {
          title: 'Plan Nutricional',
          description: 'Consulta con un nutricionista para un plan específico',
          icon: 'fa-apple-alt',
        }
      );
    } else {
      recommendations.push(
        {
          title: 'Mantén Hábitos Saludables',
          description: 'Continúa con una dieta balanceada y ejercicio regular',
          icon: 'fa-heart',
        },
        {
          title: 'Chequeos Preventivos',
          description: 'Realiza controles médicos anuales de rutina',
          icon: 'fa-calendar-check',
        }
      );
    }

    if (data.BMI > 25) {
      recommendations.push({
        title: 'Control de Peso',
        description:
          'Implementa un plan de ejercicio y alimentación balanceada',
        icon: 'fa-dumbbell',
      });
    }

    if (data.BloodPressure > 85) {
      recommendations.push({
        title: 'Control de Presión Arterial',
        description: 'Reduce el consumo de sal y aumenta la actividad física',
        icon: 'fa-heartbeat',
      });
    }

    return recommendations;
  }

  normalizeValue(value, min, max) {
    return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  }

  toggleTheme() {
    const body = document.body;
    const themeBtn = document.getElementById('theme-toggle');
    const currentTheme = body.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    body.setAttribute('data-theme', newTheme);
    themeBtn.innerHTML =
      newTheme === 'dark'
        ? '<i class="fas fa-moon"></i>'
        : '<i class="fas fa-sun"></i>';

    localStorage.setItem('theme', newTheme);
  }

  loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);

    const themeBtn = document.getElementById('theme-toggle');
    themeBtn.innerHTML =
      savedTheme === 'dark'
        ? '<i class="fas fa-moon"></i>'
        : '<i class="fas fa-sun"></i>';
  }

  loadHistory() {
    try {
      const saved = localStorage.getItem('medipredict-history');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading history:', error);
      return [];
    }
  }

  saveHistory() {
    try {
      localStorage.setItem('medipredict-history', JSON.stringify(this.history));
    } catch (error) {
      console.error('Error saving history:', error);
    }
  }

  updateHistoryCount() {
    document.getElementById('history-count').textContent = this.history.length;
  }

  showLoading() {
    document.getElementById('loading-overlay').style.display = 'block';
  }

  hideLoading() {
    document.getElementById('loading-overlay').style.display = 'none';
  }

  showError(message) {
    alert(message);
    // Aquí podrías implementar un sistema de notificaciones más elegante
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new MediPredict();
});
