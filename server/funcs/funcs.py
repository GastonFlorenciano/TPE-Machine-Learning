import joblib
import os
from pydantic import BaseModel

class Paciente(BaseModel):
    Pregnancies: int
    Glucose: float
    BloodPressure: float
    SkinThickness: float
    Insulin: float
    BMI: float
    DiabetesPedigreeFunction: float
    Age: int


MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "train", "modelo_diabetes.pkl")

model = joblib.load(MODEL_PATH)

def predict(body: Paciente) -> dict:
    data = [[
        body.Pregnancies,
        body.Glucose,
        body.BloodPressure,
        body.SkinThickness,
        body.Insulin,
        body.BMI,
        body.DiabetesPedigreeFunction,
        body.Age
    ]]
    prediction = model.predict(data)
    msg = ""
    if prediction[0] == 0:
        msg = "El paciente NO tiene diabetes"
    else:
        msg = "El paciente tiene diabetes"
    return { "message": msg }