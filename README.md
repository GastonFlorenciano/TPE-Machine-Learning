> Sistema inteligente de análisis médico que utiliza Machine Learning para
> predecir el riesgo de diabetes en pacientes, con una interfaz web moderna y
> funcionalidades avanzadas de gestión de datos.

## 🌟 Características Principales

### 🤖 **Inteligencia Artificial**

- Modelo de Machine Learning entrenado con el dataset Pima Indians Diabetes
- Predicción precisa basada en 8 parámetros médicos
- Análisis de confianza y factores de riesgo personalizados

### 💻 **Interfaz Moderna**

- Diseño glassmorphism con tema oscuro/claro
- Interfaz responsive para todos los dispositivos
- Animaciones fluidas y experiencia de usuario optimizada
- Gráficos interactivos con Chart.js

### 📊 **Gestión de Datos**

- Historial persistente de pacientes con localStorage
- Exportación de datos a formato CSV
- Estadísticas en tiempo real
- Sistema de ejemplos para pruebas rápidas

### 🏥 **Funcionalidades Médicas**

- Análisis detallado de factores de riesgo
- Recomendaciones personalizadas por paciente
- Visualización radar del perfil de riesgo
- Rangos de referencia médicos integrados

## 🚀 Tecnologías Utilizadas

### Backend

- **FastAPI** - Framework web moderno y rápido
- **Python 3.8+** - Lenguaje de programación
- **scikit-learn** - Biblioteca de Machine Learning
- **Pandas** - Manipulación de datos
- **Joblib** - Serialización del modelo
- **Uvicorn** - Servidor ASGI

### Frontend

- **HTML5** - Estructura semántica
- **CSS3** - Estilos modernos con variables CSS
- **JavaScript ES6+** - Programación funcional y orientada a objetos
- **Chart.js** - Visualización de datos
- **Font Awesome** - Iconografía

### Machine Learning

- **Algoritmo**: Random Forest Classifier
- **Dataset**: Pima Indians Diabetes Database
- **Métricas**: Precisión, Recall, F1-Score
- **Validación**: Cross-validation

## ⚡ Instalación y Configuración

### 1. **Clonar el Repositorio**

```bash
git clone https://github.com/tu-usuario/TPE-Machine-Learning.git
cd TPE-Machine-Learning
```

### 2. **Crear Entorno Virtual**

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python -m venv venv
source venv/bin/activate
```

### 3. **Instalar Dependencias**

```bash
pip install -r requirements.txt
```

### 4. **Entrenar el Modelo (Opcional)**

```bash
cd train
python train_model.py
```

### 5. **Ejecutar la Aplicación**

```bash
cd server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 6. **Acceder a la Aplicación**

- **Interfaz Principal**: http://localhost:8000
- **Documentación API**: http://localhost:8000/docs
- **API Alternativa**: http://localhost:8000/redoc

## 🔧 Uso de la Aplicación

### 📝 **Realizar Predicción**

1. Ingresa los datos del paciente en el formulario
2. Haz clic en "Analizar Paciente"
3. Visualiza los resultados y recomendaciones
4. Guarda el análisis en el historial

### 📊 **Gestionar Historial**

1. Accede al historial desde el botón superior
2. Visualiza estadísticas y casos anteriores
3. Descarga los datos en formato CSV
4. Limpia el historial cuando sea necesario

### 🎨 **Personalizar Interfaz**

- Alterna entre tema oscuro y claro
- La aplicación es completamente responsive
- Utiliza ejemplos predefinidos para pruebas
