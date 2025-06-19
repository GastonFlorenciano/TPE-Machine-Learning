from fastapi import APIRouter
from funcs.funcs import predict, Paciente

router = APIRouter()

@router.post("/predict")
def prediccion(body: Paciente):
    return predict(body)