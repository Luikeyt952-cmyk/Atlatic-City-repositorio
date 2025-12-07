# crm/models.py
from django.db import models

class Customer(models.Model):
    DOCUMENT_TYPES = [
        ('DNI', 'Documento Nacional de Identidad'),
        ('CE', 'Carné de Extranjería'),
        ('PAS', 'Pasaporte'),
    ]

    id = models.BigAutoField(primary_key=True)
    first_name = models.CharField("Nombres", max_length=100)
    last_name = models.CharField("Apellidos", max_length=150)
    document_type = models.CharField("Tipo de documento", max_length=3, choices=DOCUMENT_TYPES)
    document_number = models.CharField("Número de documento", max_length=20, unique=True)
    email = models.EmailField("Correo electrónico", unique=True)
    phone = models.CharField("Teléfono", max_length=20, blank=True, null=True)
    birth_date = models.DateField("Fecha de nacimiento", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'customers'
        verbose_name = 'Cliente'
        verbose_name_plural = 'Clientes'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.document_number})"
