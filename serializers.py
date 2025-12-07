# crm/serializers.py
from rest_framework import serializers
from .models import Customer

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = [
            'id',
            'first_name',
            'last_name',
            'document_type',
            'document_number',
            'email',
            'phone',
            'birth_date',
            'created_at',
            'updated_at',
            'is_active',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_active']

    # Ejemplo de validación adicional: evitar duplicado lógico
    def validate(self, data):
        doc_type = data.get('document_type')
        doc_number = data.get('document_number')

        if Customer.objects.filter(document_type=doc_type, document_number=doc_number).exists():
            raise serializers.ValidationError("Ya existe un cliente con ese tipo y número de documento.")
        return data
