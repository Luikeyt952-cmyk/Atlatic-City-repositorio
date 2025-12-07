# crm/views.py
from rest_framework import generics
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import Customer
from .serializers import CustomerSerializer

class CustomerCreateListView(generics.ListCreateAPIView):
    """
    GET  /api/customers/ -> Lista de clientes
    POST /api/customers/ -> Crea un cliente nuevo
    """
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
